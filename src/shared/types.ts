import z from "zod";

// Tour schema and types
export const TourSchema = z.object({
  id: z.number(),
  title: z.string(),
  description: z.string().nullable(),
  location: z.string(),
  duration_days: z.number(),
  price: z.number(),
  max_guests: z.number(),
  image_url: z.string().nullable(),
  highlights: z.string().nullable(), // JSON string
  included: z.string().nullable(), // JSON string
  gallery_images: z.string().nullable(), // JSON array of image URLs
  gallery_videos: z.string().nullable(), // JSON array of video URLs
  is_featured: z.boolean(),
  is_active: z.boolean(),
  created_at: z.string(),
  updated_at: z.string(),
});

export type Tour = z.infer<typeof TourSchema>;

// Booking schema and types
export const BookingRequestSchema = z.object({
  tour_id: z.number(),
  guest_name: z.string().min(1, "Name is required"),
  guest_email: z.string().email("Valid email is required"),
  guest_phone: z.string().min(1, "Phone number is required"),
  guest_count: z.number().min(1, "At least 1 guest required"),
  preferred_date: z.string().nullable(),
  message: z.string().nullable(),
});

export const BookingSchema = z.object({
  id: z.number(),
  tour_id: z.number(),
  guest_name: z.string(),
  guest_email: z.string(),
  guest_phone: z.string(),
  guest_count: z.number(),
  preferred_date: z.string().nullable(),
  message: z.string().nullable(),
  status: z.string(),
  total_price: z.number(),
  created_at: z.string(),
  updated_at: z.string(),
});

export type BookingRequest = z.infer<typeof BookingRequestSchema>;
export type Booking = z.infer<typeof BookingSchema>;
