import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface ThemeTokens {
  // Brand colors (HSL "H S% L%")
  primary: string;
  secondary: string;
  accent: string;
  success: string;
  warning: string;
  destructive: string;
  info: string;

  // Sidebar
  sidebarBackground: string;
  sidebarForeground: string;
  sidebarAccent: string;       // hover
  sidebarPrimary: string;      // active
  sidebarBorder: string;
  sidebarIcon: string;

  // Header
  headerBackground: string;
  headerForeground: string;
  notificationColor: string;
  avatarBorder: string;

  // Page surfaces
  background: string;
  card: string;
  popover: string;
  tableHeader: string;
  tableRowHover: string;

  // Login
  loginBackground: string;
  loginGradientFrom: string;
  loginGradientTo: string;
  loginCard: string;
  loginButton: string;
  loginText: string;
  loginImage: string; // url

  // Buttons
  buttonRadius: string;       // e.g. "0.5rem"
  buttonShadow: string;       // css shadow string
  buttonColor: string;        // HSL
  buttonHoverColor: string;   // HSL

  // Typography
  fontHeading: string;
  fontBody: string;
  fontScale: number;          // 1 = 16px base
  headingWeight: string;      // e.g. "700"
  bodyTextColor: string;      // HSL

  // Layout
  layoutMode: 'full' | 'boxed';
  sidebarMode: 'expanded' | 'compact';
}

export interface SavedTheme {
  id: string;
  name: string;
  tokens: ThemeTokens;
  dark?: Partial<ThemeTokens>;
  createdAt: number;
}

const DEFAULT_TOKENS: ThemeTokens = {
  primary: '217 91% 60%',
  secondary: '214 20% 92%',
  accent: '214 20% 94%',
  success: '142 71% 45%',
  warning: '38 92% 50%',
  destructive: '0 84% 60%',
  info: '199 89% 48%',

  sidebarBackground: '0 0% 100%',
  sidebarForeground: '220 20% 10%',
  sidebarAccent: '214 20% 96%',
  sidebarPrimary: '217 91% 60%',
  sidebarBorder: '214 20% 91%',
  sidebarIcon: '220 20% 10%',

  headerBackground: '0 0% 100%',
  headerForeground: '220 20% 10%',
  notificationColor: '0 84% 60%',
  avatarBorder: '217 91% 60%',

  background: '210 20% 99%',
  card: '0 0% 100%',
  popover: '0 0% 100%',
  tableHeader: '214 20% 96%',
  tableRowHover: '214 20% 94%',

  loginBackground: '210 20% 99%',
  loginGradientFrom: '217 91% 60%',
  loginGradientTo: '199 89% 48%',
  loginCard: '0 0% 100%',
  loginButton: '217 91% 60%',
  loginText: '220 20% 10%',
  loginImage: '',

  buttonRadius: '0.5rem',
  buttonShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  buttonColor: '217 91% 60%',
  buttonHoverColor: '217 91% 52%',

  fontHeading: 'Space Grotesk',
  fontBody: 'DM Sans',
  fontScale: 1,
  headingWeight: '700',
  bodyTextColor: '220 20% 10%',

  layoutMode: 'full',
  sidebarMode: 'expanded',
};

const DEFAULT_DARK: Partial<ThemeTokens> = {
  background: '222 20% 7%',
  card: '222 20% 9%',
  popover: '222 20% 9%',
  sidebarBackground: '222 20% 9%',
  sidebarForeground: '210 20% 95%',
  sidebarAccent: '217 20% 14%',
  sidebarBorder: '217 20% 17%',
  sidebarIcon: '210 20% 95%',
  headerBackground: '222 20% 9%',
  headerForeground: '210 20% 95%',
  tableHeader: '217 20% 14%',
  tableRowHover: '217 20% 17%',
  bodyTextColor: '210 20% 95%',
};

const PRESET_THEMES: SavedTheme[] = [
  { id: 'default', name: 'Default', tokens: DEFAULT_TOKENS, dark: DEFAULT_DARK, createdAt: 0 },
  {
    id: 'corporate',
    name: 'Corporate',
    tokens: { ...DEFAULT_TOKENS, primary: '221 70% 35%', sidebarPrimary: '221 70% 35%', loginButton: '221 70% 35%', buttonColor: '221 70% 35%', buttonHoverColor: '221 70% 28%', avatarBorder: '221 70% 35%', loginGradientFrom: '221 70% 35%', loginGradientTo: '221 70% 50%' },
    dark: DEFAULT_DARK, createdAt: 0,
  },
  {
    id: 'emerald',
    name: 'Emerald Green',
    tokens: { ...DEFAULT_TOKENS, primary: '160 84% 39%', sidebarPrimary: '160 84% 39%', loginButton: '160 84% 39%', buttonColor: '160 84% 39%', buttonHoverColor: '160 84% 32%', avatarBorder: '160 84% 39%', loginGradientFrom: '160 84% 39%', loginGradientTo: '180 84% 42%' },
    dark: DEFAULT_DARK, createdAt: 0,
  },
  {
    id: 'midnight',
    name: 'Midnight',
    tokens: { ...DEFAULT_TOKENS, ...DEFAULT_DARK, primary: '262 83% 65%', sidebarPrimary: '262 83% 65%', buttonColor: '262 83% 65%', buttonHoverColor: '262 83% 55%', loginButton: '262 83% 65%', loginGradientFrom: '262 83% 50%', loginGradientTo: '199 89% 48%', loginText: '210 20% 95%' } as ThemeTokens,
    dark: DEFAULT_DARK, createdAt: 0,
  },
];

