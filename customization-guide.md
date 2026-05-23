
1. **Branding / "Powered by" Footer**
2. **Theme Color Studio**
3. **Draw Savings (Draw AI) Module**

---

## 1) Branding — "Powered by" Footer

বর্তমানে দুটি জায়গায় "© 2026 Powered by Software Elevated" দেখা যাচ্ছে — Dashboard এর নিচে এবং Login পেজে।

### পরিবর্তনের জন্য ফাইল

| # | File Path | কী পরিবর্তন করতে হবে |
|---|-----------|----------------------|
| 1 | `src/components/shared/AppFooter.tsx` | পুরো branding footer (authenticated dashboard pages এ দেখায়)। কোম্পানির নাম, লিংক, ফোন, ফেইসবুক, WhatsApp, ওয়েবসাইট সব এখানে। |
| 2 | `src/pages/auth/LoginPage.tsx` (লাইন ~270–305) | Login page এর footer (একই content আলাদা করে বসানো আছে)। |

### কী কী Field বদলানো যাবে

- কোম্পানির নাম: `Software Elevated` → আপনার নাম (যেমন `Kaj`)
- ট্যাগলাইন: `ERP • SaaS • Mobile Apps • AI Solutions`
- ওয়েবসাইট: `https://www.softwareelevate.com`
- Facebook: `facebook.com/profile.php?id=61571454874255`
- ফোন: `01922500433`
- WhatsApp: `01312978030`
- কপিরাইট সাল: `© 2026`

### উদাহরণ — `AppFooter.tsx` এ পরিবর্তন

```tsx
// লাইন ~10
© 2026 Powered by{' '}
<a href="https://your-site.com" ...>
  Kaj
</a>
```

> 💡 Tip: ভবিষ্যতে যদি একই branding একাধিক জায়গায় বসাতে হয়, `AppFooter.tsx` কে LoginPage এও import করে `<AppFooter />` ব্যবহার করুন — duplicate code এড়াবে।

---

## 2) Theme Color Studio

ডায়নামিক theme/color/font/layout পরিবর্তনের জন্য পুরো system।

### পরিবর্তনের জন্য ফাইল

| # | File Path | ভূমিকা |
|---|-----------|--------|
| 1 | `src/stores/themeStore.ts` | **Core**: সব theme tokens এর TypeScript interface, default values, preset themes (Default, Corporate, Emerald, Midnight), persistence (localStorage), এবং `applyTheme()` ফাংশন যা CSS variables সেট করে। |
| 2 | `src/components/shared/ThemeProvider.tsx` | App load এ active theme apply করে এবং Google Fonts dynamically inject করে। |
| 3 | `src/pages/settings/ThemeStudioPage.tsx` | UI — color pickers, font selector, layout toggle, preset selector, save/duplicate/export/import buttons। |
| 4 | `src/index.css` | Base CSS variables (light + dark mode এর default values)। নতুন token যোগ করলে এখানেও fallback লিখতে হবে। |
| 5 | `tailwind.config.ts` | Tailwind class এর সাথে CSS variables map করা (যেমন `bg-primary` → `hsl(var(--primary))`)। নতুন color token যোগ করলে এখানে register করতে হবে। |
| 6 | `src/App.tsx` | `<ThemeProvider>` দিয়ে app wrap করা। |

### কী কী পরিবর্তন করা যায় UI থেকে

- **Colors**: Primary, Secondary, Accent, Success, Warning, Destructive, Info
- **Sidebar**: background, foreground, hover, active, border, icon color
- **Header**: background, text, notification color, avatar border
- **Surface**: page background, card, popover, table header, table row hover
- **Login Page**: background, gradient, card, button, text color, hero image URL
- **Buttons**: radius, shadow, color, hover color
- **Typography**: heading font, body font, font scale, heading weight, body text color
- **Layout**: full / boxed, sidebar expanded / compact

### নতুন কালার Token যোগ করার Steps

1. `src/stores/themeStore.ts` → `ThemeTokens` interface এ field যোগ করুন
2. `DEFAULT_TOKENS` এবং (দরকার হলে) `DEFAULT_DARK` এ default value দিন
3. `applyTheme()` এর `map` object এ CSS variable mapping যোগ করুন
4. `src/index.css` এর `:root` এবং `.dark` এ fallback CSS variable লিখুন
5. `tailwind.config.ts` এর `colors` এ register করুন
6. `src/pages/settings/ThemeStudioPage.tsx` এ color picker UI যোগ করুন

