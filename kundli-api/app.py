from skyfield.api import load, Topos
from datetime import datetime
import pytz
from math import degrees
from flask import Flask, request, jsonify
from flask_cors import CORS
import swisseph as swe

app = Flask(__name__)
CORS(app)

# Load planetary data
eph = load('de421.bsp')
planets = {
    'Sun': eph['sun'],
    'Moon': eph['moon'],
    'Mercury': eph['mercury'],
    'Venus': eph['venus'],
    'Mars': eph['mars'],
    'Jupiter': eph['jupiter barycenter'],
    'Saturn': eph['saturn barycenter']
}

# Mapping of Sanskrit Rashis to English names
RASHI_TRANSLATION = {
    'Mesha': 'Aries',
    'Vrishabha': 'Taurus',
    'Mithuna': 'Gemini',
    'Karka': 'Cancer',
    'Simha': 'Leo',
    'Kanya': 'Virgo',
    'Tula': 'Libra',
    'Vrishchika': 'Scorpio',
    'Dhanu': 'Sagittarius',
    'Makara': 'Capricorn',
    'Kumbha': 'Aquarius',
    'Meena': 'Pisces'
}

# Mapping of Rashis to their numbers
ZODIAC_TO_NUMBER = {
    'Aries': 1,
    'Taurus': 2,
    'Gemini': 3,
    'Cancer': 4,
    'Leo': 5,
    'Virgo': 6,
    'Libra': 7,
    'Scorpio': 8,
    'Sagittarius': 9,
    'Capricorn': 10,
    'Aquarius': 11,
    'Pisces': 12
}

# Mapping of Rashis and their lords (using English names)
rashis = {
    'Aries': {'lord': 'Mars'},
    'Taurus': {'lord': 'Venus'},
    'Gemini': {'lord': 'Mercury'},
    'Cancer': {'lord': 'Moon'},
    'Leo': {'lord': 'Sun'},
    'Virgo': {'lord': 'Mercury'},
    'Libra': {'lord': 'Venus'},
    'Scorpio': {'lord': 'Mars'},
    'Sagittarius': {'lord': 'Jupiter'},
    'Capricorn': {'lord': 'Saturn'},
    'Aquarius': {'lord': 'Saturn'},
    'Pisces': {'lord': 'Jupiter'}
}

# Nakshatras and their Lords
nakshatras = [
    ('Ashwini', 'Ketu', 0), ('Bharani', 'Venus', 13.20), ('Krittika', 'Sun', 26.40), 
    ('Rohini', 'Moon', 40), ('Mrigashira', 'Mars', 53.20), ('Ardra', 'Rahu', 66.40), 
    ('Punarvasu', 'Jupiter', 80), ('Pushya', 'Saturn', 93.20), ('Ashlesha', 'Mercury', 106.40),
    ('Magha', 'Ketu', 120), ('Purva Phalguni', 'Venus', 133.20), ('Uttara Phalguni', 'Sun', 146.40),
    ('Hasta', 'Moon', 160), ('Chitra', 'Mars', 173.20), ('Swati', 'Rahu', 186.40),
    ('Vishakha', 'Jupiter', 200), ('Anuradha', 'Saturn', 213.20), ('Jyeshtha', 'Mercury', 226.40),
    ('Mula', 'Ketu', 240), ('Purva Ashadha', 'Venus', 253.20), ('Uttara Ashadha', 'Sun', 266.40),
    ('Shravana', 'Moon', 280), ('Dhanishta', 'Mars', 293.20), ('Shatabhisha', 'Rahu', 306.40),
    ('Purva Bhadrapada', 'Jupiter', 320), ('Uttara Bhadrapada', 'Saturn', 333.20), ('Revati', 'Mercury', 346.40)
]

def convert_divisional_charts_to_numbers(charts):
    """
    Convert zodiac signs in divisional charts to their corresponding numbers
    """
    return {
        chart_type: ZODIAC_TO_NUMBER[sign]
        for chart_type, sign in charts.items()
    }

def get_nakshatra(longitude):
    nak_span = 13.333333333333334  # 360/27
    nakshatra_index = int(longitude / nak_span)
    return nakshatras[nakshatra_index]

def get_house_from_rashi(rashi, lagna_rashi):
    fixed_rashi_order = [
        'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
        'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
    ]
    return fixed_rashi_order.index(rashi) + 1

