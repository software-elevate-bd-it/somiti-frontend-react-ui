import { useParams, Link } from 'react-router-dom';
import { members, transactions } from '@/data/dummyData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import DataTable, { Column } from '@/components/shared/DataTable';
import { Transaction } from '@/data/dummyData';
import { ArrowLeft, Download, Printer, User, Phone, MapPin, CreditCard, Calendar } from 'lucide-react';
import { toast } from 'sonner';

const txColumns: Column<Transaction>[] = [
  { key: 'date', label: 'Date', sortable: true },
  { key: 'category', label: 'Category' },
  { key: 'amount', label: 'Amount', render: (t) => `৳${t.amount.toLocaleString()}` },
  { key: 'method', label: 'Method', render: (t) => <span className="capitalize">{t.method}</span> },
  { key: 'status', label: 'Status', render: (t) => <Badge variant={t.status === 'approved' ? 'default' : t.status === 'pending' ? 'secondary' : 'destructive'}>{t.status}</Badge> },
];

export default function MemberProfilePage() {
  const { id } = useParams();
  const member = members.find(m => m.id === id);
  if (!member) return <div className="p-6"><p>Member not found.</p><Link to="/members" className="text-primary underline">Back to Members</Link></div>;

  const memberTx = transactions.filter(t => t.memberId === member.id);
  const payments = memberTx.filter(t => t.status === 'approved');
  const pending = memberTx.filter(t => t.status === 'pending');

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link to="/members"><Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button></Link>
        <div>
          <h1 className="text-2xl font-heading font-bold">{member.name}</h1>
          <p className="text-muted-foreground">{member.shopName}</p>
        </div>
        <Badge variant={member.status === 'active' ? 'default' : 'secondary'} className="ml-auto">{member.status}</Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6 space-y-3">
            <div className="flex items-center justify-center">
              <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="h-10 w-10 text-primary" />
              </div>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2"><Phone className="h-4 w-4 text-muted-foreground" /> {member.phone}</div>
              <div className="flex items-center gap-2"><MapPin className="h-4 w-4 text-muted-foreground" /> {member.address}</div>
              <div className="flex items-center gap-2"><CreditCard className="h-4 w-4 text-muted-foreground" /> NID: {member.nid || 'N/A'}</div>
              <div className="flex items-center gap-2"><Calendar className="h-4 w-4 text-muted-foreground" /> Joined: {member.joinDate}</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2"><CardTitle className="font-heading text-sm">Financial Summary</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between"><span className="text-sm text-muted-foreground">Monthly Fee</span><span className="font-semibold">৳{member.monthlyFee}</span></div>
            <div className="flex justify-between"><span className="text-sm text-muted-foreground">Total Paid</span><span className="font-semibold text-green-600">৳{member.totalPaid.toLocaleString()}</span></div>
            <div className="flex justify-between"><span className="text-sm text-muted-foreground">Total Due</span><span className="font-semibold text-destructive">৳{member.totalDue.toLocaleString()}</span></div>
            <div className="flex justify-between"><span className="text-sm text-muted-foreground">Payment Link</span><span className="text-xs text-primary truncate">{member.paymentLink}</span></div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2"><CardTitle className="font-heading text-sm">Quick Actions</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            <Button size="sm" className="w-full" variant="outline" onClick={() => toast.success('PDF report generated')}><Download className="h-3 w-3 mr-2" /> Download PDF</Button>
            <Button size="sm" className="w-full" variant="outline" onClick={() => toast.success('CSV exported')}><Download className="h-3 w-3 mr-2" /> Export CSV</Button>
            <Button size="sm" className="w-full" variant="outline" onClick={() => window.print()}><Printer className="h-3 w-3 mr-2" /> Print</Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="pt-6">
          <Tabs defaultValue="ledger">
            <TabsList>
              <TabsTrigger value="ledger">Ledger</TabsTrigger>
              <TabsTrigger value="payments">Payment History ({payments.length})</TabsTrigger>
              <TabsTrigger value="dues">Due History ({pending.length})</TabsTrigger>
            </TabsList>
            <TabsContent value="ledger"><DataTable data={memberTx} columns={txColumns} searchKey="category" emptyMessage="No transactions" /></TabsContent>
            <TabsContent value="payments"><DataTable data={payments} columns={txColumns} searchKey="category" emptyMessage="No payments" /></TabsContent>
            <TabsContent value="dues"><DataTable data={pending} columns={txColumns} searchKey="category" emptyMessage="No pending dues" /></TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