### কোথায় কোন কালার Apply হয়

| Token | Tailwind Class | Effect |
|-------|---------------|--------|
| `--primary` | `bg-primary`, `text-primary` | বেশিরভাগ button, link, active state |
| `--sidebar-background` | `bg-sidebar` | বাম sidebar background |
| `--sidebar-primary` | active menu item | Active sidebar item |
| `--card` | `bg-card` | সব card / panel |
| `--background` | `bg-background` | পুরো page background |
| `--login-button` | login page CTA | শুধু login screen |

---

## 3) Draw Savings (Draw AI) Module

বর্তমান নাম: **Draw Savings Management** (sidebar এ "Draw Savings")।

### পরিবর্তনের জন্য ফাইল

| # | File Path | ভূমিকা |
|---|-----------|--------|
| 1 | `src/stores/drawSavingsStore.ts` | **Core logic**: Group create, member enrollment, installment generate, draw execute, winner approve/reject — সব business logic এবং Zustand persistent store। |
| 2 | `src/stores/drawSavingsDemo.ts` | Demo data seed function (`seedDrawDemoData`) — 3টি sample group, 13 demo member, payment, winner সব। |
| 3 | `src/pages/draw-savings/DrawSavingsPage.tsx` | পুরো UI — dashboard widgets, group list, enrollment, installment payment, draw execute, reports tab, "Load Demo Data" button। |
| 4 | `src/components/layout/DashboardLayout.tsx` | Sidebar এ "Draw Savings" menu item (icon: `Sparkles`, route: `/draw-savings`, role check)। |
| 5 | `src/App.tsx` | `/draw-savings` route registration। |
| 6 | `src/i18n/en.json` & `src/i18n/bn.json` | "Draw Savings" এবং সংশ্লিষ্ট সব label এর English / Bangla translation। |

### কী কী পরিবর্তন করা যায়

- **Module Name** ("Draw Savings" → "Draw AI"):
  - `DashboardLayout.tsx` এর sidebar label
  - `i18n/en.json` ও `bn.json` এর `drawSavings` key এর value
  - `DrawSavingsPage.tsx` এর page title

- **Draw Type**: Daily / Weekly / Every 15 Days / Monthly — `drawSavingsStore.ts` এর `DrawType` enum এ যোগ/বাদ
- **Winner Selection Method**: Random / Manual / Auto-final — `executeDraw()` function এ logic
- **Approval Workflow**: pending → approved / rejected — store এর state machine
- **Notification (SMS)**: এখনো integrate করা হয়নি, নতুন trigger দরকার হলে `drawSavingsStore.ts` এর action গুলোর ভিতর hook লাগাতে হবে
- **Permissions**: existing role system দিয়ে — `DashboardLayout.tsx` এর menu visibility `roles` array এ ঠিক করতে হবে; page-level guard দরকার হলে `PermissionGuard` component ব্যবহার করুন

### নতুন Field যোগ করার Steps (যেমন Group এ "Description")

1. `src/stores/drawSavingsStore.ts` → `DrawGroup` interface এ field যোগ
2. Create / Update action এ field accept করান
3. `src/pages/draw-savings/DrawSavingsPage.tsx` এর form ও list UI তে field দেখান
4. `i18n/*.json` এ label translation যোগ

### Demo Data Reset / Update

- `src/stores/drawSavingsDemo.ts` এর `DEMO_MEMBERS` ও group definitions edit করুন
- "Load Demo Data" button আছে page এ — click করলে old data clear করে নতুন seed হয়

---

## Quick Reference — File Map

```
Branding:
  src/components/shared/AppFooter.tsx
  src/pages/auth/LoginPage.tsx

Theme Studio:
  src/stores/themeStore.ts
  src/components/shared/ThemeProvider.tsx
  src/pages/settings/ThemeStudioPage.tsx
  src/index.css
  tailwind.config.ts
  src/App.tsx

Draw Savings:
  src/stores/drawSavingsStore.ts
  src/stores/drawSavingsDemo.ts
  src/pages/draw-savings/DrawSavingsPage.tsx
  src/components/layout/DashboardLayout.tsx
  src/App.tsx
  src/i18n/en.json
  src/i18n/bn.json
```

---

_Last updated: 2026-05-05_
