import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import StatsCard from '@/components/shared/StatsCard';
import { Download, Users, AlertCircle, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import i18n from '@/i18n';
import { apiClient } from '@/lib/api';

interface MemberDue {
  id: string;
  name: string;
  shopName?: string;
  paidCount?: number;
  dueCount?: number;
  dueMonths?: string[];
  dueAmount?: number;
  [key: string]: any;
}

export default function MemberDueReport() {
  const { t } = useTranslation();
  const [selectedYear, setSelectedYear] = useState('2024-2025');
  const [dueData, setDueData] = useState<MemberDue[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const isBn = i18n.language === 'bn';
  const [totalDue, setTotalDue] = useState('');
  const [fullyPaidMembers, setFullyPaidMembers] = useState('');
  const [totalMembers, setTotalMembers] = useState('');

  useEffect(() => {
    loadReport();
  }, [selectedYear]);

  const loadReport = async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.getMemberDuesReport();
      setTotalDue(response.data.summary.totalDue);
      setFullyPaidMembers(response.data.summary.fullyPaidMembers);
      setTotalMembers(response.data.summary.totalMembers);
      console.log('Member Dues Report:', response);
      // Extract data from response
      let data = Array.isArray(response.data) 
        ? response.data 
        : Array.isArray(response.data?.data)
        ? response.data.data
        : response.data?.members || [];
      // Ensure data is an array and sort by due count
      data = Array.isArray(data) ? data : [];
      setDueData(data.sort((a: any, b: any) => (b.dueCount || 0) - (a.dueCount || 0)));
    } catch (error) {
      console.error('Failed to load member dues report:', error);
      toast.error('Failed to load member dues report');
      setDueData([]);
    } finally {
      setIsLoading(false);
    }
  };

  // const totalDue = dueData.reduce((s, m) => s + (m.dueAmount || 0), 0);
  const membersWithDue = totalMembers;
  const fullyPaid = fullyPaidMembers;

  const handleExport = (format: string) => toast.success(t('reports.exportedAs', { format }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold">{t('reports.memberDue')}</h1>
          <p className="text-muted-foreground">{t('reports.subtitle')}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => handleExport('PDF')}><Download className="h-3 w-3 mr-1" /> PDF</Button>
          <Button variant="outline" size="sm" onClick={() => handleExport('Excel')}><Download className="h-3 w-3 mr-1" /> Excel</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatsCard title={t('reports.totalDue')} value={`৳${totalDue.toLocaleString()}`} icon={AlertCircle} />
        <StatsCard title={t('collectionReport.fullyPaid')} value={fullyPaid} icon={CheckCircle} />
        <StatsCard title={t('collectionReport.dueMembers')} value={membersWithDue} icon={Users} />
      </div>

      <Card>
        <CardHeader><CardTitle className="font-heading">{t('reports.memberDue')}</CardTitle></CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-muted-foreground text-center py-8">Loading...</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">{t('common.name')}</th>
                    <th className="text-left p-2">{t('members.shopName')}</th>
                    <th className="text-center p-2">{t('common.paid')}</th>
                    <th className="text-center p-2">{t('members.due')}</th>
                    {/* <th className="text-left p-2">{t('collectionReport.dueMembers')}</th> */}
                    <th className="text-right p-2">{t('common.amount')}</th>
                  </tr>
                </thead>
                <tbody>
                  {dueData.length > 0 ? (
                    dueData.map(member => (
                      <tr key={member.id} className="border-b hover:bg-muted/50">
                        <td className="p-2 font-medium">{member.name}</td>
                        <td className="p-2 text-muted-foreground">{member.shopName || '-'}</td>
                        <td className="text-center p-2"><Badge variant="default">{member.totalPaid || 0}</Badge></td>
                        <td className="text-center p-2">
                          {(member.due || 0) > 0 ? (
                            <Badge variant="destructive">{member.due}</Badge>
                          ) : (
                            <Badge variant="default">0</Badge>
                          )}
                        </td>
                        {/* <td className="p-2">
                          <div className="flex flex-wrap gap-1">
                            {Array.isArray(member.dueMonths) && member.dueMonths.slice(0, 4).map(m => (
                              <Badge key={m} variant="outline" className="text-xs text-destructive">{m}</Badge>
                            ))}
                            {Array.isArray(member.dueMonths) && member.dueMonths.length > 4 && <Badge variant="outline" className="text-xs">+{member.dueMonths.length - 4}</Badge>}
                          </div>
                        </td> */}
                        <td className="text-right p-2 font-bold text-destructive">৳{(member.amount || 0).toLocaleString()}</td>
                      </tr>
                    ))
                  ) : (
                    <tr><td colSpan={6} className="p-4 text-center text-muted-foreground">No members found</td></tr>
                  )}
                </tbody>
                {dueData.length > 0 && (
                  <tfoot>
                    <tr className="border-t-2 font-bold">
                      <td colSpan={5} className="p-2 text-right">{t('common.total')}:</td>
                      <td className="text-right p-2 text-destructive">৳{totalDue.toLocaleString()}</td>
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
