import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import DataTable, { Column } from '@/components/shared/DataTable';
import HelpModal from '@/components/shared/HelpModal';
import { Download, TrendingUp, TrendingDown } from 'lucide-react';
import { toast } from 'sonner';
import { apiClient } from '@/lib/api';

interface ReportTransaction {
  id: string;
  date: string;
  memberName: string;
  type: 'collection' | 'expense';
  category: string;
  amount: number;
  method: string;
  status: string;
}

export default function IncomeExpenseReport() {
  const { t } = useTranslation();
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [transactions, setTransactions] = useState<ReportTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [totalIncome, setTotalIncome]=useState('');
  const [totalExpense, setTotalExpense] =useState('');

  useEffect(() => {
    loadReport();
  }, [dateFrom, dateTo]);

  const loadReport = async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.getIncomeExpenseReport({
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
      });
      setTotalIncome(response.data.summary.totalIncome);
      setTotalExpense(response.data.summary.totalExpense);
      console.log('income expense: ',response);

      // Extract the breakdown array from the nested data structure
      // =========================== customize korte hba ============
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
      // ================--------===============================
    } catch (error) {
      console.error('Failed to load report:', error);
      toast.error('Failed to load report');
    } finally {
      setIsLoading(false);
    }
  };


  let filtered = [...transactions];
  if (filterCategory !== 'all') {
    filtered = filtered.filter(tx => tx.category === filterCategory);
  }

  const columns: Column<ReportTransaction>[] = [
    { key: 'date', label: t('common.date'), sortable: true },
    { key: 'memberName', label: t('nav.members') },
    { key: 'type', label: t('common.type') },
    { key: 'category', label: t('common.category') },
    { key: 'amount', label: t('common.amount'), render: (tx) => `৳${tx.amount.toLocaleString()}` },
    { key: 'method', label: t('common.method') },
    { key: 'status', label: t('common.status') },
  ];

  const handleExport = (format: string) => toast.success(t('reports.exportedAs', { format }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div><h1 className="text-2xl font-heading font-bold">{t('reports.incomeVsExpense')}</h1><p className="text-muted-foreground">{t('reports.subtitle')}</p></div>
          <HelpModal title={t('reports.helpTitle')} description={t('reports.helpDesc')} steps={[t('reports.helpStep1'), t('reports.helpStep2'), t('reports.helpStep3')]} />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => handleExport('PDF')}><Download className="h-3 w-3 mr-1" /> PDF</Button>
          <Button variant="outline" size="sm" onClick={() => handleExport('CSV')}><Download className="h-3 w-3 mr-1" /> CSV</Button>
          <Button variant="outline" size="sm" onClick={() => handleExport('Excel')}><Download className="h-3 w-3 mr-1" /> Excel</Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Card><CardContent className="p-4 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-green-500/10"><TrendingUp className="h-5 w-5 text-green-600" /></div>
          <div><p className="text-xs text-muted-foreground">{t('reports.totalIncome')}</p><p className="text-xl font-heading font-bold">৳{totalIncome.toLocaleString()}</p></div>
        </CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-red-500/10"><TrendingDown className="h-5 w-5 text-red-600" /></div>
          <div><p className="text-xs text-muted-foreground">{t('reports.totalExpense')}</p><p className="text-xl font-heading font-bold">৳{totalExpense.toLocaleString()}</p></div>
        </CardContent></Card>
      </div>

      <Card><CardContent className="pt-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
          <div className="space-y-1"><Label className="text-xs">{t('dashboard.dateFrom')}</Label><Input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="h-8 text-xs" /></div>
          <div className="space-y-1"><Label className="text-xs">{t('dashboard.dateTo')}</Label><Input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="h-8 text-xs" /></div>
          <div className="space-y-1"><Label className="text-xs">{t('common.category')}</Label>
            <Select value={filterCategory} onValueChange={setFilterCategory}><SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent><SelectItem value="all">{t('common.all')}</SelectItem><SelectItem value="Monthly Fee">{t('members.monthlyFee')}</SelectItem><SelectItem value="Late Fee">{t('collections.lateFee')}</SelectItem><SelectItem value="Maintenance">Maintenance</SelectItem><SelectItem value="Electricity">Electricity</SelectItem></SelectContent>
            </Select>
          </div>
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
