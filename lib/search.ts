import { tagSchema } from "@/lib/validation/posts";
import type { CommunityDTO } from "@/lib/validation/communities";

// Prisma contains uses LIKE/ILIKE: keep %, _ and backslashes literal.
// https://docs.prisma.io/docs/orm/v6/prisma-client/queries/filtering-and-sorting#filtering-faqs
export function escapeSearchPattern(value: string) {
  return value.replace(/[\\%_]/g, "\\$&");
}

// A single #tag keeps exact hashtag matching; everything else searches text.
export function feedSearchHref(value: string) {
  const query = value.trim();
  const tag = query.startsWith("#") ? tagSchema.safeParse(query.slice(1)) : null;
  const params = new URLSearchParams(tag?.success ? { tag: tag.data } : query ? { q: query } : {});
  return `/feed${params.size ? `?${params}` : ""}`;
}

export function filterCommunities(communities: CommunityDTO[], query: string, joinedOnly: boolean) {
  const search = query.trim().toLowerCase();
  return communities.filter(community =>
    (!joinedOnly || community.isMember) &&
    (!search || [community.name, community.slug, community.description ?? ""].some(value => value.toLowerCase().includes(search)))
  );
}
