import { useState, useEffect } from 'react';
import { useRolesStore, ALL_PERMISSIONS, Permission, Role } from '@/stores/rolesStore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ShieldCheck, Plus, Pencil, Trash2, UserPlus, X } from 'lucide-react';
import { toast } from 'sonner';

const PERM_GROUPS = Array.from(new Set(ALL_PERMISSIONS.map((p) => p.group)));

export default function RolesPage() {
  const roles = useRolesStore((s) => s.roles);
  const assignmentsData = useRolesStore((s) => s.assignments);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [open, setOpen] = useState(false);
  const [assignOpen, setAssignOpen] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', permissions: [] as Permission[] });
  const [assignForm, setAssignForm] = useState({ userId: '', userName: '', roleId: '' });

  // Load assignments on mount
  useEffect(() => {
    useRolesStore.getState().loadAssignments();
  }, []);

  // Ensure assignments is always an array
  const assignmentsArray = Array.isArray(assignmentsData) ? assignmentsData : [];

  const openNew = () => {
    setEditingRole(null);
    setForm({ name: '', description: '', permissions: [] });
    setOpen(true);
  };

  const openEdit = (role: Role) => {
    setEditingRole(role);
    setForm({ name: role.name, description: role.description ?? '', permissions: [...(role.permissions as Permission[])] });
    setOpen(true);
  };

  const togglePerm = (p: Permission) => {
    setForm((f) => ({
      ...f,
      permissions: f.permissions.includes(p) ? f.permissions.filter((x) => x !== p) : [...f.permissions, p],
    }));
  };

  const save = () => {
    if (!form.name.trim()) return toast.error('Role name is required');
    if (form.permissions.length === 0) return toast.error('Select at least one permission');
    if (editingRole) {
      useRolesStore.getState().updateRole(editingRole.id, { name: form.name, description: form.description, permissions: form.permissions });
      toast.success('Role updated');
    } else {
      useRolesStore.getState().addRole({ name: form.name, description: form.description, permissions: form.permissions });
      toast.success('Role created');
    }
    setOpen(false);
  };

  const handleAssign = () => {
    if (!assignForm.userId || !assignForm.userName || !assignForm.roleId) {
      return toast.error('All fields required');
    }
    useRolesStore.getState().assignRole(assignForm.userId, assignForm.userName, assignForm.roleId);
    toast.success('Role assigned');
    setAssignForm({ userId: '', userName: '', roleId: '' });
    setAssignOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold flex items-center gap-2">
            <ShieldCheck className="h-6 w-6 text-primary" /> Roles & Permissions
          </h1>
          <p className="text-muted-foreground">Create roles and assign them to users for approval workflow</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={assignOpen} onOpenChange={setAssignOpen}>
            <DialogTrigger asChild>
              <Button variant="outline"><UserPlus className="h-4 w-4 mr-2" /> Assign Role</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Assign Role to User</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <div><Label>User ID</Label><Input value={assignForm.userId} onChange={(e) => setAssignForm({ ...assignForm, userId: e.target.value })} placeholder="e.g. user-123" /></div>
                <div><Label>User Name</Label><Input value={assignForm.userName} onChange={(e) => setAssignForm({ ...assignForm, userName: e.target.value })} placeholder="Full name" /></div>
                <div>
                  <Label>Role</Label>
                  <Select value={assignForm.roleId} onValueChange={(v) => setAssignForm({ ...assignForm, roleId: v })}>
                    <SelectTrigger><SelectValue placeholder="Select role" /></SelectTrigger>
                    <SelectContent>
                      {roles.map((r) => <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter><Button onClick={handleAssign}>Assign</Button></DialogFooter>
            </DialogContent>
          </Dialog>
          <Button onClick={openNew}><Plus className="h-4 w-4 mr-2" /> New Role</Button>
        </div>
      </div>

      <Tabs defaultValue="roles">
        <TabsList>
          <TabsTrigger value="roles">Roles ({roles.length})</TabsTrigger>
          <TabsTrigger value="assignments">Assignments ({assignmentsArray.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="roles" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mt-4">
          {roles.map((role) => (
            <Card key={role.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-base flex items-center gap-2">
                      {role.name}
                      {role.isPreset && <Badge variant="secondary" className="text-[10px]">Preset</Badge>}
                    </CardTitle>
                    <CardDescription className="text-xs mt-1">{role.description}</CardDescription>
                  </div>
                  <div className="flex gap-1">
                    <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => openEdit(role)}>
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    {!role.isPreset && (
                      <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => { useRolesStore.getState().deleteRole(role.id); toast.success('Role deleted'); }}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-1">
                  {role.permissions.map((p) => {
                    const meta = ALL_PERMISSIONS.find((x) => x.key === p);
                    return <Badge key={p} variant="outline" className="text-[10px]">{meta?.label ?? p}</Badge>;
                  })}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="assignments" className="mt-4">
          <Card>
            <CardContent className="pt-6">
              {assignmentsArray.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No role assignments yet</p>
              ) : (
                <div className="space-y-2">
                  {assignmentsArray.map((a) => {
                    const role = roles.find((r) => r.id === a.roleId);
                    return (
                      <div key={`${a.userId}-${a.roleId}`} className="flex items-center justify-between p-3 border rounded-md">
                        <div>
                          <p className="font-medium text-sm">{a.userName}</p>
                          <p className="text-xs text-muted-foreground">{a.userId} • {role?.name ?? 'Unknown role'}</p>
                        </div>
                        <Button size="icon" variant="ghost" className="text-destructive" onClick={() => useRolesStore.getState().unassignRole(a.userId, a.roleId)}>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editingRole ? 'Edit Role' : 'Create New Role'}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Role Name *</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Cashier" /></div>
            <div><Label>Description</Label><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Brief description" rows={2} /></div>
            <div>
              <Label className="mb-2 block">Permissions *</Label>
              <div className="space-y-3 border rounded-md p-3">
                {PERM_GROUPS.map((group) => (
                  <div key={group}>
                    <p className="text-xs font-semibold text-muted-foreground mb-2">{group}</p>
                    <div className="grid grid-cols-2 gap-2">
                      {ALL_PERMISSIONS.filter((p) => p.group === group).map((perm) => (
                        <label key={perm.key} className="flex items-center gap-2 text-sm cursor-pointer p-1.5 rounded hover:bg-accent">
                          <Checkbox checked={form.permissions.includes(perm.key)} onCheckedChange={() => togglePerm(perm.key)} />
                          {perm.label}
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={save}>{editingRole ? 'Update' : 'Create'} Role</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
