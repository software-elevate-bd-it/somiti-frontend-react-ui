import StatsCard from '@/components/shared/StatsCard';
import DataTable, { Column } from '@/components/shared/DataTable';
import { transactions, Transaction } from '@/data/dummyData';
import { Wallet, Receipt, AlertCircle, CheckCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuthStore } from '@/stores/authStore';

const myTxColumns: Column<Transaction>[] = [
  { key: 'category', label: 'Category' },
  { key: 'amount', label: 'Amount', render: (t) => `৳${t.amount.toLocaleString()}` },
  { key: 'method', label: 'Method', render: (t) => <span className="capitalize">{t.method}</span> },
  { key: 'status', label: 'Status', render: (t) => (
    <Badge variant={t.status === 'approved' ? 'default' : t.status === 'pending' ? 'secondary' : 'destructive'}>{t.status}</Badge>
  )},
  { key: 'date', label: 'Date' },
];

export default function MemberDashboard() {
  const user = useAuthStore((s) => s.user);
  const myTransactions = transactions.filter(t => t.memberId === 'm1');
  const totalPaid = myTransactions.filter(t => t.status === 'approved').reduce((s, t) => s + t.amount, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-heading font-bold">My Dashboard</h1>
        <p className="text-muted-foreground">Welcome, {user?.name}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Total Paid" value={`৳${totalPaid.toLocaleString()}`} icon={CheckCircle} />
        <StatsCard title="Current Due" value="৳1,000" icon={AlertCircle} changeType="negative" change="Overdue" />
        <StatsCard title="Monthly Fee" value="৳500" icon={Wallet} />
        <StatsCard title="Transactions" value={myTransactions.length} icon={Receipt} />
      </div>

      <Card>
        <CardHeader><CardTitle className="font-heading">My Transactions</CardTitle></CardHeader>
        <CardContent>
          <DataTable data={myTransactions} columns={myTxColumns} />
        </CardContent>
      </Card>
    </div>
  );
}
