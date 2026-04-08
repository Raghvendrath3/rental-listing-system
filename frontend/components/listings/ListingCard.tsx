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
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
      {/* Image Placeholder */}
      <div className="w-full h-48 bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center text-blue-400">
        <span className="text-4xl">🏠</span>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Header with status */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 line-clamp-2">{listing.title}</h3>
            <p className="text-sm text-gray-600 mt-1">{listing.city}</p>
          </div>
          {showStatus && <ListingStatusBadge status={listing.status} size="sm" />}
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
          <div>
            <p className="text-gray-600">Area</p>
            <p className="font-semibold text-gray-900">{listing.area} m²</p>
          </div>
          <div>
            <p className="text-gray-600">Type</p>
            <p className="font-semibold text-gray-900 capitalize">{listing.type}</p>
          </div>
        </div>

        {/* Price */}
        <div className="mb-4 pb-4 border-t border-gray-200">
          <p className="text-2xl font-bold text-gray-900">
            ${listing.price.toLocaleString()}
            <span className="text-sm text-gray-600 font-normal">/month</span>
          </p>
        </div>

        {/* Availability Badge */}
        <div className="flex items-center justify-between mb-4">
          <span
            className={`text-sm font-medium px-2 py-1 rounded ${
              listing.is_available
                ? 'bg-green-100 text-green-700'
                : 'bg-red-100 text-red-700'
            }`}
          >
            {listing.is_available ? 'Available' : 'Not Available'}
          </span>
        </div>

        {/* Actions */}
        {showOwnerActions && (onEdit || onDelete) ? (
          <div className="flex gap-2">
            {onEdit && (
              <button
                onClick={() => onEdit(listing.id)}
                className="flex-1 px-3 py-2 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 text-sm font-medium transition-colors"
              >
                Edit
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => onDelete(listing.id)}
                className="flex-1 px-3 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200 text-sm font-medium transition-colors"
              >
                Delete
              </button>
            )}
          </div>
        ) : (
          <Link
            href={`/listings/${listing.id}`}
            className="block w-full text-center px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium transition-colors"
          >
            View Details
          </Link>
        )}
      </div>
    </div>
  );
}
