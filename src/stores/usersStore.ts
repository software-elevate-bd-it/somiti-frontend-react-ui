import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { UserRole } from './authStore';

export interface ManagedUser {
  id: string;
  name: string;
  email: string;
  password: string;
  role: UserRole; // base role: 'main_user' | 'member' (created users are typically 'member')
  somiteeId: string;
  someiteeName: string;
  roleIds: string[]; // links to rolesStore.Role[]
  status: 'active' | 'inactive';
  createdBy: string;
  createdAt: string;
}

interface UsersState {
  users: ManagedUser[];
  addUser: (u: Omit<ManagedUser, 'id' | 'createdAt' | 'status'> & { status?: 'active' | 'inactive' }) => { ok: boolean; error?: string; user?: ManagedUser };
  updateUser: (id: string, patch: Partial<Omit<ManagedUser, 'id' | 'createdAt'>>) => void;
  deleteUser: (id: string) => void;
  toggleStatus: (id: string) => void;
  findByEmail: (email: string) => ManagedUser | undefined;
  setUserRoles: (id: string, roleIds: string[]) => void;
}

export const useUsersStore = create<UsersState>()(
  persist(
    (set, get) => ({
      users: [],
      addUser: (u) => {
        const exists = get().users.some((x) => x.email.toLowerCase() === u.email.toLowerCase());
        if (exists) return { ok: false, error: 'Email already exists' };
        const user: ManagedUser = {
          ...u,
          id: `usr-${Date.now()}`,
          status: u.status ?? 'active',
          createdAt: new Date().toISOString(),
        };
        set((s) => ({ users: [...s.users, user] }));
        return { ok: true, user };
      },
      updateUser: (id, patch) =>
        set((s) => ({ users: s.users.map((u) => (u.id === id ? { ...u, ...patch } : u)) })),
      deleteUser: (id) => set((s) => ({ users: s.users.filter((u) => u.id !== id) })),
      toggleStatus: (id) =>
        set((s) => ({
          users: s.users.map((u) =>
            u.id === id ? { ...u, status: u.status === 'active' ? 'inactive' : 'active' } : u
          ),
        })),
      findByEmail: (email) => get().users.find((u) => u.email.toLowerCase() === email.toLowerCase()),
      setUserRoles: (id, roleIds) =>
        set((s) => ({ users: s.users.map((u) => (u.id === id ? { ...u, roleIds } : u)) })),
    }),
    { name: 'somitee-users-storage' }
  )
);
