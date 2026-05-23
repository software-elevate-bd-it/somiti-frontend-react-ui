import { useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useThemeStore, ThemeTokens } from '@/stores/themeStore';
import { toast } from 'sonner';
import { Download, Upload, Copy, Trash2, Plus, RotateCcw, Palette, Save, Check } from 'lucide-react';

// Convert hex -> "H S% L%" string for our HSL tokens
function hexToHsl(hex: string): string {
  let h = hex.replace('#', '');
  if (h.length === 3) h = h.split('').map((c) => c + c).join('');
  const r = parseInt(h.substring(0, 2), 16) / 255;
  const g = parseInt(h.substring(2, 4), 16) / 255;
  const b = parseInt(h.substring(4, 6), 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let H = 0, S = 0; const L = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    S = L > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: H = (g - b) / d + (g < b ? 6 : 0); break;
      case g: H = (b - r) / d + 2; break;
      case b: H = (r - g) / d + 4; break;
    }
    H /= 6;
  }
  return `${Math.round(H * 360)} ${Math.round(S * 100)}% ${Math.round(L * 100)}%`;
}

function hslToHex(hsl: string): string {
  const m = hsl.match(/(\d+(?:\.\d+)?)\s+(\d+(?:\.\d+)?)%\s+(\d+(?:\.\d+)?)%/);
  if (!m) return '#000000';
  const h = parseFloat(m[1]) / 360, s = parseFloat(m[2]) / 100, l = parseFloat(m[3]) / 100;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => {
    const k = (n + h * 12) % 12;
    const c = l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1));
    return Math.round(c * 255).toString(16).padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex items-center justify-between gap-3 py-2">
      <Label className="text-xs flex-1">{label}</Label>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={hslToHex(value)}
          onChange={(e) => onChange(hexToHsl(e.target.value))}
          className="h-8 w-10 rounded border border-border cursor-pointer bg-transparent"
        />
        <Input value={value} onChange={(e) => onChange(e.target.value)} className="h-8 w-32 text-xs font-mono" />
      </div>
    </div>
  );
}

const FONT_OPTIONS = [
  'Space Grotesk', 'DM Sans', 'Inter', 'Roboto', 'Poppins', 'Manrope',
  'Outfit', 'Plus Jakarta Sans', 'Sora', 'Work Sans', 'Lora', 'Playfair Display',
];

