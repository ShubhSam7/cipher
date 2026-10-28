import { test, beforeEach, vi } from "vitest";
import assert from "node:assert/strict";
import crypto from "node:crypto";
import bcrypt from "bcrypt";
import { jwtVerify, SignJWT } from "jose";
import { NextRequest } from "next/server";
import * as signup from "@/app/api/v1/signup/route";
import * as signin from "@/app/api/v1/signin/route";
import * as comments from "@/app/api/v1/comments/route";
import * as posts from "@/app/api/v1/posts/route";
import * as trending from "@/app/api/v1/trending/route";
import * as postlikes from "@/app/api/v1/postlikes/route";
import { proxy, config } from "@/proxy";
import { unstable_doesMiddlewareMatch } from "next/experimental/testing/server";

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));
vi.mock("@/lib/prisma", () => ({ default: new Proxy({}, { get: (_, key) => db[key] }) }));
vi.mock("@/lib/session", async importOriginal => ({
  ...await importOriginal(), getSession: async () => auth,
}));
vi.mock("nodemailer", () => ({ default: {
  createTransport: () => ({ sendMail: async mail => mails.push(mail) }),
} }));

let auth, token, user, comment, mails, deletes, postQueries, postRows, savedPost, tagsByName, batchCalls, likedPosts;
const defaultPostlike = () => ({
  upsert: async ({ create }) => { likedPosts.add(`${create.userId}:${create.postId}`); },
  deleteMany: async ({ where }) => ({ count: Number(likedPosts.delete(`${where.userId}:${where.postId}`)) }),
  count: async () => likedPosts.size,
});
const email = 'bt22cse001@iiitn.ac.in';
const hash = value => crypto.createHash('sha256').update(value).digest('hex');
const matches = where => token && Object.entries(where).every(([key, value]) => {
  if (value && typeof value === 'object' && !(value instanceof Date)) {
    if ('lt' in value) return token[key] < value.lt;
    if ('lte' in value) return token[key] <= value.lte;
    if ('gt' in value) return token[key] > value.gt;
  }
  return value instanceof Date ? +token[key] === +value : token[key] === value;
});
const db = {
  verificationToken: {
    findUnique: async () => token && { ...token },
    createMany: async ({ data }) => {
      if (token) return { count: 0 };
      token = { id: 'verification', ...data[0] };
      return { count: 1 };
    },
    updateMany: async ({ where, data }) => {
      if (!matches(where)) return { count: 0 };
      for (const [key, value] of Object.entries(data)) {
        token[key] = value && 'increment' in Object(value) ? token[key] + value.increment : value;
      }
      return { count: 1 };
    },
    deleteMany: async ({ where }) => {
      if (!matches(where)) return { count: 0 };
      token = null;
      return { count: 1 };
    },
  },
  user: {
    findUnique: async () => user,
    findFirst: async () => user,
    create: async ({ data }) => ({ id: 'new-user', ...data }),
  },
  comment: {
    findUnique: async () => comment,
    findMany: async () => [],
    deleteMany: async () => { deletes++; return { count: 0 }; },
    delete: async () => { deletes++; return comment; },
  },
  post: {
    findFirst: async () => ({ id: "post" }),
    findMany: async args => {
      postQueries.push(args);
      const start = args.cursor ? postRows.findIndex(post => post.id === args.cursor.id) + 1 : 0;
      return postRows.slice(start, start + args.take);
    },
    count: async () => { throw new Error('Post counts must not run for cursor pagination'); },
    create: async ({ data }) => {
      savedPost = { id: 'new-post', createdAt: new Date(), ...data, author: {}, community: null,
        likes: [], _count: { likes: 0, comments: 0 }, hashtags: [] };
      return savedPost;
    },
    findUniqueOrThrow: async () => savedPost,
  },
  hashtag: {
    createMany: async ({ data, skipDuplicates }) => {
      assert.equal(skipDuplicates, true);
      batchCalls.tags++;
      for (const tag of data) {
        if (!tagsByName.has(tag.name)) tagsByName.set(tag.name, { id: `tag-${tag.name}`, name: tag.name, useCount: 0 });
      }
    },
    findMany: async ({ where }) => [...tagsByName.values()].filter(tag => where.name.in.includes(tag.name)),
    updateMany: async ({ where, data }) => {
      batchCalls.increment++;
      for (const tag of tagsByName.values()) if (where.id.in.includes(tag.id)) tag.useCount += data.useCount.increment;
    },
  },
  postHashtag: {
    createMany: async ({ data, skipDuplicates }) => {
      assert.equal(skipDuplicates, true);
      batchCalls.links++;
      savedPost.hashtags = data.map(link => ({ hashtag: [...tagsByName.values()].find(tag => tag.id === link.hashtagId) }));
    },
  },
  postlike: defaultPostlike(),
  $transaction: async fn => fn(db),
};
const storage = new Map();
vi.stubGlobal("localStorage", {
  getItem: key => storage.get(key) ?? null,
  setItem: (key, value) => storage.set(key, value),
  removeItem: key => storage.delete(key),
});
const { useAuthStore } = await import('../lib/store/authStore');
const request = (body, route = 'signup', method = 'POST') => new NextRequest(`http://localhost/api/v1/${route}`, {
  method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
});
const signupRequest = (step, extra = {}) => signup.POST(request({ email, step, ...extra }));
const seed = (extra = {}) => {
  token = { id: 'verification', email, otp: hash('123456'), verified: false, attempts: 0,
    expiresAt: new Date(Date.now() + 600_000), lastSentAt: new Date(), ...extra };
};
beforeEach(() => {
  likedPosts = new Set();
  db.postlike = defaultPostlike();
  auth = { success: true, userId: 'author', email };
  token = null; user = null; comment = null; mails = []; deletes = 0; postQueries = []; postRows = []; savedPost = null; tagsByName = new Map(); batchCalls = { tags: 0, links: 0, increment: 0 };
});

