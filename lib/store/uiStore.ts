import { create } from "zustand";
import type { PostDTO } from "@/lib/posts";

interface UiState {
  isCreatePostOpen: boolean;
  setCreatePostOpen: (open: boolean) => void;
  // Posts created from the dialog this session, newest first. The feed merges
  // them in so they appear immediately without a refetch.
  createdPosts: PostDTO[];
  addCreatedPost: (post: PostDTO) => void;
}

export const useUiStore = create<UiState>()((set) => ({
  isCreatePostOpen: false,
  setCreatePostOpen: (isCreatePostOpen) => set({ isCreatePostOpen }),
  createdPosts: [],
  addCreatedPost: (post) => set((state) => ({ createdPosts: [post, ...state.createdPosts] })),
}));
