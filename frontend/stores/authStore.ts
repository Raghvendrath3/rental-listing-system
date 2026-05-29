import { create } from 'zustand';
import { STORAGE_KEYS } from '@/constants';
import type { AuthUser, Role } from '@/types';

interface AuthState {
  token: string | null;
  user: AuthUser | null;
  isHydrated: boolean;
  
  // Actions
  login: (token: string, user: AuthUser) => void;
  logout: () => void;
  hydrate: () => void;
  updateRole: (role: Role) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  user: null,
  isHydrated: false,
  
  login: (token: string, user: AuthUser) => {
    // Store in localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.TOKEN, token);
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    }
    set({ token, user });
  },
  
  logout: () => {
    // Clear localStorage
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEYS.TOKEN);
      localStorage.removeItem(STORAGE_KEYS.USER);
    }
    set({ token: null, user: null });
  },
  
  hydrate: () => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
      const userStr = localStorage.getItem(STORAGE_KEYS.USER);
      
      if (token && userStr) {
        try {
          const user = JSON.parse(userStr) as AuthUser;
          set({ token, user, isHydrated: true });
        } catch {
          // Invalid stored user, clear everything
          localStorage.removeItem(STORAGE_KEYS.TOKEN);
          localStorage.removeItem(STORAGE_KEYS.USER);
          set({ token: null, user: null, isHydrated: true });
        }
      } else {
        set({ isHydrated: true });
      }
    } else {
      set({ isHydrated: true });
    }
  },
  
  updateRole: (role: Role) => {
    set((state) => {
      if (state.user) {
        const updatedUser = { ...state.user, role };
        if (typeof window !== 'undefined') {
          localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updatedUser));
        }
        return { user: updatedUser };
      }
      return state;
    });
  },
}));

// Selectors for common access patterns
export const selectIsAuthenticated = (state: AuthState) => !!state.token && !!state.user;
export const selectUserRole = (state: AuthState) => state.user?.role ?? null;
export const selectUserId = (state: AuthState) => state.user?.id ?? null;
