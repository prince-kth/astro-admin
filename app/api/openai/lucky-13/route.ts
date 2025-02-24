import { NextRequest, NextResponse } from 'next/server';
import { generateObject } from 'ai';
import { openai } from '@ai-sdk/openai';
import { z } from "zod";

// Function to calculate lucky number
const calculateLuckyNumber = (dob: string) => {
  const digits = dob.replace(/[^0-9]/g, '').split('').map(Number);
  let sum = digits.reduce((acc, num) => acc + num, 0);
  while (sum > 9) {
    sum = sum.toString().split('').reduce((acc, num) => acc + Number(num), 0);
  }
  return sum;
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Validate incoming data
    if (!body.kundliData) {
      return NextResponse.json({ error: "Kundli data is required" }, { status: 400 });
    }

    const {
      name, dob, time_of_birth, place_of_birth, latitude, longitude, timezone, kundli_data
    } = body.kundliData;

    if (!name || !dob || !time_of_birth || !place_of_birth || !latitude || !longitude || !timezone) {
      return NextResponse.json({ error: "Missing required fields in Kundli data" }, { status: 400 });
    }

    console.log("🔍 Processing request for:", name);

    // Calculate lucky number
    const luckyNumber = calculateLuckyNumber(dob);
    console.log("🔍 Lucky number:", luckyNumber);

    // Run all async operations in parallel
    const [basicAnalysis, lucky13Analysis] = await Promise.all([
      generateObject({
        model: openai('gpt-4o'),
        prompt: `Generate a detailed astrological analysis for ${name}, born on ${dob} at ${time_of_birth} in ${place_of_birth}.
        Focus on personality traits, core characteristics, and life patterns based on planetary positions.

        Birth Chart Details:
        ${JSON.stringify(kundli_data, null, 2)}`,
        schema: z.object({
          user_details: z.object({
            name: z.string(),
            dob: z.string(),
            time_of_birth: z.string(),
            place_of_birth: z.string(),
            latitude: z.string(),
            longitude: z.string(),
            timezone: z.string(),
            sun_sign: z.string(),
            moon_sign: z.string(),
            ascendant: z.string()
          }),
        }),
        temperature: 0.7,
      }),

    

      generateObject({
        model: openai('gpt-4o'),
        prompt: `Generate a Lucky 13 report for ${name}, born on ${dob} at ${time_of_birth} in ${place_of_birth}.
        Calculate the following lucky elements based on numerological principles using birth date (${dob}):
      
        1. First calculate the birth number (day of birth) and destiny number (sum of full birth date).
        2. Based on these numbers, determine:
        - Lucky Colors: Based on ruling planet of birth number (e.g., Royal Blue for Saturn)
        - Lucky Sounds for Car Brand: Provide 4-5 two-letter sounds based on birth number's ruling planet (e.g., "Ma", "Me", "Mi", "Mu", "Mo") + a brief description of the selection logic.
        - Lucky Sounds for Bank: Provide 4-5 two-letter sounds based on destiny number's ruling planet (e.g., "Ga", "Ge", "Gi", "Go", "Gu") + a brief description of the selection logic.
        - Lucky Symbols: Natural or cultural objects associated with ruling planet (e.g., Lotus for Sun)
        - Lucky Food: Natural ingredients ruled by the birth number's planet (e.g., Wheat for Jupiter)
        - Career Areas: Based on ruling planet's characteristics (e.g., Government Related for Sun, Creative Arts for Venus)
      
        Format Guidelines:
        - All responses must be properly capitalized
        - Colors should be specific shades (e.g., Royal Blue, Pearl White)
        - Symbols should be natural/cultural objects only (e.g., Lotus, Conch Shell, Peacock Feather)
        - Food should be natural ingredients (e.g., Wheat Flour, Sugarcane, Rice, Mung Dal)
        - Career areas should be broad (e.g., Government Related, HR, Leadership Roles)
      
        Birth Chart Details:
        ${JSON.stringify(kundli_data, null, 2)}`,
        schema: z.object({
          lucky_13: z.object({
            colour: z.array(z.string()),
            number: z.number(),
            day: z.string(),
            month: z.array(z.string()),
            career: z.array(z.string()),
            car_brand: z.object({
              name: z.string(),
              description: z.string(),
              sounds: z.array(z.string()).min(4).max(5)
            }),
            bank: z.object({
              name: z.string(),
              description: z.string(),
              sounds: z.array(z.string()).min(4).max(5)
            }),
            jewellery_metal: z.array(z.string()),
            gemstones: z.array(z.string()),
            food: z.array(z.string()),
            symbols: z.array(z.string()),
            // animal: z.array(z.string()),
            animal: z.string(),
            exercise_type: z.array(z.string())
          })
        }),
        temperature: 0.7,
      })
    ]);

    // Build Final Response
    const result = {
      ...basicAnalysis.object,
      ...lucky13Analysis.object,
      lucky_number: luckyNumber,

      fortune_report: {
        company_details: {
          name: "Kriscent Techno Hub Pvt Ltd",
          slogan: "Incredible Think Ahead",
          year: "2014",
          report_name: "Lucky 13 Report",
          astrologer_name: "Kapil Gautam",
          social_media: {
            facebook: { url: "https://www.facebook.com/KriscentTechnoHub", name: "Facebook" },
            twitter: { url: "https://x.com/Kriscent_KTH", name: "Twitter" },
            instagram: { url: "https://www.instagram.com/kriscenttechnohub", name: "Instagram" },
            linkedin: { url: "https://www.linkedin.com/in/kriscent-techno-hub-761a56311", name: "LinkedIn" }
          },
          email: "support@kriscent.in"
        },
      }
    };

    console.log("🔍 Final result:", result)
    console.log("✅ Successfully generated report for:", name);
    return NextResponse.json(result);

  } catch (error) {
    console.error("❌ Error generating report:", error);
    return NextResponse.json({
      error: "Failed to generate report",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}