test('comments authenticate before reading malformed bodies', async () => {
  auth = { success: false };
  for (const handler of [comments.POST, comments.DELETE]) {
    const response = await handler({ json: () => { throw new Error('must not parse'); } });
    assert.equal(response.status, 401);
  }
});
test('comment deletion rejects non-authors and missing comments', async () => {
  comment = { id: 'comment', authorId: 'someone-else' };
  assert.equal((await comments.DELETE(request({ id: 'comment' }, 'comments', 'DELETE'))).status, 403);
  assert.equal(deletes, 0);
  comment = null;
  assert.equal((await comments.DELETE(request({ id: 'comment' }, 'comments', 'DELETE'))).status, 404);
  comment = { id: 'comment', authorId: 'author' };
  assert.equal((await comments.DELETE(request({ id: 'comment' }, 'comments', 'DELETE'))).status, 200);
});
test('OTP send stores only a hash and concurrent resends are throttled', async () => {
  const responses = await Promise.all(Array.from({ length: 10 }, () => signupRequest('send-otp')));
  assert.equal(responses.filter(r => r.status === 200).length, 1);
  assert.equal(responses.filter(r => r.status === 429).length, 9);
  assert.equal(mails.length, 1);
  const code = mails[0].html.match(/\b\d{6}\b/)[0];
  assert.equal(token.otp, hash(code));
  token.lastSentAt = new Date(Date.now() - 60_001);
  token.attempts = 5;
  assert.equal((await signupRequest('send-otp')).status, 200);
  assert.equal(token.attempts, 0);
});
test('five wrong guesses lock the OTP, including parallel guesses', async () => {
  seed();
  const responses = await Promise.all(Array.from({ length: 20 }, () => signupRequest('verify-otp', { otp: '000000' })));
  assert.equal(token.attempts, 5);
  assert.equal(responses.filter(r => r.status === 400).length, 5);
  assert.equal(responses.filter(r => r.status === 429).length, 15);
  assert.equal((await signupRequest('verify-otp', { otp: '123456' })).status, 429);
  assert.equal(token.verified, false);
});
test('correct OTP verifies within its original expiration, including the fifth try', async () => {
  seed({ attempts: 4 });
  const expiration = +token.expiresAt;
  assert.equal((await signupRequest('verify-otp', { otp: '123456' })).status, 200);
  assert.equal(token.verified, true);
  assert.equal(+token.expiresAt, expiration);
});
test('expired OTPs and expired verified signup grants are rejected', async () => {
  seed({ expiresAt: new Date(Date.now() - 1) });
  assert.equal((await signupRequest('verify-otp', { otp: '123456' })).status, 400);
  token.verified = true;
  assert.equal((await signupRequest('complete-signup', { user_handle: 'alice', password: 'password123' })).status, 400);
});
test('signup consumes verification exactly once and creates a session for the feed', async () => {
  seed({ verified: true });
  const response = await signupRequest('complete-signup', { user_handle: 'alice', password: 'password123' });
  assert.equal(response.status, 200);
  const data = await response.json();
  assert.equal(data.redirectTo, '/feed');
  assert.equal('token' in data, false);
  assert.match(response.headers.get('set-cookie'), /HttpOnly/i);
  assert.equal((await jwtVerify(response.cookies.get('token').value, new TextEncoder().encode(process.env.JWT_SECRET))).payload.userId, data.user.id);
  assert.equal(token, null);
  assert.equal((await signupRequest('complete-signup', { user_handle: 'alice', password: 'password123' })).status, 400);
});
test('signin validates both variants before database access', async () => {
  for (const body of [null, {}, { step: 'email', password: 'password123' },
    { step: 'username', user_handle: {}, password: 'password123' },
    { step: 'email', email, password: 'short' }]) {
    assert.equal((await signin.POST(request(body, 'signin'))).status, 400);
  }
});
test('signin failures match and successful sessions only expose an HttpOnly cookie', async () => {
  const password = await bcrypt.hash('password123', 4);
  for (const variant of [{ step: 'email', email }, { step: 'username', user_handle: 'alice' }]) {
    user = null;
    const missing = await signin.POST(request({ ...variant, password: 'password123' }, 'signin'));
    user = { id: 'user', email, user_handle: 'alice', password };
    const wrong = await signin.POST(request({ ...variant, password: 'wrong-password' }, 'signin'));
    assert.equal(missing.status, 401);
    assert.equal(wrong.status, 401);
    assert.deepEqual(await missing.json(), await wrong.json());
    const success = await signin.POST(request({ ...variant, password: 'password123' }, 'signin'));
    assert.equal(success.status, 200);
    assert.equal('token' in await success.json(), false);
    assert.match(success.headers.get('set-cookie'), /HttpOnly/i);
    assert.equal((await jwtVerify(success.cookies.get('token').value, new TextEncoder().encode(process.env.JWT_SECRET))).payload.userId, 'user');
  }
});
test('persisted auth drops legacy tokens and excludes tokens from new state', () => {
  const options = useAuthStore.persist.getOptions();
  assert.deepEqual(options.migrate({ token: 'legacy-secret', user: {}, isAuthenticated: true }), { user: null, isAuthenticated: false });
  assert.equal('token' in options.partialize({ token: 'secret', user: null, isAuthenticated: false }), false);
});
test('cursor pagination clamps limits and rejects malformed inputs', async () => {
  assert.equal((await posts.GET(new NextRequest('http://localhost/api/v1/posts?limit=999'))).status, 200);
  assert.equal(postQueries[0].skip, undefined);
  assert.equal(postQueries[0].take, 51);
  assert.equal((await posts.GET(new NextRequest('http://localhost/api/v1/posts?limit=0'))).status, 200);
  assert.equal(postQueries[1].take, 2);
  for (const query of ['limit=NaN', 'limit=Infinity', 'cursor=', 'limit=1.5', 'limit=10junk']) {
    assert.equal((await posts.GET(new NextRequest(`http://localhost/api/v1/posts?${query}`))).status, 400);
  }
});
test('proxy protects all private routes and APIs while allowing public entries', async () => {
  auth = { success: false };
  for (const route of ['/post/123', '/questions', '/settings', '/feed', '/new-private-page', '/signin/secret', '/about/private', '/settings.json']) {
    const response = await proxy(new NextRequest(`http://localhost${route}`));
    assert.equal(response.status, 307, route);
    assert.equal(new URL(response.headers.get('location')).pathname, '/signin');
    assert.equal(new URL(response.headers.get('location')).searchParams.get('next'), route);
  }
  for (const route of ['/', '/signin', '/signup', '/about', '/api/v1/signin', '/api/v1/signup']) {
    assert.equal((await proxy(new NextRequest(`http://localhost${route}`))).status, 200, route);
  }
  assert.equal((await proxy(new NextRequest('http://localhost/api/v1/comments'))).status, 401);
  auth = { success: true, userId: 'user', email };
  assert.equal((await proxy(new NextRequest('http://localhost/settings'))).status, 200);
  assert.equal((await proxy(new NextRequest('http://localhost/signin'))).headers.get('location'), 'http://localhost/feed');
});
test('server environment fails immediately when a required secret is absent', async () => {
  vi.resetModules();
  vi.stubEnv("JWT_SECRET", undefined);
  try { await assert.rejects(import("../lib/env"), /JWT_SECRET/); }
  finally { vi.unstubAllEnvs(); vi.resetModules(); }
});

