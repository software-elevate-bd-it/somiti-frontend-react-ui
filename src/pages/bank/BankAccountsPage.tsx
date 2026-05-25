import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import DataTable, { Column } from '@/components/shared/DataTable';
import HelpModal from '@/components/shared/HelpModal';
import { useBankAccountsStore } from '@/stores/bankAccountsStore';
import type { BankAccount } from '@/lib/api';
import { Landmark, Plus, ArrowLeftRight, Loader2, UserPlus, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

const bankSchema = z.object({
  bankName: z.string().min(2, 'Bank name required'),
  accountName: z.string().min(2, 'Account name required'),
  accountNumber: z.string().min(5, 'Account number required'),
  openingBalance: z.coerce.number().min(0),
});

const txSchema = z.object({
  bankAccountId: z.string().min(1, 'Select bank'),
  type: z.enum(['deposit', 'withdraw', 'transfer']),
  amount: z.coerce.number().min(1, 'Amount required'),
  note: z.string().min(1, 'Note required'),
  date: z.string().min(1, 'Date required'),
  transferTo: z.string().optional(),
});

interface BankTransaction {
  id: string;
  date: string;
  type: 'deposit' | 'withdraw' | 'transfer';
  amount: number;
  note: string;
  reference?: string;
}

export default function BankAccountsPage() {
  const [addOpen, setAddOpen] = useState(false);
  const [txOpen, setTxOpen] = useState(false);
  const [transactions, setTransactions] = useState<BankTransaction[]>([]);
  const { t } = useTranslation();
  
  const accounts = useBankAccountsStore((s) => s.accounts) || [];
  const loadAccounts = useBankAccountsStore((s) => s.loadAccounts);
  const createAccount = useBankAccountsStore((s) => s.createAccount);
  const deposit = useBankAccountsStore((s) => s.deposit);
  const withdraw = useBankAccountsStore((s) => s.withdraw);
  const transfer = useBankAccountsStore((s) => s.transfer);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadAccounts();
  }, [loadAccounts]);

  const total = Array.isArray(accounts) ? accounts.reduce((s, b) => s + (typeof b.balance === 'number' ? b.balance : 0), 0) : 0;

  const txColumns: Column<BankTransaction>[] = [
    { key: 'date', label: t('common.date'), sortable: true },
    { key: 'type', label: t('common.type'), render: (tx) => (
      <Badge variant={tx.type === 'deposit' ? 'default' : tx.type === 'withdraw' ? 'destructive' : 'secondary'}>{t(`bank.${tx.type}`)}</Badge>
    )},
    { key: 'amount', label: t('common.amount'), render: (tx) => {
      const amount = typeof tx.amount === 'number' ? tx.amount : 0;
      return `৳${amount.toLocaleString()}`;
    } },
    { key: 'note', label: t('common.note') },
    { key: 'reference', label: 'Reference', render: (tx) => tx.reference || '-' },
  ];

  const bankForm = useForm<z.infer<typeof bankSchema>>
    ({ resolver: zodResolver(bankSchema), 
      defaultValues: { bankName: '', accountName: '', accountNumber: '', openingBalance: 0 } 
    });
  const txForm = useForm<z.infer<typeof txSchema>>
    ({ resolver: zodResolver(txSchema), 
      defaultValues: 
      { bankAccountId: '', type: 'deposit', amount: 0, note: '', 
        date: new Date().toISOString().split('T')[0], 
        transferTo: '' } 
      });

  const handleAddBank = async (data: z.infer<typeof bankSchema>) => {
    try {
      setIsLoading(true);

      await new Promise(
        (resolve) => 
          setTimeout(resolve, 2000)
      );

     const result = await createAccount({
        bankName: data.bankName,
        accountName: data.accountName,
        accountNumber: data.accountNumber,
        openingBalance: data.openingBalance,
      });
 console.log('Created bank account:', result);

      setAddOpen(false);
      bankForm.reset();

      toast.success(t('bank.bankAdded'));
    } catch (error) {
      toast.error('Failed to add bank account');
    }finally {

    setIsLoading(false);
  }
  };

  const handleTx = async (data: z.infer<typeof txSchema>) => {
    try {
      if (data.type === 'deposit') {
        await deposit(data.bankAccountId, {
          amount: data.amount,
          date: data.date,
          note: data.note,
        });
      }
      if (data.type === 'withdraw') {
        await withdraw(data.bankAccountId, {
          amount: data.amount,
          date: data.date,
          note: data.note,
        });
      }
      // if (data.type === 'transfer') {
      //   await transfer(data.bankAccountId, {
      //     amount: data.amount,
      //     date: data.date,
      //     note: data.note,
      //   });
      // }
      setTxOpen(false);
      txForm.reset();
      toast.success(t('bank.transactionRecorded', { type: data.type }));
    } catch (error) {
      toast.error('Failed to record transaction');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div>
            <h1 className="text-2xl font-heading font-bold">{t('bank.title')}</h1>
            <p className="text-muted-foreground">{t('bank.totalBalance')}: ৳{total.toLocaleString()}</p>
          </div>
          <HelpModal title={t('bank.helpTitle')} description={t('bank.helpDesc')} steps={[t('bank.helpStep1'), t('bank.helpStep2'), t('bank.helpStep3')]} />
        </div>
        <div className="flex gap-2">
          <Dialog open={txOpen} onOpenChange={setTxOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <ArrowLeftRight className="h-4 w-4 mr-2" /> 
                {t('bank.transaction')}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="font-heading">{t('bank.transaction')}</DialogTitle>
              </DialogHeader>
              <Form {...txForm}>
                <form onSubmit={txForm.handleSubmit(handleTx)} className="space-y-4">
                  <FormField control={txForm.control} name="bankAccountId" render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('bank.title')} *</FormLabel>
                      <FormControl>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <SelectTrigger>
                            <SelectValue placeholder={t('bank.selectBank')} />
                          </SelectTrigger>
                          <SelectContent>
                            {Array.isArray(accounts) && accounts.map(b => 
                            <SelectItem key={b.id} value={b.id}>
                              {b.bankName} - {b.accountNumber}
                            </SelectItem>)}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <div className="grid grid-cols-2 gap-3">
                    <FormField control={txForm.control} name="type" render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('common.type')} *</FormLabel>
                        <FormControl>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="deposit">{t('bank.deposit')}</SelectItem>
                            <SelectItem value="withdraw">{t('bank.withdraw')}</SelectItem>
                            {/* <SelectItem value="transfer">{t('bank.transfer')}</SelectItem> */}
                          </SelectContent>
                        </Select>
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )} />
                    <FormField control={txForm.control} name="amount" render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('common.amount')} *</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>
                  <FormField control={txForm.control} name="date" render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('common.date')} *</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                      </FormItem>
                  )} />
                  <FormField control={txForm.control} name="note" render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('common.note')} *</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                      </FormItem>
                  )} />
                  <Button type="submit" className="w-full">{t('common.save')}</Button>
                </form>
              </Form>
            </DialogContent>
          </Dialog>

          <Dialog open={addOpen} onOpenChange={setAddOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" /> {t('bank.addBankAccount')}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="font-heading">{t('bank.addBankAccount')}</DialogTitle>
              </DialogHeader>
              <Form {...bankForm}>
                <form onSubmit={bankForm.handleSubmit(handleAddBank)} className="space-y-4">
                  <FormField control={bankForm.control} name="bankName" render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('bank.bankName')} *</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={bankForm.control} name="accountName" render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('bank.accountName')} *</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                    <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={bankForm.control} name="accountNumber" render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('bank.accountNumber')} *</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={bankForm.control} name="openingBalance" render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('bank.openingBalance')}</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                      </FormControl>
                    <FormMessage />
                    </FormItem>
                  )} />
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    
                     {isLoading ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Saving...
                            </>
                          ) : (
                            <>
                              <Save className="h-4 w-4 mr-2" />
                              {t('common.save')}
                            </>
                     )}
                  </Button>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.isArray(accounts) && accounts.map(bank => (
          <Card key={bank.id} className="animate-fade-in">
            <CardHeader className="pb-2">
              <CardTitle className="font-heading text-lg flex items-center gap-2">
                <Landmark className="h-5 w-5 text-primary" /> {bank.bankName || 'Bank'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{t('bank.accountNumber')}: {bank.accountNumber || '-'}</p>
              <p className="text-xs text-muted-foreground">{bank.accountName || 'N/A'}</p>
              <p className="text-2xl font-heading font-bold mt-2">৳{typeof bank.balance === 'number' ? bank.balance.toLocaleString() : '0'}</p>
              <p className="text-xs text-muted-foreground">{t('bank.openingBalance')}: ৳{typeof bank.openingBalance === 'number' ? bank.openingBalance.toLocaleString() : '0'}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* <Card>
        <CardContent className="pt-6">
          <Tabs defaultValue="ledger">
            <TabsList>
              <TabsTrigger value="ledger">{t('bank.bankLedger')}</TabsTrigger>
              <TabsTrigger value="statement">{t('bank.bankStatement')}</TabsTrigger>
            </TabsList>
            <TabsContent value="ledger">
              <DataTable data={transactions} columns={txColumns} searchKey="note" emptyMessage={t('bank.noBankTransactions')} />
            </TabsContent>
            <TabsContent value="statement">
              <DataTable data={transactions} columns={txColumns} searchKey="note" emptyMessage={t('bank.noStatements')} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card> */}
    </div>
  );
}
