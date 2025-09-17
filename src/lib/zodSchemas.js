/**
 * Zod Validation Schemas
 * Type-safe validation schemas for forms and API endpoints
 */

import { z } from 'zod';

// Common validation patterns
const emailSchema = z.string()
  .min(1, 'Email is required')
  .email('Please enter a valid email address')
  .max(254, 'Email is too long');

const passwordSchema = z.string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/\d/, 'Password must contain at least one number')
  .regex(/[!@#$%^&*(),.?":{}|<>]/, 'Password must contain at least one special character');

const usernameSchema = z.string()
  .min(3, 'Username must be at least 3 characters')
  .max(20, 'Username must be less than 20 characters')
  .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores');

const nameSchema = z.string()
  .min(2, 'Name must be at least 2 characters')
  .max(50, 'Name must be less than 50 characters')
  .regex(/^[a-zA-Z\s\-']+$/, 'Name can only contain letters, spaces, hyphens, and apostrophes');

// Sign-in form schema
export const signinSchema = z.object({
  email: z.string().min(1, 'Email or username is required'),
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional(),
  recaptchaToken: z.string().optional()
});

// Sign-up form schema
export const signupSchema = z.object({
  firstName: nameSchema,
  lastName: nameSchema,
  username: usernameSchema,
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: z.string().min(1, 'Please confirm your password'),
  agreeToTerms: z.boolean().refine(val => val === true, {
    message: 'You must agree to the Terms and Conditions and Privacy Policy'
  }),
  recaptchaToken: z.string().optional()
}).refine(data => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword']
});

// Forgot password schema
export const forgotPasswordSchema = z.object({
  email: emailSchema
});

// Reset password schema
export const resetPasswordSchema = z.object({
  token: z.string().min(10, 'Invalid reset token'),
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: z.string().min(1, 'Please confirm your password')
}).refine(data => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword']
});

// Change password schema
export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: passwordSchema,
  confirmPassword: z.string().min(1, 'Please confirm your new password')
}).refine(data => data.newPassword === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword']
});

// Address schema - matches frontend form fields (relaxed for development)
export const addressSchema = z.object({
  id: z.string().optional(),
  type: z.enum(['billing', 'shipping']),
  name: z.string().min(1, 'Name is required').max(100, 'Name is too long'),
  street: z.string().min(1, 'Street address is required').max(100, 'Street address is too long'),
  city: z.string().min(1, 'City is required').max(50, 'City name is too long'),
  state: z.string().max(50, 'State name is too long').optional(), // Made optional for development
  zipCode: z.string().max(10, 'Postal code is too long').optional(), // Made optional for development
  country: z.string().max(50, 'Country name is too long').optional(), // Made optional and more lenient
  phone: z.string().max(20, 'Phone number is too long').optional(),
  company: z.string().max(100, 'Company name is too long').optional()
});

// Checkout form schema
export const checkoutSchema = z.object({
  // Billing address
  firstName: nameSchema,
  lastName: nameSchema,
  company: z.string().max(100, 'Company name is too long').optional(),
  address1: z.string().min(1, 'Address is required').max(100, 'Address is too long'),
  address2: z.string().max(100, 'Address line 2 is too long').optional(),
  city: z.string().min(1, 'City is required').max(50, 'City name is too long'),
  state: z.string().min(1, 'State is required').max(50, 'State name is too long'),
  postcode: z.string().min(1, 'Postal code is required').max(10, 'Postal code is too long'),
  country: z.string().min(2, 'Country is required').max(2, 'Country code must be 2 characters'),
  phone: z.string().max(20, 'Phone number is too long').optional(),
  email: emailSchema,
  
  // Shipping address (optional)
  shipToDifferent: z.boolean().optional(),
  shippingFirstName: nameSchema.optional(),
  shippingLastName: nameSchema.optional(),
  shippingCompany: z.string().max(100, 'Company name is too long').optional(),
  shippingAddress1: z.string().max(100, 'Address is too long').optional(),
  shippingAddress2: z.string().max(100, 'Address line 2 is too long').optional(),
  shippingCity: z.string().max(50, 'City name is too long').optional(),
  shippingState: z.string().max(50, 'State name is too long').optional(),
  shippingPostcode: z.string().max(10, 'Postal code is too long').optional(),
  shippingCountry: z.string().max(2, 'Country code must be 2 characters').optional(),
  shippingPhone: z.string().max(20, 'Phone number is too long').optional(),
  
  // Payment
  paymentMethod: z.string().min(1, 'Please select a payment method'),
  
  // Order notes
  orderNotes: z.string().max(500, 'Order notes are too long').optional()
}).refine(data => {
  // If shipping to different address, validate shipping fields
  if (data.shipToDifferent) {
    return data.shippingFirstName && data.shippingLastName && 
           data.shippingAddress1 && data.shippingCity && 
           data.shippingState && data.shippingPostcode && 
           data.shippingCountry;
  }
  return true;
}, {
  message: 'Please fill in all shipping address fields',
  path: ['shippingAddress1']
});

// Product review schema
export const reviewSchema = z.object({
  rating: z.number().min(1, 'Please select a rating').max(5, 'Rating must be between 1 and 5'),
  title: z.string().min(1, 'Review title is required').max(100, 'Title is too long'),
  content: z.string().min(10, 'Review must be at least 10 characters').max(1000, 'Review is too long'),
  productId: z.number().positive('Invalid product ID')
});

// Contact form schema
export const contactSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  subject: z.string().min(1, 'Subject is required').max(100, 'Subject is too long'),
  message: z.string().min(10, 'Message must be at least 10 characters').max(1000, 'Message is too long'),
  recaptchaToken: z.string().optional()
});

// Newsletter subscription schema
export const newsletterSchema = z.object({
  email: emailSchema,
  firstName: nameSchema.optional(),
  lastName: nameSchema.optional()
});

// Search query schema
export const searchSchema = z.object({
  query: z.string().min(1, 'Search query is required').max(100, 'Search query is too long'),
  category: z.string().optional(),
  minPrice: z.number().min(0).optional(),
  maxPrice: z.number().min(0).optional(),
  sortBy: z.enum(['relevance', 'price_asc', 'price_desc', 'date', 'rating']).optional()
});

// API validation helper
export const validateWithZod = (schema, data) => {
  try {
    const result = schema.parse(data);
    return { success: true, data: result, errors: {} };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = {};
      error.issues.forEach(err => {
        const path = err.path.length > 0 ? err.path[0] : 'form';
        errors[path] = err.message;
      });
      return { success: false, data: null, errors };
    }
    return { success: false, data: null, errors: { general: 'Validation failed' } };
  }
};

// Safe parse helper (doesn't throw)
export const safeParseWithZod = (schema, data) => {
  const result = schema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data, errors: {} };
  } else {
    const errors = {};
    if (result.error && result.error.issues) {
      result.error.issues.forEach(err => {
        const path = err.path.length > 0 ? err.path[0] : 'form';
        errors[path] = err.message;
      });
    }
    return { success: false, data: null, errors };
  }
};