test('proxy matcher covers private routes without swallowing public assets', () => {
  for (const route of ['/post/123', '/questions', '/settings', '/api/v1/comments',
    '/settings.json', '/file.svg/private', '/faviconXico', '/_next/not-static']) {
    assert.equal(unstable_doesMiddlewareMatch({ config, nextConfig: {}, url: `http://localhost${route}` }), true, route);
  }
  for (const route of ['/_next/static/chunk.js', '/_next/image?url=x', '/favicon.ico', '/icon']) {
    assert.equal(unstable_doesMiddlewareMatch({ config, nextConfig: {}, url: `http://localhost${route}` }), false, route);
  }
});

test('verification cannot accept a code replaced by a concurrent resend', async () => {
  seed();
  const findUnique = db.verificationToken.findUnique;
  db.verificationToken.findUnique = async () => {
    const snapshot = { ...token };
    token = { ...token, otp: hash('654321'), lastSentAt: new Date(+token.lastSentAt + 1) };
    return snapshot;
  };
  try {
    assert.equal((await signupRequest('verify-otp', { otp: '123456' })).status, 400);
    assert.equal(token.verified, false);
    assert.equal(token.attempts, 0);
  } finally { db.verificationToken.findUnique = findUnique; }
});

test('signup rechecks expiration after password hashing and before account creation', async () => {
  seed({ verified: true });
  const findFirst = db.user.findFirst;
  db.user.findFirst = async () => {
    token.expiresAt = new Date(Date.now() - 1);
    return null;
  };
  try {
    assert.equal((await signupRequest('complete-signup', { user_handle: 'alice', password: 'password123' })).status, 400);
    assert.ok(token);
  } finally { db.user.findFirst = findFirst; }
});


