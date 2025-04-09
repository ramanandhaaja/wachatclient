import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { format as formatDate } from "date-fns"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Timezone utilities for handling WIB (GMT+7) consistently
 */

/**
 * Convert a UTC date to WIB (GMT+7)
 * This is for display purposes - when showing dates from the database (which are in UTC)
 */
export function toWIB(date: Date): Date {
  // Create a new date to avoid modifying the original
  const utcDate = new Date(date);
  // Add 7 hours to convert from UTC to GMT+7
  return new Date(utcDate.getTime() + (7 * 60 * 60 * 1000));
}

/**
 * Convert a WIB date to UTC
 * This is for storage purposes - when saving dates to the database (which should be in UTC)
 */
export function toUTC(date: Date): Date {
  // Create a new date to avoid modifying the original
  const wibDate = new Date(date);
  // Subtract 7 hours to convert from GMT+7 to UTC
  return new Date(wibDate.getTime() - (7 * 60 * 60 * 1000));
}

/**
 * Format a date in WIB timezone
 * This is for display purposes - when showing dates from the database
 */
export function formatWIB(date: Date, formatStr: string): string {
  // Convert the UTC date to WIB first
  const wibDate = toWIB(date);
  // Then format it
  return formatDate(wibDate, formatStr);
}
