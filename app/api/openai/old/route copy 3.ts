import { NextRequest, NextResponse } from 'next/server';
import { generateObject } from 'ai';
import { openai } from '@ai-sdk/openai';
import { z } from "zod";

// 🟢 User Details Schema
const userDetailsSchema = z.object({
  name: z.string(),
  dob: z.string(),
  time_of_birth: z.string(),
  place_of_birth: z.string(),
  sun_sign: z.string(),
  moon_sign: z.string(),
  ascendant: z.string(),
});

// 🟢 Personality Analysis Schema
const personalityAnalysisSchema = z.object({
  sun_sign: z.string(),
  moon_sign: z.string(),
  ascendant: z.string(),
});

// 🟢 Career and Profession Schema
const careerAndProfessionSchema = z.object({
  career_path: z.string(),
  dasha_analysis: z.object({
    current_dasha: z.string(),
    impact: z.string(),
  }),
  planetary_yogas: z.string(),
});

// 🟢 Wealth and Finance Schema
const wealthAndFinanceSchema = z.object({
  wealth_potential: z.string(),
  financial_luck: z.string(),
  wealth_score: z.number(),
});

// 🟢 Love and Relationships Schema
const loveAndRelationshipsSchema = z.object({
  compatibility: z.string(),
  marriage_predictions: z.string(),
  venus_mars_influence: z.string(),
});

// 🟢 Health and Wellbeing Schema
const healthAndWellbeingSchema = z.object({
  physical_health: z.string(),
  mental_health: z.string(),
  favorable_remedies: z.string(),
});

// 🟢 Company Details Schema
const companyDetailsSchema = z.object({
  name: z.string(),
  slogan: z.string(),
  year: z.string(),
  email: z.string(),
  about_report: z.string(),
});

// 🟢 Monthly Fortune Schema (Updated with Exact Word Limits)
const monthlyFortuneSchema = z.object({
  month: z.string(),
  year: z.string(),
  highlights: z.array(z.string()),
  focus_areas: z.object({
    love_relationships: z.string(),
    career_finances: z.string(),
    health_wellness: z.string(),
    lucky_symbols: z.string(),
    remedies: z.string(),
  }),
});

// 🟢 Fortune Report Schema
const fortuneReportSchema = z.object({
  monthly_predictions: z.array(monthlyFortuneSchema),
  kundali_highlights: z.array(z.string()),
  company_details: companyDetailsSchema,
});

// 🟢 Astrology Report Schema
const astrologyReportSchema = z.object({
  user_details: userDetailsSchema,
  personality_analysis: personalityAnalysisSchema,
  career_and_profession: careerAndProfessionSchema,
  wealth_and_finance: wealthAndFinanceSchema,
  love_and_relationships: loveAndRelationshipsSchema,
  health_and_wellbeing: healthAndWellbeingSchema,
  company_details: companyDetailsSchema,
  fortune_report: fortuneReportSchema,
});

// 🟢 Function to Enforce Word Limits
function enforceWordLimit(text: string, requiredWords: number): string {
  const words = text.trim().split(/\s+/);
  if (words.length !== requiredWords) {
    return regenerateText(requiredWords);
  }
  return text;
}

// 🟢 Dummy Regeneration Function (Replace with AI call if needed)
function regenerateText(requiredWords: number): string {
  return `This section needs to have exactly ${requiredWords} words but was incorrect. Please regenerate it.`;
}

// 🟢 Main API Handler
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body.kundliData) {
      return NextResponse.json({ error: "Kundli data is required" }, { status: 400 });
    }

    // 🔥 Updated Prompt with Strict Word Limits
    const prompt = `
      Generate a detailed astrology report with strict word limits:
      
      - "About Report" must be **exactly 350 words**.
      - Each "Monthly Highlight" must be **exactly 30 words**.
      - Each "Focus Area" (Love, Career, Health, Lucky Symbols, Remedies) must be **exactly 20 words**.

      If any section does not match this word limit, **automatically regenerate** that section until it is correct.
      
      User Data: ${JSON.stringify(body.kundliData, null, 2)}
    `;

    console.log(prompt);

    // 🔥 Generate Report with OpenAI
    const response = await generateObject({
      model: openai('gpt-4o'),
      prompt: prompt,
      schema: astrologyReportSchema,
      temperature: 1,
    });

    // 🔥 Post-Processing to Ensure Word Limits
    const finalResponse = {
      ...response.object,
      fortune_report: {
        ...response.object.fortune_report,
        monthly_predictions: response.object.fortune_report.monthly_predictions.map((month) => ({
          ...month,
          highlights: month.highlights.map((highlight) => enforceWordLimit(highlight, 30)),
          focus_areas: {
            love_relationships: enforceWordLimit(month.focus_areas.love_relationships, 20),
            career_finances: enforceWordLimit(month.focus_areas.career_finances, 20),
            health_wellness: enforceWordLimit(month.focus_areas.health_wellness, 20),
            lucky_symbols: enforceWordLimit(month.focus_areas.lucky_symbols, 20),
            remedies: enforceWordLimit(month.focus_areas.remedies, 20),
          },
        })),
      },
    };

    return NextResponse.json(finalResponse);
  } catch (error) {
    console.error('Error generating astrology report:', error);
    return NextResponse.json({
      error: "Failed to generate astrology report",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}
