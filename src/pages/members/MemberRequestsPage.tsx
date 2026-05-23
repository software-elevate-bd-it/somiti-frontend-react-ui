import { useState, useEffect } from 'react';
import leader5 from '@/assets/leader-5.jpg';
import { useTranslation } from 'react-i18next';
import DataTable, { Column } from '@/components/shared/DataTable';
import { useMemberRequestsStore } from '@/stores/memberRequestsStore';
import type { MemberRequest } from '@/lib/api';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CheckCircle, XCircle, Eye, UserCheck, UserX, Clock } from 'lucide-react';
import { toast } from 'sonner';
import StatsCard from '@/components/shared/StatsCard';

export default function MemberRequestsPage() {
  const { t } = useTranslation();
  const { requests, isLoading, loadMemberRequests, approveMemberRequest, rejectMemberRequest } = useMemberRequestsStore();
  console.log('member requests', requests);
  
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedRequest, setSelectedRequest] = useState<MemberRequest | null>(null);
  const [rejectNote, setRejectNote] = useState('');
  const [monthlyFee, setMonthlyFee] = useState('');
  const [billingCycle, setBillingCycle] = useState('monthly');
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);

  useEffect(() => {
    loadMemberRequests({ status: filterStatus === 'all' ? undefined : filterStatus });
  }, [filterStatus, loadMemberRequests]);

  const filtered = filterStatus === 'all' ? requests : requests.filter(r => r.status === filterStatus);

  const pendingCount = requests.filter(r => r.status === 'pending').length;
  const approvedCount = requests.filter(r => r.status === 'approved').length;
  const rejectedCount = requests.filter(r => r.status === 'rejected').length;

  const handleApproveClick = (req: MemberRequest) => {
    setSelectedRequest(req);
    setMonthlyFee('');
    setBillingCycle('monthly');
    setApproveDialogOpen(true);
  };

  const handleApproveConfirm = async () => {
    if (!selectedRequest || !monthlyFee) {
      toast.error(t('memberRequests.monthlyFeeRequired'));
      return;
    }
    
    try {
      await approveMemberRequest(selectedRequest.id, parseFloat(monthlyFee), billingCycle);
      toast.success(t('memberRequests.approved', { name: selectedRequest.nameEn }));
      setApproveDialogOpen(false);
      setViewDialogOpen(false);
      setSelectedRequest(null);
    } catch (error) {
      toast.error(t('memberRequests.approveFailed'));
    }
  };

  const handleRejectConfirm = async () => {
    if (!selectedRequest || !rejectNote) {
      toast.error(t('memberRequests.rejectionNoteRequired'));
      return;
    }
    
    try {
      await rejectMemberRequest(selectedRequest.id, rejectNote);
      toast.success(t('memberRequests.rejected', { name: selectedRequest.nameEn }));
      setRejectDialogOpen(false);
      setViewDialogOpen(false);
      setSelectedRequest(null);
      setRejectNote('');
    } catch (error) {
      toast.error(t('memberRequests.rejectFailed'));
    }
  };

  const columns: Column<MemberRequest>[] = [
    // =========================================================
    { key: 'nameEn', label: t('common.name'), sortable: true },
    // =========================================================
    { key: 'shopName', label: t('members.shopName') },
    { key: 'phone', label: t('common.phone') },
    { key: 'appliedAt', label: t('memberRequests.appliedDate'), sortable: true },
    { key: 'status', label: t('common.status'), render: (r) => (
      <Badge variant={r.status === 'approved' ? 'default' : r.status === 'pending' ? 'secondary' : 'destructive'}>
        {t(`common.${r.status}`)}
      </Badge>
    )},
    { key: 'id', label: t('common.actions'), render: (r) => (
      <div className="flex gap-1">
        <Button size="sm" variant="ghost" onClick={() => {
          console.log('viewing request',r);
           setSelectedRequest(r); 
           setViewDialogOpen(true); 
           }}>
          <Eye className="h-3.5 w-3.5" />
        </Button>
        {r.status === 'pending' && (
          <>
            <Button size="sm" variant="ghost" className="text-green-600" onClick={() => handleApproveClick(r)} disabled={isLoading}>
              <CheckCircle className="h-3.5 w-3.5" />
            </Button>
            <Button size="sm" variant="ghost" className="text-destructive" onClick={() => { setSelectedRequest(r); setRejectDialogOpen(true); }} disabled={isLoading}>
              <XCircle className="h-3.5 w-3.5" />
            </Button>
          </>
        )}
      </div>
    )},
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-heading font-bold">{t('memberRequests.title')}</h1>
        <p className="text-muted-foreground">{t('memberRequests.subtitle')}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatsCard title={t('common.pending')} value={pendingCount} icon={Clock} />
        <StatsCard title={t('common.approved')} value={approvedCount} icon={UserCheck} />
        <StatsCard title={t('common.rejected')} value={rejectedCount} icon={UserX} />
      </div>

      <div className="flex items-center gap-3">
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('common.all')}</SelectItem>
            <SelectItem value="pending">{t('common.pending')}</SelectItem>
            <SelectItem value="approved">{t('common.approved')}</SelectItem>
            <SelectItem value="rejected">{t('common.rejected')}</SelectItem>
          </SelectContent>
        </Select>
      </div>
{/* ======================== */}
      <Card>
        <CardContent className="pt-6">
          <DataTable data={filtered} columns={columns} searchKey="nameEn" pageSize={10} />
        </CardContent>
      </Card>
      {/* ================== */}

      {/* View Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className='sm:max-w-2xl'>
          <DialogHeader><DialogTitle className="font-heading">{t('memberRequests.viewRequest')}</DialogTitle></DialogHeader>
          {selectedRequest && (
  <div className="space-y-6 max-h-[80vh] overflow-y-auto">

    {/* Profile Image */}
    <div className="flex justify-center">
      <img
        src={selectedRequest.photo && selectedRequest.photo.trim() !== '' ? selectedRequest.photo.startsWith('http') ? selectedRequest.photo : `http://localhost:5000${selectedRequest.photo}` : leader5}
        alt="Profile"
        className="w-28 h-28 rounded-full border object-cover"
        onError={e => { e.currentTarget.onerror = null; e.currentTarget.src = leader5; }}
      />
    </div>

    {/* Basic Information */}
    <div>
      <h2 className="font-bold text-lg mb-3">Basic Information</h2>

      <div className="grid grid-cols-2 gap-3 text-sm">

        <div>
          <span className="text-muted-foreground">Name (EN): </span>
          <strong>{selectedRequest.nameEn || "N/A"}</strong>
        </div>

        <div>
          <span className="text-muted-foreground">Name (BN): </span>
          <strong>{selectedRequest.nameBn || "N/A"}</strong>
        </div>

        <div>
          <span className="text-muted-foreground">Phone: </span>
          <strong>{selectedRequest.phone || "N/A"}</strong>
        </div>

        <div>
          <span className="text-muted-foreground">NID: </span>
          <strong>{selectedRequest.nid || "N/A"}</strong>
        </div>

        <div>
          <span className="text-muted-foreground">Blood Group: </span>
          <strong>{selectedRequest.bloodGroup || "N/A"}</strong>
        </div>

        <div>
          <span className="text-muted-foreground">Religion: </span>
          <strong>{selectedRequest.religion || "N/A"}</strong>
        </div>

        <div>
          <span className="text-muted-foreground">Nationality: </span>
          <strong>{selectedRequest.nationality || "N/A"}</strong>
        </div>

        <div>
          <span className="text-muted-foreground">Date of Birth: </span>
          <strong>{selectedRequest.dob}</strong>
        </div>

      </div>
    </div>

    {/* Family Information */}
    <div>
      <h2 className="font-bold text-lg mb-3">Family Information</h2>

      <div className="grid grid-cols-2 gap-3 text-sm">

        <div>
          <span className="text-muted-foreground">Father Name: </span>
          <strong>{selectedRequest.fatherName}</strong>
        </div>

        <div>
          <span className="text-muted-foreground">Mother Name: </span>
          <strong>{selectedRequest.motherName}</strong>
        </div>

      </div>
    </div>

    {/* Address Information */}
    <div>
      <h2 className="font-bold text-lg mb-3">Address Information</h2>

      <div className="grid grid-cols-2 gap-3 text-sm">

        <div>
          <span className="text-muted-foreground">Village: </span>
          <strong>{selectedRequest.village || "N/A"}</strong>
        </div>

        <div>
          <span className="text-muted-foreground">Union: </span>
          <strong>{selectedRequest.union || "N/A"}</strong>
        </div>

        <div>
          <span className="text-muted-foreground">Upazila: </span>
          <strong>{selectedRequest.upazila || "N/A"}</strong>
        </div>

        <div>
          <span className="text-muted-foreground">District: </span>
          <strong>{selectedRequest.district || "N/A"}</strong>
        </div>

      </div>
    </div>

    {/* Nominee Information */}
    <div>
      <h2 className="font-bold text-lg mb-3">Nominee Information</h2>

      <div className="grid grid-cols-2 gap-3 text-sm">

        <div>
          <span className="text-muted-foreground">Nominee Name: </span>
          <strong>{selectedRequest.nomineeName}</strong>
        </div>

        <div>
          <span className="text-muted-foreground">Relation: </span>
          <strong>{selectedRequest.nomineeRelation}</strong>
        </div>

        <div>
          <span className="text-muted-foreground">Nominee NID: </span>
          <strong>{selectedRequest.nomineeNid}</strong>
        </div>

      </div>
    </div>

    {/* Images */}
    <div>
      <h2 className="font-bold text-lg mb-3">Documents</h2>

      <div className="grid grid-cols-2 gap-4">

        <div>
          <p className="mb-2 text-sm font-medium">NID Front</p>

          <img
            src={`http://localhost:5000${selectedRequest.nidFrontUrl}`}
            alt="NID Front"
            className="rounded border"
          />
        </div>

        <div>
          <p className="mb-2 text-sm font-medium">NID Back</p>

          <img
            src={`http://localhost:5000${selectedRequest.nidBackUrl}`}
            alt="NID Back"
            className="rounded border"
          />
        </div>

      </div>
    </div>

  </div>
)}
        </DialogContent>
      </Dialog>

      {/* Approve Dialog */}
      <Dialog open={approveDialogOpen} onOpenChange={setApproveDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle className="font-heading">{t('memberRequests.approveRequest')}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">{t('memberRequests.approveConfirm', { name: selectedRequest?.name })}</p>
            <div className="space-y-2">

              <Label>{t('members.monthlyFee')} *</Label>
               <select
                value={monthlyFee}
                onChange={(e) => setMonthlyFee(e.target.value)}
                className="w-full border rounded-md p-2"
              >
                <option value="">Select Monthly Fee</option>
                <option value="300">300</option>
                <option value="500">500</option>
              </select>            
            </div>


            <div className="space-y-2">
              <Label>{t('members.billingCycle')}</Label>
              <Select value={billingCycle} onValueChange={setBillingCycle}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">{t('common.monthly')}</SelectItem>
                  <SelectItem value="quarterly">{t('common.quarterly')}</SelectItem>
                  <SelectItem value="yearly">{t('common.yearly')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setApproveDialogOpen(false)} disabled={isLoading}>{t('common.cancel')}</Button>
              <Button className="flex-1" onClick={handleApproveConfirm} disabled={isLoading}>{t('memberRequests.approve')}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle className="font-heading">{t('memberRequests.rejectRequest')}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">{t('memberRequests.rejectConfirm', { name: selectedRequest?.name })}</p>
            <Textarea placeholder={t('memberRequests.rejectionNotePlaceholder')} value={rejectNote} onChange={(e) => setRejectNote(e.target.value)} rows={3} />
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setRejectDialogOpen(false)} disabled={isLoading}>{t('common.cancel')}</Button>
              <Button variant="destructive" className="flex-1" onClick={handleRejectConfirm} disabled={isLoading}>{t('memberRequests.reject')}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
