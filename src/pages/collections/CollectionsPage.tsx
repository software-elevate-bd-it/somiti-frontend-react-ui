import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import DataTable, { Column } from '@/components/shared/DataTable';
import HelpModal from '@/components/shared/HelpModal';
import { useCollectionsStore } from '@/stores/collectionsStore';
import { useMembersStore } from '@/stores/membersStore';
import type { Collection } from '@/lib/api';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Plus, Wallet, Link2, Copy } from 'lucide-react';
import { toast } from 'sonner';

const collectionSchema = z.object({
  memberId: z.string().min(1, 'Select a member'),
  amount: z.coerce.number().min(1, 'Amount must be positive'),
  method: z.enum(['cash', 'bkash', 'nagad', 'bank', 'sslcommerz']),
  category: z.string().min(1, 'Select category'),
  transactionId: z.string().optional(),
});

type CollectionFormData = z.infer<typeof collectionSchema>;

export default function CollectionsPage() {
  const { t } = useTranslation();
  const { collections, isLoading, loadCollections, createCollection } = useCollectionsStore();
  const { members, loadMembers } = useMembersStore();
  const [open, setOpen] = useState(false);
  const [linkDialogOpen, setLinkDialogOpen] = useState(false);

  useEffect(() => {
    loadCollections();
    loadMembers();
  }, [loadCollections, loadMembers]);

  const columns: Column<Collection>[] = [
    { key: 'memberName', label: t('nav.members'), sortable: true },
    { key: 'category', label: t('common.category') },
    { key: 'amount', label: t('common.amount'), render: (tx) => `৳${tx.amount.toLocaleString()}`, sortable: true },
    { key: 'method', label: t('common.method'), render: (tx) => <span className="capitalize">{tx.method}</span> },
    { key: 'status', label: t('common.status'), render: (tx) => (
      <Badge variant={tx.status === 'approved' ? 'default' : tx.status === 'pending' ? 'secondary' : 'destructive'}>{tx.status}</Badge>
    )},
    { key: 'transactionId', label: t('collections.transactionId'), render: (tx) => tx.transactionId || '-' },
    { key: 'date', label: t('common.date'), sortable: true },
  ];

  const form = useForm<CollectionFormData>({
    resolver: zodResolver(collectionSchema),
    defaultValues: { memberId: '', amount: 500, method: 'cash', category: 'Monthly Fee', transactionId: '' },
  });

  const method = form.watch('method');

  const handleSubmit = async (data: CollectionFormData) => {
    try {
      await createCollection({
        memberId: data.memberId,
        amount: data.amount,
        date: new Date().toISOString().split('T')[0],
        category: data.category,
        method: data.method,
        transactionId: data.transactionId,
      });
      setOpen(false);
      form.reset();
      toast.success(t('collections.collectionRecorded'));
    } catch (error) {
      toast.error(t('collections.collectionFailed'));
    }
  };

  const copyPaymentLink = (link: string) => {
    navigator.clipboard.writeText(`https://somiteehq.com/pay/${link}`);
    toast.success(t('collections.paymentLinkCopied'));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div>
            <h1 className="text-2xl font-heading font-bold">{t('collections.title')}</h1>
            <p className="text-muted-foreground">{t('collections.subtitle')}</p>
          </div>
          <HelpModal title={t('collections.helpTitle')} description={t('collections.helpDesc')} steps={[t('collections.helpStep1'), t('collections.helpStep2'), t('collections.helpStep3'), t('collections.helpStep4'), t('collections.helpStep5')]} />
        </div>
        <div className="flex gap-2">
          <Dialog open={linkDialogOpen} onOpenChange={setLinkDialogOpen}>
            <DialogTrigger asChild><Button variant="outline"><Link2 className="h-4 w-4 mr-2" /> {t('collections.paymentLinks')}</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle className="font-heading">{t('collections.memberPaymentLinks')}</DialogTitle></DialogHeader>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {members.map(m => (
                  <div key={m.id} className="flex items-center justify-between p-2 rounded bg-muted/50">
                    <div><p className="text-sm font-medium">{m.name}</p><p className="text-xs text-muted-foreground">somiteehq.com/pay/{m.paymentLink}</p></div>
                    <Button size="sm" variant="ghost" onClick={() => copyPaymentLink(m.paymentLink || '')}><Copy className="h-3 w-3" /></Button>
                  </div>
                ))}
              </div>
            </DialogContent>
          </Dialog>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-2" /> {t('collections.recordCollection')}</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle className="font-heading">{t('collections.recordPayment')}</DialogTitle></DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                  <FormField control={form.control} name="memberId" render={({ field }) => (
                    <FormItem><FormLabel>{t('nav.members')} *</FormLabel><FormControl>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger><SelectValue placeholder={t('collections.selectMember')} /></SelectTrigger>
                        <SelectContent>{members.map(m => <SelectItem key={m.id} value={m.id}>{m.name} - {m.shopName}</SelectItem>)}</SelectContent>
                      </Select>
                    </FormControl><FormMessage /></FormItem>
                  )} />
                  <div className="grid grid-cols-2 gap-3">
                    <FormField control={form.control} name="amount" render={({ field }) => (
                      <FormItem><FormLabel>{t('common.amount')} *</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="method" render={({ field }) => (
                      <FormItem><FormLabel>{t('common.method')} *</FormLabel><FormControl>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="cash">{t('collections.cash')}</SelectItem>
                            <SelectItem value="bkash">bKash</SelectItem>
                            <SelectItem value="nagad">Nagad</SelectItem>
                            <SelectItem value="bank">{t('collections.bankTransfer')}</SelectItem>
                            <SelectItem value="sslcommerz">SSLCommerz</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl><FormMessage /></FormItem>
                    )} />
                  </div>
                  <FormField control={form.control} name="category" render={({ field }) => (
                    <FormItem><FormLabel>{t('common.category')} *</FormLabel><FormControl>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Monthly Fee">{t('members.monthlyFee')}</SelectItem>
                          <SelectItem value="Late Fee">{t('collections.lateFee')}</SelectItem>
                          <SelectItem value="Custom">{t('collections.custom')}</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl><FormMessage /></FormItem>
                  )} />
                  {(method === 'bkash' || method === 'nagad' || method === 'bank') && (
                    <FormField control={form.control} name="transactionId" render={({ field }) => (
                      <FormItem><FormLabel>{t('collections.transactionId')} {method === 'bank' ? `(${t('collections.required')})` : `(${t('members.optional')})`}</FormLabel><FormControl><Input placeholder={t('collections.transactionId')} {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                  )}
                  <Button type="submit" className="w-full"><Wallet className="h-4 w-4 mr-2" /> {t('collections.saveCollection')}</Button>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          <DataTable data={collections} columns={columns} searchKey="memberName" />
        </CardContent>
      </Card>
    </div>
  );
}
