import { create } from 'zustand';
import type { AuthUser, Role } from '@/types';

interface AuthState {
  user: AuthUser | null;
  isHydrated: boolean;
  login: (user: AuthUser) => void;
  logout: () => void;
  setUser: (user: AuthUser | null) => void;
  setHydrated: () => void;
  updateRole: (role: Role) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isHydrated: false,

  login: (user) => set({ user, isHydrated: true }),
  logout: () => set({ user: null, isHydrated: true }),
  setUser: (user) => set({ user }),
  setHydrated: () => set({ isHydrated: true }),
  updateRole: (role) => set((state) => ({
    user: state.user ? { ...state.user, role } : null,
  })),
}));

export const selectIsAuthenticated = (state: AuthState) => !!state.user;
export const selectUserRole = (state: AuthState) => state.user?.role ?? null;
export const selectUserId = (state: AuthState) => state.user?.id ?? null;
