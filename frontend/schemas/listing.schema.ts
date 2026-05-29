import { z } from 'zod';
import { LISTING_TYPES } from '@/constants';

// Listing type must be exactly one of the 6 DB-enforced values
const listingTypeSchema = z.enum(LISTING_TYPES, {
  errorMap: () => ({ message: 'Please select a valid property type' }),
});

// Create listing schema - all fields required for publish validation
export const createListingSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255, 'Title must be less than 255 characters'),
  type: listingTypeSchema,
  city: z.string().min(1, 'City is required').max(100, 'City must be less than 100 characters'),
  area: z.string().min(1, 'Area is required').max(100, 'Area must be less than 100 characters'),
  price: z
    .number({ invalid_type_error: 'Price must be a number' })
    .min(1, 'Price must be at least 1') // DB CHECK: price > 0
    .max(100000000, 'Price seems unreasonably high'),
  is_available: z.boolean().optional().default(true),
});

// Update listing schema - all fields optional
export const updateListingSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255, 'Title must be less than 255 characters').optional(),
  type: listingTypeSchema.optional(),
  city: z.string().min(1, 'City is required').max(100, 'City must be less than 100 characters').optional(),
  area: z.string().min(1, 'Area is required').max(100, 'Area must be less than 100 characters').optional(),
  price: z
    .number({ invalid_type_error: 'Price must be a number' })
    .min(1, 'Price must be at least 1')
    .max(100000000, 'Price seems unreasonably high')
    .optional(),
  is_available: z.boolean().optional(),
});

// Filter schema for public listings
export const listingFiltersSchema = z.object({
  q: z.string().optional(),
  city: z.string().optional(),
  type: listingTypeSchema.optional(),
  priceMin: z.number().min(0).optional(),
  priceMax: z.number().min(0).optional(),
  page: z.number().min(1).optional(),
  limit: z.number().min(1).max(100).optional(),
}).refine(
  (data) => {
    if (data.priceMin !== undefined && data.priceMax !== undefined) {
      return data.priceMax > data.priceMin;
    }
    return true;
  },
  {
    message: 'Maximum price must be greater than minimum price',
    path: ['priceMax'],
  }
);

export type CreateListingFormData = z.infer<typeof createListingSchema>;
export type UpdateListingFormData = z.infer<typeof updateListingSchema>;
export type ListingFiltersFormData = z.infer<typeof listingFiltersSchema>;
