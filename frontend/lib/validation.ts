import { z } from 'zod';

// Login Schema
export const loginSchema = z.object({
  email: z
    .string()
    .email('Please enter a valid email address')
    .min(1, 'Email is required'),
  password: z
    .string()
    .min(1, 'Password is required')
    .min(8, 'Password must be at least 8 characters'),
});

export type LoginFormData = z.infer<typeof loginSchema>;

// Register Schema
export const registerSchema = z
  .object({
    email: z
      .string()
      .email('Please enter a valid email address')
      .min(1, 'Email is required'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export type RegisterFormData = z.infer<typeof registerSchema>;

// Listing Schema
export const listingSchema = z.object({
  title: z
    .string()
    .min(5, 'Title must be at least 5 characters')
    .max(100, 'Title must be no more than 100 characters'),
  description: z
    .string()
    .min(20, 'Description must be at least 20 characters')
    .max(2000, 'Description must be no more than 2000 characters'),
  city: z
    .string()
    .min(2, 'City name must be at least 2 characters')
    .max(50, 'City name must be no more than 50 characters'),
  price: z
    .number()
    .positive('Price must be greater than 0')
    .max(999999, 'Price cannot exceed $999,999'),
  property_type: z
    .enum(['apartment', 'house', 'condo', 'studio', 'other'])
    .default('apartment'),
  bedrooms: z
    .number()
    .int()
    .positive('Bedrooms must be at least 1')
    .max(10, 'Bedrooms cannot exceed 10'),
  bathrooms: z
    .number()
    .int()
    .positive('Bathrooms must be at least 1')
    .max(10, 'Bathrooms cannot exceed 10'),
  square_feet: z
    .number()
    .positive('Square feet must be greater than 0')
    .optional(),
  features: z
    .array(z.string())
    .optional()
    .default([]),
});

export type ListingFormData = z.infer<typeof listingSchema>;

// Profile Schema
export const profileSchema = z.object({
  email: z
    .string()
    .email('Please enter a valid email address'),
  current_password: z
    .string()
    .optional(),
  new_password: z
    .string()
    .min(8, 'New password must be at least 8 characters')
    .optional()
    .or(z.literal('')),
  confirm_password: z
    .string()
    .optional(),
}).refine(
  (data) => {
    if (data.new_password && !data.current_password) {
      return false;
    }
    return true;
  },
  {
    message: 'Current password is required to set a new password',
    path: ['current_password'],
  }
).refine(
  (data) => {
    if (data.new_password && data.new_password !== data.confirm_password) {
      return false;
    }
    return true;
  },
  {
    message: 'Passwords do not match',
    path: ['confirm_password'],
  }
);

export type ProfileFormData = z.infer<typeof profileSchema>;

// Helper function to get field error
export function getFieldError(error: z.ZodError, fieldName: string): string | undefined {
  return error.fieldErrors[fieldName]?.[0];
}
