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

/**
 * Converts a Prisma NameCard record to form values with consistent fallbacks.
 * Eliminates the 4x duplicated mapping across pages.
 */
export function toNameCardFormValues(card: {
  firstName?: string | null;
  lastName?: string | null;
  title?: string | null;
  company?: string | null;
  email?: string | null;
  phone?: string | null;
  website?: string | null;
  address1?: string | null;
  address2?: string | null;
  city?: string | null;
  postcode?: string | null;
  linkedin?: string | null;
  twitter?: string | null;
  instagram?: string | null;
  profileImage?: string | null;
  coverImage?: string | null;
  aiChatAgent?: boolean;
  aiVoiceCallAgent?: boolean;
}): NameCardFormValues {
  return {
    firstName: card.firstName || "",
    lastName: card.lastName || "",
    title: card.title || "",
    company: card.company || "",
    email: card.email || "",
    phone: card.phone || "",
    website: card.website || "",
    address1: card.address1 || "",
    address2: card.address2 || "",
    city: card.city || "",
    postcode: card.postcode || "",
    linkedin: card.linkedin || "",
    twitter: card.twitter || "",
    instagram: card.instagram || "",
    profileImage: card.profileImage || "",
    coverImage: card.coverImage || "",
    aiChatAgent: card.aiChatAgent ?? false,
    aiVoiceCallAgent: card.aiVoiceCallAgent ?? false,
  };
}

/** Generates a vCard 3.0 string from namecard form values. */
export function generateVCard(values: NameCardFormValues): string {
  const fullName = [values.firstName, values.lastName].filter(Boolean).join(" ");
  return [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `N:${values.lastName || ""};${values.firstName || ""};;;`,
    `FN:${fullName}`,
    values.title ? `TITLE:${values.title}` : "",
    values.company ? `ORG:${values.company}` : "",
    values.phone ? `TEL;TYPE=CELL:${values.phone}` : "",
    values.email ? `EMAIL:${values.email}` : "",
    values.website ? `URL:${values.website}` : "",
    "END:VCARD",
  ]
    .filter(Boolean)
    .join("\n");
}
