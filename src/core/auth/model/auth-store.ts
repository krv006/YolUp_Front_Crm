import { create } from 'zustand';

import { tokenStorage } from '@/shared/lib/token-storage';
import type { User, UserRole } from './types';

interface AuthState {
  /** Joriy foydalanuvchi yoki `null` (kirilmagan). */
  user: User | null;
  setUser: (user: User | null) => void;
  /** Tokenlarni saqlash (login/refresh javobidan). */
  setTokens: (access: string, refresh?: string) => void;
  /** Chiqish — tokenlar va foydalanuvchi tozalanadi. */
  signOut: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,

  setUser: (user) => set({ user }),

  setTokens: (access, refresh) => {
    tokenStorage.set(access, refresh);
  },

  signOut: () => {
    tokenStorage.clear();
    tokenStorage.removeTenantId();
    tokenStorage.removeBranchId();
    set({ user: null });
  },
}));

export const useCurrentUser = () => useAuthStore((state) => state.user);
export const useCurrentRole = (): UserRole | undefined => useAuthStore((state) => state.user?.role);
export const useIsCEO = () => useAuthStore((state) => state.user?.role === 'ceo');
export const useIsAdmin = () => useAuthStore((state) => state.user?.role === 'admin');