test('comment validation returns 400 for invalid content, IDs, and malformed JSON', async () => {
  for (const content of ['', '   ', 'x'.repeat(501)]) {
    assert.equal((await comments.POST(request({ content, postId: 'post' }, 'comments'))).status, 400);
  }
  assert.equal((await comments.DELETE(request({ id: '' }, 'comments', 'DELETE'))).status, 400);
  for (const handler of [comments.POST, comments.DELETE]) {
    assert.equal((await handler({ json: async () => { throw new SyntaxError('bad JSON'); } })).status, 400);
  }
});

test('authorized comment deletion uses a single delete and relies on database cascades', async () => {
  comment = { id: 'comment', authorId: 'author' };
  assert.equal((await comments.DELETE(request({ id: 'comment' }, 'comments', 'DELETE'))).status, 200);
  assert.equal(deletes, 1);
});

test('create-post response returns saved hashtags, deduplicated and normalized', async () => {
  const response = await posts.POST(request({ content: 'Hello #Cipher #cipher #Campus' }, 'posts'));
  assert.equal(response.status, 201);
  const { post } = await response.json();
  assert.deepEqual(post.hashtags.map(({ id, name }) => ({ id, name })), [{ id: 'tag-cipher', name: 'cipher' }, { id: 'tag-campus', name: 'campus' }]);
  assert.deepEqual(batchCalls, { tags: 1, links: 1, increment: 1 });
  assert.ok([...tagsByName.values()].every(tag => tag.useCount === 1));
  assert.equal('hashtag' in post, false);
});

