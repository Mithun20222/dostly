import { create } from 'zustand'

export const useAuthStore = create((set) => ({
  // State
  user: null,
  isAuthenticated: false,
  isLoading: true,       // true on first load while we check the session

  // Actions
  setUser: (user) => set({
    user,
    isAuthenticated: !!user,
    isLoading: false,
  }),

  clearUser: () => set({
    user: null,
    isAuthenticated: false,
    isLoading: false,
  }),

  updateUser: (updates) => set((state) => ({
    user: state.user ? { ...state.user, ...updates } : null,
  })),

  setLoading: (isLoading) => set({ isLoading }),
}))