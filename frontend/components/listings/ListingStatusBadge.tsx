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
      text: 'text-gray-700',
      label: 'Draft',
    },
    published: {
      bg: 'bg-green-100',
      text: 'text-green-700',
      label: 'Published',
    },
    archived: {
      bg: 'bg-red-100',
      text: 'text-red-700',
      label: 'Archived',
    },
  };

  const config = statusConfig[status];
  const sizeClass = size === 'sm' ? 'px-2 py-1 text-xs' : 'px-3 py-1.5 text-sm';

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full ${config.bg} ${config.text} ${sizeClass}`}
    >
      {config.label}
    </span>
  );
}
