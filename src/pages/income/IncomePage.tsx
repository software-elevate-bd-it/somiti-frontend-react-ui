import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import DataTable, { Column } from '@/components/shared/DataTable';
import { useApprovalsStore } from '@/stores/approvalsStore';
import { useAuthStore } from '@/stores/authStore';
import { apiClient, Income, type Expense } from '@/lib/api';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Plus, UserPlus, Loader, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PermissionGuard } from '@/components/shared/PermissionGuard';
import { useIncomesStore } from '@/stores/incomeStore';
import { useBankAccountsStore } from '@/stores/bankAccountsStore';


// const columns: Column<Income>[] = [
//   { key: 'title', label: 'Title' },
//   { key: 'type', label: 'Type', sortable: true },
//   { key: 'amount', label: 'Amount', render: (t) => `৳${t.amount ? t.amount.toLocaleString() : '0'}`, sortable: true },
//   { key: 'date', label: 'incomeDate', sortable: true },
//   { key: 'source', label: 'Source' },
//   { key: 'referenceNo', label: 'Reference No' },
//   { key: 'description', label: 'Description' },
//   { key: 'note', label: 'Note' },
//   { key: 'bankAccountId', 
//     label: 'Bank Account',
//    render: (row) => {

//     const bank =
//       bankAccounts.find(
//         b =>
//           String(b.id) ===
//           String(row.bankAccountId)
//       );

//     return (
//       bank?.bankName ||
//       'Not Set'
//     );

//   } },
//   { key: 'status', label: 'Status', render: (t) => <Badge variant={t.status === 'received' ? 'default' : t.status === 'pending' ? 'secondary' : 'destructive'}>{t.status || 'pending'}</Badge> },
// ];

export default function IncomePage() {
  const { t } = useTranslation();
  const incomes = useIncomesStore((s) => s.incomes) || [];
  const loadIncomes = useIncomesStore((s) => s.loadIncomes);
  const loadTypes = useIncomesStore((s) => s.loadTypes);

//   const types = useIncomesStore((s) => s.types);
  const bankAccounts = useBankAccountsStore((s) => s.accounts) || [];

  const columns: Column<Income>[] = [
  {
    key: 'title',
    label: 'Title',
  },

  {
    key: 'type',
    label: 'Type',
    sortable: true,
  },

  {
    key: 'amount',
    label: 'Amount',
    render: (t) =>
      `৳${t.amount?.toLocaleString() || '0'}`,
  },

  {
    key: 'incomeDate',
    label: 'Date',
    sortable: true,
  },

  {
    key: 'source',
    label: 'Source',
  },

  {
    key: 'referenceNo',
    label: 'Reference No',
  },

  {
    key: 'description',
    label: 'Description',
  },

  {
    key: 'note',
    label: 'Note',
  },

  {
    key: 'bankAccountId',

    label: 'Bank Account',

    render: (row) => {

      const bank =
        bankAccounts.find(
          (b) =>
            String(b.id) ===
            String(row.bankAccountId)
        );

      return (
        bank?.bankName ||
        'Not Set'
      );
    },
  },

  // {
  //   key: 'status',

  //   label: 'Status',

  //   render: (t) => (
  //     <Badge
  //       variant={
  //         t.status === 'received'
  //           ? 'default'
  //           : 'secondary'
  //       }
  //     >
  //       {t.status}
  //     </Badge>
  //   ),
  // },
];

  console.log('Bank Accounts in income:', bankAccounts);

  const [isLoading, setIsLoading] = useState(false);
  const [open, setOpen] = useState(false);
      
  const loadAccounts =
useBankAccountsStore(
(s) =>
s.loadAccounts
);
  useEffect(() => {
    loadIncomes();
    // loadTypes();
    loadAccounts();
  }, [loadIncomes, loadAccounts]);

  const [form, setForm] = useState({ title:'', type: '', amount: '', date: new Date().toISOString().split('T')[0], source:'', referenceNo:'', description:'', note: '',bankAccountId:'' });
  const submit = useApprovalsStore((s) => s.submit);
  const items = useApprovalsStore((s) => s.items);

  const user = useAuthStore((s) => s.user);

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  if (!form.type || !form.amount || !user)
    return toast.error('Fill required fields');

  try {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 2000));

    await apiClient.createIncome({
     
      title: form.title,
      type: form.type,
      amount: Number(form.amount),
      incomeDate: form.date,
      source: form.source,
      referenceNo: form.referenceNo,
      description: form.description,
      note: form.note,
      bankAccountId: Number(form.bankAccountId),
      status:'pending'
    });

    toast.success('Income submitted successfully');

    setForm({
      title: '',
      type: '',
      amount: '',
      date: new Date().toISOString().split('T')[0],
      source:'',
      referenceNo:'',
      description:'',
      note: '',
      bankAccountId:''
    });

    setOpen(false);

    // refresh list
    loadIncomes();

  } catch (err) {
    toast.error('Failed to create expense');
  }
};


  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold">Incomes</h1>
          {/* <p className="text-muted-foreground">
            All expenses require approval before being recorded
          </p> */}
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <PermissionGuard permission="expense.create" message="You don't have permission to create ">
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-2" /> Add Income</Button>
          </DialogTrigger>
          </PermissionGuard>
          <DialogContent>
            <DialogHeader><DialogTitle className="font-heading">Record Income</DialogTitle></DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
                {/* title & type */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                    <Label>Title *</Label>
                    <Input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
                </div>
                <div>
                    <Label>Type *</Label>
                    <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                        <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="fixed_deposit_interest">Fixed Deposit Interest</SelectItem>
                            <SelectItem value="donation">Donation</SelectItem>
                            <SelectItem value="bank_interest">Bank Interest</SelectItem>
                            <SelectItem value="service_income">Service Income</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
              </div>
              {/* amount & date */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1"><Label>Amount *</Label><Input type="number" required value={form.amount}  onChange={(e) => setForm({ ...form, amount: e.target.value })} />
                </div>
                <div className="space-y-1">
                    <Label>Date</Label><Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
                </div>
              </div>
                {/* source & reference */}
              <div className='grid grid-cols-2 gap-2'>
                <div className="space-y-1">
                    <Label>Source</Label>
                    <Input value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })} />
                </div>
                <div className="space-y-1">
                    <Label>Reference No</Label>
                    <Input value={form.referenceNo} onChange={(e) => setForm({ ...form, referenceNo: e.target.value })} />
                </div>
              </div>
              {/* description & note */}
              <div className='grid grid-cols-2 gap-2'>
                <div className="space-y-1">
                    <Label>Description</Label>
                    <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Description..." />
                </div>
              <div className="space-y-1">
                <Label>Note</Label>
                <Textarea value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} placeholder="Note..." />
                </div>
              </div>
                {/* bank account */}
                <div className="space-y-1">
                  <Label>Bank Account</Label>
                  <Select value={form.bankAccountId} onValueChange={(v) => setForm({ ...form, bankAccountId: v })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select bank account" />
                    </SelectTrigger>
                    <SelectContent>
                      {bankAccounts.map((account) => (
                        <SelectItem key={account.id} value={account.id}>
                          {account.bankName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
                >
                {isLoading ? (
                <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Adding...
                </>
                ) : (
                    <>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Add Income
                    </>
                )}
                </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="approved">
        <TabsList>
          <TabsTrigger value="approved">Recorded ({incomes.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="approved" className="mt-4">
          <Card>
            <CardContent className="pt-6">
              <DataTable data={incomes} columns={columns} searchKey="category" />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
// ======
// =========