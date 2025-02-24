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
    const [basicAnalysis, wealthScoreReport,
      //  yogasDoshasReport
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
        Generate a comprehensive wealth score report for ${name}, born on ${dob} at ${time_of_birth} in ${place_of_birth}.
        Use the following birth chart details and divisional charts:
        ${JSON.stringify(kundli_data, null, 2)}
        
        Analyze all aspects mentioned in the report structure including:
        - Financial indicators in birth chart
        - Wealth-bearing yogas
        - Divisional chart analysis (D1, D2, D4, D9, D10, D60)
        - Wealth score calculation
        - Remedies and manifestation practices
        `,
        schema: z.object({
          introduction: z.object({
            purpose: z.string(),
            methodology: z.string(),
            vedic_astrology_principles: z.array(z.string())
          }),
          client_info: z.object({
            name: z.string(),
            birth_details: z.object({
              date: z.string(),
              time: z.string(),
              place: z.string(),
              coordinates: z.object({
                latitude: z.number(),
                longitude: z.number()
              })
            }),
            birth_chart_analysis: z.object({
              planets: z.array(z.object({
                name: z.string(),
                position: z.object({
                  house: z.number(),
                  degree: z.number(),
                  nakshatra: z.string()
                })
              })),
              current_dasha: z.object({
                mahadasha: z.string(),
                antardasha: z.string(),
                pratyantar_dasha: z.string()
              })
            })
          }),
          financial_indicators: z.object({
            key_houses: z.array(z.object({
              house_number: z.number(),
              significance: z.string(),
              lord: z.string(),
              placement: z.string(),
              aspects: z.array(z.string()),
              strength: z.number(),
              prediction: z.string()
            })),
            wealth_yogas: z.array(z.object({
              name: z.string(),
              formation: z.string(),
              strength: z.number(),
              impact: z.string()
            }))
          }),
          divisional_charts: z.object({
            d1_analysis: z.object({
              long_term_wealth: z.string(),
              wealth_indicators: z.array(z.string()),
              challenges: z.array(z.string()),
              rating: z.number(),
              chart_explanation: z.string().min(30, 'Please provide a detailed explanation of the D1 chart analysis (minimum 30 words)')
            }),
            d2_analysis: z.object({
              wealth_stability: z.string(),
              financial_strength: z.string(),
              rating: z.number(),
              chart_explanation: z.string().min(30, 'Please provide a detailed explanation of the D2 chart analysis (minimum 30 words)')
            }),
            d4_analysis: z.object({
              property_potential: z.string(),
              real_estate_prospects: z.string(),
              rating: z.number(),
              chart_explanation: z.string().min(30, 'Please provide a detailed explanation of the D4 chart analysis (minimum 30 words)')
            }),
            d9_analysis: z.object({
              long_term_wealth: z.string(),
              fortune_indicators: z.array(z.string()),
              rating: z.number(),
              chart_explanation: z.string().min(30, 'Please provide a detailed explanation of the D9 chart analysis (minimum 30 words)')
            }),
            d10_analysis: z.object({
              career_wealth: z.string(),
              professional_growth: z.string(),
              rating: z.number(),
              chart_explanation: z.string().min(30, 'Please provide a detailed explanation of the D10 chart analysis (minimum 30 words)')
            }),
            d60_analysis: z.object({
              karmic_wealth: z.string(),
              past_life_influences: z.string(),
              rating: z.number(),
              chart_explanation: z.string().min(30, 'Please provide a detailed explanation of the D60 chart analysis (minimum 30 words)')
            })
          }),
          wealth_score: z.object({
            total_score: z.number(),
            category_scores: z.array(z.object({
              category: z.string(),
              weightage: z.number(),
              score: z.number(),
              interpretation: z.string()
            })),
            interpretation: z.object({
              tier: z.string(),
              description: z.string(),
              potential: z.string()
            })
          }),
          remedies: z.object({
            planetary_remedies: z.array(z.object({
              planet: z.string(),
              gemstone: z.object({
                name: z.string(),
                wearing_instructions: z.string()
              }),
              mantras: z.array(z.object({
                mantra: z.string(),
                repetitions: z.number(),
                youtube_link: z.string().optional()
              })),
              charity: z.array(z.string()),
              temples: z.array(z.string())
            })),
            behavioral_remedies: z.array(z.object({
              category: z.string(),
              practices: z.array(z.string()),
              affirmations: z.array(z.string())
            })),
            manifestation_practices: z.array(z.object({
              practice: z.string(),
              frequency: z.string(),
              instructions: z.string()
            }))
          }),
          career_recommendations: z.array(z.object({
            field: z.string(),
            suitability_score: z.number(),
            reasoning: z.string(),
            best_timing: z.string()
          }))
        }),
        temperature: 0.7
      }),



     
    ]);

    // Build Final Response
    const result = {
      ...basicAnalysis.object,
      wealth_score_report: wealthScoreReport.object,
      kundli_data: kundli_data.kundli,
      fortune_report: {
        company_details: {
          name: "Kriscent Techno Hub Pvt Ltd",
          slogan: "Incredible Think Ahead",
          year: "2014",
          report_name: "Comprehensive Wealth Score Report",
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
