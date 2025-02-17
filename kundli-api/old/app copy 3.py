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

# Mapping of rashis to their numbers
RASHI_TO_NUMBER = {
    'Mesha': 1,      # Aries
    'Vrishabha': 2,  # Taurus
    'Mithuna': 3,    # Gemini
    'Karka': 4,      # Cancer
    'Simha': 5,      # Leo
    'Kanya': 6,      # Virgo
    'Tula': 7,       # Libra
    'Vrishchika': 8, # Scorpio
    'Dhanu': 9,      # Sagittarius
    'Makara': 10,    # Capricorn
    'Kumbha': 11,    # Aquarius
    'Meena': 12      # Pisces
}

# Zodiac signs (Rashis) and their lords
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

# Nakshatras and their lords
nakshatras = [
    ('Ashwini', 'Ketu', 0),
    ('Bharani', 'Venus', 13.20),
    ('Krittika', 'Sun', 26.40),
    ('Rohini', 'Moon', 40),
    ('Mrigashira', 'Mars', 53.20),
    ('Ardra', 'Rahu', 66.40),
    ('Punarvasu', 'Jupiter', 80),
    ('Pushya', 'Saturn', 93.20),
    ('Ashlesha', 'Mercury', 106.40),
    ('Magha', 'Ketu', 120),
    ('Purva Phalguni', 'Venus', 133.20),
    ('Uttara Phalguni', 'Sun', 146.40),
    ('Hasta', 'Moon', 160),
    ('Chitra', 'Mars', 173.20),
    ('Swati', 'Rahu', 186.40),
    ('Vishakha', 'Jupiter', 200),
    ('Anuradha', 'Saturn', 213.20),
    ('Jyeshtha', 'Mercury', 226.40),
    ('Mula', 'Ketu', 240),
    ('Purva Ashadha', 'Venus', 253.20),
    ('Uttara Ashadha', 'Sun', 266.40),
    ('Shravana', 'Moon', 280),
    ('Dhanishta', 'Mars', 293.20),
    ('Shatabhisha', 'Rahu', 306.40),
    ('Purva Bhadrapada', 'Jupiter', 320),
    ('Uttara Bhadrapada', 'Saturn', 333.20),
    ('Revati', 'Mercury', 346.40)
]

def get_nakshatra(longitude):
    """Calculate nakshatra from longitude."""
    nak_span = 13.333333333333334  # 360/27
    nakshatra_index = int(longitude / nak_span)
    return nakshatras[nakshatra_index]

def get_house_from_rashi(planet_rashi, lagna_rashi):
    """Calculate house position based on planet's rashi and lagna rashi"""
    planet_num = RASHI_TO_NUMBER[planet_rashi]
    lagna_num = RASHI_TO_NUMBER[lagna_rashi]
    
    house = planet_num - lagna_num + 1
    if house <= 0:
        house += 12
    return house

def calculate_planetary_states(planet, rashi, degrees, speed):
    """Calculate various planetary states."""
    states = {
        'retro': speed < 0,
        'combust': False,  # Need to implement solar proximity check
        'status': 'Normal'  # Need to implement dignity calculations
    }
    
    # Basic dignity calculations
    if (planet == 'Mars' and rashi == 'Karka') or \
       (planet == 'Rahu' and rashi == 'Meena') or \
       (planet == 'Ketu' and rashi == 'Kanya'):
        states['status'] = 'Debilitated'
    elif (planet == 'Saturn' and rashi == 'Kumbha'):
        states['status'] = 'Mooltrikona'
    
    return states

def calculate_house_positions(jd, lat, lon):
    """Calculate house positions using the Whole Sign system"""
    flags = swe.FLG_SWIEPH
    hsys = b'W'  # Whole Sign system
    
    cusps, asc_mc = swe.houses_ex(jd, lat, lon, hsys, flags)
    return list(cusps), asc_mc[0]

