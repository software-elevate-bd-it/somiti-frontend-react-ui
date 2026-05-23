import { useEffect } from 'react';
import { useThemeStore, applyTheme } from '@/stores/themeStore';

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const themes = useThemeStore((s) => s.themes);
  const activeId = useThemeStore((s) => s.activeId);
  const isDark = useThemeStore((s) => s.isDark);

  useEffect(() => {
    const active = themes.find((t) => t.id === activeId) || themes[0];
    if (active) applyTheme(active, isDark);
  }, [themes, activeId, isDark]);

  // Inject Google Fonts dynamically based on chosen typography
  useEffect(() => {
    const active = themes.find((t) => t.id === activeId) || themes[0];
    if (!active) return;
    const families = [active.tokens.fontHeading, active.tokens.fontBody]
      .filter(Boolean)
      .map((f) => `family=${encodeURIComponent(f)}:wght@400;500;600;700`)
      .join('&');
    const href = `https://fonts.googleapis.com/css2?${families}&display=swap`;
    let link = document.getElementById('dynamic-fonts') as HTMLLinkElement | null;
    if (!link) {
      link = document.createElement('link');
      link.id = 'dynamic-fonts';
      link.rel = 'stylesheet';
      document.head.appendChild(link);
    }
    link.href = href;
  }, [themes, activeId]);

  return <>{children}</>;
}
