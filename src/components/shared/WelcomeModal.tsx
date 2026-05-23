import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/stores/authStore';
import { Globe2, Facebook, Phone, MessageCircle, Rocket, Sparkles } from 'lucide-react';

const STORAGE_PREFIX = 'somitee_welcome_seen_';

export default function WelcomeModal() {
  const user = useAuthStore((s) => s.user);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!user) return;
    const key = `${STORAGE_PREFIX}${user.id ?? user.email ?? 'guest'}`;
    if (!localStorage.getItem(key)) {
      const t = setTimeout(() => setOpen(true), 400);
      return () => clearTimeout(t);
    }
  }, [user]);

  const dismiss = () => {
    if (user) {
      const key = `${STORAGE_PREFIX}${user.id ?? user.email ?? 'guest'}`;
      localStorage.setItem(key, '1');
    }
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) dismiss(); }}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden border-0 shadow-2xl">
        {/* Gradient header */}
        <div className="relative bg-gradient-to-br from-primary via-primary to-primary/70 px-6 pt-6 pb-8 text-primary-foreground">
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_top_right,white,transparent_60%)]" />
          <div className="relative">
            <div className="inline-flex items-center justify-center h-12 w-12 rounded-xl bg-white/15 backdrop-blur-sm mb-3 ring-1 ring-white/20">
              <Rocket className="h-6 w-6" />
            </div>
            <DialogHeader className="text-left space-y-1">
              <DialogTitle className="text-xl font-heading font-bold text-primary-foreground">
                🚀 Welcome to Somitee HQ
              </DialogTitle>
              <DialogDescription className="text-primary-foreground/85 text-sm">
                This platform is proudly developed by{' '}
                <span className="font-semibold text-primary-foreground">Software Elevated</span>.
              </DialogDescription>
            </DialogHeader>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4">
          <div className="flex items-start gap-2.5">
            <Sparkles className="h-4 w-4 text-primary mt-0.5 shrink-0" />
            <p className="text-sm text-foreground leading-relaxed">
              Need <span className="font-semibold">ERP, SaaS, Mobile Apps, AI Automation,</span> or{' '}
              <span className="font-semibold">Custom Software</span>?
            </p>
          </div>

          <div className="rounded-lg border border-border bg-muted/40 divide-y divide-border">
            <a
              href="https://www.softwareelevate.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 px-3 py-2.5 hover:bg-accent transition-colors"
            >
              <Globe2 className="h-4 w-4 text-primary shrink-0" />
              <span className="text-sm font-medium">www.softwareelevate.com</span>
            </a>
            <a
              href="https://facebook.com/profile.php?id=61571454874255"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 px-3 py-2.5 hover:bg-accent transition-colors"
            >
              <Facebook className="h-4 w-4 text-primary shrink-0" />
              <span className="text-sm font-medium">Facebook Page</span>
            </a>
            <a
              href="tel:01922500433"
              className="flex items-center gap-3 px-3 py-2.5 hover:bg-accent transition-colors"
            >
              <Phone className="h-4 w-4 text-primary shrink-0" />
              <span className="text-sm font-medium">Call: 01922500433</span>
            </a>
            <a
              href="https://wa.me/8801312978030"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 px-3 py-2.5 hover:bg-accent transition-colors"
            >
              <MessageCircle className="h-4 w-4 text-success shrink-0" />
              <span className="text-sm font-medium">WhatsApp: 01312978030</span>
            </a>
          </div>
        </div>

        <DialogFooter className="px-6 pb-6 pt-0 flex-col sm:flex-row gap-2 sm:gap-2">
          <Button
            asChild
            className="w-full sm:flex-1"
            onClick={dismiss}
          >
            <a href="https://wa.me/8801312978030" target="_blank" rel="noopener noreferrer">
              Contact Us
            </a>
          </Button>
          <Button
            asChild
            variant="secondary"
            className="w-full sm:flex-1"
            onClick={dismiss}
          >
            <a
              href="https://facebook.com/profile.php?id=61571454874255"
              target="_blank"
              rel="noopener noreferrer"
            >
              Visit Facebook
            </a>
          </Button>
          <Button variant="ghost" className="w-full sm:w-auto" onClick={dismiss}>
            Continue
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
