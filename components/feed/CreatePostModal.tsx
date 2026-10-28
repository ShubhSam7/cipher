"use client";
import { apiFetch } from "@/lib/apiFetch";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useApi } from "@/lib/hooks/useApi";
import type { CommunityDTO } from "@/lib/validation/communities";
import { createPostSchema, MAX_CONTENT_LENGTH } from "@/lib/validation/posts";
import { useUiStore } from "@/lib/store/uiStore";
import type { PostDTO } from "@/lib/posts";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";

const WARN_AT = MAX_CONTENT_LENGTH - 50;

export default function CreatePostModal() {
  const isOpen = useUiStore((state) => state.isCreatePostOpen);
  const setOpen = useUiStore((state) => state.setCreatePostOpen);
  const addCreatedPost = useUiStore((state) => state.addCreatedPost);
  const router = useRouter();
  const pathname = usePathname();
  const { data: communityData } = useApi<{ communities: CommunityDTO[] }>(isOpen ? "/api/v1/communities" : null);
  const [communityId, setCommunityId] = useState("");
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    if (!content.trim() || isSubmitting) return;
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await apiFetch("/api/v1/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(createPostSchema.parse({ content: content.trim(), communityId: communityId || undefined })),
      });
      const data: { post?: PostDTO; error?: string } = await response.json();
      if (!response.ok || !data.post) throw new Error(data.error || "Failed to create post");

      addCreatedPost(data.post);
      setContent("");
      setOpen(false);
      const postId = data.post.id;
      toast.success("Posted", pathname === "/feed" ? undefined : {
        action: { label: "View", onClick: () => router.push(`/post/${postId}`) },
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create post");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !isSubmitting && setOpen(open)}>
      <DialogContent className="max-w-2xl">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void submit();
          }}
        >
          <DialogHeader className="border-b pb-4">
            <DialogTitle className="text-xl">Create a post</DialogTitle>
            <DialogDescription>Use #hashtags so your campus can find it.</DialogDescription>
          </DialogHeader>

          <div className="space-y-3 p-6">
            <label htmlFor="post-community" className="block text-sm font-medium">Post to</label>
            <select id="post-community" className="control-select" value={communityId} onChange={event => setCommunityId(event.target.value)}><option value="">Campus feed</option>{communityData?.communities.filter(community => community.isMember).map(community => <option key={community.id} value={community.id}>c/{community.name}</option>)}</select>
            {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
            <label htmlFor="post-content" className="sr-only">Post content</label>
            <Textarea
              id="post-content"
              autoFocus
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                  e.preventDefault();
                  void submit();
                }
              }}
              placeholder="What's on your mind?"
              className="h-48"
              maxLength={MAX_CONTENT_LENGTH}
              aria-describedby="post-content-count"
            />
            <div className="flex items-center justify-between text-sm">
              <span className="hidden text-muted-foreground sm:inline">⌘/Ctrl + Enter to post</span>
              <span
                id="post-content-count"
                className={content.length > WARN_AT ? "text-destructive" : "text-muted-foreground"}
              >
                {content.length}/{MAX_CONTENT_LENGTH}
              </span>
            </div>
          </div>

          <DialogFooter className="border-t pt-4">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!content.trim() || isSubmitting}

            >
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
              {isSubmitting ? "Posting…" : "Post"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
