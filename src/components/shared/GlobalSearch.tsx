import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, Users, Wallet, CreditCard, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { members, transactions } from '@/data/dummyData';
import { useNavigate } from 'react-router-dom';

interface SearchResult {
  type: 'member' | 'transaction' | 'payment';
  id: string;
  title: string;
  subtitle: string;
  path: string;
}

export default function GlobalSearch() {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { t } = useTranslation();

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const results: SearchResult[] = [];
  if (query.length >= 2) {
    const q = query.toLowerCase();
    members.filter(m => m.name.toLowerCase().includes(q) || m.phone.includes(q) || m.shopName.toLowerCase().includes(q))
      .slice(0, 5).forEach(m => results.push({ type: 'member', id: m.id, title: m.name, subtitle: `${m.shopName} • ${m.phone}`, path: `/members/${m.id}` }));
    transactions.filter(t => t.memberName.toLowerCase().includes(q) || t.transactionId?.toLowerCase().includes(q) || t.id.toLowerCase().includes(q))
      .slice(0, 5).forEach(tx => results.push({ type: 'transaction', id: tx.id, title: `${tx.type === 'collection' ? t('nav.collections') : t('nav.expenses')} - ৳${tx.amount}`, subtitle: `${tx.memberName} • ${tx.date} • ${tx.status}`, path: tx.type === 'collection' ? '/collections' : '/expenses' }));
  }

  const grouped = {
    member: results.filter(r => r.type === 'member'),
    transaction: results.filter(r => r.type === 'transaction'),
  };

  const icons = { member: Users, transaction: Wallet, payment: CreditCard };
  const labels = { member: t('search.members'), transaction: t('search.transactions'), payment: t('search.payments') };

  return (
    <div ref={ref} className="relative hidden md:block">
      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
      <Input
        placeholder={t('search.placeholder')}
        className="pl-9 w-72 h-9"
        value={query}
        onChange={e => { setQuery(e.target.value); setOpen(true); }}
        onFocus={() => query.length >= 2 && setOpen(true)}
      />
      {query && (
        <button onClick={() => { setQuery(''); setOpen(false); }} className="absolute right-2.5 top-2.5">
          <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
        </button>
      )}
      {open && results.length > 0 && (
        <div className="absolute top-full mt-1 w-96 bg-popover border border-border rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto">
          {(Object.keys(grouped) as Array<keyof typeof grouped>).map(key => {
            const items = grouped[key];
            if (!items.length) return null;
            const Icon = icons[key];
            return (
              <div key={key}>
                <div className="px-3 py-1.5 text-xs font-semibold text-muted-foreground uppercase flex items-center gap-1.5 bg-muted/50">
                  <Icon className="h-3 w-3" /> {labels[key]}
                </div>
                {items.map(item => (
                  <button
                    key={item.id}
                    className="w-full px-3 py-2 text-left hover:bg-accent flex flex-col transition-colors"
                    onClick={() => { navigate(item.path); setOpen(false); setQuery(''); }}
                  >
                    <span className="text-sm font-medium">{item.title}</span>
                    <span className="text-xs text-muted-foreground">{item.subtitle}</span>
                  </button>
                ))}
              </div>
            );
          })}
        </div>
      )}
      {open && query.length >= 2 && results.length === 0 && (
        <div className="absolute top-full mt-1 w-96 bg-popover border border-border rounded-lg shadow-lg z-50 p-4 text-center text-sm text-muted-foreground">
          {t('search.noResults', { query })}
        </div>
      )}
    </div>
  );
}
