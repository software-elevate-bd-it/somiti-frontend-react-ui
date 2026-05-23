import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import DataTable, { Column } from '@/components/shared/DataTable';
import HelpModal from '@/components/shared/HelpModal';
import { Download, TrendingUp, TrendingDown, Wallet } from 'lucide-react';
import { toast } from 'sonner';
import { apiClient } from '@/lib/api';

interface CashFlowTransaction {
  id: string;
  date: string;
  memberName: string;
  type: 'collection' | 'expense';
  category: string;
  amount: number;
  method: string;
  status: string;
}

export default function CashFlowReport() {
  const { t } = useTranslation();
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [transactions, setTransactions] = useState<CashFlowTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [totalInflow, setTotalInFlow] = useState('');
  const [totalOutflow, setTotalOutflow] = useState('');
  const [netCashFlow, setNetCashFlow] = useState('');


  useEffect(() => {
    loadReport();
  }, [dateFrom, dateTo]);

  const loadReport = async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.getCashFlowReport({
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
      });
      console.log('Cash Flow Report:', response);
      setTotalInFlow(response.data.totalInflow)
      setTotalOutflow(response.data.totalOutflow);
      setNetCashFlow(response.data.netCashFlow);
      // Extract the breakdown or transactions from response
      // =========== need customize ===================
      let transactionsData = [];
      if (response.data?.breakdown && Array.isArray(response.data.breakdown)) {
        transactionsData = response.data.breakdown;
      } else if (Array.isArray(response.data?.data?.breakdown)) {
        transactionsData = response.data.data.breakdown;
      } else if (Array.isArray(response.data)) {
        transactionsData = response.data;
      }
      console.log('Extracted transactions:', transactionsData);
      setTransactions(transactionsData);
      // ===== cutomize korte hba ============
    } catch (error) {
      console.error('Failed to load report:', error);
      toast.error('Failed to load report');
    } finally {
      setIsLoading(false);
    }
  };


  let filtered = [...transactions];

  const columns: Column<CashFlowTransaction>[] = [
    { key: 'date', label: t('common.date'), sortable: true },
    { key: 'memberName', label: t('nav.members') },
    { key: 'type', label: t('common.type') },
    { key: 'category', label: t('common.category') },
    { key: 'amount', label: t('common.amount'), render: (tx) => `৳${tx.amount}` },
    { key: 'method', label: t('common.method') },
    { key: 'status', label: t('common.status') },
  ];

  const handleExport = (format: string) => toast.success(t('reports.exportedAs', { format }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div><h1 className="text-2xl font-heading font-bold">{t('reports.cashFlow')}</h1><p className="text-muted-foreground">{t('reports.subtitle')}</p></div>
          <HelpModal title={t('reports.helpTitle')} description={t('reports.helpDesc')} steps={[t('reports.helpStep1'), t('reports.helpStep2'), t('reports.helpStep3')]} />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => handleExport('PDF')}><Download className="h-3 w-3 mr-1" /> PDF</Button>
          <Button variant="outline" size="sm" onClick={() => handleExport('CSV')}><Download className="h-3 w-3 mr-1" /> CSV</Button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card><CardContent className="p-4 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-green-500/10"><TrendingUp className="h-5 w-5 text-green-600" /></div>
          <div><p className="text-xs text-muted-foreground">{t('reports.totalIncome')}</p><p className="text-xl font-heading font-bold">৳{totalInflow}</p></div>
        </CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-red-500/10"><TrendingDown className="h-5 w-5 text-red-600" /></div>
          <div><p className="text-xs text-muted-foreground">{t('reports.totalExpense')}</p><p className="text-xl font-heading font-bold">৳{totalOutflow}</p></div>
        </CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-blue-500/10"><Wallet className="h-5 w-5 text-blue-600" /></div>
          <div><p className="text-xs text-muted-foreground">{t('reports.netProfit')}</p><p className="text-xl font-heading font-bold">৳{(netCashFlow)}</p></div>
        </CardContent></Card>
      </div>

      <Card><CardContent className="pt-6">
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="space-y-1"><Label className="text-xs">{t('dashboard.dateFrom')}</Label><Input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="h-8 text-xs" /></div>
          <div className="space-y-1"><Label className="text-xs">{t('dashboard.dateTo')}</Label><Input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="h-8 text-xs" /></div>
        </div>
        {isLoading ? (
          <p className="text-muted-foreground text-center py-8">Loading...</p>
        ) : (
          <DataTable data={filtered} columns={columns} searchKey="memberName" pageSize={10} emptyMessage="No transactions found" />
        )}
      </CardContent></Card>
    </div>
  );
}
