CREATE INDEX "posts_authorId_idx" ON "posts"("authorId");
CREATE INDEX "comments_authorId_idx" ON "comments"("authorId");
CREATE INDEX "posts_createdAt_id_idx" ON "posts"("createdAt", "id");
DROP INDEX "posts_createdAt_idx";
DROP INDEX "verification_tokens_email_idx";