def calculate_planetary_states(planet, rashi, degrees_in_rashi, speed, sun_position=None):
    retro = False
    combust = False
    status = "Neutral"

    if speed < 0:
        retro = True
    
    if sun_position is not None and planet != 'Sun':
        if abs(degrees_in_rashi - sun_position) < 8:
            combust = True
    
    # Exaltation and Debilitation states
    if planet == 'Sun':
        status = "Exalted" if rashi == "Aries" else "Neutral"
    elif planet == 'Moon':
        status = "Exalted" if rashi == "Taurus" else "Debilitated" if rashi == "Scorpio" else "Neutral"
    elif planet == 'Mars':
        status = "Exalted" if rashi == "Capricorn" else "Debilitated" if rashi == "Cancer" else "Neutral"
    elif planet == 'Mercury':
        status = "Exalted" if rashi == "Virgo" else "Debilitated" if rashi == "Pisces" else "Neutral"
    elif planet == 'Jupiter':
        status = "Exalted" if rashi == "Cancer" else "Debilitated" if rashi == "Capricorn" else "Neutral"
    elif planet == 'Venus':
        status = "Exalted" if rashi == "Pisces" else "Debilitated" if rashi == "Virgo" else "Neutral"
    elif planet == 'Saturn':
        status = "Exalted" if rashi == "Libra" else "Debilitated" if rashi == "Aries" else "Neutral"

    return {'retro': retro, 'combust': combust, 'status': status}

def calculate_house_positions(jd, lat, lon):
    flags = swe.FLG_SWIEPH
    hsys = b'W'  # Whole Sign system
    cusps, asc_mc = swe.houses_ex(jd, lat, lon, hsys, flags)
    return list(cusps), asc_mc[0]

def calculate_d2(total_degrees, planet):
    base_rashi = int(total_degrees / 30)
    degree_in_rashi = total_degrees % 30
    
    if planet in ['Sun', 'Jupiter']:
        hora_rashi = 'Leo' if degree_in_rashi < 15 else 'Cancer'
    else:
        hora_rashi = 'Cancer' if degree_in_rashi < 15 else 'Leo'
    
    return hora_rashi

def calculate_d4(total_degrees):
    base_rashi = int(total_degrees / 30)
    degree_in_rashi = total_degrees % 30
    quarter = int(degree_in_rashi / 7.5)
    
    final_rashi_num = (base_rashi + (quarter * 3)) % 12
    
    fixed_rashi_order = [
        'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
        'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
    ]
    
    return fixed_rashi_order[final_rashi_num]

def calculate_d9(total_degrees, is_ascendant=False):
    base_rashi = int(total_degrees / 30)
    degree_in_rashi = total_degrees % 30
    navamsa = int(degree_in_rashi / 3.333333)
    
    if base_rashi % 2 == 0:
        start_rashi = base_rashi
    else:
        start_rashi = (base_rashi + 8) % 12
    
    initial_rashi_num = (start_rashi + navamsa) % 12
    
    if is_ascendant:
        final_rashi_num = (initial_rashi_num) % 12
    else:
        final_rashi_num = (initial_rashi_num + 4) % 12
    
    fixed_rashi_order = [
        'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
        'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
    ]
    
    return fixed_rashi_order[final_rashi_num]

def calculate_d10(total_degrees):
    base_rashi = int(total_degrees / 30)
    degree_in_rashi = total_degrees % 30
    division = int(degree_in_rashi / 3)
    
    is_odd_sign = (base_rashi % 2 == 0)
    
    if is_odd_sign:
        start_rashi = base_rashi
    else:
        start_rashi = (base_rashi + 8) % 12
    
    final_rashi_num = (start_rashi + division) % 12
    
    fixed_rashi_order = [
        'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
        'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
    ]
    
    return fixed_rashi_order[final_rashi_num]

def calculate_d60(total_degrees, planet=None):
    base_rashi = int(total_degrees / 30)
    degree_in_rashi = total_degrees % 30
    division = int(degree_in_rashi / 0.5)
    
    rashi_type = base_rashi % 3
    
    if rashi_type == 0:
        start_rashi = base_rashi
    elif rashi_type == 1:
        start_rashi = (base_rashi + 4) % 12
    else:
        start_rashi = (base_rashi + 8) % 12
    
    zodiac_rounds = division // 5
    remaining_divisions = division % 5
    
    final_rashi_num = (start_rashi + zodiac_rounds + remaining_divisions) % 12
    
    fixed_rashi_order = [
        'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
        'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
    ]
    
    return fixed_rashi_order[final_rashi_num]

