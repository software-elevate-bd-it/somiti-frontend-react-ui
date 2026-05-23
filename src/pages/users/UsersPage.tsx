import { useState, useEffect } from 'react';
import { useUsersStore, ManagedUser } from '@/stores/usersStore';
import { useRolesStore, ALL_PERMISSIONS } from '@/stores/rolesStore';
import { useAuthStore, UserRole } from '@/stores/authStore';
import { somitees } from '@/data/dummyData';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Users as UsersIcon, Plus, Pencil, Trash2, Power, Eye, EyeOff, Copy } from 'lucide-react';
import { toast } from 'sonner';

interface FormState {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  somiteeId: string;
  roleIds: string[];
  status: 'active' | 'inactive';
}

const blank = (defaultSomitee?: string): FormState => ({
  name: '',
  email: '',
  password: '',
  role: 'member',
  somiteeId: defaultSomitee ?? '',
  roleIds: [],
  status: 'active',
});

export default function UsersPage() {
  const { users, addUser, updateUser, deleteUser, toggleStatus } = useUsersStore();
  const roles = useRolesStore((s) => s.roles);
  const currentUser = useAuthStore((s) => s.user);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<ManagedUser | null>(null);
  const [showPwd, setShowPwd] = useState(false);
  const [form, setForm] = useState<FormState>(blank(currentUser?.somiteeId));
  const [search, setSearch] = useState('');

  // Load roles once on mount
  useEffect(() => {
    useRolesStore.getState().loadRoles();
  }, []);

  // Ensure roles is always an array
  const rolesArray = Array.isArray(roles) ? roles : [];

  const openNew = () => {
    setEditing(null);
    setForm(blank(currentUser?.somiteeId));
    setShowPwd(false);
    setOpen(true);
  };

  const openEdit = (u: ManagedUser) => {
    setEditing(u);
    setForm({
      name: u.name,
      email: u.email,
      password: u.password,
      role: u.role,
      somiteeId: u.somiteeId,
      roleIds: [...u.roleIds],
      status: u.status,
    });
    setOpen(true);
  };

  const toggleRole = (id: string) => {
    setForm((f) => ({ ...f, roleIds: f.roleIds.includes(id) ? f.roleIds.filter((x) => x !== id) : [...f.roleIds, id] }));
  };

  const handleSave = () => {
    if (!form.name.trim()) return toast.error('Name is required');
    if (!form.email.trim() || !form.email.includes('@')) return toast.error('Valid email required');
    if (!form.password || form.password.length < 6) return toast.error('Password must be at least 6 characters');
    if (!form.somiteeId) return toast.error('Select somitee');
    if (form.roleIds.length === 0) return toast.error('Assign at least one role');

    const somiteeName = somitees.find((s) => s.id === form.somiteeId)?.name ?? 'Unknown';

    if (editing) {
      updateUser(editing.id, { ...form, someiteeName: somiteeName });
      toast.success('User updated');
    } else {
      const result = addUser({
        ...form,
        someiteeName: somiteeName,
        createdBy: currentUser?.id ?? 'system',
      });
      if (!result.ok) return toast.error(result.error ?? 'Failed to create user');
      toast.success('User created', { description: `${form.name} can now login with ${form.email}` });
    }
    setOpen(false);
  };

  const copyCreds = (u: ManagedUser) => {
    navigator.clipboard.writeText(`Email: ${u.email}\nPassword: ${u.password}`);
    toast.success('Credentials copied');
  };

  const generatePwd = () => {
    const pwd = Math.random().toString(36).slice(-10);
    setForm((f) => ({ ...f, password: pwd }));
    setShowPwd(true);
  };

  const filtered = users.filter((u) =>
    [u.name, u.email, u.someiteeName].some((v) => v.toLowerCase().includes(search.toLowerCase()))
  );

  const getRoleNames = (ids: string[]) =>
    ids.map((id) => rolesArray.find((r) => r.id === id)?.name ?? '?').join(', ');

  const getEffectivePerms = (ids: string[]) => {
    const set = new Set<string>();
    ids.forEach((rid) => rolesArray.find((r) => r.id === rid)?.permissions.forEach((p) => set.add(p)));
    return set.size;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold flex items-center gap-2">
            <UsersIcon className="h-6 w-6 text-primary" /> User Management
          </h1>
          <p className="text-muted-foreground">Create users and assign roles. They can login with the credentials you set.</p>
        </div>
        <Button onClick={openNew}><Plus className="h-4 w-4 mr-2" /> New User</Button>
      </div>

      <div className="flex gap-2">
        <Input placeholder="Search by name, email, or somitee..." value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-sm" />
      </div>

      {filtered.length === 0 ? (
        <Card><CardContent className="py-12 text-center text-muted-foreground">
          <UsersIcon className="h-12 w-12 mx-auto mb-2 opacity-30" />
          <p className="mb-1">No users yet</p>
          <p className="text-xs">Click "New User" to create your first role-based user.</p>
        </CardContent></Card>
      ) : (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((u) => (
            <Card key={u.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-start gap-3">
                  <Avatar className="h-10 w-10"><AvatarFallback className="bg-primary/10 text-primary">{u.name.charAt(0)}</AvatarFallback></Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-sm truncate">{u.name}</p>
                      <Badge variant={u.status === 'active' ? 'default' : 'secondary'} className="text-[10px]">{u.status}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">{u.someiteeName}</p>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <div className="flex flex-wrap gap-1">
                    {u.roleIds.length === 0 ? (
                      <Badge variant="outline" className="text-[10px] text-destructive">No role</Badge>
                    ) : (
                      u.roleIds.map((rid) => {
                        const role = rolesArray.find((r) => r.id === rid);
                        return <Badge key={rid} variant="outline" className="text-[10px]">{role?.name ?? '?'}</Badge>;
                      })
                    )}
                  </div>
                  <p className="text-[11px] text-muted-foreground">{getEffectivePerms(u.roleIds)} permissions</p>
                </div>
                <div className="flex items-center gap-1 pt-2 border-t">
                  <Button size="sm" variant="ghost" className="h-7 px-2 text-xs" onClick={() => copyCreds(u)}>
                    <Copy className="h-3 w-3 mr-1" /> Copy
                  </Button>
                  <Button size="sm" variant="ghost" className="h-7 px-2 text-xs" onClick={() => openEdit(u)}>
                    <Pencil className="h-3 w-3 mr-1" /> Edit
                  </Button>
                  <Button size="sm" variant="ghost" className="h-7 px-2 text-xs" onClick={() => { toggleStatus(u.id); toast.success(`User ${u.status === 'active' ? 'deactivated' : 'activated'}`); }}>
                    <Power className="h-3 w-3 mr-1" /> {u.status === 'active' ? 'Disable' : 'Enable'}
                  </Button>
                  <Button size="sm" variant="ghost" className="h-7 px-2 text-xs text-destructive ml-auto" onClick={() => { if (confirm('Delete this user?')) { deleteUser(u.id); toast.success('User deleted'); } }}>
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing ? 'Edit User' : 'Create New User'}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Full Name *</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Karim Mia" /></div>
              <div><Label>Email *</Label><Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="user@example.com" disabled={!!editing} /></div>
            </div>
            <div>
              <Label>Password *</Label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Input type={showPwd ? 'text' : 'password'} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Min 6 characters" />
                  <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground">
                    {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <Button type="button" variant="outline" size="sm" onClick={generatePwd}>Generate</Button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Account Type *</Label>
                <Select value={form.role} onValueChange={(v) => setForm({ ...form, role: v as UserRole })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="member">Member / Staff</SelectItem>
                    <SelectItem value="main_user">Somitee Manager</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Somitee *</Label>
                <Select value={form.somiteeId} onValueChange={(v) => setForm({ ...form, somiteeId: v })}>
                  <SelectTrigger><SelectValue placeholder="Select somitee" /></SelectTrigger>
                  <SelectContent>
                    {somitees.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label className="mb-2 block">Assign Roles * <span className="text-xs text-muted-foreground font-normal">(controls what this user can do)</span></Label>
              <div className="border rounded-md p-3 space-y-2 max-h-64 overflow-y-auto">
                {rolesArray.map((role) => (
                  <label key={role.id} className="flex items-start gap-3 p-2 rounded hover:bg-accent cursor-pointer">
                    <Checkbox checked={form.roleIds.includes(role.id)} onCheckedChange={() => toggleRole(role.id)} className="mt-0.5" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-sm">{role.name}</p>
                        {role.isPreset && <Badge variant="secondary" className="text-[10px]">Preset</Badge>}
                      </div>
                      {role.description && <p className="text-xs text-muted-foreground">{role.description}</p>}
                      <div className="flex flex-wrap gap-1 mt-1">
                        {role.permissions.slice(0, 4).map((p) => {
                          const meta = ALL_PERMISSIONS.find((x) => x.key === p);
                          return <Badge key={p} variant="outline" className="text-[9px] px-1 py-0">{meta?.label ?? p}</Badge>;
                        })}
                        {role.permissions.length > 4 && <span className="text-[10px] text-muted-foreground">+{role.permissions.length - 4} more</span>}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
              {form.roleIds.length > 0 && (
                <p className="text-xs text-muted-foreground mt-1">Selected: <strong>{getRoleNames(form.roleIds)}</strong></p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={handleSave}>{editing ? 'Update User' : 'Create User'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