test('trending ranks recent post usage and preserves that ranking when fetching tag names', async () => {
  const findMany = db.hashtag.findMany;
  const groupBy = db.postHashtag.groupBy;
  const started = Date.now();
  db.postHashtag.groupBy = async args => {
    assert.deepEqual(args.by, ['hashtagId']);
    assert.deepEqual(args.orderBy[0], { _count: { postId: 'desc' } });
    assert.equal(args.take, 5);
    const since = +args.where.post.createdAt.gte;
    assert.ok(since >= started - 30 * 86400_000 && since <= Date.now() - 30 * 86400_000);
    return [{ hashtagId: 'old-but-active', _count: { postId: 12 } }, { hashtagId: 'new-tag', _count: { postId: 2 } }];
  };
  db.hashtag.findMany = async () => [{ id: 'new-tag', name: 'new' }, { id: 'old-but-active', name: 'established' }];
  try {
    const response = await trending.GET(new NextRequest('http://localhost/api/v1/trending'));
    assert.equal(response.status, 200);
    assert.deepEqual((await response.json()).tags, [
      { id: 'old-but-active', name: 'established', useCount: 12 },
      { id: 'new-tag', name: 'new', useCount: 2 },
    ]);
    db.postHashtag.groupBy = async () => [];
    assert.deepEqual((await (await trending.GET(new NextRequest('http://localhost/api/v1/trending'))).json()).tags, []);
    db.postHashtag.groupBy = async () => { throw new Error('database unavailable'); };
    const log = console.error;
    console.error = () => {};
    try { assert.equal((await trending.GET(new NextRequest('http://localhost/api/v1/trending'))).status, 500); }
    finally { console.error = log; }
  } finally { db.hashtag.findMany = findMany; db.postHashtag.groupBy = groupBy; }
});

test('double likes use the compound key and tolerate a competing insert', async () => {
  const { Prisma } = await import('@prisma/client');
  const likes = new Set();
  db.postlike = {
    upsert: async ({ where, create }) => {
      assert.deepEqual(where.userId_postId, { userId: 'author', postId: 'post' });
      likes.add(`${create.userId}:${create.postId}`);
    },
  };
  const responses = await Promise.all(Array.from({ length: 10 }, () => postlikes.POST(request({ postId: 'post' }, 'postlikes'))));
  assert.ok(responses.every(response => response.status === 200));
  assert.equal(likes.size, 1);
  db.postlike.upsert = async () => {
    throw new Prisma.PrismaClientKnownRequestError('duplicate', { code: 'P2002', clientVersion: '6' });
  };
  assert.equal((await postlikes.POST(request({ postId: 'post' }, 'postlikes'))).status, 200);
});


