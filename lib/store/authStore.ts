import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { SessionUser } from "@/lib/validation/auth"

interface AuthState {
  user: SessionUser | null
  isAuthenticated: boolean
  login: (user: SessionUser) => void
  clear: () => void
  logout: () => Promise<void>
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      login: (user) => set({ user, isAuthenticated: true }),
      clear: () => set({ user: null, isAuthenticated: false }),
      logout: async () => {
        // Call the API to clear the HTTP-only cookie
        try {
          await fetch('/api/v1/logout', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
          });
        } catch (error) {
          console.error('Logout API call failed:', error);
        }
        // Clear client-side state regardless of API call result
        set({ user: null, isAuthenticated: false });
      },
    }),
    {
      name: 'auth-storage',
      version: 2,
      // Discard legacy sessions, including tokens previously persisted in v0.
      migrate: () => ({ user: null, isAuthenticated: false }),
      partialize: ({ user, isAuthenticated }) => ({ user, isAuthenticated }),
      storage: createJSONStorage(() => localStorage),
      skipHydration: false,
    }
  )
)