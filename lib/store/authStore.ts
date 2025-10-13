import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import {User} from '@prisma/client'

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  login: (token: string, user: User) => void
  logout: () => Promise<void>
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      login: (token, user) => set({ token, user, isAuthenticated: true }),
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
        set({ token: null, user: null, isAuthenticated: false });
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      skipHydration: false,
    }
  )
)