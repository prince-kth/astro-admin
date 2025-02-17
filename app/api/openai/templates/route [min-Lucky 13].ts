import { NextRequest, NextResponse } from 'next/server';
import { generateObject } from 'ai';
import { openai } from '@ai-sdk/openai';
import { z } from "zod";

const userDetailsSchema = z.object({
  name: z.string().describe("The full name of the person"),
  dob: z.string().describe("Date of birth in YYYY-MM-DD format"),
  time_of_birth: z.string().describe("Time of birth in 24-hour format (HH:MM)"),
  place_of_birth: z.string().describe("City and country of birth"),
  sun_sign: z.string().describe("Zodiac sun sign based on birth date"),
  moon_sign: z.string().describe("Zodiac moon sign based on birth time and location"),
  ascendant: z.string().describe("Rising sign/ascendant based on birth time and location"),
  latitude: z.string().describe("Latitude of birth place"),
  longitude: z.string().describe("Longitude of birth place"),
  timezone: z.string().describe("Asia/Kolkata Time Zone"),
  sunrise_time: z.string().describe("Consider atmospheric refraction and the observer's location to calculate sunrise timings based on the given coordinates. Provide the local time in HH:MM format"),
  sunset_time: z.string().describe("Consider atmospheric refraction and the observer's location to calculate sunset timings based on the given coordinates. Provide the local time in HH:MM format"),
  ayanamsa: z.string().describe("Ayanamsa system used"),
  chart_image: z.string().optional().describe("URL or base64 of the birth chart image")
});

const personalityAnalysisSchema = z.object({
  sun_sign: z.string().describe("Analysis of personality traits based on sun sign"),
  moon_sign: z.string().describe("Analysis of emotional nature based on moon sign"),
  ascendant: z.string().describe("Analysis of outward personality and physical appearance based on ascendant"),
});

const dashaAnalysisSchema = z.object({
  current_dasha: z.string().describe("Current planetary period and its duration"),
  impact: z.string().describe("Impact and influence of the current dasha period"),
});

const careerAndProfessionSchema = z.object({
  career_path: z.string().describe("Career prospects and suitable professional paths"),
  dasha_analysis: dashaAnalysisSchema,
  planetary_yogas: z.string().describe("Auspicious planetary combinations affecting career"),
});

const wealthAndFinanceSchema = z.object({
  wealth_potential: z.string().describe("Analysis of wealth accumulation potential"),
  financial_luck: z.string().describe("Periods of financial gains and losses"),
  wealth_score: z.number().describe("Numerical score indicating overall wealth prospects (1-10)"),
});

const loveAndRelationshipsSchema = z.object({
  compatibility: z.string().describe("Relationship compatibility with different zodiac signs"),
  marriage_predictions: z.string().describe("Timing and nature of marriage prospects"),
  venus_mars_influence: z.string().describe("Impact of Venus and Mars on romantic life"),
});

const healthAndWellbeingSchema = z.object({
  physical_health: z.string().describe("Analysis of physical health and potential concerns"),
  mental_health: z.string().describe("Analysis of mental well-being and emotional balance"),
  favorable_remedies: z.string().describe("Recommended remedies for health improvement"),
});

const companyDetailsSchema = z.object({
  name: z.string().describe("Name of the company-Kriscent Techno Hub Pvt Ltd"),
  slogan: z.string().describe("Company slogan or tagline- Incredible Think Ahead"),
  year: z.string().describe("Establishment year of the company-2014"),
  social_media: z.object({
    facebook: z.string().describe("https://www.facebook.com/KriscentTechnoHub"),
    twitter: z.string().describe("https://x.com/Kriscent_KTH"),
    instagram: z.string().describe("https://www.instagram.com/kriscenttechnohub"),
    linkedin: z.string().describe("https://www.linkedin.com/in/kriscent-techno-hub-761a56311")
  }),
  email: z.string().describe("Company email address-support@kriscent.in"),
  report_name: z.string().describe("Name of the report-Lucky 13 Report"),
  astrologer_name: z.string().describe("Name of the astrologer-Kapil Gautam"),
  address: z.string().describe("Company address"),
  phone: z.string().describe("Company phone number"),
  website: z.string().describe("Company website")
});

const spiritualityAndGrowthSchema = z.object({
  dharma_and_life_purpose: z.string().describe("Analysis of life purpose and spiritual path"),
  karmic_analysis: z.string().describe("Past life influences and karmic debts"),
  guru_influence: z.string().describe("Spiritual guidance and teacher influences"),
});

