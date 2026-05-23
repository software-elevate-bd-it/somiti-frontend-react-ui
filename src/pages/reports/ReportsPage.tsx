import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { TrendingUp, DollarSign, Users, Banknote } from 'lucide-react';
import { transactions, members, bankAccounts } from '@/data/dummyData';

export default function ReportsPage() {
  const { t } = useTranslation();

  const totalIncome = transactions.filter(tx => tx.type === 'collection' && tx.status === 'approved').reduce((s, tx) => s + tx.amount, 0);
  const totalExpense = transactions.filter(tx => tx.type === 'expense' && tx.status === 'approved').reduce((s, tx) => s + tx.amount, 0);
  const totalDue = members.reduce((s, m) => s + m.totalDue, 0);
  const totalBank = bankAccounts.reduce((s, b) => s + b.balance, 0);

  const reportCards = [
    { title: t('reports.incomeVsExpense'), path: '/reports/income-expense', icon: TrendingUp, value: `৳${(totalIncome - totalExpense).toLocaleString()}`, color: 'bg-green-500/10 text-green-600' },
    { title: t('reports.cashFlow'), path: '/reports/cash-flow', icon: DollarSign, value: `৳${totalIncome.toLocaleString()}`, color: 'bg-blue-500/10 text-blue-600' },
    { title: t('reports.memberDue'), path: '/reports/member-due', icon: Users, value: `৳${totalDue.toLocaleString()}`, color: 'bg-orange-500/10 text-orange-600' },
    { title: t('reports.bankVsCash'), path: '/reports/bank-cash', icon: Banknote, value: `৳${totalBank.toLocaleString()}`, color: 'bg-purple-500/10 text-purple-600' },
  ];

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-heading font-bold">{t('reports.title')}</h1><p className="text-muted-foreground">{t('reports.subtitle')}</p></div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {reportCards.map((card) => (
          <Link key={card.path} to={card.path}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-6 flex flex-col items-center text-center gap-3">
                <div className={`p-3 rounded-full ${card.color}`}><card.icon className="h-6 w-6" /></div>
                <h3 className="font-heading font-semibold">{card.title}</h3>
                <p className="text-2xl font-heading font-bold">{card.value}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
