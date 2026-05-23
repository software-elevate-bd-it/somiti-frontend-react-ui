import { useCompanyStore } from '@/stores/companyStore';
import { ShieldCheck } from 'lucide-react';

interface Props {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function CompanyHeader({ className = '', size = 'md' }: Props) {
  const { company } = useCompanyStore();

  const logoSize = size === 'sm' ? 'h-8 w-8' : size === 'lg' ? 'h-16 w-16' : 'h-12 w-12';
  const nameSize = size === 'sm' ? 'text-base' : size === 'lg' ? 'text-2xl' : 'text-xl';
  const detailSize = size === 'sm' ? 'text-[10px]' : 'text-xs';

  return (
    <div className={`flex flex-col items-center text-center ${className}`}>
      <div className="flex items-center gap-3">
        {company.logo ? (
          <img src={company.logo} alt={company.name} className={`${logoSize} object-contain rounded`} />
        ) : (
          <ShieldCheck className={`${logoSize} text-primary`} />
        )}
        <h1 className={`font-heading font-bold ${nameSize}`}>{company.name}</h1>
      </div>
      <div className={`${detailSize} text-muted-foreground mt-1 space-x-2`}>
        {company.address && <span>{company.address}</span>}
        {company.phone && <span>• {company.phone}</span>}
        {company.email && <span>• {company.email}</span>}
      </div>
    </div>
  );
}
