import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import StatsCard from '@/components/shared/StatsCard';
import { Download, Users, CheckCircle, AlertCircle, DollarSign } from 'lucide-react';
import { toast } from 'sonner';
import i18n from '@/i18n';
import { apiClient } from '@/lib/api';

interface PaymentMonth {
  month:number;
  paid:boolean;
}

interface MemberInfo {
  id: string;
  name: string;
  shopName: string;
}

interface MemberCollectionData {
  id?: string;
  amount: number;
  method: string;
  status: string;
  date: string;

  member: MemberInfo;
  months: PaymentMonth[];
}

interface MonthlyCollectionData {
  month: string;
  label: string;
  paidCount: number;
  dueCount: number;
  collected: number;
  pending: number;
}

export default function CollectionReport() {
  const { t } = useTranslation();
  const [viewType, setViewType] = useState<'member' | 'monthly'>('member');
  const [memberData, setMemberData] = useState<MemberCollectionData[]>([]);
  const [monthlyData, setMonthlyData] = useState<MonthlyCollectionData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const isBn = i18n.language === 'bn';
  const [ totalCollection, setTotalCollection] = useState(0);
  const [ totalDue, setTotalDue] = useState(0);
  const [ activeMembers, setActiveMembers] = useState(0);
  const [fullyPaidMembers, setFullyPaidMembers] = useState(0);

  console.log("Member data:", memberData);

  useEffect(() => {
    loadReport();
  }, [dateFrom, dateTo]);

  const loadReport = async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.getCollectionReport({
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
      });
      console.log('Collection Report:', response);
      setTotalCollection(response.data.summary.totalCollection);
      setTotalDue(response.data.summary.totalDue);
      setActiveMembers(response.data.summary.activeMembers);
      setFullyPaidMembers(response.data.summary.fullyPaidMembers);
      
      // Extract member data
      let members = Array.isArray(response.data)
        ? response.data
        : Array.isArray(response.data?.members)
        ? response.data.members
        : response.data?.data || [];
      
      members = Array.isArray(members) ? members : [];
      setMemberData(members);
      
      // Extract or calculate monthly data
      let monthly = Array.isArray(response.data?.monthly)
        ? response.data.monthly
        : response.data?.monthlyBreakdown || [];
      
      monthly = Array.isArray(monthly) ? monthly : [];
      setMonthlyData(monthly);
    } catch (error) {
      console.error('Failed to load collection report:', error);
      toast.error('Failed to load collection report');
      setMemberData([]);
      setMonthlyData([]);
    } finally {
      setIsLoading(false);
    }
  };

  const MONTHS = [
    { value: '1', label: 'January', labelBn: 'জানুয়ারি' },
    { value: '2', label: 'February', labelBn: 'ফেব্রুয়ারি' },
    { value: '3', label: 'March', labelBn: 'মার্চ' },
    { value: '4', label: 'April', labelBn: 'এপ্রিল' },
    { value: '5', label: 'May', labelBn: 'মে' },
    { value: '6', label: 'June', labelBn: 'জুন' },
    { value: '7', label: 'July', labelBn: 'জুলাই' },
    { value: '8', label: 'August', labelBn: 'আগস্ট' },
    { value: '9', label: 'September', labelBn: 'সেপ্টেম্বর' },
    { value: '10', label: 'October', labelBn: 'অক্টোবর' },
    { value: '11', label: 'November', labelBn: 'নভেম্বর' },
    { value: '12', label: 'December', labelBn: 'ডিসেম্বর' },
  ];

  const totalCollected = totalCollection;
  const fullPaidCount = memberData.filter(
    m => m.months?.every(month => month.paid)).length;


  const handleExport = (format: string) => toast.success(t('reports.exportedAs', { format }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold">{t('collectionReport.title')}</h1>
          <p className="text-muted-foreground">{t('collectionReport.subtitle')}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => handleExport('PDF')}><Download className="h-3 w-3 mr-1" /> PDF</Button>
          <Button variant="outline" size="sm" onClick={() => handleExport('Excel')}><Download className="h-3 w-3 mr-1" /> Excel</Button>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <input
          type="date"
          value={dateFrom}
          onChange={(e) => setDateFrom(e.target.value)}
          className="px-3 py-2 border rounded-md text-sm"
          placeholder="From date"
        />
        <input
          type="date"
          value={dateTo}
          onChange={(e) => setDateTo(e.target.value)}
          className="px-3 py-2 border rounded-md text-sm"
          placeholder="To date"
        />
        <Select value={viewType} onValueChange={(v: 'member' | 'monthly') => setViewType(v)}>
          <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="member">{t('collectionReport.memberWise')}</SelectItem>
            <SelectItem value="monthly">{t('collectionReport.monthlyBreakdown')}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatsCard title={t('collectionReport.totalCollected')} value={`৳${totalCollected.toLocaleString()}`} icon={DollarSign} />
        <StatsCard title={t('collectionReport.totalDue')} value={`৳${totalDue.toLocaleString()}`} icon={AlertCircle} />
        <StatsCard title={t('collectionReport.fullyPaid')} value={fullyPaidMembers} icon={CheckCircle} />
        <StatsCard title={t('collectionReport.activeMembers')} value={activeMembers} icon={Users} />
      </div>

      {viewType === 'member' ? (
        <Card>
          <CardHeader><CardTitle className="font-heading">{t('collectionReport.memberWise')}</CardTitle></CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-muted-foreground text-center py-8">Loading...</p>
            ) : memberData.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">{t('common.name')}</th>
                      {MONTHS.map(m => (
                        <th key={m.value} className="text-center p-1 text-xs">{isBn ? m.labelBn.slice(0, 3) : m.label.slice(0, 3)}</th>
                      ))}
                      <th className="text-right p-2">{t('common.paid')}</th>
                      <th className="text-right p-2">{t('members.due')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {memberData.map(member => {

  const paidMonthsCount =
    member.months?.filter(m => m.paid).length || 0;

  const dueMonthsCount =
    member.months?.filter(m => !m.paid).length || 0;

  const monthlyAmount = member.amount / 12;

  const yearPaid =
    paidMonthsCount * monthlyAmount;

  const yearDue =
    dueMonthsCount * monthlyAmount;

  return (
    <tr
      key={member.id || member.member.name}
      className="border-b hover:bg-muted/50"
    >
      <td className="p-2 font-medium">
        {member.member.name}
      </td>

      {MONTHS.map(m => {

        const isPaid = member.months?.some(
          (month) =>
            month.month === Number(m.value) &&
            month.paid
        );

        return (
          <td key={m.value} className="text-center p-1">
            {isPaid ? (
              <span className="inline-block w-5 h-5 rounded-full bg-green-500 text-white text-xs leading-5">
                ✓
              </span>
            ) : (
              <span className="inline-block w-5 h-5 rounded-full bg-red-100 text-red-500 text-xs leading-5">
                ✗
              </span>
            )}
          </td>
        );
      })}

      <td className="text-right p-2 text-green-600 font-bold">
        ৳{yearPaid.toLocaleString()}
      </td>

      <td className="text-right p-2 text-destructive font-bold">
        ৳{yearDue.toLocaleString()}
      </td>
    </tr>
  );
})}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">No collection data found</p>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader><CardTitle className="font-heading">{t('collectionReport.monthlyBreakdown')}</CardTitle></CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-muted-foreground text-center py-8">Loading...</p>
            ) : monthlyData.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">{t('advancedCollection.month')}</th>
                      <th className="text-center p-2">{t('collectionReport.paidMembers')}</th>
                      <th className="text-center p-2">{t('collectionReport.dueMembers')}</th>
                      <th className="text-right p-2">{t('collectionReport.collected')}</th>
                      <th className="text-right p-2">{t('common.pending')}</th>
                      <th className="text-center p-2">{t('collectionReport.rate')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {monthlyData.map(row => {
                      const rate = activeMembers > 0 ? Math.round(((row.paidCount || 0) / activeMembers) * 100) : 0;
                      return (
                        <tr key={row.month} className="border-b hover:bg-muted/50">
                          <td className="p-2 font-medium">{row.label}</td>
                          <td className="text-center p-2"><Badge variant="default">{row.paidCount || 0}</Badge></td>
                          <td className="text-center p-2"><Badge variant="destructive">{row.dueCount || 0}</Badge></td>
                          <td className="text-right p-2 text-green-600 font-bold">৳{(row.collected || 0).toLocaleString()}</td>
                          <td className="text-right p-2 text-destructive">৳{(row.pending || 0).toLocaleString()}</td>
                          <td className="text-center p-2">
                            <Badge variant={rate >= 80 ? 'default' : rate >= 50 ? 'secondary' : 'destructive'}>{rate}%</Badge>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">No collection data found</p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
