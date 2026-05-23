import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { apiClient, type Role } from '@/lib/api';

export type { Role };

export type Permission =
  | 'collection.create' | 'collection.approve'
  | 'expense.create' | 'expense.approve'
  | 'bank.create' | 'bank.approve'
  | 'member.create' | 'member.approve'
  | 'reports.view' | 'settings.manage' | 'roles.manage';

export const ALL_PERMISSIONS: { key: Permission; label: string; group: string }[] = [
  { key: 'collection.create', label: 'Create Collection', group: 'Collections' },
  { key: 'collection.approve', label: 'Approve Collection', group: 'Collections' },
  { key: 'expense.create', label: 'Create Expense', group: 'Expenses' },
  { key: 'expense.approve', label: 'Approve Expense', group: 'Expenses' },
  { key: 'bank.create', label: 'Create Bank Transaction', group: 'Bank' },
  { key: 'bank.approve', label: 'Approve Bank Transaction', group: 'Bank' },
  { key: 'member.create', label: 'Register Member', group: 'Members' },
  { key: 'member.approve', label: 'Approve Member', group: 'Members' },
  { key: 'reports.view', label: 'View Reports', group: 'Reports' },
  { key: 'settings.manage', label: 'Manage Settings', group: 'Admin' },
  { key: 'roles.manage', label: 'Manage Roles', group: 'Admin' },
];

export interface RoleAssignment {
  userId: string;
  userName: string;
  roleId: string;
  assignedAt: string;
}

const PRESET_ROLES: Role[] = [
  {
    id: 'role-collector',
    name: 'Collector',
    description: 'Can record collections, requires approval',
    permissions: ['collection.create'],
    isPreset: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'role-accountant',
    name: 'Accountant',
    description: 'Records expenses and bank transactions',
    permissions: ['expense.create', 'bank.create', 'collection.create', 'reports.view'],
    isPreset: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'role-approver',
    name: 'Approver',
    description: 'Approves all financial transactions',
    permissions: ['collection.approve', 'expense.approve', 'bank.approve', 'member.approve', 'reports.view'],
    isPreset: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'role-viewer',
    name: 'Viewer',
    description: 'Read-only access to reports',
    permissions: ['reports.view'],
    isPreset: true,
    createdAt: new Date().toISOString(),
  },
];

interface RolesState {
  roles: Role[];
  assignments: RoleAssignment[];
  isLoading: boolean;
  error: string | null;
  loadRoles: () => Promise<void>;
  addRole: (role: Omit<Role, 'id' | 'isPreset' | 'createdAt'>) => Promise<Role>;
  updateRole: (id: string, patch: Partial<Omit<Role, 'id' | 'isPreset'>>) => Promise<void>;
  deleteRole: (id: string) => Promise<void>;
  assignRole: (userId: string, userName: string, roleId: string) => Promise<void>;
  unassignRole: (userId: string, roleId: string) => Promise<void>;
  loadAssignments: (userId?: string) => Promise<void>;
  getUserPermissions: (userId: string) => Permission[];
  hasPermission: (userId: string, permission: Permission) => boolean;
  loadMyPermissions: () => Promise<Permission[]>;
}

