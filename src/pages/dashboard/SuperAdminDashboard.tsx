import StatsCard from '@/components/shared/StatsCard';
import DataTable, { Column } from '@/components/shared/DataTable';
import { somitees, Somitee } from '@/data/dummyData';
import { Building2, Users, Wallet, TrendingUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const columns: Column<Somitee>[] = [
  { key: 'name', label: 'Somitee Name', sortable: true },
  { key: 'managerName', label: 'Manager', sortable: true },
  { key: 'totalMembers', label: 'Members', sortable: true },
  { key: 'plan', label: 'Plan', render: (s) => <Badge variant="secondary" className="capitalize">{s.plan}</Badge> },
  { key: 'status', label: 'Status', render: (s) => (
    <Badge variant={s.status === 'active' ? 'default' : 'destructive'}>{s.status}</Badge>
  )},
];

export default function SuperAdminDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-heading font-bold">Platform Overview</h1>
        <p className="text-muted-foreground">Welcome back, System Admin</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Total Somitees" value={somitees.length} icon={Building2} change="+2 this month" changeType="positive" />
        <StatsCard title="Total Members" value="165" icon={Users} change="+12 this month" changeType="positive" />
        <StatsCard title="Total Transactions" value="৳4,50,000" icon={Wallet} change="+15% vs last month" changeType="positive" />
        <StatsCard title="Platform Revenue" value="৳25,000" icon={TrendingUp} change="+8% growth" changeType="positive" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="font-heading">All Somitees</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable data={somitees} columns={columns} searchKey="name" />
        </CardContent>
      </Card>
    </div>
  );
}
