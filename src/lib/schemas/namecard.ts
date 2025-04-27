import { z } from "zod";

export const nameCardSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  title: z.string().min(1, "Job title is required"),
  company: z.string().optional(),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(1, "Phone number is required"),
  website: z.string().url("Invalid URL").optional().or(z.literal("")),
  address1: z.string().optional(),
  address2: z.string().optional(),
  city: z.string().optional(),
  postcode: z.string().optional(),
  linkedin: z.string().url("Invalid LinkedIn URL").optional().or(z.literal("")),
  twitter: z.string().url("Invalid Twitter URL").optional().or(z.literal("")),
  instagram: z.string().url("Invalid Instagram URL").optional().or(z.literal("")),
  profileImage: z.string().nullable().optional().default(""),
  coverImage: z.string().nullable().optional().default(""),
  aiChatAgent: z.boolean().optional().default(false),
  aiVoiceCallAgent: z.boolean().optional().default(false),
});

export type NameCardFormValues = z.infer<typeof nameCardSchema>;
