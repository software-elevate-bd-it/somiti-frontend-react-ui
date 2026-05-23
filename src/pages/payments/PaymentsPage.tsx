import { useEffect } from 'react';
import DataTable, { Column } from '@/components/shared/DataTable';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, XCircle } from 'lucide-react';
import { usePaymentsStore } from '@/stores/paymentsStore';
import { toast } from 'sonner';
import type { Payment } from '@/lib/api';


export default function PaymentsPage() {
  const payments = usePaymentsStore((s) => s.payments);
  const isLoading = usePaymentsStore((s) => s.isLoading);
  const loadPayments = usePaymentsStore((s) => s.loadPayments);
  const verifyPayment = usePaymentsStore((s) => s.verifyPayment);

  useEffect(() => {
    loadPayments();
  }, [loadPayments]);

  const handleVerify = async (id: string, status: string) => {
    try {
      await verifyPayment(id, status);
      toast.success(`Payment ${status}`);
    } catch (error) {
      toast.error('Failed to verify payment');
    }
  };

  const columns: Column<Payment>[] = [
  { key: 'memberName', label: 'Member',render: (p) => <span>{p.member.name}</span> },
  { key: 'amount', label: 'Amount', render: (p) => `৳${p.amount.toLocaleString()}` },
  { key: 'method', label: 'Method', render: (p) => <span className="capitalize">{p.method}</span> },
  { key: 'transactionId', label: 'TXN ID', render: (p) => p.transactionId || '—' },
  { key: 'status', label: 'Status', render: (p) => (
    <Badge variant={p.status === 'approved' ? 'default' : p.status === 'pending' ? 'secondary' : 'destructive'}>{p.status}</Badge>
  )},
  { key: 'actions', label: 'Actions', render: (p) => p.status === 'pending' ? (
    <div className="flex gap-1">
      <Button 
        size="sm" 
        variant="ghost" 
        className="text-success h-7 px-2"
        onClick={() => handleVerify(p.id, 'approved')}
      >
        <CheckCircle className="h-4 w-4" />
      </Button>
      <Button 
        size="sm" 
        variant="ghost" 
        className="text-destructive h-7 px-2"
        onClick={() => handleVerify(p.id, 'rejected')}
      >
        <XCircle className="h-4 w-4" />
      </Button>
    </div>
  ) : null },
];

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-heading font-bold">Payment Verification</h1><p className="text-muted-foreground">Review and approve pending payments</p></div>
      <Card><CardContent className="pt-6">{isLoading ? <p className="text-muted-foreground text-center py-8">Loading...</p> : <DataTable data={payments} columns={columns} searchKey="memberName" emptyMessage="No payments to verify" />}</CardContent></Card>
    </div>
  );
}
