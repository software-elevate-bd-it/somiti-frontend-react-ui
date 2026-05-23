import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@/stores/authStore';
import { useCompanyStore } from '@/stores/companyStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ShieldCheck, Globe, ChevronDown, ChevronUp, Copy, Facebook, Phone, MessageCircle, Globe2, MapPin, Mail, Users, Wallet, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';
import { DEMO_USERS } from '@/data/demoUsers';
import loginHero from '@/assets/login-hero.jpg';
import { Loader } from '@/components/ui/loader';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showDemo, setShowDemo] = useState(true);
  const login = useAuthStore((s) => s.login);
  const { company } = useCompanyStore();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const success = await login(email, password);
      if (success) {
        toast.success(t('auth.loginSuccess', 'Logged in successfully'));
        navigate('/leadership');
      } else {
        toast.error(t('auth.invalidCredentials', 'Invalid credentials'));
      }
    } catch (error) {
      toast.error(t('auth.loginError', 'Login failed. Please try again.'));
    } finally {
      setIsLoading(false);
    }
  };

  const quickLogin = async (demoEmail: string, demoPassword: string) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setIsLoading(true);
    try {
      const success = await login(demoEmail, demoPassword);
      if (success) {
        toast.success(`Logged in as ${demoEmail.split('@')[0]}`);
        navigate('/leadership');
      } else {
        toast.error('Demo login failed');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const copyCreds = (e: React.MouseEvent, demoEmail: string, demoPassword: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(`${demoEmail} / ${demoPassword}`);
    toast.success('Credentials copied');
  };

  const toggleLang = () => i18n.changeLanguage(i18n.language === 'en' ? 'bn' : 'en');

  return (
   <div className="min-h-screen flex flex-col bg-background">
      {/* Main split */}
      <div className="flex-1 flex flex-col lg:flex-row">
        {/* LEFT — Somitee info with hero image */}
        <div className="relative lg:w-1/2 min-h-[280px] lg:min-h-screen flex items-center justify-center overflow-hidden">
          <img
            src={loginHero}
            alt={company.name}
            className="absolute inset-0 w-full h-full object-cover"
          />
          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/90 via-primary/75 to-primary/95" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.15),transparent_60%)]" />

          {/* Content */}
          <div className="relative z-10 px-8 lg:px-14 py-10 lg:py-16 text-primary-foreground max-w-xl animate-fade-in">
            <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-white/15 backdrop-blur-sm mb-5 ring-1 ring-white/25">
              {company.logo ? (
                <img src={company.logo} alt={company.name} className="h-9 w-9 object-contain" />
              ) : (
                <ShieldCheck className="h-9 w-9" />
              )}
            </div>

            <h1 className="font-heading text-3xl lg:text-4xl font-bold leading-tight mb-3">
              {company.name}
            </h1>
            <p className="text-primary-foreground/85 text-base lg:text-lg mb-8 leading-relaxed">
              {t('auth.loginSubtitle', 'A modern platform for community management, collections, and transparent reporting.')}
            </p>

            {/* Feature highlights */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
              {[
                { icon: Users, label: 'Members' },
                { icon: Wallet, label: 'Collections' },
                { icon: TrendingUp, label: 'Reports' },
              ].map(({ icon: Icon, label }) => (
                <div
                  key={label}
                  className="flex items-center gap-2 rounded-lg bg-white/10 backdrop-blur-sm border border-white/15 px-3 py-2"
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span className="text-sm font-medium">{label}</span>
                </div>
              ))}
            </div>

            {/* Org contact */}
            <div className="space-y-1.5 text-sm text-primary-foreground/85 border-t border-white/15 pt-5">
              {company.address && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 shrink-0" />
                  <span>{company.address}</span>
                </div>
              )}
              {company.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-3.5 w-3.5 shrink-0" />
                  <span>{company.phone}</span>
                </div>
              )}
              {company.email && (
                <div className="flex items-center gap-2">
                  <Mail className="h-3.5 w-3.5 shrink-0" />
                  <span>{company.email}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT — Login form */}
        <div className="lg:w-1/2 flex items-center justify-center p-6 sm:p-10 bg-background">
          <div className="w-full max-w-md animate-fade-in">
            {/* Top bar */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-primary/10">
                  {company.logo ? (
                    <img src={company.logo} alt={company.name} className="h-5 w-5 object-contain" />
                  ) : (
                    <ShieldCheck className="h-5 w-5 text-primary" />
                  )}
                </div>
                <span className="font-heading font-semibold text-sm text-foreground truncate max-w-[180px]">
                  {company.name}
                </span>
              </div>
              <Button variant="ghost" size="sm" onClick={toggleLang}>
                <Globe className="h-4 w-4 mr-1" />
                {i18n.language === 'en' ? t('common.bangla') : t('common.english')}
              </Button>
            </div>

            {/* Heading */}
            <div className="mb-6">
              <h2 className="font-heading text-2xl font-bold text-foreground">
                {t('auth.welcomeBack', 'Welcome back')}
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                {t('auth.loginToContinue', 'Sign in to continue to your dashboard.')}
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">{t('common.email')}</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder={t('auth.emailPlaceholder')}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">{t('common.password')}</Label>
                  <Link to="/forgot-password" className="text-xs text-primary hover:underline">
                    {t('auth.forgotPassword')}
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full h-11" disabled={isLoading}>
                {isLoading ? <Loader className="h-5 w-5 mr-2 text-white" /> : null}
                {isLoading ? t('common.loading', 'Loading...') : t('auth.login')}
              </Button>
              <p className="text-center text-sm text-muted-foreground">
                {t('auth.noAccount', "Don't have an account?")}{' '}
                <Link to="/register" className="text-primary font-medium hover:underline">
                  {t('auth.register')}
                </Link>
              </p>
            </form>

            {/* Demo accounts panel
            <div className="mt-6 border-t border-border pt-4">
              <button
                type="button"
                onClick={() => setShowDemo((v) => !v)}
                className="flex items-center justify-between w-full text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                <span>🚀 Quick Demo Login ({DEMO_USERS.length} users)</span>
                {showDemo ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </button>
              {showDemo && (
                <div className="mt-3 space-y-1.5 max-h-64 overflow-y-auto pr-1">
                  {DEMO_USERS.map((u) => (
                    <button
                      key={u.email}
                      type="button"
                      disabled={isLoading}
                      onClick={() => quickLogin(u.email, u.password)}
                      className="group w-full text-left p-2.5 rounded-md border border-border hover:border-primary hover:bg-primary/5 transition-all disabled:opacity-50"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm">{u.label}</span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-mono">
                              {u.user.role}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground truncate">{u.description}</p>
                          <p className="text-[11px] text-muted-foreground/80 font-mono truncate mt-0.5">
                            {u.email} / {u.password}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => copyCreds(e, u.email, u.password)}
                          className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-background transition-opacity"
                          title="Copy credentials"
                        >
                          <Copy className="h-3.5 w-3.5 text-muted-foreground" />
                        </button>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div> */}
          </div>
        </div>
      </div>

      {/* FOOTER — Software company info */}
      {/* ======================== */}
      <footer className="border-t border-border bg-card/80 backdrop-blur-sm">
        <div className="px-4 sm:px-6 py-3 flex flex-col lg:flex-row items-center justify-between gap-2 text-xs text-muted-foreground">
          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 text-center sm:text-left">
            <span className="font-medium text-foreground">
              © 2026 Powered by{' '}
              <a
                href="https://www.softwareelevate.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Software Elevated
              </a>
            </span>
            <span className="hidden sm:inline text-border">|</span>
            <span>
              ERP <span className="text-primary/60">•</span> SaaS{' '}
              <span className="text-primary/60">•</span> Mobile Apps{' '}
              <span className="text-primary/60">•</span> AI Solutions
            </span>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
            <a
              href="https://www.softwareelevate.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 hover:text-primary transition-colors"
            >
              <Globe2 className="h-3.5 w-3.5" />
              <span className="hidden md:inline">softwareelevate.com</span>
            </a>
            <a
              href="https://facebook.com/profile.php?id=61571454874255"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 hover:text-primary transition-colors"
            >
              <Facebook className="h-3.5 w-3.5" />
              <span className="hidden md:inline">Facebook</span>
            </a>
            <a
              href="tel:01922500433"
              className="flex items-center gap-1 hover:text-primary transition-colors"
            >
              <Phone className="h-3.5 w-3.5" />
              <span>01922500433</span>
            </a>
            <a
              href="https://wa.me/8801312978030"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 hover:text-success transition-colors"
            >
              <MessageCircle className="h-3.5 w-3.5" />
              <span>WhatsApp: 01312978030</span>
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

