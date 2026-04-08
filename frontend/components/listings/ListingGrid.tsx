import { Listing } from '@/types/listing.types';
import ListingCard from './ListingCard';
import EmptyState from '../common/EmptyState';

interface ListingGridProps {
  listings: Listing[];
  isLoading?: boolean;
  showStatus?: boolean;
  showOwnerActions?: boolean;
  onEdit?: (id: number) => void;
  onDelete?: (id: number) => void;
  emptyMessage?: string;
  onCreateNew?: () => void;
}

export default function ListingGrid({
  listings,
  isLoading,
  showStatus = false,
  showOwnerActions = false,
  onEdit,
  onDelete,
  emptyMessage = 'No listings found',
  onCreateNew,
}: ListingGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="bg-white rounded-lg border border-gray-200 h-80 animate-pulse"
          >
            <div className="h-48 bg-gray-200" />
            <div className="p-4 space-y-3">
              <div className="h-4 bg-gray-200 rounded w-3/4" />
              <div className="h-4 bg-gray-200 rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (listings.length === 0) {
    return (
      <EmptyState
        icon="🔍"
        title={emptyMessage}
        description="Try adjusting your search filters or create a new listing"
        action={
          onCreateNew
            ? { label: 'Create Listing', onClick: onCreateNew }
            : undefined
        }
      />
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
      {listings.map((listing) => (
        <ListingCard
          key={listing.id}
          listing={listing}
          showStatus={showStatus}
          showOwnerActions={showOwnerActions}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
