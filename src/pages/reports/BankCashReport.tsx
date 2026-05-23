import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import DataTable, { Column } from '@/components/shared/DataTable';
import HelpModal from '@/components/shared/HelpModal';
import { Download, Landmark, Wallet } from 'lucide-react';
import { toast } from 'sonner';
import { apiClient } from '@/lib/api';

interface BankRow {
  id: string;
  bankName: string;
  accountName: string;
  accountNumber: string;
  balance: number;
}

export default function BankCashReport() {
  const { t } = useTranslation();
  const [bankAccounts, setBankAccounts] = useState<BankRow[]>([]);
  const [cashInHand, setCashInHand] = useState(0);
  const [totalBankBalance, setTotalBankBalance] =useState(0);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadReport();
  }, []);

  const loadReport = async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.getBankCashReport();
      setTotalBankBalance(response.data.totalBankBalance)
      console.log('Bank vs Cash Report:', response);
      
      // Extract bank accounts
      let accounts = Array.isArray(response.data)
        ? response.data
        : Array.isArray(response.data?.bankAccounts)
        ? response.data.bankAccounts
        : response.data?.data || [];
      
      accounts = Array.isArray(accounts) ? accounts : [];
      setBankAccounts(response.data.bank);
      // console.log(response.data.bank);
      
      // Extract cash in hand
      const cash = response.data?.cashInHand || 0;
      setCashInHand(cash);
    } catch (error) {
      console.error('Failed to load bank cash report:', error);
      toast.error('Failed to load bank cash report');
      setBankAccounts([]);
      setCashInHand(0);
    } finally {
      setIsLoading(false);
    }
  };

  const totalBank = totalBankBalance;

  const columns: Column<BankRow>[] = [
    { key: 'bankName', label: t('bank.bankName'), sortable: true },
    { key: 'accountName', label: t('bank.accountName') },
    { key: 'accountNumber', label: t('bank.accountNumber') },
    { key: 'balance', label: t('common.amount'), sortable: true, render: (b) => `৳${(b.balance || 0).toLocaleString()}` },
  ];

  const handleExport = (format: string) => toast.success(t('reports.exportedAs', { format }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div><h1 className="text-2xl font-heading font-bold">{t('reports.bankVsCash')}</h1><p className="text-muted-foreground">{t('reports.subtitle')}</p></div>
          <HelpModal title={t('reports.helpTitle')} description={t('reports.helpDesc')} steps={[t('reports.helpStep1'), t('reports.helpStep2')]} />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => handleExport('PDF')}><Download className="h-3 w-3 mr-1" /> PDF</Button>
          <Button variant="outline" size="sm" onClick={() => handleExport('CSV')}><Download className="h-3 w-3 mr-1" /> CSV</Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Card><CardContent className="p-4 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-blue-500/10"><Landmark className="h-5 w-5 text-blue-600" /></div>
          <div><p className="text-xs text-muted-foreground">{t('reports.totalBankBalance')}</p><p className="text-xl font-heading font-bold">৳{totalBank.toLocaleString()}</p></div>
        </CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-green-500/10"><Wallet className="h-5 w-5 text-green-600" /></div>
          <div><p className="text-xs text-muted-foreground">{t('reports.cashInHand')}</p><p className="text-xl font-heading font-bold">৳{cashInHand.toLocaleString()}</p></div>
        </CardContent></Card>
      </div>

      <Card><CardContent className="pt-6">
        {isLoading ? (
          <p className="text-muted-foreground text-center py-8">Loading...</p>
        ) : (
          <DataTable data={bankAccounts} columns={columns} searchKey="bankName" pageSize={10} />
        )}
      </CardContent></Card>
    </div>
  );
}
