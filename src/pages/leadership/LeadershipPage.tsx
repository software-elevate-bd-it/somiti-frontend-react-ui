import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useCompanyStore } from '@/stores/companyStore';
import { Crown, Award, Users, Sparkles, Mail, Phone } from 'lucide-react';

interface Person {
  name?: string;
  title?: string;
  photo?: string;
}

function FounderCard({ p, index }: { p: Person; index: number }) {
  return (
    <div className="group relative">
      <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/40 via-primary/10 to-accent/40 rounded-2xl blur opacity-50 group-hover:opacity-100 transition" />
      <Card className="relative overflow-hidden border-0 bg-card/95 backdrop-blur transition-all duration-300 hover:shadow-2xl">
        <div className="flex flex-col">
          {/* Photo */}
          <div className="relative bg-gradient-to-br from-primary/15 via-primary/5 to-accent/20 p-6 flex items-center justify-center min-h-[200px]">
            <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(hsl(var(--primary)) 1px, transparent 1px)', backgroundSize: '14px 14px' }} />
            <div className="relative">
              <div className="absolute inset-0 bg-primary/30 rounded-full blur-xl" />
              <Avatar className="relative h-28 w-28 ring-4 ring-background shadow-xl">
                {p.photo ? <AvatarImage src={p.photo} alt={p.name} /> : null}
                <AvatarFallback className="bg-gradient-to-br from-primary to-primary/60 text-primary-foreground font-heading text-3xl">
                  {p.name?.charAt(0) || '?'}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 flex flex-col text-center items-center">
            <div className="flex items-center justify-center gap-2 mb-3 flex-wrap">
              <Badge className="bg-primary/10 text-primary border-primary/20 hover:bg-primary/20">
                <Sparkles className="h-3 w-3 mr-1" />
                ক্রম #{index + 1}
              </Badge>
            </div>
            <h3 className="font-heading font-bold text-xl leading-tight">{p.name || '—'}</h3>
            <Badge variant="outline" className="tracking-wider text-[11px] mt-2">
              {p.title}
            </Badge>
            <p className="text-sm text-muted-foreground mt-3 leading-relaxed">
              সমিতির একজন নিবেদিতপ্রাণ কর্মকর্তা, যিনি সদস্যদের কল্যাণ ও স্বচ্ছতার লক্ষ্যে নিরলসভাবে কাজ করছেন।
            </p>
            <div className="flex flex-col items-center gap-2 mt-4 pt-4 border-t border-dashed border-border w-full text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5 hover:text-primary transition cursor-pointer">
                <Mail className="h-3.5 w-3.5" />
                founder{index + 1}@somitee.com
              </span>
              <span className="flex items-center gap-1.5 hover:text-primary transition cursor-pointer">
                <Phone className="h-3.5 w-3.5" />
                +880 17{10 + index} 000 000
              </span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

function OfficerCard({ p, icon: Icon, accent }: { p: Person; icon: typeof Crown; accent: string }) {
  return (
    <div className="group relative">
      <div className={`absolute -inset-1 ${accent} rounded-3xl blur-lg opacity-40 group-hover:opacity-70 transition`} />
      <Card className="relative overflow-hidden border-0 shadow-xl">
        <div className="grid grid-cols-1 sm:grid-cols-5">
          {/* Photo column */}
          <div className="sm:col-span-2 relative bg-gradient-to-br from-primary/20 to-accent/30 min-h-[260px] flex items-center justify-center p-6">
            <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(hsl(var(--primary)) 1px, transparent 1px)', backgroundSize: '16px 16px' }} />
            <div className="relative">
              <div className="absolute inset-0 bg-primary/30 rounded-full blur-xl" />
              <Avatar className="relative h-40 w-40 ring-4 ring-background shadow-2xl">
                {p.photo ? <AvatarImage src={p.photo} alt={p.name} /> : null}
                <AvatarFallback className="bg-gradient-to-br from-primary to-primary/60 text-primary-foreground font-heading text-4xl">
                  {p.name?.charAt(0) || '?'}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>

          {/* Content column */}
          <div className="sm:col-span-3 p-6 flex flex-col justify-center">
            <div className="flex items-center gap-2 mb-3">
              <div className={`p-2 rounded-lg ${accent} text-primary-foreground`}>
                <Icon className="h-4 w-4" />
              </div>
              <Badge variant="outline" className="uppercase tracking-wider text-[10px]">
                {p.title}
              </Badge>
            </div>
            <h3 className="font-heading font-bold text-2xl leading-tight">{p.name || '—'}</h3>
            <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
              Leading the somitee with vision and dedication. Committed to transparency, member welfare, and sustainable growth of our community.
            </p>
            <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5" />
                contact@somitee.com
              </span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

export default function LeadershipPage() {
  const { t } = useTranslation();
  const { company } = useCompanyStore();
  const all = company.founders || [];

  const president = all[0];
  const secretary = all[1];
  const others = all.slice(2);

  return (
    <div className="space-y-12 pb-8">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/10 via-background to-accent/20 border p-8 md:p-12">
        <div className="absolute inset-0 opacity-30" style={{ backgroundImage: 'radial-gradient(circle at 15% 20%, hsl(var(--primary) / 0.4) 0%, transparent 40%), radial-gradient(circle at 85% 80%, hsl(var(--accent) / 0.4) 0%, transparent 40%)' }} />
        <div className="relative text-center max-w-2xl mx-auto">
          <Badge className="mb-4 bg-primary/10 text-primary border-primary/20 hover:bg-primary/20">
            <Users className="h-3 w-3 mr-1.5" />
            {t('leadership.title') || 'আমাদের নেতৃত্ব'}
          </Badge>
          <h1 className="text-3xl md:text-5xl font-heading font-bold tracking-tight">
            পরিচিতি <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">সমিতির কর্মকর্তাবৃন্দ</span>
          </h1>
          <p className="mt-4 text-muted-foreground text-base md:text-lg leading-relaxed">
            আমাদের কর্মকর্তাবৃন্দ অভিজ্ঞতা, নিষ্ঠা ও দূরদৃষ্টি নিয়ে সমিতির প্রতিটি সদস্যের কল্যাণে কাজ করছেন।
          </p>
          <div className="flex items-center justify-center gap-6 mt-6">
            <div className="text-center">
              <p className="text-2xl font-heading font-bold text-primary">{all.length}</p>
              <p className="text-xs uppercase tracking-wider text-muted-foreground">মোট কর্মকর্তা</p>
            </div>
          </div>
        </div>
      </section>

      {/* President & Secretary - side by side */}
      {(president || secretary) && (
        <section>
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <Crown className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-heading font-bold text-2xl">সভাপতি ও সাধারণ সম্পাদক</h2>
              <p className="text-sm text-muted-foreground">সমিতির শীর্ষ নেতৃত্ব</p>
            </div>
            <div className="ml-auto h-px flex-1 bg-gradient-to-r from-border to-transparent hidden md:block" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {president && <OfficerCard p={president} icon={Crown} accent="bg-gradient-to-br from-primary to-primary/60" />}
            {secretary && <OfficerCard p={secretary} icon={Award} accent="bg-gradient-to-br from-accent-foreground/80 to-primary/60" />}
          </div>
        </section>
      )}

      {/* Other officers - 2 per row */}
      {others.length > 0 && (
        <section>
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-heading font-bold text-2xl">কার্যনির্বাহী কমিটি</h2>
              <p className="text-sm text-muted-foreground">অন্যান্য কর্মকর্তাবৃন্দ</p>
            </div>
            <div className="ml-auto h-px flex-1 bg-gradient-to-r from-border to-transparent hidden md:block" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {others.map((f, i) => (
              <FounderCard key={i} p={f} index={i + 2} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
