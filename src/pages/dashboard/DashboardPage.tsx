import { useAuthStore } from '@/stores/authStore';
import SuperAdminDashboard from './SuperAdminDashboard';
import MainUserDashboard from './MainUserDashboard';
import MemberDashboard from './MemberDashboard';

export default function DashboardPage() {
  const role = useAuthStore((s) => s.user?.role);
  if (role === 'super_admin') return <SuperAdminDashboard />;
  if (role === 'main_user') return <MainUserDashboard />;
  return <MemberDashboard />;
}
