import { Globe2, Facebook, Phone, MessageCircle } from 'lucide-react';

export default function AppFooter() {
  return (
    <footer className="border-t border-border bg-card/80 backdrop-blur-sm">
      <div className="px-4 sm:px-6 py-3 flex flex-col lg:flex-row items-center justify-between gap-2 text-xs text-muted-foreground">
        {/* Left: copyright + tagline */}
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
          <span className="text-muted-foreground">
            ERP <span className="text-primary/60">•</span> SaaS{' '}
            <span className="text-primary/60">•</span> Mobile Apps{' '}
            <span className="text-primary/60">•</span> AI Solutions
          </span>
        </div>

        {/* Right: contact links */}
        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
          <a
            href="https://www.softwareelevate.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 hover:text-primary transition-colors"
            title="Website"
          >
            <Globe2 className="h-3.5 w-3.5" />
            <span className="hidden md:inline">softwareelevate.com</span>
          </a>
          <a
            href="https://facebook.com/profile.php?id=61571454874255"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 hover:text-primary transition-colors"
            title="Facebook"
          >
            <Facebook className="h-3.5 w-3.5" />
            <span className="hidden md:inline">Facebook</span>
          </a>
          <a
            href="tel:01922500433"
            className="flex items-center gap-1 hover:text-primary transition-colors"
            title="Call"
          >
            <Phone className="h-3.5 w-3.5" />
            <span>01922500433</span>
          </a>
          <a
            href="https://wa.me/8801312978030"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 hover:text-success transition-colors"
            title="WhatsApp"
          >
            <MessageCircle className="h-3.5 w-3.5" />
            <span>WhatsApp: 01312978030</span>
          </a>
        </div>
      </div>
    </footer>
  );
}
