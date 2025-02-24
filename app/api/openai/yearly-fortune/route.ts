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




const monthlyFortuneSchema = z.object({
  month: z.string().describe("Month of the prediction").refine(
    (month) => ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"].includes(month),
    {
      message: "Month must be a valid month name from January to December"
    }
  ),
  year: z.string().describe("2025"),
  highlights: z.array(z.string()).describe("Key astrological highlights for the month, including planetary transits, aspect influences and their effects on various areas of life. The highlights should be at only 30 words and provide actionable insights to the user"),
  challenging_days: z.array(z.number()).describe("Array of dates (1-31) that are predicted to be challenging in the month"),
  opportunities_days: z.array(z.number()).describe("Array of dates (1-31) that are predicted to bring opportunities in the month"),
  focus_areas: z.object({
    love_relationships: z.string().describe("Love and relationships predictions must be exactly 80 words - no more, no less"),
    career_finances: z.string().describe("Career and financial predictions must be exactly 80 words - no more, no less. Include specific dates for job interviews, promotions, business opportunities, and investment advice"),
    health_wellness: z.string().describe("Health and wellness predictions must be exactly 100 words - no more, no less"),
    lucky_numbers: z.array(z.string()).describe("Lucky numbers for the month"),
    lucky_colors: z.array(z.string()).describe("Lucky colors for the month"),
    lucky_symbols: z.array(z.string()).describe("Lucky symbols for the month"),
    remedies: z.array(z.string()).describe("Remedies must be exactly 80 words in total - no more, no less. Each remedy should be concise and specific to the month's challenges")
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
     
       monthlyPredictions
      ] = await Promise.all([
      generateObject({
        model: openai('gpt-4o'),
        prompt: `Analyze the following birth chart (Kundli) data for ${name}, born on ${dob} at ${time_of_birth} in ${place_of_birth}.
        
        Instructions for Analysis:
        1. Analyze planetary positions:
           - Check each planet's house position, degrees, and status (exalted/debilitated/neutral)
           - Note any retrograde planets and their significance
           - Identify combust planets and their effects
           - Analyze Rashi (zodiac sign) placement and lordship
           - Consider Nakshatra positions and their lords

        2. Special Attention Points:
           - Ascendant position and its aspects
           - Moon sign and its strength (based on degrees and house)
           - Position of major planets (Sun, Moon, Mars, Mercury, Jupiter, Venus, Saturn)
           - Rahu-Ketu axis and its influence
           - Any planetary conjunctions or special yogas

        3. Divisional Charts Analysis:
           - D9 (Navamsa) positions for relationship/marriage insights
           - D10 (Dashamamsa) for career analysis
           - D2, D4, D60 positions for additional depth

        Birth Chart Details:
        ${JSON.stringify(kundli_data.kundli, null, 2)}

        Provide a comprehensive analysis focusing on:
        1. Core personality traits based on Ascendant and key planetary positions
        2. Mental and emotional nature (based on Moon position and aspects)
        3. Career and life direction (based on Sun, Saturn, and 10th house)
        4. Relationship patterns and tendencies
        5. Key strengths and potential challenges
        6. Important planetary periods and their likely effects`,
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
        prompt: `Generate detailed monthly predictions for ${name}, born on ${dob} at ${time_of_birth} in ${place_of_birth}. 
        Analyze the following birth chart positions for accurate monthly transits and predictions.

        Instructions for Monthly Analysis:
        1. Analyze transit effects based on natal positions:
           - Ascendant in ${kundli_data.kundli.Ascendant.rashi} at ${kundli_data.kundli.Ascendant.degrees}°
           - Moon in ${kundli_data.kundli.Moon.rashi} (House ${kundli_data.kundli.Moon.house})
           - Sun in ${kundli_data.kundli.Sun.rashi} (House ${kundli_data.kundli.Sun.house})
           - Other key planets and their house positions
           - Major planetary aspects and conjunctions
           - Relationship between transiting and natal planets
           - Dasha-antardasha periods
           - Special yogas forming during transits

        2. Pay special attention to:
           - Transit over natal positions of major planets
           - Rahu-Ketu axis transits
           - Saturn's transit aspects (sade-sati if applicable)
           - Jupiter's beneficial transits
           - Mars and Venus periods for relationship/career matters

        Requirements:
        1. Generate exactly 12 predictions in chronological order (January first, then February, and so on)
        2. Each month should include:
           - Specific dates and timings for important events based on planetary transits
           - 3-5 challenging days where caution is advised (when malefic planets aspect natal positions)
           - 3-5 opportunity days (when benefic planets form positive aspects)
           - Impact of transiting planets on career, relationships, and health
           - Remedial measures for challenging periods

        3. Focus Areas per Month:
           - Financial opportunities (based on 2nd, 11th house transits)
           - Career developments (based on 10th house and its lord)
           - Relationship matters (based on 7th house and Venus transits)
           - Health and wellbeing (based on 1st, 6th house transits)
           - Personal growth (based on 5th, 9th house aspects)

        Birth Chart Details:
        ${JSON.stringify(kundli_data.kundli, null, 2)}

        Note: All predictions should be based on the interaction between transit planets and these natal positions.`,
        schema: z.object({
          monthly_predictions: z.array(monthlyFortuneSchema).length(12),
        }),
        temperature: 0.7,
      })

     
    ]);

    // Build Final Response
    const result = {
      ...basicAnalysis.object,
      lucky_number: luckyNumber,
      kundli_data: kundli_data.kundli,
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

    console.log( " ⚖ kundli_data",kundli_data)
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
