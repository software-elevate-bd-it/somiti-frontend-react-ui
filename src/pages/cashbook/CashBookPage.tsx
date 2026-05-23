import { useEffect } from 'react';
import DataTable, { Column } from '@/components/shared/DataTable';
import { Card, CardContent } from '@/components/ui/card';
import StatsCard from '@/components/shared/StatsCard';
import { ArrowUpRight, ArrowDownRight, Wallet } from 'lucide-react';
import { useCashBookStore } from '@/stores/cashbookStore';

interface CashEntry {
  id: string;
  date: string;
  description: string;
  cashIn: number;
  cashOut: number;
  balance: number;
}

const columns: Column<CashEntry>[] = [
  { key: 'date', label: 'Date', sortable: true },
  { key: 'description', label: 'Description' },
  { key: 'cashIn', label: 'Cash In', render: (e) => e.cashIn > 0 ? <span className="text-success font-medium flex items-center gap-1"><ArrowUpRight className="h-3 w-3" /> ৳{(e.cashIn || 0).toLocaleString()}</span> : '-' },
  { key: 'cashOut', label: 'Cash Out', render: (e) => e.cashOut > 0 ? <span className="text-destructive font-medium flex items-center gap-1"><ArrowDownRight className="h-3 w-3" /> ৳{(e.cashOut || 0).toLocaleString()}</span> : '-' },
  { key: 'balance', label: 'Balance', render: (e) => `৳${(e.balance || 0).toLocaleString()}` },
];

export default function CashBookPage() {
  const rawEntries = useCashBookStore((s) => s.entries);
  const sortedEntries = [...rawEntries].sort((a,b) =>
    new Date(a.date).getTime() - new Date(b.date).getTime());
  let runningBalance = 0;
  const entries = sortedEntries.map((entry) =>{
    runningBalance += (entry.cashIn || 0) - (entry.cashOut||0);
    return { ...entry, balance: runningBalance}
  })
  
  const summary = useCashBookStore((s) => s.summary);
  const isLoading = useCashBookStore((s) => s.isLoading);
  const loadCashBook = useCashBookStore((s) => s.loadCashBook);

  useEffect(() => {
    loadCashBook();
  }, [loadCashBook]);

  const totalIn = summary?.totalIn || 0;
  const totalOut = summary?.totalOut || 0;
  const balance = summary?.currentBalance || (totalIn - totalOut);

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-heading font-bold">Cash Book</h1><p className="text-muted-foreground">Daily cash flow tracking</p></div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatsCard title="Cash In" value={`৳${totalIn.toLocaleString()}`} icon={ArrowUpRight} changeType="positive" />
        <StatsCard title="Cash Out" value={`৳${totalOut.toLocaleString()}`} icon={ArrowDownRight} changeType="negative" />
        <StatsCard title="Balance" value={`৳${balance.toLocaleString()}`} icon={Wallet} />
      </div>
      <Card><CardContent className="pt-6">{isLoading ? <p className="text-muted-foreground text-center py-8">Loading...</p> : <DataTable data={entries} columns={columns} searchKey="description" emptyMessage="No cash entries found" />}</CardContent></Card>
    </div>
  );
}
