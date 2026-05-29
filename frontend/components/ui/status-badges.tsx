import { Badge } from '@/components/ui/badge';
import {
  LISTING_STATUS_STYLES,
  OWNER_REQUEST_STATUS_STYLES,
  ROLE_BADGE_STYLES,
} from '@/constants';
import type { ListingStatus, OwnerRequestStatus, Role } from '@/types';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: ListingStatus;
  className?: string;
}

export function ListingStatusBadge({ status, className }: StatusBadgeProps) {
  const styles = LISTING_STATUS_STYLES[status];
  const labels: Record<ListingStatus, string> = {
    draft: 'Draft',
    published: 'Published',
    archived: 'Archived',
  };

  return (
    <Badge
      variant="outline"
      className={cn(styles.bg, styles.text, 'border-transparent', className)}
    >
      {labels[status]}
    </Badge>
  );
}

interface OwnerRequestStatusBadgeProps {
  status: OwnerRequestStatus;
  className?: string;
}

export function OwnerRequestStatusBadge({ status, className }: OwnerRequestStatusBadgeProps) {
  const styles = OWNER_REQUEST_STATUS_STYLES[status];
  const labels: Record<OwnerRequestStatus, string> = {
    none: 'No Request',
    pending: 'Pending',
    approved: 'Approved',
    rejected: 'Rejected',
  };

  return (
    <Badge
      variant="outline"
      className={cn(styles.bg, styles.text, 'border-transparent', className)}
    >
      {labels[status]}
    </Badge>
  );
}

interface RoleBadgeProps {
  role: Role;
  className?: string;
}

export function RoleBadge({ role, className }: RoleBadgeProps) {
  const styles = ROLE_BADGE_STYLES[role];
  const labels: Record<Role, string> = {
    user: 'User',
    owner: 'Owner',
    admin: 'Admin',
  };

  return (
    <Badge
      variant="outline"
      className={cn(styles.bg, styles.text, 'border-transparent', className)}
    >
      {labels[role]}
    </Badge>
  );
}
