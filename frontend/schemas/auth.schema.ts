import { z } from 'zod';

// Password must be at least 8 characters with uppercase, lowercase, number, and symbol
const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[!@#$%^&*(),.?":{}|<>]/, 'Password must contain at least one symbol');

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: passwordSchema,
  full_name: z.string().min(1, 'Full name is required'),
  phone: z
    .string()
    .min(1, 'Phone number is required')
    .refine((val) => {
      const cleanPhone = val.replace(/[\s-]/g, '');
      return /^(?:\+91|91|0)?[6-9]\d{9}$/.test(cleanPhone);
    }, 'Invalid Indian phone number format. Must be a 10-digit mobile number.'),
  address: z.string().min(1, 'Address is required'),
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
