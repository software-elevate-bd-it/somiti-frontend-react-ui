import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';

export interface Activity {
  id: string;
  action: string;
  description: string;
  timestamp: string;
  user: string;
}

const dummyActivities: Activity[] = [
  { id: '1', action: 'Payment Received', description: 'Karim Mia paid ৳500 monthly fee', timestamp: '2024-12-15 10:30', user: 'System' },
  { id: '2', action: 'Member Added', description: 'New member Fatema Khatun registered', timestamp: '2024-12-15 09:15', user: 'Rahim Uddin' },
  { id: '3', action: 'Expense Recorded', description: 'Electricity bill ৳5,000 paid', timestamp: '2024-12-14 16:45', user: 'Rahim Uddin' },
  { id: '4', action: 'Payment Rejected', description: 'Salam Mia payment ৳300 rejected', timestamp: '2024-12-14 14:20', user: 'Rahim Uddin' },
  { id: '5', action: 'Bank Deposit', description: '৳20,000 deposited to Sonali Bank', timestamp: '2024-12-13 11:00', user: 'Rahim Uddin' },
  { id: '6', action: 'SMS Sent', description: 'Due reminder sent to 3 members', timestamp: '2024-12-13 09:00', user: 'System' },
];

export default function ActivityLog() {
  const { t } = useTranslation();

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="font-heading text-base">{t('activity.title')}</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-64">
          <div className="space-y-3">
            {dummyActivities.map(a => (
              <div key={a.id} className="flex items-start gap-3 pb-3 border-b border-border last:border-0">
                <div className="h-2 w-2 rounded-full bg-primary mt-2 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{a.action}</p>
                  <p className="text-xs text-muted-foreground">{a.description}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{a.timestamp} • {a.user}</p>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
