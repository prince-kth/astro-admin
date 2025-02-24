// utils/kundliUtils.ts
import swisseph from 'swisseph';
import { z } from 'zod';

// Constants
export const ZODIAC_SIGNS = [
  "Aries", "Taurus", "Gemini", "Cancer", 
  "Leo", "Virgo", "Libra", "Scorpio", 
  "Sagittarius", "Capricorn", "Aquarius", "Pisces"
] as const;

export const NAKSHATRAS = [
  "Ashwini", "Bharani", "Krittika", "Rohini", "Mrigashira", 
  "Ardra", "Punarvasu", "Pushya", "Ashlesha", "Magha", 
  "Purva Phalguni", "Uttara Phalguni", "Hasta", "Chitra",
  "Swati", "Vishakha", "Anuradha", "Jyeshtha", "Mula", 
  "Purva Ashadha", "Uttara Ashadha", "Shravana", "Dhanishta",
  "Shatabhisha", "Purva Bhadrapada", "Uttara Bhadrapada", "Revati"
] as const;

export const PLANETS = {
  SUN: swisseph.SE_SUN,
  MOON: swisseph.SE_MOON,
  MARS: swisseph.SE_MARS,
  MERCURY: swisseph.SE_MERCURY,
  JUPITER: swisseph.SE_JUPITER,
  VENUS: swisseph.SE_VENUS,
  SATURN: swisseph.SE_SATURN,
  RAHU: swisseph.SE_MEAN_NODE,
  KETU: -1 // Calculated from Rahu
} as const;

// Input validation schema
export const kundliInputSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format. Use YYYY-MM-DD"),
  timeOfBirth: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Invalid time format. Use HH:mm"),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  timezone: z.string()
});

// Helper Functions
export function getJulianDay(date: Date): number {
  return swisseph.swe_julday(
    date.getUTCFullYear(),
    date.getUTCMonth() + 1,
    date.getUTCDate(),
    date.getUTCHours() + date.getUTCMinutes() / 60,
    swisseph.SE_GREG_CAL
  );
}

export function getZodiacSign(longitude: number): string {
  const signIndex = Math.floor(longitude / 30) % 12;
  return ZODIAC_SIGNS[signIndex];
}

export function getNakshatra(longitude: number): string {
  const nakshatraIndex = Math.floor(longitude * 27 / 360) % 27;
  return NAKSHATRAS[nakshatraIndex];
}

export function getDegreeInSign(longitude: number): number {
  return longitude % 30;
}

export function isRetrograde(speedLong: number): boolean {
  return speedLong < 0;
}

export function getHouseNumber(longitude: number, ascendantLongitude: number): number {
  const relativeLongitude = (longitude - ascendantLongitude + 360) % 360;
  return Math.floor(relativeLongitude / 30) + 1;
}