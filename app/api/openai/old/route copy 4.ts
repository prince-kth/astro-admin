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
  // about_report: z.string().describe("Description about the report must be at least 350 words")
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
    love_relationships: z.string().describe("Love and relationships predictions for the month must be at least 300 words"),
    career_finances: z.string().describe("Career and financial predictions for the month must be at least 350 words, including specific dates for job interviews, promotions, new business opportunities, investment advice, and potential challenges or gains in professional life"),
    health_wellness: z.string().describe("Health and wellness predictions for the month must be at least 350 words"),
    lucky_symbols: z.string().describe("Lucky symbols, lucky numbers, and lucky colors for the month must be at least 350 words"),
    remedies: z.string().describe("Recommended remedies for the month must be at least 200 words")
  })
});

// const monthlyFortuneSchema = z.object({
//   month: z.string().describe("Month of the prediction"),
//   year: z.string().describe("Year of the prediction"),
//   highlights: z.array(z.string()).describe("Key astrological highlights for the month. Each highlight should provide detailed insights with minimum 100 words covering significant planetary movements, their impacts, and specific dates of importance."),
//   focus_areas: z.object({
//     love_relationships: z.string().describe("Comprehensive analysis of love and relationship dynamics for the month. Should include detailed predictions about romantic prospects, existing relationships, potential challenges and opportunities, and advice for relationship growth. Minimum 150 words."),
    
//     career_finances: z.string().describe("In-depth analysis of career trajectory and financial matters for the month. Should cover job prospects, business opportunities, investment advice, financial planning, and potential challenges or gains in professional life. Minimum 150 words."),
    
//     health_wellness: z.string().describe("Detailed health and wellness forecast for the month. Should include physical health predictions, mental well-being insights, preventive measures, and lifestyle recommendations based on planetary positions. Minimum 150 words."),
    
//     lucky_symbols: z.string().describe("Comprehensive guide to favorable elements for the month including lucky numbers, colors, days, gemstones, and their astrological significance. Should explain how to maximize their positive influence. Minimum 100 words."),
    
//     remedies: z.string().describe("Detailed astrological remedies and solutions for the month. Should include specific rituals, practices, gemstones, donations, and other remedial measures with their purpose and expected benefits. Minimum 150 words.")
//   })
// });

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

    const prompt = `Generate a detailed astrology report for a user based on their birth details and astrology chart. The user's data is provided below. The report should cover various aspects of their life like personality, career, wealth, relationships, health, spirituality, family, and more, based on astrological analysis of the positions of planets, signs, and houses. The report should include accurate insights and interpretations as per traditional astrology principles.\n\nUser Details: \nName: {user_name}\nDate of Birth: {user_dob}\nTime of Birth: {user_time_of_birth}\nPlace of Birth: {user_place_of_birth}\nSun Sign: {user_sun_sign}\nMoon Sign: {user_moon_sign}\nAscendant: {user_ascendant}\n\nNow, provide detailed insights for each section below:\n\n1. Personality Analysis:\n- Sun Sign Analysis: {user_sun_sign}\n- Moon Sign Analysis: {user_moon_sign}\n- Ascendant Analysis: {user_ascendant}\n- Overall Personality: Based on the positions of the Sun, Moon, and Ascendant, describe the individual's core personality traits and tendencies.\n\n2. Career and Profession:\n- Career Path: Provide insights based on the 10th house and key planetary positions affecting career and profession.\n- Dasha Analysis: Analyze the current Dasha and its impact on the user's career path and professional life.\n- Planetary Yogas: Mention any planetary yogas (combinations) that influence the user's career.\n\n3. Wealth and Finance:\n- Wealth Potential: Analyze the 2nd and 11th houses and the planets influencing wealth and financial success.\n- Financial Luck: Provide insights on financial luck based on the user's birth chart.\n- Wealth Score: Offer an analysis of the user's financial future based on their astrological chart.\n\n4. Love and Relationships:\n- Compatibility: Analyze the user's compatibility with others based on their 7th house and Venus placement.\n- Marriage Predictions: Offer predictions about marriage and relationships, considering the placements of Venus and other influencing planets.\n- Venus and Mars Influence: Describe the influence of Venus and Mars on the user's relationships.\n\n5. Health and Wellbeing:\n- Physical Health: Analyze the user's physical health based on the 6th house and any malefic influences.\n- Mental Health: Provide insights into the user's mental health, focusing on the moon, malefic planets, and aspects from the 12th house.\n- Remedies: Suggest remedies for physical and mental health issues based on the chart.\n\n6. Company Details:\n- Name: Provide the name of the company.\n- Slogan: Offer the company slogan or tagline.\n- Year: Mention the establishment year of the company.\n\n7. Spirituality and Growth:\n- Dharma and Life Purpose: Based on the 9th and 12th houses, describe the user's spiritual purpose and growth potential.\n- Karmic Analysis: Analyze any karmic influences in the user's chart and their implications on their life.\n- Guru Influence: Explain the influence of Jupiter and any other spiritual planets on the user's spirituality.\n\n8. Family and Domestic Life:\n- Parenting Style: Describe the user's potential parenting style based on the 4th house and planetary influences.\n- Family Relations: Offer an analysis of the user's family life and relationships.\n- Siblings: Discuss any notable influences on siblings, as indicated in the birth chart.\n\n9. Lucky Periods and Forecast:\n- Current Dasha: Provide insights into the current Dasha and its impact on the user's life.\n- Upcoming Transits: Describe the upcoming planetary transits and how they might affect the user.\n- Annual Forecast: Provide an annual forecast based on current planetary positions.\n\n10. Energy Balance Insights:\n- Elemental Balance: Analyze the balance of the five elements (earth, water, fire, air, ether) in the user's chart.\n- Chakra Analysis: Examine the user's chakra balance based on the planetary influences.\n\n11. Challenges and Remedies:\n- Doshas and Malefic Planets: Identify any doshas (imbalances) and malefic planetary influences.\n- Remedies: Suggest remedies for challenges the user may face based on their birth chart.\n\n12. Fortune Report:\n- Monthly Predictions: Provide a detailed monthly prediction report for the next 12 months.\n- Kundali Highlights: Highlight key points from the kundali analysis.\n- Company Details: Provide company details.\n\nMake sure to personalize each section and provide deep insights based on the user's astrological chart. Do not use placeholders like 'analysis based on planets', provide specific astrological details and personalized interpretations. ${
      JSON.stringify(body.kundliData, null, 2)
    }`;

    console.log(prompt);

    const response = await generateObject({
      model: openai('gpt-4o'),
      prompt: prompt,
      schema: astrologyReportSchema,
      temperature: 1,
    });

    return NextResponse.json(response.object);
  } catch (error) {
    console.error('Error generating astrology report:', error);
    return NextResponse.json({
      error: "Failed to generate astrology report",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}