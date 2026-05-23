import DataTable, { Column } from '@/components/shared/DataTable';
import { somitees, Somitee } from '@/data/dummyData';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ShieldCheck, ShieldOff } from 'lucide-react';
import { toast } from 'sonner';

const columns: Column<Somitee>[] = [
  { key: 'name', label: 'Somitee', sortable: true },
  { key: 'managerName', label: 'Manager' },
  { key: 'email', label: 'Email' },
  { key: 'totalMembers', label: 'Members', sortable: true },
  { key: 'plan', label: 'Plan', render: (s) => <Badge variant="secondary" className="capitalize">{s.plan}</Badge> },
  { key: 'status', label: 'Status', render: (s) => <Badge variant={s.status === 'active' ? 'default' : 'destructive'}>{s.status}</Badge> },
  { key: 'actions', label: 'Actions', render: (s) => (
    <Button size="sm" variant="ghost" onClick={() => toast.success(`${s.status === 'active' ? 'Blocked' : 'Activated'} ${s.name}`)}>
      {s.status === 'active' ? <ShieldOff className="h-4 w-4" /> : <ShieldCheck className="h-4 w-4" />}
    </Button>
  )},
];

export default function SomiteesPage() {
  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-heading font-bold">Somitee Management</h1><p className="text-muted-foreground">Manage all registered somitees</p></div>
      <Card><CardContent className="pt-6"><DataTable data={somitees} columns={columns} searchKey="name" /></CardContent></Card>
    </div>
  );
}
