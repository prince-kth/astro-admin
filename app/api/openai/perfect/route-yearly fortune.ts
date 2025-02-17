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

const chakraHealingSchema = z.object({
  empowering_affirmations: z.array(z.string()).describe("Daily affirmations for inner strength and clarity"),
  
  sensory_therapy: z.array(z.object({
    therapy: z.string().describe("Type of sensory therapy"),
    description: z.string().describe("Detailed description of how to practice the therapy")
  })),
  
  color_therapy: z.array(z.object({
    color: z.string().describe("Color to use"),
    day: z.string().describe("Day to apply the color therapy"),
    purpose: z.string().describe("Purpose and benefits of the color therapy")
  })),
  
  donation_therapy: z.array(z.object({
    activity: z.string().describe("Type of donation or volunteer activity"),
    day: z.string().describe("Recommended day for the activity"),
    benefit: z.string().describe("Spiritual and karmic benefits of the activity"),
    astrological_significance: z.string().describe("Vedic astrological significance")
  })),
  
  meditation_therapy: z.array(z.object({
    name: z.string().describe("Name of the meditation technique"),
    instructions: z.string().describe("Step by step instructions"),
    duration: z.string().describe("Recommended duration and progression"),
    benefits: z.string().describe("Benefits of the meditation practice"),
    vedic_significance: z.string().optional().describe("Optional Vedic astrological significance")
  }))
});