test('PostCard initially displays the API liked state and count', async () => {
  const React = await import('react');
  const { renderToStaticMarkup } = await import('react-dom/server');
  const { default: PostCard } = await import('../components/feed/PostCard');
  const post = {
    id: 'post', content: 'Hello', createdAt: '2026-10-01T00:00:00Z',
    author: { id: 'author', user_handle: 'alice', avatar: null, bio: null },
    community: null, mediaURL: [], mediaType: [], likeCount: 7, commentCount: 0, hashtags: [],
  };
  const liked = renderToStaticMarkup(React.createElement(PostCard, { post: { ...post, isLikedByUser: true } }));
  const unliked = renderToStaticMarkup(React.createElement(PostCard, { post: { ...post, isLikedByUser: false } }));
  assert.match(liked, /fill-current/);
  assert.match(liked, />7<\/span>/);
  assert.doesNotMatch(unliked, /fill-current/);
});

test('cursor pages use bounded queries and remain stable when newer posts arrive', async () => {
  const makePost = (id, liked = false) => ({
    id, content: 'Hello', mediaURL: [], mediaType: [], createdAt: new Date('2026-10-01T00:00:00Z'),
    author: { id: 'author', user_handle: 'alice', avatar: null, bio: null }, community: null,
    _count: { likes: 20, comments: 30 }, likes: liked ? [{ userId: 'author' }] : [], hashtags: [],
  });
  postRows = [makePost('p3', true), makePost('p2'), makePost('p1')];
  const first = await (await posts.GET(new NextRequest('http://localhost/api/v1/posts?limit=2'))).json();
  assert.deepEqual(first.posts.map(post => post.id), ['p3', 'p2']);
  assert.deepEqual(first.pagination, { hasMore: true, nextCursor: 'p2' });
  assert.equal(first.posts[0].likeCount, 20);
  assert.equal(first.posts[0].commentCount, 30);
  assert.equal(first.posts[0].isLikedByUser, true);
  assert.equal(first.posts[1].isLikedByUser, false);
  const query = postQueries[0];
  assert.equal(query.take, 3);
  assert.deepEqual(query.include._count, { select: { likes: true, comments: true } });
  assert.deepEqual(query.include.likes.where, { userId: 'author' });
  assert.equal(query.include.comments, undefined);
  assert.deepEqual(query.orderBy, [{ createdAt: 'desc' }, { id: 'desc' }]);
  postRows.unshift(makePost('p4'));
  const second = await (await posts.GET(new NextRequest(`http://localhost/api/v1/posts?limit=2&cursor=${first.pagination.nextCursor}`))).json();
  assert.deepEqual(second.posts.map(post => post.id), ['p1']);
  assert.deepEqual(second.pagination, { hasMore: false, nextCursor: null });
  assert.deepEqual(postQueries[1].cursor, { id: 'p2' });
  assert.equal(postQueries[1].skip, 1);

  const findUnique = db.post.findUnique;
  db.post.findUnique = async () => postRows[1];
  try {
    const single = await (await posts.GET(new NextRequest('http://localhost/api/v1/posts?postId=p3'))).json();
    assert.deepEqual(single.post, first.posts[0]);
  } finally { db.post.findUnique = findUnique; }
});

test('hashtag writes are batched and increment existing tags once per post', async () => {
  tagsByName.set('tag0', { id: 'tag-tag0', name: 'tag0', useCount: 9 });
  const content = Array.from({ length: 20 }, (_, index) => `#tag${index}`).join(' ') + ' #TAG0';
  const response = await posts.POST(request({ content }, 'posts'));
  assert.equal(response.status, 201);
  assert.equal((await response.json()).post.hashtags.length, 20);
  assert.deepEqual(batchCalls, { tags: 1, links: 1, increment: 1 });
  assert.equal(tagsByName.get('tag0').useCount, 10);
  assert.equal(tagsByName.get('tag1').useCount, 1);
});

test('posts without hashtags skip all hashtag writes', async () => {
  const response = await posts.POST(request({ content: 'No hashtags here' }, 'posts'));
  assert.equal(response.status, 201);
  assert.deepEqual((await response.json()).post.hashtags, []);
  assert.deepEqual(batchCalls, { tags: 0, links: 0, increment: 0 });
});

