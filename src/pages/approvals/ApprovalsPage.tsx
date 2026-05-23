import { useState } from 'react';
import { useApprovalsStore, ApprovalItem, ApprovalType } from '@/stores/approvalsStore';
import { useAuthStore } from '@/stores/authStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { CheckCircle2, XCircle, Clock, Wallet, Receipt, Landmark, UserPlus, Inbox } from 'lucide-react';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { PermissionGuard } from '@/components/shared/PermissionGuard';
import type { Permission } from '@/stores/rolesStore';

const TYPE_META: Record<ApprovalType, { label: string; icon: typeof Wallet; color: string }> = {
  collection: { label: 'Collection', icon: Wallet, color: 'text-success' },
  expense: { label: 'Expense', icon: Receipt, color: 'text-destructive' },
  bank: { label: 'Bank Transaction', icon: Landmark, color: 'text-primary' },
  member: { label: 'Member', icon: UserPlus, color: 'text-accent-foreground' },
};

export default function ApprovalsPage() {
  const { items, approve, reject } = useApprovalsStore();
  const user = useAuthStore((s) => s.user);
  const [tab, setTab] = useState<'pending' | 'approved' | 'rejected' | 'all'>('pending');
  const [typeFilter, setTypeFilter] = useState<ApprovalType | 'all'>('all');
  const [rejectTarget, setRejectTarget] = useState<ApprovalItem | null>(null);
  const [rejectNote, setRejectNote] = useState('');

  const filtered = items.filter((i) => {
    if (tab !== 'all' && i.status !== tab) return false;
    if (typeFilter !== 'all' && i.type !== typeFilter) return false;
    return true;
  });

  const counts = {
    pending: items.filter((i) => i.status === 'pending').length,
    approved: items.filter((i) => i.status === 'approved').length,
    rejected: items.filter((i) => i.status === 'rejected').length,
  };

  const handleApprove = (item: ApprovalItem) => {
    if (!user) return;
    approve(item.id);
    toast.success(`${TYPE_META[item.type].label} approved`);
  };

  const handleReject = () => {
    if (!rejectTarget || !user) return;
    if (!rejectNote.trim()) return toast.error('Rejection reason is required');
    reject(rejectTarget.id, rejectNote.trim());
    toast.success('Rejected with note');
    setRejectTarget(null);
    setRejectNote('');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-heading font-bold flex items-center gap-2">
          <Inbox className="h-6 w-6 text-primary" /> Approvals
        </h1>
        <p className="text-muted-foreground">Review and approve transactions submitted by your team</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <button onClick={() => setTypeFilter('all')} className={`text-left p-4 rounded-lg border-2 transition-colors ${typeFilter === 'all' ? 'border-primary bg-primary/5' : 'border-border'}`}>
          <p className="text-xs text-muted-foreground">All Types</p>
          <p className="text-2xl font-bold">{items.filter((i) => i.status === 'pending').length}</p>
          <p className="text-[11px] text-muted-foreground">pending</p>
        </button>
        {(Object.keys(TYPE_META) as ApprovalType[]).map((t) => {
          const meta = TYPE_META[t];
          const Icon = meta.icon;
          const count = items.filter((i) => i.type === t && i.status === 'pending').length;
          return (
            <button key={t} onClick={() => setTypeFilter(t)} className={`text-left p-4 rounded-lg border-2 transition-colors ${typeFilter === t ? 'border-primary bg-primary/5' : 'border-border'}`}>
              <Icon className={`h-4 w-4 mb-1 ${meta.color}`} />
              <p className="text-xs text-muted-foreground">{meta.label}</p>
              <p className="text-2xl font-bold">{count}</p>
            </button>
          );
        })}
      </div>

      <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)}>
        <TabsList>
          <TabsTrigger value="pending">Pending {counts.pending > 0 && <Badge variant="destructive" className="ml-2 h-5 px-1.5">{counts.pending}</Badge>}</TabsTrigger>
          <TabsTrigger value="approved">Approved ({counts.approved})</TabsTrigger>
          <TabsTrigger value="rejected">Rejected ({counts.rejected})</TabsTrigger>
          <TabsTrigger value="all">All ({items.length})</TabsTrigger>
        </TabsList>

        <TabsContent value={tab} className="mt-4">
          {filtered.length === 0 ? (
            <Card><CardContent className="py-12 text-center text-muted-foreground">
              <Inbox className="h-12 w-12 mx-auto mb-2 opacity-30" />
              <p>No {tab === 'all' ? '' : tab} items</p>
            </CardContent></Card>
          ) : (
            <div className="space-y-3">
              {filtered.map((item) => {
                const meta = TYPE_META[item.type];
                const Icon = meta.icon;
                return (
                  <Card key={item.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-md bg-muted ${meta.color}`}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <p className="font-medium text-sm">{item.title}</p>
                              {item.description && <p className="text-xs text-muted-foreground mt-0.5">{item.description}</p>}
                            </div>
                            {item.amount !== undefined && (
                              <p className="font-bold text-lg whitespace-nowrap">৳{item.amount.toLocaleString()}</p>
                            )}
                          </div>
                          <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                            <Badge variant="outline" className="text-[10px]">{meta.label}</Badge>
                            <span>by {item.createdByName}</span>
                            <span>•</span>
                            <span><Clock className="h-3 w-3 inline mr-0.5" />{formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}</span>
                          </div>
                          {item.status === 'rejected' && item.rejectionNote && (
                            <div className="mt-2 p-2 bg-destructive/10 border border-destructive/20 rounded text-xs">
                              <span className="font-medium text-destructive">Rejected by {item.reviewedByName}: </span>
                              <span>{item.rejectionNote}</span>
                            </div>
                          )}
                          {item.status === 'approved' && (
                            <p className="mt-2 text-xs text-success">✓ Approved by {item.reviewedByName}</p>
                          )}
                        </div>
                        {item.status === 'pending' && (
                          <div className="flex flex-col gap-1">
                            <PermissionGuard permission={`${item.type}.approve` as Permission} message={`Need ${item.type}.approve permission`}>
                              <Button size="sm" onClick={() => handleApprove(item)} className="bg-success hover:bg-success/90 text-success-foreground">
                                <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Approve
                              </Button>
                            </PermissionGuard>
                            <PermissionGuard permission={`${item.type}.approve` as Permission} message={`Need ${item.type}.approve permission`}>
                              <Button size="sm" variant="destructive" onClick={() => setRejectTarget(item)}>
                                <XCircle className="h-3.5 w-3.5 mr-1" /> Reject
                              </Button>
                            </PermissionGuard>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={!!rejectTarget} onOpenChange={(o) => !o && setRejectTarget(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Reject {rejectTarget && TYPE_META[rejectTarget.type].label}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="text-sm text-muted-foreground">
              <p><strong>{rejectTarget?.title}</strong></p>
              {rejectTarget?.amount !== undefined && <p>Amount: ৳{rejectTarget.amount.toLocaleString()}</p>}
            </div>
            <div>
              <Label>Rejection Reason *</Label>
              <Textarea value={rejectNote} onChange={(e) => setRejectNote(e.target.value)} placeholder="Explain why this is being rejected..." rows={3} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectTarget(null)}>Cancel</Button>
            <Button variant="destructive" onClick={handleReject}>Reject</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