def calculate_extended_planetary_info(julian_day, lat, lon):
    """Calculate detailed planetary positions and states including Ascendant and Houses."""
    # Set ayanamsa to Lahiri
    swe.set_sid_mode(swe.SIDM_LAHIRI)
    ayanamsa = swe.get_ayanamsa(julian_day)
    
    # Calculate houses and ascendant
    houses, ascendant = calculate_house_positions(julian_day, lat, lon)
    
    # Adjust for ayanamsa
    ascendant = (ascendant - ayanamsa) % 360
    houses = [(h - ayanamsa) % 360 for h in houses]
    
    # Get lagna rashi first
    lagna_rashi = list(rashis.keys())[int(ascendant / 30)]
    
    planetary_info = {}
    
    # Calculate for regular planets
    for planet in ['Sun', 'Moon', 'Mars', 'Mercury', 'Venus', 'Jupiter', 'Saturn']:
        if planet == 'Sun':
            planet_num = swe.SUN
        elif planet == 'Moon':
            planet_num = swe.MOON
        elif planet == 'Mars':
            planet_num = swe.MARS
        elif planet == 'Mercury':
            planet_num = swe.MERCURY
        elif planet == 'Venus':
            planet_num = swe.VENUS
        elif planet == 'Jupiter':
            planet_num = swe.JUPITER
        elif planet == 'Saturn':
            planet_num = swe.SATURN
            
        flags = swe.FLG_SWIEPH | swe.FLG_SPEED
        planet_info = swe.calc_ut(julian_day, planet_num, flags)
        
        longitude = (planet_info[0][0] - ayanamsa) % 360
        speed = planet_info[0][3]
        
        rashi_index = int(longitude / 30)
        rashi_list = list(rashis.keys())
        rashi = rashi_list[rashi_index]
        degrees_in_rashi = longitude % 30
        
        nakshatra_info = get_nakshatra(longitude)
        states = calculate_planetary_states(planet, rashi, degrees_in_rashi, speed)
        
        # Calculate house position
        house_position = get_house_from_rashi(rashi, lagna_rashi)
        
        planetary_info[planet] = {
            'rashi': rashi,
            'rashi_lord': rashis[rashi]['lord'],
            'nakshatra': nakshatra_info[0],
            'nakshatra_lord': nakshatra_info[1],
            'degrees': round(degrees_in_rashi, 2),
            'total_degrees': round(longitude, 2),
            'retro': states['retro'],
            'combust': states['combust'],
            'status': states['status'],
            'house': house_position
        }
    
    # Calculate Rahu and Ketu with house positions
    node_flags = swe.FLG_SWIEPH | swe.FLG_SPEED
    rahu_info = swe.calc_ut(julian_day, swe.MEAN_NODE, node_flags)
    rahu_lon = (rahu_info[0][0] - ayanamsa) % 360
    ketu_lon = (rahu_lon + 180) % 360
    
    # Add Rahu info with house position
    rahu_rashi_index = int(rahu_lon / 30)
    rahu_rashi = list(rashis.keys())[rahu_rashi_index]
    rahu_degrees = rahu_lon % 30
    rahu_nakshatra = get_nakshatra(rahu_lon)
    rahu_states = calculate_planetary_states('Rahu', rahu_rashi, rahu_degrees, rahu_info[0][3])
    rahu_house = get_house_from_rashi(rahu_rashi, lagna_rashi)
    
    planetary_info['Rahu'] = {
        'rashi': rahu_rashi,
        'rashi_lord': rashis[rahu_rashi]['lord'],
        'nakshatra': rahu_nakshatra[0],
        'nakshatra_lord': rahu_nakshatra[1],
        'degrees': round(rahu_degrees, 2),
        'total_degrees': round(rahu_lon, 2),
        'retro': rahu_states['retro'],
        'combust': False,
        'status': rahu_states['status'],
        'house': rahu_house
    }
    
    # Add Ketu info with house position
    ketu_rashi_index = int(ketu_lon / 30)
    ketu_rashi = list(rashis.keys())[ketu_rashi_index]
    ketu_degrees = ketu_lon % 30
    ketu_nakshatra = get_nakshatra(ketu_lon)
    ketu_states = calculate_planetary_states('Ketu', ketu_rashi, ketu_degrees, -rahu_info[0][3])
    ketu_house = get_house_from_rashi(ketu_rashi, lagna_rashi)
    
    planetary_info['Ketu'] = {
        'rashi': ketu_rashi,
        'rashi_lord': rashis[ketu_rashi]['lord'],
        'nakshatra': ketu_nakshatra[0],
        'nakshatra_lord': ketu_nakshatra[1],
        'degrees': round(ketu_degrees, 2),
        'total_degrees': round(ketu_lon, 2),
        'retro': ketu_states['retro'],
        'combust': False,
        'status': ketu_states['status'],
        'house': ketu_house
    }

    # Include Ascendant
    ascendant_rashi = list(rashis.keys())[int(ascendant / 30)]
    ascendant_nakshatra = get_nakshatra(ascendant)
    
    planetary_info['Ascendant'] = {
        'rashi': ascendant_rashi,
        'rashi_lord': rashis[ascendant_rashi]['lord'],
        'degrees': round(ascendant % 30, 2),
        'total_degrees': round(ascendant, 2),
        'nakshatra': ascendant_nakshatra[0],
        'nakshatra_lord': ascendant_nakshatra[1]
    }

    # Houses info
    planetary_info['Houses'] = {}
    for i, house_degree in enumerate(houses, 1):
        house_rashi = list(rashis.keys())[int(house_degree / 30)]
        planetary_info['Houses'][f'{i}th_house'] = {
            'rashi': house_rashi,
            'degree': round(house_degree % 30, 2),
            'total_degree': round(house_degree, 2)
        }
    
    return planetary_info

@app.route('/generate_kundli', methods=['POST'])
def generate_kundli():
    try:
        data = request.get_json()
        birth_date = data["date_of_birth"]  # Format: YYYY-MM-DD
        birth_time = data["time_of_birth"]  # Format: HH:MM
        lat = float(data["latitude"])
        lon = float(data["longitude"])

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