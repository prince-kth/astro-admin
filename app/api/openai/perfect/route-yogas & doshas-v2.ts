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

      yogasDoshasReport
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



      // Generate Yogas & Doshas Report
      generateObject({
        model: openai('gpt-4o'),
        prompt: `Analyze the birth chart and provide a detailed report for  ${name}, born on ${dob} at ${time_of_birth} in ${place_of_birth}.. Include all of the following sections with complete information:

For Doshas analysis, ensure that:
1. Financial Doshas (Must include all of these for each dosha):
   - Name (all must be: Kaal Sarp Dosha, Kemadruma Dosha, Daridra Yoga, Neecha Graha)
   - Presence (true/false)
   - Severity (must be specified even if not present)
   - Impact Areas (at least one area)
   - Effects on: Career, Wealth, and Mental Peace (all must be described)
   - Remedies (must be specified)

2. Relationship Doshas (Must include all of these for each dosha):
   - Name (all must be: Manglik Dosha, Shrapit Dosha, Kuja Dosha)
   - Presence (true/false)
   - Severity (must be specified even if not present)
   - Karmic Significance (must be described)
   - Effects on: Marriage, Family Life, and Relationships (all must be described)
   - Remedies (must be specified)

3. Health Doshas (Must include all of these for each dosha):
   - Name (all must be: Grahan Dosha, Pitru Dosha, Chandra Dosha)
   - Presence (true/false)
   - Severity (must be specified even if not present)
   - Effects on: Mental Health, Physical Health, and Emotional Stability (all must be described)
   - Karmic Impact (must be described)
   - Remedies (must be specified)

Important: Every field must be filled with meaningful content. Do not leave any field empty or with placeholder text. For doshas that are not present, still provide detailed information about what their presence would mean and potential remedies.

        Birth Chart Details:
        ${JSON.stringify(kundli_data, null, 2)}
        
        Focus on providing detailed insights about:
        1. Birth Chart Overview
        2. Yogas (Dhana, Raja, and Spiritual)
        3. Doshas (Financial, Relationship, Health)
        4. Remedies and Solutions
        5. Action Plan for Growth
        
        Provide specific details about temple locations and deities for remedies.`,
        schema: z.object({
          introduction: z.object({
            importance: z.string(),
            key_concepts: z.array(z.string()),
            report_benefits: z.array(z.string())
          }),
          birth_chart_overview: z.object({
            key_planetary_positions: z.array(z.object({
              planet: z.string(),
              position: z.string(),
              influence: z.string()
            })),
            strong_houses: z.array(z.string()),
            weak_houses: z.array(z.string()),
            ascendant_analysis: z.string(),
            moon_sign_analysis: z.string(),
            karaka_planets: z.object({
              atmakaraka: z.string(),
              amatyakaraka: z.string(),
              significance: z.string()
            })
          }),
          yogas: z.object({
            dhana_yogas: z.array(z.object({
              name: z.string(),
              presence: z.boolean(),
              strength: z.string(),
              impact: z.string(),
              activation_period: z.string()
            })),
            raja_yogas: z.array(z.object({
              name: z.string(),
              presence: z.boolean(),
              strength: z.string(),
              impact: z.string(),
              manifestation_areas: z.array(z.string())
            })),
            spiritual_yogas: z.array(z.object({
              name: z.string(),
              presence: z.boolean(),
              significance: z.string(),
              karmic_implications: z.string()
            }))
          }),
          doshas: z.object({
            financial_doshas: z.array(z.object({
              name: z.enum(['Kaal Sarp Dosha', 'Kemadruma Dosha', 'Daridra Yoga', 'Neecha Graha']),
              presence: z.boolean(),
              severity: z.string().min(1, "Severity must not be empty"),
              impact_areas: z.array(z.string().min(1, "Impact area must not be empty")).min(1, "At least one impact area is required"),
              effects: z.object({
                career: z.string().min(1, "Career effect must not be empty"),
                wealth: z.string().min(1, "Wealth effect must not be empty"),
                mental_peace: z.string().min(1, "Mental peace effect must not be empty")
              }),
              remedies: z.string().min(1, "Remedies must not be empty")
            })).min(4, "All financial doshas must be present"),

            relationship_doshas: z.array(z.object({
              name: z.enum(['Manglik Dosha', 'Shrapit Dosha', 'Kuja Dosha']),
              presence: z.boolean(),
              severity: z.string().min(1, "Severity must not be empty"),
              karmic_significance: z.string().min(1, "Karmic significance must not be empty"),
              effects: z.object({
                marriage: z.string().min(1, "Marriage effect must not be empty"),
                family_life: z.string().min(1, "Family life effect must not be empty"),
                relationships: z.string().min(1, "Relationships effect must not be empty")
              }),
              remedies: z.string().min(1, "Remedies must not be empty")
            })).min(3, "All relationship doshas must be present"),

            health_doshas: z.array(z.object({
              name: z.enum(['Grahan Dosha', 'Pitru Dosha', 'Chandra Dosha']),
              presence: z.boolean(),
              severity: z.string().min(1, "Severity must not be empty"),
              effects: z.object({
                mental_health: z.string().min(1, "Mental health effect must not be empty"),
                physical_health: z.string().min(1, "Physical health effect must not be empty"),
                emotional_stability: z.string().min(1, "Emotional stability effect must not be empty")
              }),
              karmic_impact: z.string().min(1, "Karmic impact must not be empty"),
              remedies: z.string().min(1, "Remedies must not be empty")
            })).min(3, "All health doshas must be present")
          }),
          remedies: z.object({
            planetary_remedies: z.array(z.object({
              type: z.string(),
              recommendations: z.array(z.string()),
              temples: z.array(z.object({
                name: z.string(),
                location: z.string(),
                deity: z.string(),
                significance: z.string()
              }))
            })),
            vedic_rituals: z.array(z.object({
              name: z.string(),
              purpose: z.string(),
              procedure: z.string(),
              timing: z.string(),
              benefits: z.array(z.string())
            })),
            lifestyle_practices: z.array(z.object({
              category: z.string(),
              recommendations: z.array(z.string()),
              frequency: z.string(),
              expected_benefits: z.string()
            }).array())
          }),
          action_plan: z.object({
            immediate_actions: z.array(z.string()),
            long_term_strategy: z.array(z.string()),
            auspicious_timings: z.array(z.object({
              activity: z.string(),
              suitable_period: z.string(),
              reason: z.string()
            })),
            dasha_analysis: z.object({
              current_dasha: z.string(),
              favorable_periods: z.array(z.string()),
              challenging_periods: z.array(z.string()),
              recommendations: z.array(z.string())
            })
          })
        }),
        temperature: 0.7,
      })
    ]);

    // Build Final Response
    const result = {
      ...basicAnalysis.object,

      kundli_data: kundli_data.kundli,
      ...yogasDoshasReport.object,
      fortune_report: {
        company_details: {
          name: "Kriscent Techno Hub Pvt Ltd",
          slogan: "Incredible Think Ahead",
          year: "2014",
          report_name: "Yogas & Doshas: Chart Secrets Unveiled",
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