export default function ThemeStudioPage() {
  const themes = useThemeStore((s) => s.themes);
  const activeId = useThemeStore((s) => s.activeId);
  const setActive = useThemeStore((s) => s.setActive);
  const updateTokens = useThemeStore((s) => s.updateActiveTokens);
  const updateDark = useThemeStore((s) => s.updateActiveDark);
  const saveAs = useThemeStore((s) => s.saveAs);
  const duplicate = useThemeStore((s) => s.duplicate);
  const remove = useThemeStore((s) => s.remove);
  const rename = useThemeStore((s) => s.rename);
  const reset = useThemeStore((s) => s.reset);
  const importJson = useThemeStore((s) => s.importJson);
  const exportJson = useThemeStore((s) => s.exportJson);
  const isDark = useThemeStore((s) => s.isDark);
  const setDark = useThemeStore((s) => s.setDark);

  const active = themes.find((t) => t.id === activeId) || themes[0];
  const t = active.tokens;
  const fileRef = useRef<HTMLInputElement>(null);
  const [newName, setNewName] = useState('');

  const set = (patch: Partial<ThemeTokens>) => {
    if (isDark) updateDark(patch); else updateTokens(patch);
  };

  const handleExport = () => {
    const blob = new Blob([exportJson(active.id)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `${active.name.replace(/\s+/g, '-')}.json`; a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const ok = importJson(reader.result as string);
      toast[ok ? 'success' : 'error'](ok ? 'Theme imported' : 'Invalid theme JSON');
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold flex items-center gap-2">
            <Palette className="h-6 w-6 text-primary" /> Branding & Theme Studio
          </h1>
          <p className="text-muted-foreground text-sm">Customize the entire application — live preview, no refresh required.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-border">
            <Label className="text-xs">Dark Mode Editing</Label>
            <Switch checked={isDark} onCheckedChange={setDark} />
          </div>
          <Button variant="outline" size="sm" onClick={() => reset()}><RotateCcw className="h-4 w-4 mr-1" /> Reset</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Theme list */}
        <Card className="lg:col-span-3 h-fit">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-heading">Themes</CardTitle>
            <CardDescription className="text-xs">Multiple themes supported</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {themes.map((th) => (
              <div key={th.id}
                onClick={() => setActive(th.id)}
                className={`flex items-center justify-between p-2 rounded-md cursor-pointer border transition-colors ${
                  th.id === activeId ? 'border-primary bg-primary/5' : 'border-border hover:bg-accent'
                }`}>
                <div className="flex items-center gap-2 min-w-0">
                  <div className="h-6 w-6 rounded border border-border shrink-0" style={{ background: `hsl(${th.tokens.primary})` }} />
                  <span className="text-sm font-medium truncate">{th.name}</span>
                </div>
                {th.id === activeId && <Check className="h-4 w-4 text-primary shrink-0" />}
              </div>
            ))}

            <Separator className="my-3" />

            <div className="space-y-2">
              <Input placeholder="New theme name" value={newName} onChange={(e) => setNewName(e.target.value)} className="h-8 text-xs" />
              <div className="grid grid-cols-2 gap-2">
                <Button size="sm" variant="outline" onClick={() => { if (!newName) return toast.error('Enter a name'); saveAs(newName); setNewName(''); toast.success('Theme saved'); }}>
                  <Plus className="h-3 w-3 mr-1" /> Save As
                </Button>
                <Button size="sm" variant="outline" onClick={() => { duplicate(active.id); toast.success('Duplicated'); }}>
                  <Copy className="h-3 w-3 mr-1" /> Duplicate
                </Button>
                <Button size="sm" variant="outline" onClick={handleExport}>
                  <Download className="h-3 w-3 mr-1" /> Export
                </Button>
                <Button size="sm" variant="outline" onClick={() => fileRef.current?.click()}>
                  <Upload className="h-3 w-3 mr-1" /> Import
                </Button>
                <input ref={fileRef} type="file" accept="application/json" className="hidden" onChange={handleImport} />
              </div>
              <Button size="sm" variant="ghost" className="w-full text-destructive" disabled={['default','corporate','emerald','midnight'].includes(active.id)} onClick={() => { remove(active.id); toast.success('Theme removed'); }}>
                <Trash2 className="h-3 w-3 mr-1" /> Remove Active
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Editor */}
        <div className="lg:col-span-9 space-y-4">
          <Card>
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <div>
                <Input value={active.name} onChange={(e) => rename(active.id, e.target.value)} className="h-9 font-semibold max-w-xs" />
              </div>
              <Badge variant="secondary">{isDark ? 'Editing dark mode' : 'Editing light mode'}</Badge>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="colors">
                <TabsList className="flex flex-wrap h-auto">
                  <TabsTrigger value="colors">Colors</TabsTrigger>
                  <TabsTrigger value="sidebar">Sidebar</TabsTrigger>
                  <TabsTrigger value="header">Header</TabsTrigger>
                  <TabsTrigger value="surfaces">Surfaces</TabsTrigger>
                  <TabsTrigger value="login">Login</TabsTrigger>
                  <TabsTrigger value="buttons">Buttons</TabsTrigger>
                  <TabsTrigger value="typography">Typography</TabsTrigger>
                  <TabsTrigger value="layout">Layout</TabsTrigger>
                </TabsList>

                <TabsContent value="colors" className="space-y-1 pt-4">
                  <ColorField label="Primary" value={t.primary} onChange={(v) => set({ primary: v })} />
                  <ColorField label="Secondary" value={t.secondary} onChange={(v) => set({ secondary: v })} />
                  <ColorField label="Accent" value={t.accent} onChange={(v) => set({ accent: v })} />
                  <ColorField label="Success" value={t.success} onChange={(v) => set({ success: v })} />
                  <ColorField label="Warning" value={t.warning} onChange={(v) => set({ warning: v })} />
                  <ColorField label="Error / Destructive" value={t.destructive} onChange={(v) => set({ destructive: v })} />
                  <ColorField label="Info" value={t.info} onChange={(v) => set({ info: v })} />
                </TabsContent>

                <TabsContent value="sidebar" className="space-y-1 pt-4">
                  <ColorField label="Background" value={t.sidebarBackground} onChange={(v) => set({ sidebarBackground: v })} />
                  <ColorField label="Text" value={t.sidebarForeground} onChange={(v) => set({ sidebarForeground: v })} />
                  <ColorField label="Hover" value={t.sidebarAccent} onChange={(v) => set({ sidebarAccent: v })} />
                  <ColorField label="Active Menu" value={t.sidebarPrimary} onChange={(v) => set({ sidebarPrimary: v })} />
                  <ColorField label="Border" value={t.sidebarBorder} onChange={(v) => set({ sidebarBorder: v })} />
                  <ColorField label="Icon" value={t.sidebarIcon} onChange={(v) => set({ sidebarIcon: v })} />
                </TabsContent>

                <TabsContent value="header" className="space-y-1 pt-4">
                  <ColorField label="Background" value={t.headerBackground} onChange={(v) => set({ headerBackground: v })} />
                  <ColorField label="Text" value={t.headerForeground} onChange={(v) => set({ headerForeground: v })} />
                  <ColorField label="Notification Icon" value={t.notificationColor} onChange={(v) => set({ notificationColor: v })} />
                  <ColorField label="Avatar Border" value={t.avatarBorder} onChange={(v) => set({ avatarBorder: v })} />
                </TabsContent>

                <TabsContent value="surfaces" className="space-y-1 pt-4">
                  <ColorField label="Main Background" value={t.background} onChange={(v) => set({ background: v })} />
                  <ColorField label="Card" value={t.card} onChange={(v) => set({ card: v })} />
                  <ColorField label="Modal / Popover" value={t.popover} onChange={(v) => set({ popover: v })} />
                  <ColorField label="Table Header" value={t.tableHeader} onChange={(v) => set({ tableHeader: v })} />
                  <ColorField label="Table Row Hover" value={t.tableRowHover} onChange={(v) => set({ tableRowHover: v })} />
                </TabsContent>

                <TabsContent value="login" className="space-y-1 pt-4">
                  <ColorField label="Background" value={t.loginBackground} onChange={(v) => set({ loginBackground: v })} />
                  <ColorField label="Gradient From" value={t.loginGradientFrom} onChange={(v) => set({ loginGradientFrom: v })} />
                  <ColorField label="Gradient To" value={t.loginGradientTo} onChange={(v) => set({ loginGradientTo: v })} />
                  <ColorField label="Card" value={t.loginCard} onChange={(v) => set({ loginCard: v })} />
                  <ColorField label="Button" value={t.loginButton} onChange={(v) => set({ loginButton: v })} />
                  <ColorField label="Text" value={t.loginText} onChange={(v) => set({ loginText: v })} />
                  <div className="flex items-center justify-between gap-3 py-2">
                    <Label className="text-xs flex-1">Background Image URL</Label>
                    <Input value={t.loginImage} onChange={(e) => set({ loginImage: e.target.value })} placeholder="https://..." className="h-8 max-w-sm" />
                  </div>
                </TabsContent>

                <TabsContent value="buttons" className="space-y-3 pt-4">
                  <ColorField label="Color" value={t.buttonColor} onChange={(v) => set({ buttonColor: v })} />
                  <ColorField label="Hover Color" value={t.buttonHoverColor} onChange={(v) => set({ buttonHoverColor: v })} />
                  <div className="flex items-center justify-between gap-3 py-2">
                    <Label className="text-xs flex-1">Radius</Label>
                    <Select value={t.buttonRadius} onValueChange={(v) => set({ buttonRadius: v })}>
                      <SelectTrigger className="h-8 w-40"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">Square</SelectItem>
                        <SelectItem value="0.25rem">Small</SelectItem>
                        <SelectItem value="0.5rem">Medium</SelectItem>
                        <SelectItem value="0.75rem">Large</SelectItem>
                        <SelectItem value="9999px">Pill</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center justify-between gap-3 py-2">
                    <Label className="text-xs flex-1">Shadow</Label>
                    <Select value={t.buttonShadow} onValueChange={(v) => set({ buttonShadow: v })}>
                      <SelectTrigger className="h-8 w-40"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        <SelectItem value="0 1px 2px 0 rgb(0 0 0 / 0.05)">Subtle</SelectItem>
                        <SelectItem value="0 4px 6px -1px rgb(0 0 0 / 0.1)">Medium</SelectItem>
                        <SelectItem value="0 10px 15px -3px rgb(0 0 0 / 0.1)">Large</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </TabsContent>

                <TabsContent value="typography" className="space-y-3 pt-4">
                  <div className="flex items-center justify-between gap-3 py-2">
                    <Label className="text-xs flex-1">Heading Font</Label>
                    <Select value={t.fontHeading} onValueChange={(v) => set({ fontHeading: v })}>
                      <SelectTrigger className="h-8 w-48"><SelectValue /></SelectTrigger>
                      <SelectContent>{FONT_OPTIONS.map((f) => <SelectItem key={f} value={f}>{f}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center justify-between gap-3 py-2">
                    <Label className="text-xs flex-1">Body Font</Label>
                    <Select value={t.fontBody} onValueChange={(v) => set({ fontBody: v })}>
                      <SelectTrigger className="h-8 w-48"><SelectValue /></SelectTrigger>
                      <SelectContent>{FONT_OPTIONS.map((f) => <SelectItem key={f} value={f}>{f}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center justify-between gap-3 py-2">
                    <Label className="text-xs flex-1">Heading Weight</Label>
                    <Select value={t.headingWeight} onValueChange={(v) => set({ headingWeight: v })}>
                      <SelectTrigger className="h-8 w-40"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="500">Medium</SelectItem>
                        <SelectItem value="600">Semibold</SelectItem>
                        <SelectItem value="700">Bold</SelectItem>
                        <SelectItem value="800">Extra Bold</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2 py-2">
                    <div className="flex items-center justify-between"><Label className="text-xs">Font Size Scale</Label><span className="text-xs font-mono">{t.fontScale.toFixed(2)}×</span></div>
                    <Slider min={0.85} max={1.2} step={0.01} value={[t.fontScale]} onValueChange={(v) => set({ fontScale: v[0] })} />
                  </div>
                  <ColorField label="Body Text Color" value={t.bodyTextColor} onChange={(v) => set({ bodyTextColor: v })} />
                </TabsContent>

                <TabsContent value="layout" className="space-y-4 pt-4">
                  <div className="flex items-center justify-between gap-3">
                    <div><Label className="text-sm">Layout Mode</Label><p className="text-xs text-muted-foreground">Boxed centers content with max-width</p></div>
                    <Select value={t.layoutMode} onValueChange={(v: 'full' | 'boxed') => set({ layoutMode: v })}>
                      <SelectTrigger className="h-8 w-40"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="full">Full Width</SelectItem>
                        <SelectItem value="boxed">Boxed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <div><Label className="text-sm">Sidebar Mode</Label><p className="text-xs text-muted-foreground">Compact uses icons-only by default</p></div>
                    <Select value={t.sidebarMode} onValueChange={(v: 'expanded' | 'compact') => set({ sidebarMode: v })}>
                      <SelectTrigger className="h-8 w-40"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="expanded">Expanded</SelectItem>
                        <SelectItem value="compact">Compact</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Live preview */}
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-base font-heading">Live Preview</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="p-4 rounded-lg border bg-card">
                  <p className="text-xs text-muted-foreground mb-2">Card</p>
                  <h3 className="font-heading font-bold mb-2">Heading sample</h3>
                  <p className="text-sm">Body text for preview</p>
                  <Button className="mt-3" size="sm">Primary</Button>
                </div>
                <div className="p-4 rounded-lg border" style={{ background: `hsl(var(--sidebar-background))`, color: `hsl(var(--sidebar-foreground))` }}>
                  <p className="text-xs opacity-70 mb-2">Sidebar</p>
                  <div className="space-y-1">
                    <div className="px-2 py-1.5 rounded text-sm" style={{ background: `hsl(var(--sidebar-primary))`, color: 'white' }}>Active item</div>
                    <div className="px-2 py-1.5 rounded text-sm hover:bg-[hsl(var(--sidebar-accent))]">Menu item</div>
                  </div>
                </div>
                <div className="p-4 rounded-lg border" style={{ background: `linear-gradient(135deg, hsl(var(--login-gradient-from)), hsl(var(--login-gradient-to)))`, color: 'white' }}>
                  <p className="text-xs opacity-80 mb-2">Login Gradient</p>
                  <h3 className="font-heading font-bold">Welcome</h3>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
