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
    const kundliDataSchema = z.object({
      name: z.string(),
      dob: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Must be in YYYY-MM-DD format"),
      time_of_birth: z.string(),
      place_of_birth: z.string(),
      latitude: z.coerce.number().min(-90).max(90),
      longitude: z.coerce.number().min(-180).max(180),
      timezone: z.string(),
      kundli_data: z.any() // This could be more specific if we know the exact structure
    });

    const kundliDataValidation = kundliDataSchema.safeParse(body.kundliData);
    if (!kundliDataValidation.success) {
      return NextResponse.json({ error: "Invalid Kundli data", details: kundliDataValidation.error.format() }, { status: 400 });
    }

    const {
      name, dob, time_of_birth, place_of_birth, latitude, longitude, timezone, kundli_data
    } = kundliDataValidation.data;

    console.log("🔍 Processing request for:", name);
    console.log("✅✅ kundali_data:", kundli_data);

    // Calculate lucky number
    const luckyNumber = calculateLuckyNumber(dob);
    console.log("🔍 Lucky number:", luckyNumber);

    // Run all async operations in parallel
    const [basicAnalysis, wealthReport] = await Promise.all([
      generateObject({
        model: openai('gpt-4o'),
        prompt: `
        Generate a detailed astrological analysis for ${name}, born on ${dob} at ${time_of_birth} in ${place_of_birth}.
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
        prompt: `Generate a detailed Wealth Report based on Vedic Astrology for ${name}. Use ONLY the data provided in kundli_data.kundli for analysis:

        Birth Information:
        Date: ${dob}
        Time: ${time_of_birth}
        Place: ${place_of_birth}
        Coordinates: ${latitude}, ${longitude}
        Timezone: ${timezone}
        
        // Below is the exact birth chart extracted from **kundli_data.kundli** (DO NOT assume or modify):
        
        Birth Chart Details:
        ${JSON.stringify(kundli_data.kundli, null, 2)}
        
        Analysis Requirements:
        
        1. 📊 Basic Birth Chart Analysis
           - List all planets with their exact degrees, nakshatras, and house positions as provided in the JSON data.
           - Detail the current Mahadasha, Antardasha, and Pratyantar dasha periods with start and end dates.
        
        2. 💰 Financial Indicators Analysis
           - Analyze the 2nd, 10th, and 11th houses based on the precise data from the JSON:
             - **2nd House**: How does it affect wealth accumulation and savings? Discuss the impact of planets, aspects, and nakshatras.
             - **10th House**: Deep dive into career implications, focusing on the lord, planets, aspects, and nakshatras. Highlight both opportunities and challenges.
             - **11th House**: Explore how this house influences financial gains and growth. Discuss the significance of the planets placed here.
        
           For each house, provide:
           - Sign and lord
           - Planets placed, their degrees, nakshatras
           - Aspects influencing the house
           - A comprehensive inference that integrates all these factors.
        
        3. 🌟 Wealth Yogas Analysis
           - Identify and analyze Dhana Yogas, Lakshmi Yoga, and Raja Yoga formations based strictly on the JSON data.
           - Discuss the positions of Jupiter, Venus, Moon, and Sun in relation to wealth.
        
        4. 📈 Calculate Wealth Score (Total 100 points)
           - Provide scoring based on the actual positions and configurations from the JSON data.
        
        5. 🔮 Remedial Measures
           - Suggest remedies for any challenging placements or aspects noted in the JSON data.
        
        Important Guidelines:
        - Use ONLY the data from kundli_data.kundli for your analysis.
        - Provide specific house/planet positions and degrees as they appear in the JSON.
        - Avoid assumptions; stick to the provided data for all predictions and interpretations.
        - Ensure the analysis is detailed, covering both positive and negative implications where applicable.

        Generate a comprehensive wealth analysis strictly based on the provided birth chart data.`,
        schema: z.object({
          user_details: z.object({
            name: z.string(),
            dob: z.string(),
            time_of_birth: z.string(),
            place_of_birth: z.string(),
            latitude: z.string(),
            longitude: z.string(),
            timezone: z.string(),
            mahadasha: z.object({
              planet: z.string(),
              start_date: z.string(),
              end_date: z.string()
            }),
            antardasha: z.object({
              planet: z.string(),
              start_date: z.string(),
              end_date: z.string()
            }),
            pratyantar_dasha: z.object({
              planet: z.string(),
              start_date: z.string(),
              end_date: z.string()
            })
          }),
          birth_chart_analysis: z.object({
            planets: z.array(z.object({
              name: z.string(),
              degree: z.string(),
              nakshatra: z.string(),
              house: z.number()
            }))
          }),
          financial_indicators: z.object({
            second_house: z.object({
              sign: z.string(),
              lord: z.string(),
              lord_placement: z.string(),
              planets_placed: z.array(z.string()),
              aspects: z.array(z.string()),
              nakshatras: z.array(z.string()),
              inference: z.string().min(500, "Minimum 500 characters for detailed analysis").describe("Analyze how the 2nd house planets, signs, and aspects influence wealth accumulation and savings. Discuss the implications of both beneficial and challenging placements.Minimum 500 characters for detailed analysis")
            }),
            tenth_house: z.object({
              sign: z.string(),
              lord: z.string(),
              lord_placement: z.string(),
              planets_placed: z.array(z.string()),
              aspects: z.array(z.string()),
              nakshatras: z.array(z.string()),
              inference: z.string().min(500, "Minimum 500 characters for detailed analysis").describe("Provide a detailed analysis on how the 10th house's configuration impacts career growth, including the role of the house lord, planets, aspects, and nakshatras. Address both potential for success and areas of caution.Minimum 500 characters for detailed analysis")
            }),
            eleventh_house: z.object({
              sign: z.string(),
              lord: z.string(),
              lord_placement: z.string(),
              planets_placed: z.array(z.string()),
              aspects: z.array(z.string()),
              nakshatras: z.array(z.string()),
              inference: z.string().min(500, "Minimum 500 characters for detailed analysis").describe("Examine the influence of the 11th house on financial gains and expansions, focusing on the placement of planets, aspects, and nakshatras. Discuss how these factors could lead to financial stability or challenges.Minimum 500 characters for detailed analysis")
            })
          }),
          wealth_yogas: z.object({
            dhana_yogas: z.array(z.object({
              planet: z.string(),
              nakshatra: z.string(),
              house: z.number(),
              description: z.string(),
              inference: z.string().min(100, "Minimum 100 characters for detailed analysis").describe("Provide a thorough interpretation of how this Dhana Yoga influences wealth, considering both immediate and long-term effects. Include any specific conditions or transits that could modify these effects.")
            })),
            lakshmi_yoga: z.object({
              is_present: z.boolean(),
              strength: z.string(),
              description: z.string().min(50, "Minimum 50 characters for description")
            }),
            raja_yoga: z.object({
              is_present: z.boolean(),
              strength: z.string(),
              description: z.string().min(50, "Minimum 50 characters for description")
            }),
            special_combinations: z.array(z.string().min(100, "Each combination should have at least 100 characters to explain its significance and potential impact on wealth.")).min(1, "At least 2 combinations should be listed").max(1, "No more than 1 combinations are necessary for this report"),
          }),
          wealth_score: z.object({
            second_house_strength: z.number(),
            tenth_house_strength: z.number(),
            eleventh_house_strength: z.number(),
            dhana_yogas_strength: z.number(),
            wealth_nakshatras_strength: z.number(),
            total_score: z.number(),
            interpretation: z.string(),
            conclusion: z.string(),
            challenges: z.array(z.string())
          }),
          remedies: z.object({
            planet_remedies: z.array(z.object({
              planet: z.string(),
              mantras: z.array(z.object({
                text: z.string(),
                youtube_link: z.string().url().optional()
              })),
              gemstones: z.array(z.string()),
              charity: z.array(z.string()),
              poojas: z.array(z.string())
            })),
            behavioral_remedies: z.array(z.object({
              type: z.string(),
              recommendations: z.array(z.string())
            }))
          })
        }),
        temperature: 0.7,
      })
    ]);

    // Build Final Response
    const result = {
      ...basicAnalysis.object,
      kundli_data: kundli_data.kundli,
      ...wealthReport.object,
      fortune_report: {
        company_details: {
          name: "Kriscent Techno Hub Pvt Ltd",
          slogan: "Incredible Think Ahead",
          year: "2014",
          report_name: "Wealth Report",
          astrologer_name: "Kapil Gautam",
          social_media: {
            facebook: { url: "https://www.facebook.com/KriscentTechnoHub", name: "Facebook" },
            twitter: { url: "https://x.com/Kriscent_KTH", name: "X" },
            instagram: { url: "https://www.instagram.com/kriscenttechnohub", name: "Instagram" },
            linkedin: { url: "https://www.linkedin.com/in/kriscent-techno-hub-761a56311", name: "LinkedIn" }
          },
          email: "support@kriscent.in"
        },
      },
      lucky_number: luckyNumber
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