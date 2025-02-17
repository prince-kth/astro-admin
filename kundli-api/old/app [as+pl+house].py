from skyfield.api import load, Topos
from datetime import datetime
import pytz
from math import degrees
from flask import Flask, request, jsonify
import swisseph as swe

app = Flask(__name__)

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

# Mapping of Rashis to their numbers
RASHI_TO_NUMBER = {
    'Mesha': 1, 'Vrishabha': 2, 'Mithuna': 3, 'Karka': 4, 'Simha': 5, 'Kanya': 6,
    'Tula': 7, 'Vrishchika': 8, 'Dhanu': 9, 'Makara': 10, 'Kumbha': 11, 'Meena': 12
}

# Mapping of Rashis and their lords
rashis = {
    'Mesha': {'lord': 'Mars'},
    'Vrishabha': {'lord': 'Venus'},
    'Mithuna': {'lord': 'Mercury'},
    'Karka': {'lord': 'Moon'},
    'Simha': {'lord': 'Sun'},
    'Kanya': {'lord': 'Mercury'},
    'Tula': {'lord': 'Venus'},
    'Vrishchika': {'lord': 'Mars'},
    'Dhanu': {'lord': 'Jupiter'},
    'Makara': {'lord': 'Saturn'},
    'Kumbha': {'lord': 'Saturn'},
    'Meena': {'lord': 'Jupiter'}
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

# Function to calculate Nakshatra
def get_nakshatra(longitude):
    nak_span = 13.333333333333334  # 360/27
    nakshatra_index = int(longitude / nak_span)
    return nakshatras[nakshatra_index]

# House calculations based on Rashi
def get_house_from_rashi(rashi, lagna_rashi):
    # Fixed order of rashis according to natural zodiac
    fixed_rashi_order = [
        'Mesha',      # 1 - Aries
        'Vrishabha',  # 2 - Taurus
        'Mithuna',    # 3 - Gemini
        'Karka',      # 4 - Cancer
        'Simha',      # 5 - Leo
        'Kanya',      # 6 - Virgo
        'Tula',       # 7 - Libra
        'Vrishchika', # 8 - Scorpio
        'Dhanu',      # 9 - Sagittarius
        'Makara',     # 10 - Capricorn
        'Kumbha',     # 11 - Aquarius
        'Meena'       # 12 - Pisces
    ]
    
    # Simply return the natural index of the rashi (1-based)
    return fixed_rashi_order.index(rashi) + 1

# Function to calculate planetary states
def calculate_planetary_states(planet, rashi, degrees_in_rashi, speed, sun_position=None):
    retro = False
    combust = False
    status = "Neutral"  # Default status

    # Retrograde: Planet moving backwards (negative speed)
    if speed < 0:
        retro = True
    
    # Combustion: Planet too close to Sun (combust when within ~8 degrees of Sun)
    if sun_position is not None and planet != 'Sun':
        if abs(degrees_in_rashi - sun_position) < 8:
            combust = True
    
    # Status based on the rashi and planet position
    if planet == 'Sun':
        status = "Exalted" if rashi == "Mesha" else "Neutral"  # Sun is exalted in Aries (Mesha)
    elif planet == 'Moon':
        status = "Debilitated" if rashi == "Vrishchika" else "Neutral"  # Moon is debilitated in Scorpio (Vrishchika)
    # Add more logic for other planets (exalted, debilitated, etc.)

    return {'retro': retro, 'combust': combust, 'status': status}

# House position calculation using Whole Sign System
def calculate_house_positions(jd, lat, lon):
    flags = swe.FLG_SWIEPH
    hsys = b'W'  # Whole Sign system
    
    cusps, asc_mc = swe.houses_ex(jd, lat, lon, hsys, flags)
    return list(cusps), asc_mc[0]

# Calculate planetary details including nakshatras, retrograde, combustion, etc.
def calculate_extended_planetary_info(julian_day, lat, lon):
    swe.set_sid_mode(swe.SIDM_LAHIRI)
    ayanamsa = swe.get_ayanamsa(julian_day)
    
    # Houses and Ascendant
    houses, ascendant = calculate_house_positions(julian_day, lat, lon)
    
    # Adjusting for ayanamsa
    ascendant = (ascendant - ayanamsa) % 360
    houses = [(h - ayanamsa) % 360 for h in houses]
    
    lagna_rashi = list(rashis.keys())[int(ascendant / 30)]
    
    planetary_info = {}
    
    # Calculate Sun's position for combustion calculations
    sun_flags = swe.FLG_SWIEPH | swe.FLG_SPEED
    sun_info = swe.calc_ut(julian_day, swe.SUN, sun_flags)
    sun_longitude = (sun_info[0][0] - ayanamsa) % 360
    sun_position = sun_longitude % 30

    # Function to get the planetary details
    def get_planet_info(planet_num, planet, julian_day, ayanamsa):
        flags = swe.FLG_SWIEPH | swe.FLG_SPEED
        planet_info = swe.calc_ut(julian_day, planet_num, flags)
        
        longitude = (planet_info[0][0] - ayanamsa) % 360
        speed = planet_info[0][3]
        
        rashi_index = int(longitude / 30)
        rashi_list = list(rashis.keys())
        rashi = rashi_list[rashi_index]
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

    # Calculate planetary info for major planets
    for planet, planet_num in [('Sun', swe.SUN), ('Moon', swe.MOON), ('Mars', swe.MARS),
                               ('Mercury', swe.MERCURY), ('Venus', swe.VENUS), 
                               ('Jupiter', swe.JUPITER), ('Saturn', swe.SATURN)]:
        planet_info = get_planet_info(planet_num, planet, julian_day, ayanamsa)
        rashi = planet_info['rashi']
        house_position = get_house_from_rashi(rashi, lagna_rashi)

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
            'house': house_position
        }

    # Calculate Rahu and Ketu
    rahu_info = swe.calc_ut(julian_day, swe.MEAN_NODE, swe.FLG_SWIEPH | swe.FLG_SPEED)
    rahu_lon = (rahu_info[0][0] - ayanamsa) % 360
    ketu_lon = (rahu_lon + 180) % 360
    
    rahu_info = get_planet_info(swe.MEAN_NODE, 'Rahu', julian_day, ayanamsa)
    rahu_house = get_house_from_rashi(rahu_info['rashi'], lagna_rashi)

    planetary_info['Rahu'] = {
        'rashi': rahu_info['rashi'],
        'rashi_lord': rashis[rahu_info['rashi']]['lord'],
        'nakshatra': rahu_info['nakshatra'],
        'nakshatra_lord': rahu_info['nakshatra_lord'],
        'degrees': rahu_info['degrees'],
        'total_degrees': rahu_info['total_degrees'],
        'retro': rahu_info['retro'],
        'combust': False,
        'status': rahu_info['status'],
        'house': rahu_house
    }

    ketu_info = get_planet_info(swe.MEAN_NODE, 'Ketu', julian_day, ayanamsa)
    ketu_house = get_house_from_rashi(ketu_info['rashi'], lagna_rashi)

    planetary_info['Ketu'] = {
        'rashi': ketu_info['rashi'],
        'rashi_lord': rashis[ketu_info['rashi']]['lord'],
        'nakshatra': ketu_info['nakshatra'],
        'nakshatra_lord': ketu_info['nakshatra_lord'],
        'degrees': ketu_info['degrees'],
        'total_degrees': ketu_info['total_degrees'],
        'retro': ketu_info['retro'],
        'combust': False,
        'status': ketu_info['status'],
        'house': ketu_house
    }

    # Ascendant Details
    ascendant_rashi = list(rashis.keys())[int(ascendant / 30)]
    ascendant_nakshatra = get_nakshatra(ascendant)
    
    planetary_info['Ascendant'] = {
        'rashi': ascendant_rashi,
        'rashi_lord': rashis[ascendant_rashi]['lord'],
        'degrees': round(ascendant % 30, 2),
        'total_degrees': round(ascendant, 2),
        'nakshatra': ascendant_nakshatra[0],
        'nakshatra_lord': ascendant_nakshatra[1],
        'house': get_house_from_rashi(ascendant_rashi, lagna_rashi)
    }

    return planetary_info

# Route to generate kundli
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

if __name__ == "__main__":
    app.run(debug=True)
