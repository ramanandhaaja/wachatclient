import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { format as formatDate } from "date-fns"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Timezone utilities for handling WIB (GMT+7) consistently
 */

// The offset in milliseconds for WIB (GMT+7)
export const WIB_OFFSET = 7 * 60 * 60 * 1000

/**
 * Convert a UTC date to WIB (GMT+7)
 */
export function toWIB(date: Date): Date {
  return new Date(date.getTime() + WIB_OFFSET)
}

/**
 * Convert a WIB date to UTC
 */
export function toUTC(date: Date): Date {
  return new Date(date.getTime() - WIB_OFFSET)
}

/**
 * Format a date in WIB timezone
 */
export function formatWIB(date: Date, formatStr: string): string {
  const wibDate = toWIB(date)
  return formatDate(wibDate, formatStr)
}
