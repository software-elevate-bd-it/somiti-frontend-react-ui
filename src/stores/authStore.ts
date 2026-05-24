import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useUsersStore } from './usersStore';
import { useRolesStore } from './rolesStore';
import { apiClient, type User } from '@/lib/api';


export type UserRole = 'super_admin' | 'main_user' | 'member';

interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken?: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string, phone?: string, somiteeName?: string) => Promise<boolean>;
  logout: () => void;
  switchRole: (role: UserRole) => void;
  setToken: (token: string | null) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
      login: async (email, password) => {
        set({ isLoading: true });

        // 3) Fallback to real API
        try {
          const response = await apiClient.login({ email, password });

          const { user, token, refreshToken } = response.data;
          console.log('Token after login:',token);
          console.log('Refresh token after login:', refreshToken);

          // Set token for future API calls
          apiClient.setToken(token);

          set({
            user,
            token,
            refreshToken,
            isAuthenticated: true,
            isLoading: false,
          });
          return true;
        } catch (error) {
          console.error('Login failed:', error);
          set({ isLoading: false });
          return false;
        }
      },
      register: async (name, email, password, phone, somiteeName) => {
        set({ isLoading: true });
        try {
          const response = await apiClient.register({
            name,
            email,
            password,
            phone,
            somiteeName: somiteeName || 'New Somitee',
          });
          const { user, token } = response.data;

          // Set token for future API calls
          apiClient.setToken(token);

          set({
            user,
            token,
            isAuthenticated: true,
            isLoading: false,
          });
          return true;
        } catch (error) {
          console.error('Registration failed:', error);
          set({ isLoading: false });
          return false;
        }
      },
      logout: () => {
        apiClient.setToken(null);
        set({ 
          user: null, 
          token: null, 
          refreshToken: null,
          isAuthenticated: false 
        });
      },
      switchRole: (role) => set((state) => state.user ? { user: { ...state.user, role } } : {}),
      setToken: (token) => {
        apiClient.setToken(token);
        set(state =>({
          token,
          refreshToken: state.refreshToken,
        }));
      },
    }),
    {
      name: 'somitee-auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

// Helper hook for permissions of current user
export function useCurrentPermissions() {
  const user = useAuthStore((s) => s.user);
  const roles = useRolesStore((s) => s.roles);
  const assignments = useRolesStore((s) => s.assignments);

  if (!user) return [];
  // Super admin & main_user implicitly have ALL permissions
  if (user.role === 'super_admin' || user.role === 'main_user') {
    return ['*'] as const;
  }
  // Managed user: union of permissions from assigned roleIds + assignments
  const ids = new Set<string>([
    ...(user.roleIds ?? []),
    ...assignments.filter((a) => a.userId === user.id).map((a) => a.roleId),
  ]);
  const perms = new Set<string>();
  ids.forEach((rid) => roles.find((r) => r.id === rid)?.permissions.forEach((p) => perms.add(p)));
  return Array.from(perms);
}
