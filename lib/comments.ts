export interface CommentData {
  id: string;
  content: string;
  author: { id: string; user_handle: string; avatar: string | null };
  createdAt: string;
  parentId: string | null;
}

export function groupComments(comments: CommentData[]) {
  const ids = new Set(comments.map(comment => comment.id));
  const topLevel: CommentData[] = [];
  const repliesByParent = new Map<string, CommentData[]>();
  for (const comment of comments) {
    if (!comment.parentId || !ids.has(comment.parentId) || comment.parentId === comment.id) {
      topLevel.push(comment);
    } else {
      const siblings = repliesByParent.get(comment.parentId) ?? [];
      siblings.push(comment);
      repliesByParent.set(comment.parentId, siblings);
    }
  }
  return { topLevel, repliesByParent };
}

// Match the database's cascade at every depth, including replies to replies.
export function commentBranchIds(comments: CommentData[], rootId: string) {
  const { repliesByParent } = groupComments(comments);
  const removed = new Set<string>();
  const pending = [rootId];
  while (pending.length) {
    const id = pending.pop()!;
    if (removed.has(id)) continue;
    removed.add(id);
    for (const child of repliesByParent.get(id) ?? []) pending.push(child.id);
  }
  return removed;
}
