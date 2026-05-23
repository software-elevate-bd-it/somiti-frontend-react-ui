import { useAuthStore, useCurrentPermissions } from '@/stores/authStore';
import { Permission } from '@/stores/rolesStore';

export function usePermissions() {
  const user = useAuthStore((s) => s.user);
  const perms = useCurrentPermissions();

  const isAdmin = user?.role === 'super_admin' || user?.role === 'main_user';

  const has = (p: Permission | Permission[]): boolean => {
    if (isAdmin) return true;
    const list = Array.isArray(p) ? p : [p];
    return list.some((perm) => (perms as string[]).includes(perm));
  };

  const hasAll = (list: Permission[]): boolean => {
    if (isAdmin) return true;
    return list.every((p) => (perms as string[]).includes(p));
  };

  return { has, hasAll, isAdmin, permissions: perms, user };
}
