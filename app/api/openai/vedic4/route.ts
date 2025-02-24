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
    console.log("✅✅ kundali_data:", kundli_data);

    // Calculate lucky number
    const luckyNumber = calculateLuckyNumber(dob);
    console.log("🔍 Lucky number:", luckyNumber);

    // Run all async operations in parallel
    const [basicAnalysis,
      vedic4Analysis
    ] = await Promise.all([
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
        prompt: `
      Generate a detailed Vedic 4 (Purushartha) analysis for ${name} based strictly on the provided birth details and planetary positions.
      
      ### Birth Information:
      - Date: ${dob}
      - Time: ${time_of_birth}
      - Place: ${place_of_birth}
      - Coordinates: ${latitude}, ${longitude}
      - Timezone: ${timezone}
      
      ### **Birth Chart (From kundli_data.kundli)**
      Below is the exact birth chart extracted from **kundli_data.kundli** (DO NOT assume or modify):
      
      ${JSON.stringify(kundli_data.kundli, null, 2)}
      
      ### **Analysis Instructions**
      Analyze the Purushartha (Dharma, Artha, Kama, Moksha) **STRICTLY** based on the provided birth chart data. Follow these steps:
      
      1️⃣ **DHARMA (Life Purpose)**
         - **Houses:** 1st, 5th, 9th  
         - **Data Source:** Use house lords, planets, nakshatra from kundli_data.kundli  
         - **Jupiter’s impact** (use exact placement from kundli_data.kundli)  
         - **Challenges & remedies** based on planetary alignments  
      
      2️⃣ **ARTHA (Wealth & Career)**
         - **Houses:** 2nd, 6th, 10th  
         - **Data Source:** Use kundli_data.kundli planetary placements  
         - **Dhan yoga & Raja yoga analysis** (use planets from kundli_data.kundli)  
         - **Career & financial potential based on houses & aspects**  
      
      3️⃣ **KAMA (Desires & Relationships)**
         - **Houses:** 3rd, 7th, 11th  
         - **Data Source:** Venus, Mars, and house lords from kundli_data.kundli  
         - **Marriage, relationships & desires analysis from planetary aspects**  
         - **Challenges & remedies for better relationship harmony**  
      
      4️⃣ **MOKSHA (Spiritual Growth)**
         - **Houses:** 4th, 8th, 12th  
         - **Data Source:** Ketu’s placement, Jupiter-Saturn impact from kundli_data.kundli  
         - **Spiritual tendencies & life lessons from kundli_data.kundli**  
         - **Best spiritual path & remedies for enlightenment**  
      
      ### **🚀 Important Guidelines**
      ✅ **Use kundli_data.kundli EXACTLY** – NO assumptions.  
      ✅ **Provide exact house, rashi, nakshatra details for each planet.**  
      ✅ **Mention real yogas & planetary alignments.**  
      ❌ **DO NOT modify planetary placements – use them as they are.**  
      ❌ **DO NOT assume planetary aspects – extract from kundli_data.kundli.**  
      
      ---
      Now generate the Vedic 4 (Purushartha) analysis based strictly on the given kundli_data.kundli.  
        `,
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
          dharma: z.object({
            lord: z.string(),
            placement: z.string(),
            nakshatra: z.string(),
            life_purpose: z.array(z.string()),
            nakshatra_influence: z.string().min(100, 'Please provide a more detailed influence of the nakshatra on dharma.'),
            challenges: z.array(z.string()).min(2, 'Please provide at least 2 challenges for dharma.'),
            alignment_tips: z.array(z.string()).min(2, 'Please provide at least 2 alignment tips for dharma.'),
          }),
          artha: z.object({
            lord: z.string(),
            placement: z.string(),
            nakshatra: z.string(),
            wealth_creation_path: z.string().min(100, 'Please provide a more detailed wealth creation path for artha.'),
            nakshatra_influence: z.string().min(100, 'Please provide a more detailed influence of the nakshatra on artha.'),
            career_paths: z.array(z.string()).min(2, 'Please provide at least 2 suitable career paths for artha.'),
            challenges: z.array(z.string()).min(2, 'Please provide at least 2 challenges for artha.'),
            enhancement_tips: z.array(z.string()).min(2, 'Please provide at least 2 enhancement tips for artha.'),
          }),
          kama: z.object({
            lord: z.string(),
            placement: z.string(),
            nakshatra: z.string(),
            desires_analysis: z.string().min(100, 'Please provide a more detailed analysis of desires and fulfillment.'),
            nakshatra_influence: z.string().min(100, 'Please provide a more detailed influence of the nakshatra on kama.'),
            fulfillment_methods: z.array(z.string()),
            challenges: z.array(z.string()).min(2, 'Please provide at least 2 challenges for kama.'),
            balance_tips: z.array(z.string()).min(2, 'Please provide at least 2 balance tips for kama.'),
          }),
          moksha: z.object({
            lord: z.string(),
            placement: z.string(),
            nakshatra: z.string(),
            peace_source: z.string().min(100, 'Please provide a more detailed source of mental peace.'),
            nakshatra_influence: z.string().min(100, 'Please provide a more detailed influence of the nakshatra on spiritual growth.'),
            spiritual_path: z.array(z.string()),
            challenges: z.array(z.string()),
            spiritual_tips: z.array(z.string()).min(1, 'Please provide at least 1 spiritual tips for moksha.')
          })
        }),
        temperature: 0.7,
      })
      
    ]);

    // Build Final Response
    const result = {
      ...basicAnalysis.object,
      // ...lucky13Analysis.object,
      // lucky_number: luckyNumber,
      // ...spiritualAndFamilyAnalysis.object,
      ...vedic4Analysis.object,
      fortune_report: {
        company_details: {
          name: "Kriscent Techno Hub Pvt Ltd",
          slogan: "Incredible Think Ahead",
          year: "2014",
          report_name: "Vedic 4 Report",
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