interface ThemeState {
  themes: SavedTheme[];
  activeId: string;
  isDark: boolean;
  getActive: () => SavedTheme;
  setActive: (id: string) => void;
  updateActiveTokens: (patch: Partial<ThemeTokens>) => void;
  updateActiveDark: (patch: Partial<ThemeTokens>) => void;
  saveAs: (name: string) => void;
  duplicate: (id: string) => void;
  remove: (id: string) => void;
  rename: (id: string, name: string) => void;
  reset: () => void;
  importJson: (json: string) => boolean;
  exportJson: (id: string) => string;
  setDark: (v: boolean) => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      themes: PRESET_THEMES,
      activeId: 'default',
      isDark: false,
      getActive: () => get().themes.find((t) => t.id === get().activeId) || PRESET_THEMES[0],
      setActive: (id) => set({ activeId: id }),
      updateActiveTokens: (patch) =>
        set((s) => ({
          themes: s.themes.map((t) => (t.id === s.activeId ? { ...t, tokens: { ...t.tokens, ...patch } } : t)),
        })),
      updateActiveDark: (patch) =>
        set((s) => ({
          themes: s.themes.map((t) => (t.id === s.activeId ? { ...t, dark: { ...(t.dark || {}), ...patch } } : t)),
        })),
      saveAs: (name) => {
        const active = get().getActive();
        const id = `theme-${Date.now()}`;
        set((s) => ({ themes: [...s.themes, { ...active, id, name, createdAt: Date.now() }], activeId: id }));
      },
      duplicate: (id) => {
        const src = get().themes.find((t) => t.id === id);
        if (!src) return;
        const newId = `theme-${Date.now()}`;
        set((s) => ({ themes: [...s.themes, { ...src, id: newId, name: `${src.name} Copy`, createdAt: Date.now() }], activeId: newId }));
      },
      remove: (id) => {
        if (PRESET_THEMES.find((t) => t.id === id)) return;
        set((s) => ({
          themes: s.themes.filter((t) => t.id !== id),
          activeId: s.activeId === id ? 'default' : s.activeId,
        }));
      },
      rename: (id, name) =>
        set((s) => ({ themes: s.themes.map((t) => (t.id === id ? { ...t, name } : t)) })),
      reset: () => set({ themes: PRESET_THEMES, activeId: 'default' }),
      importJson: (json) => {
        try {
          const parsed = JSON.parse(json) as SavedTheme;
          if (!parsed.tokens) return false;
          const id = `theme-${Date.now()}`;
          set((s) => ({ themes: [...s.themes, { ...parsed, id, createdAt: Date.now() }], activeId: id }));
          return true;
        } catch {
          return false;
        }
      },
      exportJson: (id) => {
        const t = get().themes.find((x) => x.id === id);
        return JSON.stringify(t, null, 2);
      },
      setDark: (v) => set({ isDark: v }),
    }),
    { name: 'somitee-theme-store' }
  )
);

export { DEFAULT_TOKENS, DEFAULT_DARK };

/** Apply CSS variables for the given theme */
export function applyTheme(theme: SavedTheme, isDark: boolean) {
  const root = document.documentElement;
  const t = { ...theme.tokens, ...(isDark ? theme.dark || {} : {}) };

  const map: Record<string, string> = {
    '--primary': t.primary,
    '--secondary': t.secondary,
    '--accent': t.accent,
    '--success': t.success,
    '--warning': t.warning,
    '--destructive': t.destructive,
    '--info': t.info,

    '--sidebar-background': t.sidebarBackground,
    '--sidebar-foreground': t.sidebarForeground,
    '--sidebar-accent': t.sidebarAccent,
    '--sidebar-accent-foreground': t.sidebarForeground,
    '--sidebar-primary': t.sidebarPrimary,
    '--sidebar-border': t.sidebarBorder,
    '--sidebar-ring': t.sidebarPrimary,

    '--background': t.background,
    '--card': t.card,
    '--card-foreground': t.bodyTextColor,
    '--popover': t.popover,
    '--popover-foreground': t.bodyTextColor,
    '--foreground': t.bodyTextColor,
    '--muted': t.tableHeader,
    '--accent-foreground': t.bodyTextColor,
    '--border': t.sidebarBorder,
    '--input': t.sidebarBorder,
    '--ring': t.primary,

    '--header-background': t.headerBackground,
    '--header-foreground': t.headerForeground,
    '--notification-color': t.notificationColor,
    '--avatar-border': t.avatarBorder,
    '--table-header': t.tableHeader,
    '--table-row-hover': t.tableRowHover,

    '--login-background': t.loginBackground,
    '--login-gradient-from': t.loginGradientFrom,
    '--login-gradient-to': t.loginGradientTo,
    '--login-card': t.loginCard,
    '--login-button': t.loginButton,
    '--login-text': t.loginText,

    '--button-radius': t.buttonRadius,
    '--button-shadow': t.buttonShadow,
    '--button-color': t.buttonColor,
    '--button-hover-color': t.buttonHoverColor,
    '--radius': t.buttonRadius,

    '--font-heading': `'${t.fontHeading}', sans-serif`,
    '--font-body': `'${t.fontBody}', sans-serif`,
    '--font-scale': String(t.fontScale),
    '--heading-weight': t.headingWeight,
  };

  Object.entries(map).forEach(([k, v]) => root.style.setProperty(k, v));
  root.style.setProperty('--login-image-url', t.loginImage ? `url('${t.loginImage}')` : 'none');
  root.style.fontSize = `${16 * t.fontScale}px`;

  document.documentElement.classList.toggle('dark', isDark);
  document.documentElement.dataset.layout = t.layoutMode;
  document.documentElement.dataset.sidebar = t.sidebarMode;
}
