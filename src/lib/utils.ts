import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format as formatDate } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
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
  return new Date(utcDate.getTime() + 7 * 60 * 60 * 1000);
}

/**
 * Convert a WIB date to UTC
 * This is for storage purposes - when saving dates to the database (which should be in UTC)
 */
export function toUTC(date: Date): Date {
  // Create a new date to avoid modifying the original
  const wibDate = new Date(date);
  // Subtract 7 hours to convert from GMT+7 to UTC
  return new Date(wibDate.getTime() - 7 * 60 * 60 * 1000);
}

/**
 * Format a date in WIB timezone (GMT+7).
 * Uses manual UTC offset to avoid double-offset when date-fns applies local timezone.
 */
export function formatWIB(date: Date, formatStr: string): string {
  // Shift the UTC time by +7 hours to get WIB
  const wibDate = toWIB(date);
  // Format using UTC values to avoid date-fns applying local timezone on top
  // We create a date where the local time equals the WIB time
  const localEquivalent = new Date(
    wibDate.getUTCFullYear(),
    wibDate.getUTCMonth(),
    wibDate.getUTCDate(),
    wibDate.getUTCHours(),
    wibDate.getUTCMinutes(),
    wibDate.getUTCSeconds(),
    wibDate.getUTCMilliseconds()
  );
  return formatDate(localEquivalent, formatStr);
}

/**
 * Combined utility for preprocessing text:
 * 1. Transforms bullets into markdown format
 * 2. Preserves markdown links for react-markdown to process
 */
export function preprocessText(text: string): string {
  // Only process the bullets, leave markdown links as is
  // since react-markdown will handle them
  return preprocessBullets(text);
}

/**
 * Transform bullets into markdown format
 */
function preprocessBullets(text: string): string {
  // 1. Normalize all literal \n to real line breaks
  let result = text.replace(/\\n/g, "\n");

  // 2. Convert inline bullets to newlines and markdown bullets
  result = result.replace(/(?:^|[ \t])•[ \t]+/g, (match, offset, string) => {
    // If at the start of the string or after a newline, just use "- "
    if (offset === 0 || string[offset - 1] === "\n") return "- ";
    // Otherwise, replace with "\n- "
    return "\n- ";
  });

  // 3. Ensure there is a blank line before the first bullet (for markdown)
  result = result.replace(/([^\n])\n(- )/g, "$1\n\n$2");

  return result;
}
