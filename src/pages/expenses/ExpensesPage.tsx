import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import DataTable, { Column } from '@/components/shared/DataTable';
import { useExpensesStore } from '@/stores/expensesStore';
import { useApprovalsStore } from '@/stores/approvalsStore';
import { useAuthStore } from '@/stores/authStore';
import { apiClient, type Expense } from '@/lib/api';
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
import { resolve } from 'path';


const columns: Column<Expense>[] = [
  { key: 'category', label: 'Category', sortable: true },
  { key: 'amount', label: 'Amount', render: (t) => `৳${t.amount ? t.amount.toLocaleString() : '0'}`, sortable: true },
  { key: 'method', label: 'Method', render: (t) => <span className="capitalize">{t.method || 'N/A'}</span> },
  { key: 'note', label: 'Note' },
  { key: 'date', label: 'Date', sortable: true },
  { key: 'status', label: 'Status', render: (t) => <Badge variant={t.status === 'approved' ? 'default' : t.status === 'pending' ? 'secondary' : 'destructive'}>{t.status || 'pending'}</Badge> },
];

export default function ExpensesPage() {
  const { t } = useTranslation();
  const expenses = useExpensesStore((s) => s.expenses) || [];
  const loadExpenses = useExpensesStore((s) => s.loadExpenses);
  const loadCategories = useExpensesStore((s) => s.loadCategories);
  const categories = useExpensesStore((s) => s.categories);
  const [isLoading, setIsLoading] = useState(false);

  const [open, setOpen] = useState(false);

  useEffect(() => {
    loadExpenses();
    loadCategories();
  }, [loadExpenses, loadCategories]);
  const [form, setForm] = useState({ category: '', amount: '', date: new Date().toISOString().split('T')[0], note: '', method: 'cash' });
  const submit = useApprovalsStore((s) => s.submit);
  const items = useApprovalsStore((s) => s.items);
  const pendingExpenses = useMemo(
  () => items.filter(i => i.type === 'expense'),
  [items]
);


  const user = useAuthStore((s) => s.user);

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  if (!form.category || !form.amount || !user)
    return toast.error('Fill required fields');

  try {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 2000));

    await apiClient.createExpense({
      amount: Number(form.amount),
      date: form.date,
      category: form.category,
      method: form.method,
      receiptUrl: "", 
      note: form.note,
      status: 'pending',
    });

    toast.success('Expense submitted successfully');

    setForm({
      category: '',
      amount: '',
      date: new Date().toISOString().split('T')[0],
      note: '',
      method: 'cash',
    });

    setOpen(false);

    // refresh list
    loadExpenses();

  } catch (err) {
    toast.error('Failed to create expense');
  }
};


  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-heading font-bold">Expenses</h1><p className="text-muted-foreground">All expenses require approval before being recorded</p></div>
        <Dialog open={open} onOpenChange={setOpen}>
          <PermissionGuard permission="expense.create" message="You don't have permission to create expenses">
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-2" /> Add Expense</Button>
          </DialogTrigger>
          </PermissionGuard>
          <DialogContent>
            <DialogHeader><DialogTitle className="font-heading">Record Expense</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1"><Label>Category *</Label>
                <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                  <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                  <SelectContent>{categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1"><Label>Amount *</Label><Input type="number" required value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} /></div>
                <div className="space-y-1"><Label>Date</Label><Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></div>
              </div>
              <div className="space-y-1"><Label>Method</Label>
                <Select value={form.method} onValueChange={(v) => setForm({ ...form, method: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="bank">Bank</SelectItem>
                    <SelectItem value="bkash">bKash</SelectItem>
                    <SelectItem value="nagad">Nagad</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1"><Label>Note</Label><Textarea value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} placeholder="Description..." /></div>
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
      Add Expense
    </>
  )}
</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="approved">
        <TabsList>
          <TabsTrigger value="approved">Recorded ({expenses.length})</TabsTrigger>
          <TabsTrigger value="pending">In Approval ({pendingExpenses.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="approved" className="mt-4">
          <Card><CardContent className="pt-6"><DataTable data={expenses} columns={columns} searchKey="category" /></CardContent></Card>
        </TabsContent>
        <TabsContent value="pending" className="mt-4">
          <Card><CardContent className="pt-6">
            {pendingExpenses.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No expenses awaiting approval</p>
            ) : (
              <div className="space-y-2">
                {pendingExpenses.map((i) => (
                  <div key={i.id} className="flex items-center justify-between p-3 border rounded-md">
                    <div>
                      <p className="font-medium text-sm">{i.title}</p>
                      <p className="text-xs text-muted-foreground">by {i.createdByName} • {i.description}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">৳{i.amount?.toLocaleString()}</p>
                      <Badge variant={i.status === 'pending' ? 'secondary' : i.status === 'approved' ? 'default' : 'destructive'} className="text-[10px]">{i.status}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent></Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