def calculate_extended_planetary_info(julian_day, lat, lon):
    swe.set_sid_mode(swe.SIDM_LAHIRI)
    ayanamsa = swe.get_ayanamsa(julian_day)
    
    houses, ascendant = calculate_house_positions(julian_day, lat, lon)
    ascendant = (ascendant - ayanamsa) % 360
    houses = [(h - ayanamsa) % 360 for h in houses]
    
    sanskrit_lagna_rashi = list(RASHI_TRANSLATION.keys())[int(ascendant / 30)]
    lagna_rashi = RASHI_TRANSLATION[sanskrit_lagna_rashi]
    
    planetary_info = {}
    
    sun_flags = swe.FLG_SWIEPH | swe.FLG_SPEED
    sun_info = swe.calc_ut(julian_day, swe.SUN, sun_flags)
    sun_longitude = (sun_info[0][0] - ayanamsa) % 360
    sun_position = sun_longitude % 30

    def get_planet_info(planet_num, planet, julian_day, ayanamsa):
        flags = swe.FLG_SWIEPH | swe.FLG_SPEED
        planet_info = swe.calc_ut(julian_day, planet_num, flags)
        
        longitude = (planet_info[0][0] - ayanamsa) % 360
        speed = planet_info[0][3]
        
        rashi_index = int(longitude / 30)
        sanskrit_rashi = list(RASHI_TRANSLATION.keys())[rashi_index]
        rashi = RASHI_TRANSLATION[sanskrit_rashi]
        degrees_in_rashi = longitude % 30
        
        nakshatra_info = get_nakshatra(longitude)
        states = calculate_planetary_states(planet, rashi, degrees_in_rashi, speed, sun_position)
        
        return {
            'longitude': longitude,
            'rashi': rashi,
            'rashi_lord': rashis[rashi]['lord'],
            'nakshatra': nakshatra_info[0],
            'nakshatra_lord': nakshatra_info[1],
            'degrees': round(degrees_in_rashi, 2),
            'total_degrees': round(longitude, 2),
            'retro': states['retro'],
            'combust': states['combust'],
            'status': states['status']
        }

    planet_mappings = [
        ('Sun', swe.SUN), ('Moon', swe.MOON), ('Mars', swe.MARS),
        ('Mercury', swe.MERCURY), ('Venus', swe.VENUS), 
        ('Jupiter', swe.JUPITER), ('Saturn', swe.SATURN)
    ]

    for planet, planet_num in planet_mappings:
        planet_info = get_planet_info(planet_num, planet, julian_day, ayanamsa)
        rashi = planet_info['rashi']
        house_position = get_house_from_rashi(rashi, lagna_rashi)
        
        total_degrees = planet_info['total_degrees']
        divisional_charts = {
            'D2': calculate_d2(total_degrees, planet),
            'D4': calculate_d4(total_degrees),
            'D9': calculate_d9(total_degrees),
            'D10': calculate_d10(total_degrees),
            'D60': calculate_d60(total_degrees, planet)
        }
        
        # Convert divisional charts to numbers
        divisional_charts = convert_divisional_charts_to_numbers(divisional_charts)
        
        planetary_info[planet] = {
            'rashi': rashi,
            'rashi_lord': planet_info['rashi_lord'],
            'nakshatra': planet_info['nakshatra'],
            'nakshatra_lord': planet_info['nakshatra_lord'],
            'degrees': planet_info['degrees'],
            'total_degrees': planet_info['total_degrees'],
            'retro': planet_info['retro'],
            'combust': planet_info['combust'],
            'status': planet_info['status'],
            'house': house_position,
            'divisional_charts': divisional_charts
        }

    # Calculate Rahu and Ketu
    rahu_info = get_planet_info(swe.MEAN_NODE, 'Rahu', julian_day, ayanamsa)
    rahu_house = get_house_from_rashi(rahu_info['rashi'], lagna_rashi)
    
    # Calculate divisional charts for Rahu
    rahu_divisional_charts = {
        'D2': calculate_d2(rahu_info['total_degrees'], 'Rahu'),
        'D4': calculate_d4(rahu_info['total_degrees']),
        'D9': calculate_d9(rahu_info['total_degrees']),
        'D10': calculate_d10(rahu_info['total_degrees']),
        'D60': calculate_d60(rahu_info['total_degrees'], 'Rahu')
    }
    
    # Convert Rahu's divisional charts to numbers
    rahu_divisional_charts = convert_divisional_charts_to_numbers(rahu_divisional_charts)
    
    planetary_info['Rahu'] = {
        'rashi': rahu_info['rashi'],
        'rashi_lord': rashis[rahu_info['rashi']]['lord'],
        'nakshatra': rahu_info['nakshatra'],
        'nakshatra_lord': rahu_info['nakshatra_lord'],
        'degrees': rahu_info['degrees'],
        'total_degrees': rahu_info['total_degrees'],
        'retro': True,
        'combust': False,
        'status': 'Neutral',
        'house': rahu_house,
        'divisional_charts': rahu_divisional_charts
    }

    # Calculate Ketu position
    ketu_longitude = (rahu_info['total_degrees'] + 180) % 360
    ketu_rashi_index = int(ketu_longitude / 30)
    sanskrit_ketu_rashi = list(RASHI_TRANSLATION.keys())[ketu_rashi_index]
    ketu_rashi = RASHI_TRANSLATION[sanskrit_ketu_rashi]
    ketu_house = get_house_from_rashi(ketu_rashi, lagna_rashi)
    ketu_degrees = ketu_longitude % 30
    ketu_nakshatra = get_nakshatra(ketu_longitude)
    
    # Calculate divisional charts for Ketu
    ketu_divisional_charts = {
        'D2': calculate_d2(ketu_longitude, 'Ketu'),
        'D4': calculate_d4(ketu_longitude),
        'D9': calculate_d9(ketu_longitude),
        'D10': calculate_d10(ketu_longitude),
        'D60': calculate_d60(ketu_longitude, 'Ketu')
    }
    
    # Convert Ketu's divisional charts to numbers
    ketu_divisional_charts = convert_divisional_charts_to_numbers(ketu_divisional_charts)

    planetary_info['Ketu'] = {
        'rashi': ketu_rashi,
        'rashi_lord': rashis[ketu_rashi]['lord'],
        'nakshatra': ketu_nakshatra[0],
        'nakshatra_lord': ketu_nakshatra[1],
        'degrees': round(ketu_degrees, 2),
        'total_degrees': round(ketu_longitude, 2),
        'retro': True,
        'combust': False,
        'status': 'Neutral',
        'house': ketu_house,
        'divisional_charts': ketu_divisional_charts
    }

    # Ascendant Details
    sanskrit_ascendant_rashi = list(RASHI_TRANSLATION.keys())[int(ascendant / 30)]
    ascendant_rashi = RASHI_TRANSLATION[sanskrit_ascendant_rashi]
    ascendant_nakshatra = get_nakshatra(ascendant)
    
    # Calculate divisional charts for Ascendant
    ascendant_divisional_charts = {
        'D2': calculate_d2(ascendant, 'Ascendant'),
        'D4': calculate_d4(ascendant),
        'D9': calculate_d9(ascendant, is_ascendant=True),
        'D10': calculate_d10(ascendant),
        'D60': calculate_d60(ascendant, 'Ascendant')
    }
    
    # Convert Ascendant's divisional charts to numbers
    ascendant_divisional_charts = convert_divisional_charts_to_numbers(ascendant_divisional_charts)
    
    planetary_info['Ascendant'] = {
        'rashi': ascendant_rashi,
        'rashi_lord': rashis[ascendant_rashi]['lord'],
        'degrees': round(ascendant % 30, 2),
        'total_degrees': round(ascendant, 2),
        'nakshatra': ascendant_nakshatra[0],
        'nakshatra_lord': ascendant_nakshatra[1],
        'house': get_house_from_rashi(ascendant_rashi, lagna_rashi),
        'divisional_charts': ascendant_divisional_charts
    }

    return planetary_info

@app.route('/generate_kundli', methods=['POST'])
def generate_kundli():
    try:
        data = request.get_json()
        birth_date = data["date_of_birth"]
        birth_time = data["time_of_birth"]
        lat = float(data["latitude"])
        lon = float(data["longitude"])

        # Local time conversion to UTC
        ist = pytz.timezone('Asia/Kolkata')
        dt = datetime.strptime(f"{birth_date} {birth_time}", "%Y-%m-%d %H:%M")
        dt = ist.localize(dt)
        utc_time = dt.astimezone(pytz.UTC)

        julian_day = swe.julday(utc_time.year, utc_time.month, utc_time.day,
                               utc_time.hour + utc_time.minute/60.0)

        planetary_info = calculate_extended_planetary_info(julian_day, lat, lon)

        return jsonify({
            "meta": {
                "status": "success",
                "message": "Kundli generated successfully",
                "ayanamsa": {
                    "value": swe.get_ayanamsa(julian_day),
                    "type": "Lahiri"
                }
            },
            "kundli": planetary_info
        })
    except Exception as e:
        return jsonify({
            "meta": {
                "status": "error",
                "message": str(e)
            }
        }), 400

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)