const familyAndDomesticLifeSchema = z.object({
  parenting_style: z.string().describe("Natural parenting approach and abilities"),
  family_relations: z.string().describe("Dynamics with family members and domestic harmony"),
  siblings: z.string().describe("Relationship with siblings and their influence"),
});

const luckyPeriodsAndForecastSchema = z.object({
  current_dasha: z.string().describe("Current planetary period and its significance"),
  upcoming_transits: z.string().describe("Important planetary movements and their effects"),
  annual_forecast: z.string().describe("Yearly prediction of major life events"),
});

const energyBalanceInsightsSchema = z.object({
  elemental_balance: z.string().describe("Distribution and balance of elemental energies"),
  chakra_analysis: z.string().describe("State and alignment of major energy centers"),
});

const challengesAndRemediesSchema = z.object({
  doshas_and_malefic_planets: z.string().describe("Challenging planetary positions and their effects"),
  remedies: z.string().describe("Suggested solutions for planetary difficulties"),
});

// const monthlyFortuneSchema = z.object({
//   month: z.string().describe("Month of the prediction").refine(
//     (month) => ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"].includes(month),
//     {
//       message: "Month must be a valid month name from January to December"
//     }
//   ),
//   year: z.string().describe("2025"),
//   highlights: z.array(z.string()).describe("Key astrological highlights for the month, including planetary transits, aspect influences and their effects on various areas of life. The highlights should be at only 30 words and provide actionable insights to the user"),
//   focus_areas: z.object({
//     love_relationships: z.string().describe("Love and relationships predictions for the month must be at least 30 words"),
//     career_finances: z.string().describe("Career and financial predictions for the month must be at least 30 words, including specific dates for job interviews, promotions, new business opportunities, investment advice, and potential challenges or gains in professional life"),
//     health_wellness: z.string().describe("Health and wellness predictions for the month must be at least 30 words"),
//     lucky_numbers: z.array(z.string()).describe("Lucky numbers for the month"),
//     lucky_colors: z.array(z.string()).describe("Lucky colors for the month"),
//     lucky_symbols: z.array(z.string()).describe("Lucky symbols for the month"),
//     remedies: z.array(z.string()).describe("Array of recommended remedies for the month. Each remedy should be concise and specific to the month's challenges must be at least 30 words")
//   })
// })

const fortuneReportSchema = z.object({
  // monthly_predictions: z.array(monthlyFortuneSchema),
  kundali_highlights: z.array(z.string()).describe("Key highlights from the kundali analysis"),
  company_details: companyDetailsSchema
});

const astrologyReportSchema = z.object({
  user_details: userDetailsSchema,
  personality_analysis: personalityAnalysisSchema,
  career_and_profession: careerAndProfessionSchema,
  wealth_and_finance: wealthAndFinanceSchema,
  love_and_relationships: loveAndRelationshipsSchema,
  health_and_wellbeing: healthAndWellbeingSchema,
  company_details: companyDetailsSchema,
  spirituality_and_growth: spiritualityAndGrowthSchema,
  family_and_domestic_life: familyAndDomesticLifeSchema,
  lucky_periods_and_forecast: luckyPeriodsAndForecastSchema,
  energy_balance_insights: energyBalanceInsightsSchema,
  challenges_and_remedies: challengesAndRemediesSchema,
  fortune_report: fortuneReportSchema
});

