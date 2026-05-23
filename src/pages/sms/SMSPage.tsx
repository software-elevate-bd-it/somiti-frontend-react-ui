import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MessageSquare, Send } from 'lucide-react';
import { toast } from 'sonner';

const templates = [
  { id: 'payment', label: 'Payment Received', text: 'Dear {{name}}, your payment of ৳{{amount}} has been received. Thank you!' },
  { id: 'due', label: 'Due Reminder', text: 'Dear {{name}}, your monthly fee of ৳{{amount}} is due. Please pay before {{date}}.' },
];

export default function SMSPage() {
  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-heading font-bold">SMS System</h1><p className="text-muted-foreground">Send and manage SMS notifications</p></div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className="font-heading">Send SMS</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1"><Label>Recipient</Label>
              <Select><SelectTrigger><SelectValue placeholder="Select member or group" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Members</SelectItem>
                  <SelectItem value="due">Members with Due</SelectItem>
                  <SelectItem value="active">Active Members</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1"><Label>Template</Label>
              <Select><SelectTrigger><SelectValue placeholder="Select template" /></SelectTrigger>
                <SelectContent>{templates.map(t => <SelectItem key={t.id} value={t.id}>{t.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1"><Label>Message</Label><Textarea rows={4} placeholder="Type your message..." /></div>
            <Button onClick={() => toast.success('SMS sent!')} className="w-full"><Send className="h-4 w-4 mr-2" /> Send SMS</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="font-heading">SMS Templates</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {templates.map(t => (
              <div key={t.id} className="p-3 rounded-lg bg-muted">
                <p className="font-medium text-sm">{t.label}</p>
                <p className="text-sm text-muted-foreground mt-1">{t.text}</p>
              </div>
            ))}
            <Button variant="outline" className="w-full">Add Template</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
