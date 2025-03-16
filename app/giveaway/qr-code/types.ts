import { z } from "zod";

export const entryFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string()
    .email("Invalid email address")
    .optional()
    .or(z.literal('')),  // Allow empty string
  whatsappNumber: z.string()
    .regex(/^[6-9]\d{9}$/, "Please enter a valid 10-digit mobile number"),
  address: z.string().min(5, "Address must be at least 5 characters"),
  city: z.string().min(2, "City must be at least 2 characters"),
  pincode: z.string()
    .regex(/^[1-9][0-9]{5}$/, "Please enter a valid 6-digit pincode"),
});

export type EntryFormData = z.infer<typeof entryFormSchema>; 