const lucky13Schema = z.object({
  colour: z.array(z.string()).describe("Lucky colors including Gold, Yellow, Orange, Orange-ish Red"),
  number: z.number().describe("Lucky number"),
  day: z.string().describe("Lucky day of the week"),
  month: z.array(z.string()).describe("Lucky months"),
  career: z.array(z.string()).describe("Suitable career paths"),
  car_brand: z.string().describe("Lucky car brands with sounds 'Ma, Me, Mu, Mi'"),
  bank: z.string().describe("Lucky bank names with sounds 'Ga, Gi, Gu, Ge'"),
  jewellery_metal: z.array(z.string()).describe("Lucky metals for jewellery"),
  gemstones: z.array(z.string()).describe("Lucky gemstones"),
  food: z.array(z.string()).describe("Lucky food items"),
  symbols: z.array(z.string()).describe("Lucky symbols"),
  animal: z.array(z.string()).describe("Lucky animals"),
  exercise_type: z.array(z.string()).describe("Recommended exercise types")
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Log the incoming request data
    console.log('Received request data in /api/openai:', {
      name: body.kundliData.name,
      dob: body.kundliData.dob,
      time_of_birth: body.kundliData.time_of_birth,
      place_of_birth: body.kundliData.place_of_birth,
      sun_sign: body.kundliData.sun_sign,
      moon_sign: body.kundliData.moon_sign,
      ascendant: body.kundliData.ascendant,
      latitude: body.kundliData.latitude,
      longitude: body.kundliData.longitude,
      timezone: body.kundliData.timezone,
      sunrise_time: body.kundliData.sunrise_time,
      sunset_time: body.kundliData.sunset_time,
      ayanamsa: body.kundliData.ayanamsa,
    });

    // Validate that we received the kundli data
    if (!body.kundliData) {
      return NextResponse.json({ error: "Kundli data is required" }, { status: 400 });
    }

    const { date_of_birth, time_of_birth, name, kundli_data, timezone, place_of_birth, latitude, longitude } = body.kundliData;

    // Break down the analysis into smaller chunks
    const basicAnalysis = await generateObject({
      model: openai('gpt-4o'),
      prompt: `Generate a detailed astrological analysis for ${name}, born on ${date_of_birth} at ${time_of_birth} in ${place_of_birth} (latitude: ${latitude}, longitude: ${longitude}) with timezone ${timezone}. 
      Focus on personality traits, core characteristics, and fundamental life patterns based on their birth chart.
      Provide specific insights based on planetary positions and aspects.
      
      Birth Chart Details:
      ${JSON.stringify(kundli_data, null, 2)}`,
      schema: z.object({
        user_details: userDetailsSchema,
      }),
      temperature: 0.7,
    });

    const lucky13Analysis = await generateObject({
      model: openai('gpt-4o'),
      prompt: `Generate a Lucky 13 report for ${name}, born on ${date_of_birth} at ${time_of_birth} in ${place_of_birth} (latitude: ${latitude}, longitude: ${longitude}) with timezone ${timezone}. 
      Focus on personality traits, core characteristics, and fundamental life patterns based on their birth chart.
      Provide specific insights based on planetary positions and aspects.
      
      Birth Chart Details:
      ${JSON.stringify(kundli_data, null, 2)}`,
      schema: z.object({
       lucky_13: lucky13Schema
      }),
      temperature: 0.7,
    });

    const spiritualAndFamilyAnalysis = await generateObject({
      model: openai('gpt-4o'),
      prompt: `Analyze the spiritual path and family dynamics for ${name} based on their birth chart.
      Consider house positions, planetary aspects, and yogas to provide insights into their spiritual journey and family relationships.
      
      Birth Chart Details:
      ${JSON.stringify(kundli_data, null, 2)}`,
      schema: z.object({
        // spirituality_and_growth: spiritualityAndGrowthSchema,
        // family_and_domestic_life: familyAndDomesticLifeSchema,
      }),
      temperature: 0.7,
    });




    // const monthlyPredictions = await generateObject({
    //   model: openai('gpt-4o'),
    //   prompt: `Generate detailed monthly predictions for ${name}, born on ${date_of_birth} at ${time_of_birth} in ${place_of_birth} (latitude: ${latitude}, longitude: ${longitude}) with timezone ${timezone}. 
    //    for all 12 months of the year (January to December).
    //   Each prediction should be specific to the calendar month, starting from January and ending in December.
      
    //   Requirements:
    //   1. Generate exactly 12 predictions in chronological order (January first, then February, and so on)
    //   2. Each month should include specific dates and timings for important events
    //   3. Consider planetary positions, transits, and dashas for accurate monthly predictions
    //   4. Focus on practical advice and timing of important events
    //   5. Monthly highlights should be exactly 50 words, no more or no less

    //   Birth Chart Details:
    //   ${JSON.stringify(kundli_data, null, 2)}`,
    //   schema: z.object({
    //     monthly_predictions: z.array(monthlyFortuneSchema).length(12),
    //     // kundali_highlights: z.array(z.string()),
    //   }),
    //   temperature: 0.7,
    // });

    // Combine all analyses
    const result = {
      ...basicAnalysis.object,
      ...lucky13Analysis.object,
      ...spiritualAndFamilyAnalysis.object,
      fortune_report: {
        // monthly_predictions: monthlyPredictions.object.monthly_predictions,
        // kundali_highlights: monthlyPredictions.object.kundali_highlights,
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
          email: "support@kriscent.in",

        }
      }
    };

    // Return the result
    console.log(JSON.stringify(result, null, 2));
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error generating report:', error);
    return NextResponse.json({
      error: "Failed to generate report",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}