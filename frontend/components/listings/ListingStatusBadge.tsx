import { ListingStatus } from '@/types/listing.types';

interface ListingStatusBadgeProps {
  status: ListingStatus;
  size?: 'sm' | 'md';
}

export default function ListingStatusBadge({
  status,
  size = 'md',
}: ListingStatusBadgeProps) {
  const statusConfig = {
    draft: {
      bg: 'bg-gray-100',
      border: 'border-gray-300',
      text: 'text-ink-700',
      label: 'Draft',
    },
    published: {
      bg: 'bg-ink-900',
      border: 'border-ink-900',
      text: 'text-white',
      label: 'Published',
    },
    archived: {
      bg: 'bg-white',
      border: 'border-ink-300',
      text: 'text-ink-600',
      label: 'Archived',
    },
  };

  const config = statusConfig[status];
  const sizeClass = size === 'sm' ? 'px-2 py-1 text-xs' : 'px-3 py-1.5 text-sm';

  return (
    <span
      className={`inline-flex items-center font-medium rounded border ${config.bg} ${config.border} ${config.text} ${sizeClass}`}
    >
      {config.label}
    </span>
  );
}
