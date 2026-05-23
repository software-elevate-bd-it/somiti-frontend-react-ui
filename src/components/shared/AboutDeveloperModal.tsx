import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Globe2, Facebook, Phone, MessageCircle, Code2, Cpu, Smartphone, Boxes, Sparkles, Wrench, Server } from 'lucide-react';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const services = [
  { icon: Server, label: 'SaaS Development' },
  { icon: Boxes, label: 'ERP Development' },
  { icon: Smartphone, label: 'Mobile Apps' },
  { icon: Code2, label: 'API Development' },
  { icon: Sparkles, label: 'AI Automation' },
  { icon: Wrench, label: 'Custom Software' },
];

export default function AboutDeveloperModal({ open, onOpenChange }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg p-0 overflow-hidden border-0 shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Hero header */}
        <div className="relative bg-gradient-to-br from-primary via-primary to-primary/60 px-6 pt-7 pb-8 text-primary-foreground">
          <div className="absolute inset-0 opacity-25 bg-[radial-gradient(circle_at_top_left,white,transparent_55%)]" />
          <div className="relative">
            <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-white/15 backdrop-blur-sm mb-3 ring-1 ring-white/25">
              <Cpu className="h-7 w-7" />
            </div>
            <DialogHeader className="text-left space-y-1">
              <DialogTitle className="text-2xl font-heading font-bold text-primary-foreground">
                Software Elevated
              </DialogTitle>
              <DialogDescription className="text-primary-foreground/85 text-sm">
                Your Trusted Technology Partner
              </DialogDescription>
            </DialogHeader>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-5">
          {/* Services */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
              Services
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {services.map(({ icon: Icon, label }) => (
                <div
                  key={label}
                  className="flex items-center gap-2 rounded-lg border border-border bg-muted/40 px-3 py-2 hover:bg-accent transition-colors"
                >
                  <Icon className="h-4 w-4 text-primary shrink-0" />
                  <span className="text-xs font-medium truncate">{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
              Contact
            </h3>
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
        </div>

        <DialogFooter className="px-6 pb-6 pt-0 flex-col sm:flex-row gap-2">
          <Button asChild className="w-full sm:flex-1">
            <a href="https://www.softwareelevate.com" target="_blank" rel="noopener noreferrer">
              <Globe2 className="h-4 w-4" /> Visit Website
            </a>
          </Button>
          <Button asChild variant="secondary" className="w-full sm:flex-1">
            <a
              href="https://facebook.com/profile.php?id=61571454874255"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Facebook className="h-4 w-4" /> Visit Facebook
            </a>
          </Button>
          <Button asChild variant="outline" className="w-full sm:flex-1">
            <a href="https://wa.me/8801312978030" target="_blank" rel="noopener noreferrer">
              <MessageCircle className="h-4 w-4" /> WhatsApp Now
            </a>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