test('every protected handler authenticates before reading the request', async () => {
  auth = { success: false, error: 'Unauthorized' };
  for (const handler of [posts.GET, posts.POST, comments.GET, comments.POST, comments.DELETE,
    postlikes.GET, postlikes.POST, postlikes.DELETE, trending.GET]) {
    const response = await handler({ json: async () => { throw new Error('must not read'); } });
    assert.equal(response.status, 401);
  }
});

test('jose sessions validate signature, expiration, algorithm, and payload', async () => {
  const session = await vi.importActual('../lib/session');
  const { NextResponse } = await import('next/server');
  const key = new TextEncoder().encode(process.env.JWT_SECRET);
  const user = { id: 'session-user', email };
  const signed = await session.signSession(user);
  const withCookie = token => new NextRequest('http://localhost/feed', { headers: { cookie: `token=${token}` } });
  assert.deepEqual(await session.getSession(withCookie(signed)), { success: true, userId: user.id, email });
  assert.equal((await session.getSession(new NextRequest('http://localhost/feed'))).success, false);
  const makeToken = (payload, algorithm = 'HS256', expiration = '1h', secret = key) => {
    const jwt = new SignJWT(payload).setProtectedHeader({ alg: algorithm });
    if (expiration !== null) jwt.setExpirationTime(expiration);
    return jwt.sign(secret);
  };
  for (const token of [
    await makeToken({ userId: user.id, email }, 'HS256', 0),
    await makeToken({ userId: user.id, email }, 'HS384'),
    await makeToken({ userId: 123, email }),
    await makeToken({ userId: user.id, email }, 'HS256', null),
    await makeToken({ userId: user.id, email }, 'HS256', '1h', new Uint8Array(32)),
  ]) assert.equal((await session.getSession(withCookie(token))).success, false);
  const response = await session.setSessionCookie(NextResponse.json({}), user);
  assert.equal(response.cookies.get('token').httpOnly, true);
  const logout = await import('../app/api/v1/logout/route');
  const cleared = (await logout.POST()).cookies.get('token');
  assert.equal(cleared.value, '');
  assert.equal(cleared.httpOnly, true);
  assert.equal(cleared.maxAge, 0);
  assert.equal(+cleared.expires, 0);
});

test('shared signup schemas reject invalid branches and preserve typed payload variants', async () => {
  const { signupSchema, signinSchema, collegeEmailSchema } = await import('../lib/validation/auth');
  assert.equal(collegeEmailSchema.safeParse(email).success, true);
  assert.equal(collegeEmailSchema.safeParse('bt22xyz001@iiitn.ac.in').success, false);
  assert.equal(signupSchema.safeParse({ email, step: 'verify-otp', otp: 'abc123' }).success, false);
  assert.equal(signupSchema.safeParse({ email, step: 'complete-signup', user_handle: 'x'.repeat(21), password: 'password123' }).success, false);
  assert.deepEqual(signinSchema.parse({ step: 'email', email, password: 'password123', user_handle: 'unused' }),
    { step: 'email', email, password: 'password123' });
});


test('likes toggle for the authenticated user without removing another user’s like', async () => {
  likedPosts.add('other-user:post');
  assert.equal((await postlikes.POST(request({ postId: 'post' }, 'postlikes'))).status, 200);
  assert.equal((await postlikes.POST(request({ postId: 'post' }, 'postlikes'))).status, 200);
  assert.equal(likedPosts.size, 2);
  assert.equal((await postlikes.DELETE(request({ postId: 'post' }, 'postlikes', 'DELETE'))).status, 200);
  assert.deepEqual([...likedPosts], ['other-user:post']);
  assert.equal((await postlikes.DELETE(request({ postId: 'post' }, 'postlikes', 'DELETE'))).status, 404);
});
