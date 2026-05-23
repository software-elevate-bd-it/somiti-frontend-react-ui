import { useEffect, useMemo, useState } from 'react';
import { useDrawSavingsStore, DrawGroup, DrawType, DrawMethod, DrawGroupStatus } from '@/stores/drawSavingsStore';
import { seedDrawDemoData } from '@/stores/drawSavingsDemo';
import { useMembersStore } from '@/stores/membersStore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Trophy, Gift, Users as UsersIcon, Calendar, Plus, Sparkles, Wallet, CheckCircle2, XCircle, Coins, ListChecks, ArrowLeft, Dice5, Database } from 'lucide-react';
import { toast } from 'sonner';
import { usePermissions } from '@/hooks/usePermissions';

const drawTypeLabel: Record<DrawType, string> = {
  daily: 'Daily', weekly: 'Weekly', biweekly: 'Every 15 Days', monthly: 'Monthly',
};

const fmtMoney = (n: number) => `৳${n.toLocaleString()}`;

export default function DrawSavingsPage() {
  const store = useDrawSavingsStore();
  const { members, loadMembers } = useMembersStore();
  const { isAdmin } = usePermissions();
  const [tab, setTab] = useState('overview');
  const [openGroup, setOpenGroup] = useState<DrawGroup | null>(null);
  const [createOpen, setCreateOpen] = useState(false);

  useEffect(() => { if (members.length === 0) loadMembers().catch(() => {}); }, []);

  const stats = useMemo(() => {
    const active = store.groups.filter((g) => g.status === 'active');
    const totalPot = store.groups.reduce((s, g) => s + store.groupTotalPot(g.id), 0);
    const winnersCount = store.winners.filter((w) => w.approvalStatus === 'approved').length;
    const remaining = store.enrollments.filter((e) => e.eligible && !e.hasWon).length;
    const nextDraw = active[0]?.startDate;
    return { active: active.length, totalPot, winnersCount, remaining, nextDraw };
  }, [store.groups, store.winners, store.enrollments]);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-heading font-bold flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-primary" /> Draw Savings
          </h1>
          <p className="text-muted-foreground">Rotating savings groups with digital draws and winner management.</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" onClick={() => { seedDrawDemoData(); toast.success('Demo data loaded'); }} className="gap-2">
            <Database className="h-4 w-4" /> Load Demo Data
          </Button>
          <Button onClick={() => setCreateOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" /> New Draw Group
          </Button>
        </div>
      </div>

      {/* Dashboard widgets */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard icon={ListChecks} label="Active Groups" value={stats.active} accent="from-primary/20" />
        <StatCard icon={Calendar} label="Next Draw" value={stats.nextDraw ? new Date(stats.nextDraw).toLocaleDateString() : '—'} accent="from-blue-500/20" />
        <StatCard icon={Coins} label="Total Pot" value={fmtMoney(stats.totalPot)} accent="from-amber-500/20" />
        <StatCard icon={Trophy} label="Winners" value={stats.winnersCount} accent="from-emerald-500/20" />
        <StatCard icon={UsersIcon} label="Eligible Members" value={stats.remaining} accent="from-fuchsia-500/20" />
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="overview">Groups</TabsTrigger>
          <TabsTrigger value="winners">Winners</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {store.groups.length === 0 ? (
            <Card><CardContent className="py-12 text-center text-muted-foreground">
              <Gift className="h-10 w-10 mx-auto mb-3 opacity-50" />
              No draw groups yet. Create your first one to get started.
            </CardContent></Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {store.groups.map((g) => (
                <GroupCard key={g.id} group={g} onOpen={() => setOpenGroup(g)} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="winners">
          <WinnersTable />
        </TabsContent>

        <TabsContent value="reports">
          <ReportsView />
        </TabsContent>
      </Tabs>

      <CreateGroupDialog open={createOpen} onOpenChange={setCreateOpen} />
      {openGroup && (
        <GroupDetailDialog
          groupId={openGroup.id}
          onClose={() => setOpenGroup(null)}
          isAdmin={isAdmin}
          membersList={members.map((m) => ({ id: m.id, name: m.name }))}
        />
      )}
    </div>
  );
}

function StatCard({ icon: Icon, label, value, accent }: { icon: any; label: string; value: any; accent: string }) {
  return (
    <Card className={`relative overflow-hidden bg-gradient-to-br ${accent} to-transparent border`}>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">{label}</p>
            <p className="text-2xl font-bold mt-1">{value}</p>
          </div>
          <Icon className="h-8 w-8 text-primary/70" />
        </div>
      </CardContent>
    </Card>
  );
}

function GroupCard({ group, onOpen }: { group: DrawGroup; onOpen: () => void }) {
  const store = useDrawSavingsStore();
  const enrolled = store.groupEnrollments(group.id).length;
  const collected = store.groupCollected(group.id);
  const pot = store.groupTotalPot(group.id);
  const progress = pot > 0 ? Math.min(100, (collected / pot) * 100) : 0;
  const statusColor: Record<DrawGroupStatus, string> = {
    draft: 'secondary', active: 'default', completed: 'outline',
  } as any;

  return (
    <Card className="hover:shadow-lg transition-shadow cursor-pointer group" onClick={onOpen}>
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <div>
            <CardTitle className="text-lg group-hover:text-primary transition-colors">{group.name}</CardTitle>
            <CardDescription>{drawTypeLabel[group.drawType]} · {group.totalCycles} cycles</CardDescription>
          </div>
          <Badge variant={statusColor[group.status] as any} className="capitalize">{group.status}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div><p className="text-muted-foreground text-xs">Installment</p><p className="font-semibold">{fmtMoney(group.installmentAmount)}</p></div>
          <div><p className="text-muted-foreground text-xs">Total Pot</p><p className="font-semibold">{fmtMoney(pot)}</p></div>
          <div><p className="text-muted-foreground text-xs">Members</p><p className="font-semibold">{enrolled} / {group.totalMembers}</p></div>
          <div><p className="text-muted-foreground text-xs">Start Date</p><p className="font-semibold">{new Date(group.startDate).toLocaleDateString()}</p></div>
        </div>
        <div>
          <div className="flex justify-between text-xs text-muted-foreground mb-1">
            <span>Collected</span><span>{progress.toFixed(0)}%</span>
          </div>
          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-primary to-primary/60" style={{ width: `${progress}%` }} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function CreateGroupDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const create = useDrawSavingsStore((s) => s.createGroup);
  const [form, setForm] = useState({
    name: '', drawType: 'monthly' as DrawType, startDate: new Date().toISOString().slice(0, 10),
    totalMembers: 10, installmentAmount: 1000, totalCycles: 10, drawMethod: 'random' as DrawMethod,
    status: 'draft' as DrawGroupStatus,
  });

  const submit = () => {
    if (!form.name.trim()) { toast.error('Group name is required'); return; }
    create(form);
    toast.success('Draw group created');
    onOpenChange(false);
    setForm({ ...form, name: '' });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><Sparkles className="h-5 w-5 text-primary" /> Create Draw Group</DialogTitle>
          <DialogDescription>Configure a new rotating savings group.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-2">
          <div className="grid gap-2">
            <Label>Group Name</Label>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. January Savings Circle" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-2">
              <Label>Draw Type</Label>
              <Select value={form.drawType} onValueChange={(v: DrawType) => setForm({ ...form, drawType: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="biweekly">Every 15 Days</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Draw Method</Label>
              <Select value={form.drawMethod} onValueChange={(v: DrawMethod) => setForm({ ...form, drawMethod: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="random">Random Draw</SelectItem>
                  <SelectItem value="manual">Manual Selection</SelectItem>
                  <SelectItem value="token">Token Draw</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="grid gap-2"><Label>Start Date</Label><Input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} /></div>
            <div className="grid gap-2"><Label>Total Members</Label><Input type="number" min={2} value={form.totalMembers} onChange={(e) => setForm({ ...form, totalMembers: +e.target.value })} /></div>
            <div className="grid gap-2"><Label>Total Cycles</Label><Input type="number" min={1} value={form.totalCycles} onChange={(e) => setForm({ ...form, totalCycles: +e.target.value })} /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-2"><Label>Installment Amount</Label><Input type="number" min={0} value={form.installmentAmount} onChange={(e) => setForm({ ...form, installmentAmount: +e.target.value })} /></div>
            <div className="grid gap-2">
              <Label>Status</Label>
              <Select value={form.status} onValueChange={(v: DrawGroupStatus) => setForm({ ...form, status: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={submit}>Create Group</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function GroupDetailDialog({ groupId, onClose, isAdmin, membersList }: {
  groupId: string; onClose: () => void; isAdmin: boolean; membersList: { id: string; name: string }[];
}) {
  const store = useDrawSavingsStore();
  const group = store.groups.find((g) => g.id === groupId);
  const [enrollOpen, setEnrollOpen] = useState(false);
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [activeCycle, setActiveCycle] = useState(1);
  const [drawDialogOpen, setDrawDialogOpen] = useState(false);
  const [manualPick, setManualPick] = useState<string>('');

  if (!group) return null;
  const enrollments = store.groupEnrollments(groupId);
  const eligible = store.eligibleMembers(groupId);
  const installments = store.groupInstallments(groupId, activeCycle);
  const winners = store.groupWinners(groupId);
  const cycleHasWinner = winners.some((w) => w.cycleNumber === activeCycle && w.approvalStatus !== 'rejected');

  const enroll = () => {
    const picks = membersList.filter((m) => selectedMembers.includes(m.id));
    store.enrollMembers(groupId, picks);
    toast.success(`${picks.length} member(s) enrolled`);
    setSelectedMembers([]);
    setEnrollOpen(false);
  };

  const generateInstallments = () => {
    store.generateCycle(groupId, activeCycle);
    toast.success(`Cycle ${activeCycle} installments generated`);
  };

  const runDraw = () => {
    const winner = store.executeDraw(groupId, activeCycle, group.drawMethod, manualPick || undefined);
    if (!winner) { toast.error('No eligible members'); return; }
    toast.success(`Winner: ${winner.memberName}`);
    setDrawDialogOpen(false);
    setManualPick('');
  };

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between gap-3">
            <div>
              <DialogTitle className="text-xl flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" /> {group.name}
              </DialogTitle>
              <DialogDescription>
                {drawTypeLabel[group.drawType]} · {group.totalCycles} cycles · {fmtMoney(group.installmentAmount)} per cycle
              </DialogDescription>
            </div>
            <Badge className="capitalize">{group.status}</Badge>
          </div>
        </DialogHeader>

        <Tabs defaultValue="members">
          <TabsList>
            <TabsTrigger value="members">Members</TabsTrigger>
            <TabsTrigger value="cycles">Cycles & Collection</TabsTrigger>
            <TabsTrigger value="draws">Draws</TabsTrigger>
          </TabsList>

          <TabsContent value="members" className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">{enrollments.length} of {group.totalMembers} enrolled · {eligible.length} eligible</p>
              <Button size="sm" onClick={() => setEnrollOpen(true)} className="gap-2"><Plus className="h-4 w-4" /> Enroll Members</Button>
            </div>
            <Card><CardContent className="p-0">
              <Table>
                <TableHeader><TableRow>
                  <TableHead>#</TableHead><TableHead>Member</TableHead><TableHead>Join Date</TableHead><TableHead>Status</TableHead><TableHead>Eligibility</TableHead>
                </TableRow></TableHeader>
                <TableBody>
                  {enrollments.length === 0 ? (
                    <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-6">No members yet</TableCell></TableRow>
                  ) : enrollments.map((e) => (
                    <TableRow key={e.id}>
                      <TableCell>{e.position}</TableCell>
                      <TableCell className="font-medium">{e.memberName}</TableCell>
                      <TableCell>{new Date(e.joinDate).toLocaleDateString()}</TableCell>
                      <TableCell>{e.hasWon ? <Badge variant="default" className="gap-1"><Trophy className="h-3 w-3" />Won</Badge> : <Badge variant="secondary">Active</Badge>}</TableCell>
                      <TableCell>{e.eligible ? <Badge variant="outline" className="text-emerald-600 border-emerald-600/50">Eligible</Badge> : <Badge variant="outline" className="text-muted-foreground">Not eligible</Badge>}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent></Card>
          </TabsContent>

          <TabsContent value="cycles" className="space-y-3">
            <div className="flex items-center gap-3 flex-wrap">
              <Label>Cycle</Label>
              <Select value={String(activeCycle)} onValueChange={(v) => setActiveCycle(+v)}>
                <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Array.from({ length: group.totalCycles }, (_, i) => i + 1).map((c) => (
                    <SelectItem key={c} value={String(c)}>Cycle {c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button size="sm" variant="outline" onClick={generateInstallments}>Generate Installments</Button>
            </div>
            <Card><CardContent className="p-0">
              <Table>
                <TableHeader><TableRow>
                  <TableHead>Member</TableHead><TableHead>Cycle</TableHead><TableHead>Due</TableHead><TableHead>Paid</TableHead><TableHead>Status</TableHead><TableHead>Action</TableHead>
                </TableRow></TableHeader>
                <TableBody>
                  {installments.length === 0 ? (
                    <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-6">No installments. Click Generate Installments.</TableCell></TableRow>
                  ) : installments.map((i) => (
                    <InstallmentRow key={i.id} installment={i} />
                  ))}
                </TableBody>
              </Table>
            </CardContent></Card>
          </TabsContent>

          <TabsContent value="draws" className="space-y-3">
            <div className="flex items-center gap-3 flex-wrap">
              <Label>Cycle</Label>
              <Select value={String(activeCycle)} onValueChange={(v) => setActiveCycle(+v)}>
                <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Array.from({ length: group.totalCycles }, (_, i) => i + 1).map((c) => (
                    <SelectItem key={c} value={String(c)}>Cycle {c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button size="sm" disabled={cycleHasWinner || eligible.length === 0} onClick={() => setDrawDialogOpen(true)} className="gap-2">
                <Dice5 className="h-4 w-4" /> Execute Draw
              </Button>
              {eligible.length === 1 && <Badge variant="outline" className="text-amber-600 border-amber-600/50">Final eligible — auto-assign</Badge>}
            </div>
            <Card><CardContent className="p-0">
              <Table>
                <TableHeader><TableRow>
                  <TableHead>Cycle</TableHead><TableHead>Winner</TableHead><TableHead>Draw Date</TableHead><TableHead>Amount</TableHead><TableHead>Method</TableHead><TableHead>Status</TableHead><TableHead>Action</TableHead>
                </TableRow></TableHeader>
                <TableBody>
                  {winners.length === 0 ? (
                    <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-6">No draws yet</TableCell></TableRow>
                  ) : winners.map((w) => (
                    <WinnerRow key={w.id} winnerId={w.id} isAdmin={isAdmin} />
                  ))}
                </TableBody>
              </Table>
            </CardContent></Card>
          </TabsContent>
        </Tabs>

        {/* Enroll dialog */}
        <Dialog open={enrollOpen} onOpenChange={setEnrollOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Enroll Members</DialogTitle>
              <DialogDescription>Select members to add to this group.</DialogDescription>
            </DialogHeader>
            <div className="max-h-80 overflow-y-auto space-y-2 border rounded-md p-3">
              {membersList.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No members available</p>
              ) : membersList.map((m) => {
                const already = enrollments.some((e) => e.memberId === m.id);
                return (
                  <label key={m.id} className={`flex items-center gap-2 p-2 rounded hover:bg-muted/50 cursor-pointer ${already ? 'opacity-50' : ''}`}>
                    <Checkbox
                      disabled={already}
                      checked={selectedMembers.includes(m.id)}
                      onCheckedChange={(c) => setSelectedMembers((prev) => c ? [...prev, m.id] : prev.filter((x) => x !== m.id))}
                    />
                    <span className="text-sm">{m.name}</span>
                    {already && <Badge variant="outline" className="ml-auto text-xs">Enrolled</Badge>}
                  </label>
                );
              })}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEnrollOpen(false)}>Cancel</Button>
              <Button onClick={enroll} disabled={selectedMembers.length === 0}>Enroll {selectedMembers.length}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Draw dialog */}
        <Dialog open={drawDialogOpen} onOpenChange={setDrawDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2"><Dice5 className="h-5 w-5 text-primary" /> Execute Draw — Cycle {activeCycle}</DialogTitle>
              <DialogDescription>Method: {group.drawMethod}. {eligible.length} eligible member(s).</DialogDescription>
            </DialogHeader>
            {group.drawMethod === 'manual' && eligible.length > 1 && (
              <div className="grid gap-2">
                <Label>Pick Winner</Label>
                <Select value={manualPick} onValueChange={setManualPick}>
                  <SelectTrigger><SelectValue placeholder="Choose member" /></SelectTrigger>
                  <SelectContent>
                    {eligible.map((e) => <SelectItem key={e.memberId} value={e.memberId}>{e.memberName}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setDrawDialogOpen(false)}>Cancel</Button>
              <Button onClick={runDraw}><Sparkles className="h-4 w-4 mr-1" /> Run Draw</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </DialogContent>
    </Dialog>
  );
}

function InstallmentRow({ installment }: { installment: any }) {
  const recordPayment = useDrawSavingsStore((s) => s.recordPayment);
  const [val, setVal] = useState(installment.paidAmount);
  const colors = { paid: 'default', partial: 'secondary', due: 'destructive' } as const;
  return (
    <TableRow>
      <TableCell className="font-medium">{installment.memberName}</TableCell>
      <TableCell>{installment.cycleNumber}</TableCell>
      <TableCell>{fmtMoney(installment.dueAmount)}</TableCell>
      <TableCell><Input type="number" value={val} onChange={(e) => setVal(+e.target.value)} className="w-28 h-8" /></TableCell>
      <TableCell><Badge variant={colors[installment.status as keyof typeof colors] as any} className="capitalize">{installment.status}</Badge></TableCell>
      <TableCell>
        <Button size="sm" variant="outline" onClick={() => { recordPayment(installment.id, val); toast.success('Payment recorded · Ledger & cashbook updated'); }}>
          Save
        </Button>
      </TableCell>
    </TableRow>
  );
}

function WinnerRow({ winnerId, isAdmin }: { winnerId: string; isAdmin: boolean }) {
  const winner = useDrawSavingsStore((s) => s.winners.find((w) => w.id === winnerId));
  const approve = useDrawSavingsStore((s) => s.approveWinner);
  const reject = useDrawSavingsStore((s) => s.rejectWinner);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [note, setNote] = useState('');
  if (!winner) return null;
  const colors = { pending: 'secondary', approved: 'default', rejected: 'destructive' } as const;
  return (
    <>
      <TableRow>
        <TableCell>{winner.cycleNumber}</TableCell>
        <TableCell className="font-medium flex items-center gap-1"><Trophy className="h-3 w-3 text-amber-500" />{winner.memberName}</TableCell>
        <TableCell>{new Date(winner.drawDate).toLocaleDateString()}</TableCell>
        <TableCell>{fmtMoney(winner.amount)}</TableCell>
        <TableCell className="capitalize">{winner.method}</TableCell>
        <TableCell><Badge variant={colors[winner.approvalStatus] as any} className="capitalize">{winner.approvalStatus}</Badge></TableCell>
        <TableCell>
          {winner.approvalStatus === 'pending' && isAdmin && (
            <div className="flex gap-1">
              <Button size="sm" variant="outline" onClick={() => { approve(winner.id, 'admin'); toast.success('Winner approved · Bank entry created'); }}>
                <CheckCircle2 className="h-3 w-3" />
              </Button>
              <Button size="sm" variant="outline" onClick={() => setRejectOpen(true)}>
                <XCircle className="h-3 w-3" />
              </Button>
            </div>
          )}
          {winner.rejectionNote && <p className="text-xs text-muted-foreground italic">{winner.rejectionNote}</p>}
        </TableCell>
      </TableRow>
      <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Reject Winner</DialogTitle><DialogDescription>Provide a mandatory reason.</DialogDescription></DialogHeader>
          <Textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Reason for rejection" />
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={() => {
              if (!note.trim()) { toast.error('Note required'); return; }
              reject(winner.id, 'admin', note);
              toast.success('Winner rejected · member returned to eligible pool');
              setRejectOpen(false); setNote('');
            }}>Reject</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function WinnersTable() {
  const winners = useDrawSavingsStore((s) => s.winners);
  const groups = useDrawSavingsStore((s) => s.groups);
  return (
    <Card><CardContent className="p-0">
      <Table>
        <TableHeader><TableRow>
          <TableHead>Group</TableHead><TableHead>Cycle</TableHead><TableHead>Winner</TableHead><TableHead>Date</TableHead><TableHead>Amount</TableHead><TableHead>Status</TableHead>
        </TableRow></TableHeader>
        <TableBody>
          {winners.length === 0 ? (
            <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-6">No winners yet</TableCell></TableRow>
          ) : winners.map((w) => (
            <TableRow key={w.id}>
              <TableCell>{groups.find((g) => g.id === w.groupId)?.name ?? '—'}</TableCell>
              <TableCell>{w.cycleNumber}</TableCell>
              <TableCell className="font-medium">{w.memberName}</TableCell>
              <TableCell>{new Date(w.drawDate).toLocaleDateString()}</TableCell>
              <TableCell>{fmtMoney(w.amount)}</TableCell>
              <TableCell><Badge variant={w.approvalStatus === 'approved' ? 'default' : w.approvalStatus === 'rejected' ? 'destructive' : 'secondary'} className="capitalize">{w.approvalStatus}</Badge></TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </CardContent></Card>
  );
}

function ReportsView() {
  const store = useDrawSavingsStore();
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {store.groups.map((g) => {
        const enrolls = store.groupEnrollments(g.id);
        const wins = store.groupWinners(g.id);
        const collected = store.groupCollected(g.id);
        const dueRows = store.groupInstallments(g.id).filter((i) => i.status !== 'paid');
        const remaining = enrolls.filter((e) => e.eligible && !e.hasWon);
        return (
          <Card key={g.id}>
            <CardHeader>
              <CardTitle className="text-base">{g.name}</CardTitle>
              <CardDescription>Group summary</CardDescription>
            </CardHeader>
            <CardContent className="text-sm space-y-1">
              <div className="flex justify-between"><span className="text-muted-foreground">Members</span><span>{enrolls.length}/{g.totalMembers}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Collected</span><span>{fmtMoney(collected)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Pending Dues</span><span>{dueRows.length}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Winners</span><span>{wins.filter((w) => w.approvalStatus === 'approved').length}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Remaining Eligible</span><span>{remaining.length}</span></div>
            </CardContent>
          </Card>
        );
      })}
      {store.groups.length === 0 && (
        <Card className="md:col-span-2"><CardContent className="py-12 text-center text-muted-foreground">No data to report yet</CardContent></Card>
      )}
    </div>
  );
}
