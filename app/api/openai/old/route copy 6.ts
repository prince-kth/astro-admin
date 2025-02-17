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
  timezone: z.string().describe("Timezone of birth place"),
  sunrise_time: z.string().describe("Sunrise time at birth place"),
  sunset_time: z.string().describe("Sunset time at birth place"),
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
  report_name: z.string().describe("Name of the report-Astrology Report"),
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

const monthlyFortuneSchema = z.object({
  month: z.string().describe("Month of the prediction"),
  year: z.string().describe("Year of the prediction"),
  highlights: z.array(z.string()).describe("Key astrological highlights for the month, including planetary transits, aspect influences and their effects on various areas of life. The highlights should be at least 80 words and provide actionable insights to the user"),
  focus_areas: z.object({
    love_relationships: z.string().describe("Love and relationships predictions for the month must be at least 30 words"),
    career_finances: z.string().describe("Career and financial predictions for the month must be at least 30 words, including specific dates for job interviews, promotions, new business opportunities, investment advice, and potential challenges or gains in professional life"),
    health_wellness: z.string().describe("Health and wellness predictions for the month must be at least 30 words"),
    lucky_symbols: z.string().describe(
      "Lucky symbols, <ul>" + 
      "<li> <strong>Lucky Numbers:</strong> [List of numbers] </li>" + 
      "<li> Lucky Colors: [List of colors] </li>" + 
      "<li> Lucky Symbols: [Symbols] </li>" + 
      "</ul>"
    ),
    remedies: z.string().describe("Recommended remedies for the month should be concise and only include the most important suggestions. For example, if a particular month requires a specific donation, chanting, service or affirmation, only mention that. Do not repeat all the suggestions every time. Feeding [animal,birds,fish,...etc]")
  })
});

const fortuneReportSchema = z.object({
  monthly_predictions: z.array(monthlyFortuneSchema),
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

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Validate that we received the kundli data
    if (!body.kundliData) {
      return NextResponse.json({ error: "Kundli data is required" }, { status: 400 });
    }

    const { date_of_birth, time_of_birth, name, kundli_data } = body.kundliData;

    // Break down the analysis into smaller chunks
    const basicAnalysis = await generateObject({
      model: openai('gpt-4o'),
      prompt: `Generate a detailed astrological analysis for ${name}, born on ${date_of_birth} at ${time_of_birth}. 
      Focus on personality traits, core characteristics, and fundamental life patterns based on their birth chart.
      Provide specific insights based on planetary positions and aspects.
      
      Birth Chart Details:
      ${JSON.stringify(kundli_data, null, 2)}`,
      schema: z.object({
        user_details: userDetailsSchema,
        personality_analysis: personalityAnalysisSchema,
      }),
      temperature: 0.7,
    });

    const lifeAreasAnalysis = await generateObject({
      model: openai('gpt-4o'),
      prompt: `Based on the birth chart of ${name} (born ${date_of_birth} at ${time_of_birth}), 
      analyze key life areas including career, wealth, relationships, and health.
      Consider planetary positions, house placements, and aspects to provide detailed predictions and guidance.
      
      Birth Chart Details:
      ${JSON.stringify(kundli_data, null, 2)}`,
      schema: z.object({
        career_and_profession: careerAndProfessionSchema,
        wealth_and_finance: wealthAndFinanceSchema,
        love_and_relationships: loveAndRelationshipsSchema,
        health_and_wellbeing: healthAndWellbeingSchema,
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
        spirituality_and_growth: spiritualityAndGrowthSchema,
        family_and_domestic_life: familyAndDomesticLifeSchema,
      }),
      temperature: 0.7,
    });

    const monthlyPredictions = await generateObject({
      model: openai('gpt-4o'),
      prompt: `Generate detailed monthly predictions for ${name} for the next 12 months.
      Consider current planetary positions, transits, and dashas to provide specific insights and guidance for each month.
      Focus on practical advice and timing of important events.
      
      Birth Chart Details:
      ${JSON.stringify(kundli_data, null, 2)}`,
      schema: z.object({
        monthly_predictions: z.array(monthlyFortuneSchema).length(12),
        // kundali_highlights: z.array(z.string()),
      }),
      temperature: 0.7,
    });

    // Combine all analyses
    const result = {
      ...basicAnalysis.object,
      ...lifeAreasAnalysis.object,
      ...spiritualAndFamilyAnalysis.object,
      fortune_report: {
        monthly_predictions: monthlyPredictions.object.monthly_predictions,
        // kundali_highlights: monthlyPredictions.object.kundali_highlights,
        company_details: {
          name: "Kriscent Techno Hub Pvt Ltd",
          slogan: "Incredible Think Ahead",
          year: "2014",
          report_name: "Astrology Report",
          astrologer_name: "Kapil Gautam"
        }
      }
    };

    // Return the result
    console.log(result);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error generating report:', error);
    return NextResponse.json({ 
      error: "Failed to generate report",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}