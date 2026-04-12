import Link from 'next/link';
import { Listing } from '@/types/listing.types';
import ListingStatusBadge from './ListingStatusBadge';

interface ListingCardProps {
  listing: Listing;
  showStatus?: boolean;
  showOwnerActions?: boolean;
  onEdit?: (id: number) => void;
  onDelete?: (id: number) => void;
}

export default function ListingCard({
  listing,
  showStatus = false,
  showOwnerActions = false,
  onEdit,
  onDelete,
}: ListingCardProps) {
  return (
    <div className="group bg-white border border-gray-300 rounded overflow-hidden transition-all duration-200 hover:border-gray-500 hover:shadow-md">
      {/* Image Placeholder */}
      <div className="w-full aspect-video bg-gray-100 flex items-center justify-center border-b border-gray-300 group-hover:bg-gray-150 transition-colors">
        <span className="text-5xl opacity-40">🏠</span>
      </div>

      {/* Content */}
      <div className="p-6 space-y-4">
        {/* Header with status */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-medium text-ink-900 line-clamp-2">{listing.title}</h3>
            <p className="text-sm text-ink-500 mt-2">{listing.city}</p>
          </div>
          {showStatus && <ListingStatusBadge status={listing.status} size="sm" />}
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-2 gap-4 py-4 border-y border-gray-300">
          <div>
            <p className="text-xs uppercase text-ink-500 font-medium tracking-wide">Area</p>
            <p className="text-sm font-medium text-ink-900 mt-1">{listing.area} m²</p>
          </div>
          <div>
            <p className="text-xs uppercase text-ink-500 font-medium tracking-wide">Type</p>
            <p className="text-sm font-medium text-ink-900 mt-1 capitalize">{listing.type}</p>
          </div>
        </div>

        {/* Price */}
        <div>
          <p className="text-xs uppercase text-ink-500 font-medium tracking-wide">Price</p>
          <p className="text-2xl font-medium text-ink-900 mt-1">
            ${listing.price.toLocaleString()}
            <span className="text-sm text-ink-500 font-normal">/mo</span>
          </p>
        </div>

        {/* Availability Badge */}
        <div className="flex items-center">
          <span
            className={`inline-block text-xs font-medium px-3 py-1.5 rounded border ${
              listing.is_available
                ? 'bg-ink-900 text-white border-ink-900'
                : 'bg-white text-ink-600 border-ink-300'
            }`}
          >
            {listing.is_available ? 'Available' : 'Unavailable'}
          </span>
        </div>

        {/* Actions */}
        {showOwnerActions && (onEdit || onDelete) ? (
          <div className="flex gap-3 pt-2">
            {onEdit && (
              <button
                onClick={() => onEdit(listing.id)}
                className="flex-1 px-4 py-2 bg-ink-900 text-white text-sm font-medium rounded border border-ink-900 hover:bg-ink-800 transition-colors"
              >
                Edit
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => onDelete(listing.id)}
                className="flex-1 px-4 py-2 bg-white text-ink-900 text-sm font-medium rounded border border-ink-300 hover:bg-gray-50 transition-colors"
              >
                Delete
              </button>
            )}
          </div>
        ) : (
          <Link
            href={`/listings/${listing.id}`}
            className="block w-full text-center px-4 py-2 bg-ink-900 text-white text-sm font-medium rounded border border-ink-900 hover:bg-ink-800 transition-colors mt-2"
          >
            View Details
          </Link>
        )}
      </div>
    </div>
  );
}