export const useRolesStore = create<RolesState>()(
  persist(
    (set, get) => ({
      roles: PRESET_ROLES,
      assignments: [],
      isLoading: false,
      error: null,

      loadRoles: async () => {
        set({ isLoading: true, error: null });
        try {
          const response = await apiClient.getRoles();
          // console.log('Roles API Response:', response); // Debug log
          // console.log('Response data type:', typeof response.data, 'Is Array:', Array.isArray(response.data)); // Debug
          // console.log('Response data keys:', Object.keys(response.data || {})); // Debug
          
          // Handle both array and nested response structures
          let rolesArray = Array.isArray(response.data)
            ? response.data
            : Array.isArray(response.data?.roles)
            ? response.data.roles
            : response.data?.data && Array.isArray(response.data.data)
            ? response.data.data
            : [];
          
          // console.log('Extracted roles array:', rolesArray, 'length:', rolesArray.length); // Debug
          
          // Merge with preset roles (preset roles are essential)
          const allRoles = [...PRESET_ROLES, ...rolesArray.filter((r: Role) => !r.isPreset)];
          set({ roles: allRoles, isLoading: false });
        } catch (error) {
          console.error('Failed to load roles:', error);
          set({ error: 'Failed to load roles', isLoading: false });
          // Keep preset roles on error
        }
      },

      addRole: async (role) => {
        set({ isLoading: true, error: null });
        try {
          const response = await apiClient.createRole(role as { name: string; description?: string; permissions: string[] });
          const newRole = response.data;
          set((s) => ({ roles: [...s.roles, newRole], isLoading: false }));
          return newRole;
        } catch (error) {
          console.error('Failed to create role:', error);
          set({ error: 'Failed to create role', isLoading: false });
          throw error;
        }
      },

      updateRole: async (id, patch) => {
        set({ isLoading: true, error: null });
        try {
          const response = await apiClient.updateRole(id, patch);
          const updatedRole = response.data;
          set((s) => ({
            roles: s.roles.map((r) => (r.id === id ? updatedRole : r)),
            isLoading: false,
          }));
        } catch (error) {
          console.error('Failed to update role:', error);
          set({ error: 'Failed to update role', isLoading: false });
          throw error;
        }
      },

      deleteRole: async (id) => {
        set({ isLoading: true, error: null });
        try {
          await apiClient.deleteRole(id);
          set((s) => ({
            roles: s.roles.filter((r) => r.id !== id || r.isPreset),
            assignments: s.assignments.filter((a) => a.roleId !== id),
            isLoading: false,
          }));
        } catch (error) {
          console.error('Failed to delete role:', error);
          set({ error: 'Failed to delete role', isLoading: false });
          throw error;
        }
      },

      assignRole: async (userId, userName, roleId) => {
        set({ isLoading: true, error: null });
        try {
          await apiClient.assignRole({ userId, userName, roleId });
          set((s) => ({
            assignments: [
              ...s.assignments.filter((a) => !(a.userId === userId && a.roleId === roleId)),
              { userId, userName, roleId, assignedAt: new Date().toISOString() },
            ],
            isLoading: false,
          }));
        } catch (error) {
          console.error('Failed to assign role:', error);
          set({ error: 'Failed to assign role', isLoading: false });
          throw error;
        }
      },

      unassignRole: async (userId, roleId) => {
        set({ isLoading: true, error: null });
        try {
          await apiClient.removeRoleAssignment({ userId, roleId });
          set((s) => ({
            assignments: s.assignments.filter((a) => !(a.userId === userId && a.roleId === roleId)),
            isLoading: false,
          }));
        } catch (error) {
          console.error('Failed to unassign role:', error);
          set({ error: 'Failed to unassign role', isLoading: false });
          throw error;
        }
      },

      loadAssignments: async (userId) => {
        set({ isLoading: true, error: null });
        try {
          const response = await apiClient.getRoleAssignments(userId ? { userId } : undefined);
          // console.log('Role Assignments API Response:', response); // Debug log
          // console.log('Response data type:', typeof response.data, 'Is Array:', Array.isArray(response.data)); // Debug
          
          // Handle both array and nested response structures
          let assignmentsArray = Array.isArray(response.data)
            ? response.data
            : Array.isArray(response.data?.assignments)
            ? response.data.assignments
            : response.data?.data && Array.isArray(response.data.data)
            ? response.data.data
            : [];
          
          // console.log('Extracted assignments array:', assignmentsArray, 'length:', assignmentsArray.length); // Debug
          set({ assignments: assignmentsArray, isLoading: false });
        } catch (error) {
          console.error('Failed to load role assignments:', error);
          set({ error: 'Failed to load role assignments', isLoading: false });
        }
      },

      getUserPermissions: (userId) => {
        const { assignments, roles } = get();
        const userRoleIds = assignments.filter((a) => a.userId === userId).map((a) => a.roleId);
        const perms = new Set<Permission>();
        userRoleIds.forEach((rid) => {
          roles.find((r) => r.id === rid)?.permissions.forEach((p) => perms.add(p as Permission));
        });
        return Array.from(perms);
      },

      hasPermission: (userId, permission) => get().getUserPermissions(userId).includes(permission),

      loadMyPermissions: async () => {
        try {
          const response = await apiClient.getMyPermissions();
          return response.data;
        } catch (error) {
          console.error('Failed to load my permissions:', error);
          return [];
        }
      },
    }),
    { name: 'somitee-roles-storage' }
  )
);
