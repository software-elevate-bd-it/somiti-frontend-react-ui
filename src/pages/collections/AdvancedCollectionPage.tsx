import { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { FINANCIAL_YEARS, MemberPayment, MONTHS } from '@/data/dummyData';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import DataTable, { Column } from '@/components/shared/DataTable';
import { Wallet, CheckCircle, CalendarDays, Users, DollarSign, Search, Zap, CreditCard, Loader } from 'lucide-react';
import { toast } from 'sonner';
import i18n from '@/i18n';
import { useCollectionsStore } from '@/stores/collectionsStore';
import { apiClient, Collection, Member } from '@/lib/api';
import z from 'zod';


const collectionSchema = z.object({
  memberId: z.string().min(1,'Select a member'),
  financialYear: z.string().min(1, 'Select year'),
  months: z.array(z.number()).min(1, 'Select at least one month'),
  method: z.enum(['cash', 'bkash', 'nagad', 'bank', 'sslcommerz']),
  transactionId: z.string().optional(),
  discount: z.coerce.number().min(0).default(0),
});

type CollectionFormData = z.infer<typeof collectionSchema>;

export default function AdvancedCollectionPage() {
  const { t } = useTranslation();
  const isLoading = useCollectionsStore((s) => s.isLoading);
  const [members, setMembers] = useState<Member[]>([]);
  const [payments, setPayments] = useState<MemberPayment[]>([]);
  const [memberSearch, setMemberSearch] = useState('');
  const [collections, setCollections] = useState<Collection[]>([]);

const paidMonths = useMemo(() => {
  return collections.flatMap(c => c.months || []);
}, [collections]);

  const form = useForm<CollectionFormData>({
    resolver: zodResolver(collectionSchema),
    defaultValues: { memberId: '', financialYear: '2024-2025', months: [], method: 'cash', transactionId: '', discount: 0 },
  });

  const selectedMemberId = form.watch('memberId');
  const selectedYear = form.watch('financialYear');
  const selectedMonths = form.watch('months');
  const discount = form.watch('discount');
  const method = form.watch('method');

  const selectedMember = members.find(m => m.id === selectedMemberId);
  const isBn = i18n.language === 'bn';

  const monthlyFee = selectedMember?.monthlyFee || 0;

  const subtotal = selectedMonths.length * monthlyFee;
  
  const lateFee = 0;
  const allMonths = MONTHS.map(m => m.value);

const dueMonths = allMonths.filter(
  m => !paidMonths.includes(m)
);

  const total = subtotal + lateFee - (discount || 0);

  const filteredMembers = members.filter(m =>
    m.status === 'active' && (
      m.name.toLowerCase().includes(memberSearch.toLowerCase()) ||
      m.shopName.toLowerCase().includes(memberSearch.toLowerCase()) ||
      m.phone.includes(memberSearch)
    )
  );

  const toggleMonth = (monthVal: number) => {
    if (paidMonths.includes(monthVal)) return;
    const current = form.getValues('months');
    form.setValue('months',
      current.includes(monthVal) ? current.filter(m => m !== monthVal) : [...current, monthVal]
    );
  };

  const quickSelect = (type: 'full' | '6months' | 'due') => {
    if (type === 'due') {
      form.setValue('months', dueMonths);
    } else {
      const available = MONTHS.map(m => m.value).filter(m => !paidMonths.includes(m));
      form.setValue('months', type === '6months' ? available.slice(0, 6) : available);
    }
  };

  const { createCollection } = useCollectionsStore();
   useEffect(() => {
  if (!selectedMemberId || !selectedYear) return;

  apiClient.getCollections({
    memberId: Number(selectedMemberId),
    financialYear: selectedYear,
  }).then(res => {
    setCollections(res.data.data);
  });
}, [selectedMemberId, selectedYear]);

useEffect(() =>{
   apiClient.getMembers().then(res => {
    setMembers(res.data.data);
  });
},[])
  useEffect(()=>{
   apiClient.getCollections().then(res => {
    setPayments(res.data.data);
  });
},[])

 const handleSubmit = async (data: CollectionFormData) => {
  if (data.months.some(m => paidMonths.includes(m))) {
    toast.error(t('advancedCollection.duplicatePayment'));
    return;
  }
 
  const response = {
    memberId: Number(data.memberId),
    amount: subtotal,
    date: new Date().toISOString().split('T')[0],
    category: 'Monthly Fee',
    method: data.method,
    transactionId: data.transactionId,
    financialYear: data.financialYear,
    months: data.months,
    lateFee,
    discount: data.discount,
    totalPaid: total,
  };

  await new Promise(resolve => setTimeout(resolve, 2000));
  
  await createCollection({
    memberId: Number(data.memberId),
    amount: subtotal,
    date: new Date().toISOString().split('T')[0],
    category: 'Monthly Fee',
    method: data.method,
    transactionId: data.transactionId,
    financialYear: data.financialYear,
    months: data.months,
    lateFee,
    discount: data.discount,
    totalPaid: total,
  });

  toast.success(t('advancedCollection.paymentRecorded'));
};


  const historyColumns: Column<MemberPayment>[] = [
    { key: 'memberName', label: t('common.name'), sortable: true },
    { key: 'financialYear', label: t('advancedCollection.financialYear') },
    { key: 'months', label: t('advancedCollection.months'), render: (p) => (
      <div className="flex flex-wrap gap-1">{p.months.map(m => {
        const month = MONTHS.find(mo => mo.value === m);
        return <Badge key={m} variant="outline" className="text-xs">{isBn ? month?.labelBn : month?.label}</Badge>;
      })}</div>
    )},
    { key: 'totalPaid', label: t('common.amount'), render: (p) => {
    const amount = typeof p.totalPaid === 'number' ? p.totalPaid : 0;
    return `৳${p.amount}`;
  }, sortable: true },
    { key: 'method', label: t('common.method'), render: (p) => <span className="capitalize">{p.method}</span> },
    { key: 'status', label: t('common.status'), render: (p) => (
      <Badge variant={p.status === 'approved' ? 'default' : p.status === 'pending' ? 'secondary' : 'destructive'}>{t(`common.${p.status}`)}</Badge>
    )},
    { key: 'date', label: t('common.date'), sortable: true, 
      render: (row) => 
      row.date ? new Date(row.date).toISOString().split('T')[0]:'Not Set' 
    },
  ];

  const totalCollected = payments.filter(p => 
    p.status === 'approved').reduce((s, p) => s + p.amount, 0);
console.log('payments', payments);
  console.log("total collected: ",totalCollected);
  const pendingPayments = payments.filter(p => p.status === 'pending').length;

  const PAYMENT_METHODS = [
    { value: 'cash', label: t('collections.cash'), icon: '💵' },
    { value: 'bkash', label: 'bKash', icon: '📱' },
    { value: 'nagad', label: 'Nagad', icon: '📱' },
    { value: 'bank', label: t('collections.bankTransfer'), icon: '🏦' },
    { value: 'sslcommerz', label: 'SSLCommerz', icon: '🌐' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-heading font-bold">{t('advancedCollection.title')}</h1>
        <p className="text-muted-foreground">{t('advancedCollection.subtitle')}</p>
      </div>

      <Tabs defaultValue="history">
        <TabsList>
          <TabsTrigger value="history">{t('advancedCollection.paymentHistory')}</TabsTrigger>
          <TabsTrigger value="collect">{t('advancedCollection.collectPayment')}</TabsTrigger>
        </TabsList>

        <TabsContent value="collect" className="space-y-4 mt-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)}>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* LEFT: Member + Year + Months */}
                <div className="lg:col-span-2 space-y-4">
                  {/* Member Search */}
                  <Card>
                    <CardContent className="pt-4 space-y-3">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder={t('registration.searchMember')}
                          value={memberSearch}
                          onChange={(e) => setMemberSearch(e.target.value)}
                          className="pl-9"
                        />
                      </div>

                      {memberSearch && !selectedMemberId && (
                        <div className="border rounded-lg max-h-40 overflow-y-auto divide-y">
                          {filteredMembers.map(m => (
                            <button
                              key={m.id}
                              type="button"
                              onClick={() => { form.setValue('memberId', m.id); setMemberSearch(m.name); }}
                              className="w-full text-left px-3 py-2 hover:bg-muted/50 text-sm flex justify-between"
                            >
                              <span className="font-medium">{m.name}</span>
                              <span className="text-muted-foreground text-xs">{m.shopName} • ৳{m.monthlyFee}/{t('advancedCollection.month')}</span>
                            </button>
                          ))}
                          {filteredMembers.length === 0 && <p className="p-3 text-sm text-muted-foreground">{t('common.noData')}</p>}
                        </div>
                      )}

                      {selectedMember && (
                        <div className="p-3 bg-primary/5 rounded-lg border border-primary/20 flex items-center justify-between">
                          <div>
                            <p className="font-bold text-sm">{selectedMember.name} — {selectedMember.shopName}</p>
                            <p className="text-xs text-muted-foreground">{t('members.monthlyFee')}: ৳{selectedMember.monthlyFee} • {t('members.totalDue')}: <span className="text-destructive font-bold">৳{selectedMember.totalDue}</span></p>
                          </div>
                          <Button type="button" variant="ghost" size="sm" onClick={() => { form.setValue('memberId', ''); form.setValue('months', []); setMemberSearch(''); }}>✕</Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Financial Year + Month Grid */}
                  {selectedMember && (
                    <Card>
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <CardTitle className="text-base font-heading">{t('advancedCollection.selectMonths')}</CardTitle>
                          <FormField control={form.control} name="financialYear" render={({ field }) => (
                            <Select onValueChange={field.onChange} value={field.value}>
                              <SelectTrigger className="w-36 h-8"><SelectValue /></SelectTrigger>
                              <SelectContent>{FINANCIAL_YEARS.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}</SelectContent>
                            </Select>
                          )} />
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {/* Quick actions */}
                        <div className="flex flex-wrap gap-2">
                          <Button type="button" variant="outline" size="sm" onClick={() => quickSelect('full')} className="text-xs">
                            <Zap className="h-3 w-3 mr-1" /> {t('advancedCollection.fullYear')}
                          </Button>
                          <Button type="button" variant="outline" size="sm" onClick={() => quickSelect('6months')} className="text-xs">
                            6 {t('advancedCollection.months')}
                          </Button>
                          <Button type="button" variant="outline" size="sm" onClick={() => quickSelect('due')} className="text-xs text-destructive border-destructive/30">
                            {t('advancedCollection.payDueOnly')} ({dueMonths.length})
                          </Button>
                        </div>

                        {/* Month Grid */}
                        <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
                          {MONTHS.map(month => {
                            const isPaid = paidMonths.includes(month.value);
                            const isSelected = selectedMonths.includes(month.value);
                            const isDue = dueMonths.includes(month.value) && !isSelected;
                            return (
                              <button
                                key={month.value}
                                type="button"
                                disabled={isPaid}
                                onClick={() => toggleMonth(month.value)}
                                className={`relative p-3 rounded-lg border text-sm font-medium transition-all ${
                                  isPaid ? 'bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-400 border-green-300 dark:border-green-800 cursor-not-allowed' :
                                  isSelected ? 'bg-primary text-primary-foreground border-primary shadow-md scale-[1.02]' :
                                  isDue ? 'bg-red-50 dark:bg-red-950 text-red-600 dark:text-red-400 border-red-300 dark:border-red-800 hover:border-primary' :
                                  'bg-card hover:bg-muted border-border hover:border-primary'
                                }`}
                              >
                                {isBn ? month.labelBn : month.label}
                                {isPaid && <CheckCircle className="h-3.5 w-3.5 absolute top-1 right-1 text-green-600" />}
                              </button>
                            );
                          })}
                        </div>
                        <FormField control={form.control} name="months" render={() => <FormMessage />} />

                        {/* Legend */}
                        <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1"><span className="h-3 w-3 rounded bg-green-500/20 border border-green-500"></span> {t('common.paid')}</span>
                          <span className="flex items-center gap-1"><span className="h-3 w-3 rounded bg-red-500/20 border border-red-500"></span> {t('members.due')}</span>
                          <span className="flex items-center gap-1"><span className="h-3 w-3 rounded bg-primary border border-primary"></span> {t('advancedCollection.selected')}</span>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Payment Method */}
                  {selectedMember && selectedMonths.length > 0 && (
                    <Card>
                      <CardContent className="pt-4 space-y-3">
                        <FormField control={form.control} name="method" render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm">{t('common.method')}</FormLabel>
                            <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
                              {PAYMENT_METHODS.map(pm => (
                                <button
                                  key={pm.value}
                                  type="button"
                                  onClick={() => field.onChange(pm.value)}
                                  className={`p-2 rounded-lg border text-xs font-medium text-center transition-all ${
                                    field.value === pm.value ? 'bg-primary text-primary-foreground border-primary' : 'bg-card hover:bg-muted border-border'
                                  }`}
                                >
                                  <span className="text-lg block mb-0.5">{pm.icon}</span>
                                  {pm.label}
                                </button>
                              ))}
                            </div>
                          </FormItem>
                        )} />

                        {(method === 'bkash' || method === 'nagad' || method === 'bank' || method === 'sslcommerz') && (
                          <FormField control={form.control} name="transactionId" render={({ field }) => (
                            <FormItem><FormLabel>{t('collections.transactionId')}</FormLabel><FormControl><Input placeholder="TXN-XXXXX" {...field} /></FormControl></FormItem>
                          )} />
                        )}

                        <FormField control={form.control} name="discount" render={({ field }) => (
                          <FormItem className="max-w-[200px]"><FormLabel>{t('advancedCollection.discount')} (৳)</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormItem>
                        )} />
                      </CardContent>
                    </Card>
                  )}
                </div>

                {/* RIGHT: Summary Card */}
                <div>
                  <Card className="sticky top-6">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base font-heading flex items-center gap-2">
                        <CreditCard className="h-4 w-4" /> {t('advancedCollection.summary')}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm">
                      {selectedMember ? (
                        <>
                          <div className="p-3 rounded-lg bg-muted/50 space-y-1">
                            <p className="font-bold">{selectedMember.name}</p>
                            <p className="text-xs text-muted-foreground">{selectedMember.shopName}</p>
                          </div>
                          <SummaryRow label={t('advancedCollection.financialYear')} value={selectedYear} />
                          <SummaryRow label={t('advancedCollection.monthsSelected')} value={`${selectedMonths.length} ${t('advancedCollection.months')}`} />
                          {selectedMonths.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {selectedMonths.sort((a, b) => MONTHS.findIndex(m => m.value === a) - MONTHS.findIndex(m => m.value === b)).map(m => {
                                const month = MONTHS.find(mo => mo.value === m);
                                return <Badge key={m} variant="secondary" className="text-[10px]">{isBn ? month?.labelBn : month?.label}</Badge>;
                              })}
                            </div>
                          )}
                          <hr />
                          <SummaryRow label={t('advancedCollection.subtotal')} value={`৳${subtotal.toLocaleString()}`} />
                          {lateFee > 0 && <SummaryRow label={t('collections.lateFee')} value={`৳${lateFee}`} className="text-destructive" />}
                          {(discount || 0) > 0 && <SummaryRow label={t('advancedCollection.discount')} value={`-৳${discount}`} className="text-green-600" />}
                          <hr />
                          <div className="flex justify-between font-bold text-lg">
                            <span>{t('common.total')}</span>
                            <span className="text-primary">৳{total.toLocaleString()}</span>
                          </div>

                          <Button type="submit" disabled={selectedMonths.length === 0 || isLoading} className="w-full mt-2" size="lg">
                            {isLoading ?
                             (
                              <>
                               <Loader className="h-5 w-5 mr-2 text-white" />
                             Confirming......
                             </>
                             )
                              :(
                                <>
                                 <Wallet className="h-4 w-4 mr-2" />
                                  {t('advancedCollection.confirmPayment')}
                                </>
                              )
                            }
                          </Button>
                        </>
                      ) : (
                        <div className="text-center py-8 text-muted-foreground">
                          <Users className="h-10 w-10 mx-auto mb-2 opacity-30" />
                          <p className="text-xs">{t('registration.searchMember')}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            </form>
          </Form>
        </TabsContent>

        <TabsContent value="history" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-green-500/10 flex items-center justify-center"><DollarSign className="h-5 w-5 text-green-600" /></div>
              <div>
                <p className="text-xs text-muted-foreground">
                  {t('advancedCollection.totalCollected')}
                  </p>
                  <p className="text-xl font-bold">৳{totalCollected.toLocaleString()}</p></div>
            </Card>
            <Card className="p-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center"><CalendarDays className="h-5 w-5 text-blue-600" /></div>
              <div><p className="text-xs text-muted-foreground">{t('advancedCollection.totalPayments')}</p><p className="text-xl font-bold">{payments.length}</p></div>
            </Card>
            <Card className="p-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-orange-500/10 flex items-center justify-center"><Users className="h-5 w-5 text-orange-600" /></div>
              <div><p className="text-xs text-muted-foreground">{t('common.pending')}</p><p className="text-xl font-bold">{pendingPayments}</p></div>
            </Card>
          </div>
          <Card>
            <CardContent className="pt-6">
              <DataTable data={payments} columns={historyColumns} searchKey="memberName" pageSize={10} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function SummaryRow({ label, value, className = '' }: { label: string; value: string | number; className?: string }) {
  return (
    <div className={`flex justify-between ${className}`}>
      <span className="text-muted-foreground">{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
