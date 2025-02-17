// app/api/generate-kundli/route.ts
import { NextRequest, NextResponse } from 'next/server';
import swisseph from 'swisseph';
import { 
  PLANETS, 
  kundliInputSchema, 
  getJulianDay,
  getZodiacSign,
  getNakshatra,
  getDegreeInSign,
  isRetrograde,
  getHouseNumber 
} from '@/utils/kundliUtils';
import type { 
  KundliInput, 
  KundliResponse, 
  PlanetPosition,
  PlanetaryPositions 
} from '@/types/kundli';

// Initialize Swiss Ephemeris
swisseph.swe_set_ephe_path(process.env.EPHE_PATH || './ephemeris');

export async function POST(req: NextRequest): Promise<NextResponse<KundliResponse>> {
  try {
    // Parse and validate input
    const body = await req.json();
    const validatedInput = kundliInputSchema.safeParse(body);

    if (!validatedInput.success) {
      return NextResponse.json({
        success: false,
        error: validatedInput.error.errors[0].message
      }, { status: 400 });
    }

    const input = validatedInput.data as KundliInput;

    // Convert input to Date object
    const birthDateTime = new Date(`${input.dateOfBirth}T${input.timeOfBirth}Z`);
    const julianDay = getJulianDay(birthDateTime);

    // Calculate Ayanamsa
    const ayanamsa = swisseph.swe_get_ayanamsa(julianDay);

    // Calculate houses
    const houses:any = swisseph.swe_houses(
      julianDay,
      input.latitude,
      input.longitude,
      'P'
    );

    if (!houses) {
      throw new Error('Failed to calculate houses');
    }

    // Calculate ascendant
    const ascendant = {
      longitude: (houses.ascendant - ayanamsa + 360) % 360,
      sign: getZodiacSign(houses.ascendant - ayanamsa),
      degree: getDegreeInSign(houses.ascendant - ayanamsa)
    };

    // Calculate planetary positions
    const planetaryPositions: PlanetaryPositions = {};
    
    for (const [planet, code] of Object.entries(PLANETS)) {
      let position: PlanetPosition;

      if (code === -1) { // Special case for Ketu
        const rahuPosition = swisseph.swe_calc_ut(julianDay, PLANETS.RAHU, 1) as any;
        position = {
          longitude: (rahuPosition.longitude + 180) % 360,
          latitude: rahuPosition.latitude,
          distance: rahuPosition.distance,
          speedLong: rahuPosition.longitudeSpeed,
          speedLat: rahuPosition.latitudeSpeed,
          speedDist: rahuPosition.distanceSpeed,
          rflag: rahuPosition.rflag
        };
      } else {
        const calcPosition = swisseph.swe_calc_ut(julianDay, code, 1) as any;
        position = {
          longitude: calcPosition.longitude,
          latitude: calcPosition.latitude,
          distance: calcPosition.distance,
          speedLong: calcPosition.longitudeSpeed,
          speedLat: calcPosition.latitudeSpeed,
          speedDist: calcPosition.distanceSpeed,
          rflag: calcPosition.rflag
        };
      }

      if (!position) {
        throw new Error(`Failed to calculate position for ${planet}`);
      }

      const siderealLong = (position.longitude - ayanamsa + 360) % 360;

      planetaryPositions[planet] = {
        longitude: siderealLong,
        latitude: position.latitude,
        distance: position.distance,
        sign: getZodiacSign(siderealLong),
        nakshatra: getNakshatra(siderealLong),
        house: getHouseNumber(siderealLong, ascendant.longitude),
        degree: getDegreeInSign(siderealLong),
        isRetrograde: isRetrograde(position.speedLong),
        rflag: position.rflag
      };
    }

    // Generate house cusps
    const houseCusps = houses.cusps.map((cusp: number, index: number) => ({
      longitude: (cusp - ayanamsa + 360) % 360,
      sign: getZodiacSign(cusp - ayanamsa),
      degree: getDegreeInSign(cusp - ayanamsa)
    }));

    const kundliData = {
      personalInfo: input,
      astronomicalInfo: {
        julianDay,
        ayanamsa,
        siderealTime: houses.sidereal_time
      },
      birthChart: {
        ascendant,
        houses: houseCusps,
        planets: planetaryPositions
      }
    };

    return NextResponse.json({
      success: true,
      data: kundliData
    });

  } catch (error) {
    console.error('Error generating kundli:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to generate kundli'
    }, { status: 500 });
  }
}