const monthlyFortuneSchema = z.object({
  month: z.string().describe("Month of the prediction").refine(
    (month) => ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"].includes(month),
    {
      message: "Month must be a valid month name from January to December"
    }
  ),
  year: z.string().describe("2025"),
  highlights: z.array(z.string()).describe("Key astrological highlights for the month, including planetary transits, aspect influences and their effects on various areas of life. The highlights should be at only 30 words and provide actionable insights to the user"),
  focus_areas: z.object({
    love_relationships: z.string().describe("Love and relationships predictions for the month must be at least 200 words"),
    career_finances: z.string().describe("Career and financial predictions for the month must be at least 200 words, including specific dates for job interviews, promotions, new business opportunities, investment advice, and potential challenges or gains in professional life"),
    health_wellness: z.string().describe("Health and wellness predictions for the month must be at least 100 words"),
    lucky_numbers: z.array(z.string()).describe("Lucky numbers for the month"),
    lucky_colors: z.array(z.string()).describe("Lucky colors for the month"),
    lucky_symbols: z.array(z.string()).describe("Lucky symbols for the month"),
    remedies: z.array(z.string()).describe("Array of recommended remedies for the month. Each remedy should be concise and specific to the month's challenges must be at least 200 words")
  })
})

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
    const [basicAnalysis, 
      // lucky13Analysis,
      //  chakraHealingAnalysis,
       monthlyPredictions
      ] = await Promise.all([
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

   
      // lucky13Analysis

      // generateObject({
      //   model: openai('gpt-4o'),
      //   prompt: `Generate a Lucky 13 report for ${name}, born on ${dob} at ${time_of_birth} in ${place_of_birth}.
      //   Calculate the following lucky elements based on numerological principles using birth date (${dob}):
      
      //   1. First calculate the birth number (day of birth) and destiny number (sum of full birth date).
      //   2. Based on these numbers, determine:
      //   - Lucky Colors: Based on ruling planet of birth number (e.g., Royal Blue for Saturn)
      //   - Lucky Sounds for Car Brand: Provide 4-5 two-letter sounds based on birth number's ruling planet (e.g., "Ma", "Me", "Mi", "Mu", "Mo") + a brief description of the selection logic.
      //   - Lucky Sounds for Bank: Provide 4-5 two-letter sounds based on destiny number's ruling planet (e.g., "Ga", "Ge", "Gi", "Go", "Gu") + a brief description of the selection logic.
      //   - Lucky Symbols: Natural or cultural objects associated with ruling planet (e.g., Lotus for Sun)
      //   - Lucky Food: Natural ingredients ruled by the birth number's planet (e.g., Wheat for Jupiter)
      //   - Career Areas: Based on ruling planet's characteristics (e.g., Government Related for Sun, Creative Arts for Venus)
      
      //   Format Guidelines:
      //   - All responses must be properly capitalized
      //   - Colors should be specific shades (e.g., Royal Blue, Pearl White)
      //   - Symbols should be natural/cultural objects only (e.g., Lotus, Conch Shell, Peacock Feather)
      //   - Food should be natural ingredients (e.g., Wheat Flour, Sugarcane, Rice, Mung Dal)
      //   - Career areas should be broad (e.g., Government Related, HR, Leadership Roles)
      
      //   Birth Chart Details:
      //   ${JSON.stringify(kundli_data, null, 2)}`,
      //   schema: z.object({
      //     lucky_13: z.object({
      //       colour: z.array(z.string()),
      //       number: z.number(),
      //       day: z.string(),
      //       month: z.array(z.string()),
      //       career: z.array(z.string()),
      //       car_brand: z.object({
      //         name: z.string(),
      //         description: z.string(),
      //         sounds: z.array(z.string()).min(4).max(5)
      //       }),
      //       bank: z.object({
      //         name: z.string(),
      //         description: z.string(),
      //         sounds: z.array(z.string()).min(4).max(5)
      //       }),
      //       jewellery_metal: z.array(z.string()),
      //       gemstones: z.array(z.string()),
      //       food: z.array(z.string()),
      //       symbols: z.array(z.string()),
      //       animal: z.array(z.string()),
      //       exercise_type: z.array(z.string())
      //     })
      //   }),
      //   temperature: 0.7,
      // }),


      // Chakra Healing Analysis
      //

      // generateObject({
      //   model: openai('gpt-4o'),
      //   prompt: `Generate a personalized chakra healing report for ${name}, born on ${dob} at ${time_of_birth} in ${place_of_birth}.
      //   Consider their birth chart placements and current planetary positions to provide specific healing practices.
      //   Include empowering affirmations, sensory therapies, color therapies, donation recommendations, and meditation practices.
        
      //   Chakra Healing Report Details:
      //   ${JSON.stringify(kundli_data, null, 2)}`,
      //   schema: z.object({
      //     chakra_healing: chakraHealingSchema
      //   }),
      //   temperature: 0.7,
      // }),


      generateObject({
        model: openai('gpt-4o'),
        prompt: `Generate detailed monthly predictions for {name}, born on ${dob} at ${time_of_birth} in ${place_of_birth}. 
         for all 12 months of the year (January to December).
        Each prediction should be specific to the calendar month, starting from January and ending in December.
        
        Requirements:
        1. Generate exactly 12 predictions in chronological order (January first, then February, and so on)
        2. Each month should include specific dates and timings for important events
        3. Consider planetary positions, transits, and dashas for accurate monthly predictions
        4. Focus on practical advice and timing of important events
        5. Monthly highlights should be exactly 50 words, no more or no less
  
        Birth Chart Details:
        ${JSON.stringify(kundli_data, null, 2)}`,
        schema: z.object({
          monthly_predictions: z.array(monthlyFortuneSchema).length(12),
          // kundali_highlights: z.array(z.string()),
        }),
        temperature: 0.7,
      })

     
    ]);

    // Build Final Response
    const result = {
      ...basicAnalysis.object,
      // ...lucky13Analysis.object,
      lucky_number: luckyNumber,
      // ...chakraHealingAnalysis.object,
      fortune_report: {
        monthly_predictions: monthlyPredictions.object.monthly_predictions,

        company_details: {
          name: "Kriscent Techno Hub Pvt Ltd",
          slogan: "Incredible Think Ahead",
          year: "2014",
          report_name: "Yearly Fortune Report",
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
