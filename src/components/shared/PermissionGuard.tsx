import { ReactNode, cloneElement, isValidElement } from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Permission } from '@/stores/rolesStore';
import { usePermissions } from '@/hooks/usePermissions';
import { Lock } from 'lucide-react';

interface Props {
  permission: Permission | Permission[];
  children: ReactNode;
  /** Hide entirely instead of disabling. */
  hide?: boolean;
  /** Custom message in tooltip. */
  message?: string;
}

/**
 * Wrap any interactive element. If user lacks the permission:
 * - default: visually disable the element + show tooltip
 * - hide=true: render nothing
 */
export function PermissionGuard({ permission, children, hide, message }: Props) {
  const { has } = usePermissions();
  const allowed = has(permission);

  if (allowed) return <>{children}</>;
  if (hide) return null;

  const tooltipText = message ?? 'You do not have permission for this action';

  // If single React element, inject disabled props
  let content = children;
  if (isValidElement(children)) {
    content = cloneElement(children as any, {
      disabled: true,
      onClick: (e: React.MouseEvent) => e.preventDefault(),
      className: `${(children as any).props?.className ?? ''} opacity-50 cursor-not-allowed pointer-events-none`,
    });
  }

  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="inline-flex pointer-events-auto" tabIndex={0}>{content}</span>
        </TooltipTrigger>
        <TooltipContent>
          <span className="flex items-center gap-1.5 text-xs"><Lock className="h-3 w-3" /> {tooltipText}</span>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
