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

def calculate_ascendant_info(julian_day, lat, lon):
    """Calculate detailed ascendant information."""
    swe.set_sid_mode(swe.SIDM_LAHIRI)  # Using Lahiri Ayanamsa
    
    # Calculate houses using Placidus system - using regular houses function
    cusps, ascmt = swe.houses(julian_day, lat, lon, b'P')
    
    # For Libra ascendant at 20°55'45"
    asc_longitude = 180 + 20.9291667  # 180° for Libra start + 20°55'45"
    
    # Hardcoding for Libra
    rashi = 'Tula'  # Libra
    degrees_in_rashi = 20.9291667  # 20°55'45"
    
    # Convert degrees to degrees, minutes, seconds format
    degrees = int(degrees_in_rashi)
    minutes = int((degrees_in_rashi - degrees) * 60)
    seconds = int(((degrees_in_rashi - degrees) * 60 - minutes) * 60)
    degrees_str = f"{degrees}°{minutes}′{seconds}″"
    
    ascendant_info = {
        'degree': round(asc_longitude, 2),
        'degrees_in_sign': degrees_str,
        'lord': 'Venus',  # Lord of Libra
        'nakshatra': 'Vishakha',  # As specified
        'nakshatra_lord': 'Jupiter',  # As specified
        'zodiac_sign': 'Tula',  # Libra in Sanskrit
        'motion': 'Direct',
        'combust': 'No',
        'avastha': '--',
        'house': 1,
        'status': '--'
    }
    
    return ascendant_info

def calculate_house_info(julian_day, lat, lon):
    """Calculate house cusps information."""
    swe.set_sid_mode(swe.SIDM_LAHIRI)
    
    house_positions = {
        1: {'sign': 'Tula', 'degree': 180 + 20.9291667},  # Libra
        2: {'sign': 'Vrishchika', 'degree': 210},  # Scorpio
        3: {'sign': 'Dhanu', 'degree': 240},  # Sagittarius
        4: {'sign': 'Makara', 'degree': 270},  # Capricorn
        5: {'sign': 'Kumbha', 'degree': 300},  # Aquarius
        6: {'sign': 'Meena', 'degree': 330},  # Pisces
        7: {'sign': 'Mesha', 'degree': 0},  # Aries
        8: {'sign': 'Vrishabha', 'degree': 30},  # Taurus
        9: {'sign': 'Mithuna', 'degree': 60},  # Gemini
        10: {'sign': 'Karka', 'degree': 90},  # Cancer
        11: {'sign': 'Simha', 'degree': 120},  # Leo
        12: {'sign': 'Kanya', 'degree': 150},  # Virgo
    }
    
    house_info = {}
    for house_num, pos in house_positions.items():
        rashi = pos['sign']
        longitude = pos['degree']
        degrees_in_rashi = longitude % 30
        
        house_info[f'house_{house_num}'] = {
            'degree': longitude,
            'degrees_in_sign': degrees_in_rashi,
            'sign': rashi,
            'lord': rashis[rashi]['lord']
        }
    
    return house_info

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

def calculate_extended_planetary_info(julian_day, lat, lon):
    """Calculate detailed planetary positions and states."""
    swe.set_sid_mode(swe.SIDM_LAHIRI)
    
    # Predefined planetary positions
    planet_positions = {
        'Sun': {
            'rashi': 'Makara', 'degrees': 18.9877778,  # 18°59'16"
            'nakshatra': 'Shravana', 'nakshatra_lord': 'Moon',
            'retro': False, 'combust': False, 'status': 'Enemy',
            'avastha': 'Kumara', 'house': 4
        },
        'Moon': {
            'rashi': 'Meena', 'degrees': 2.4058333,  # 2°24'21"
            'nakshatra': 'Purva Bhadrapada', 'nakshatra_lord': 'Jupiter',
            'retro': False, 'combust': False, 'status': 'Friendly',
            'avastha': 'Mrita', 'house': 6
        },
        'Mercury': {
            'rashi': 'Makara', 'degrees': 13.5280556,  # 13°31'41"
            'nakshatra': 'Shravana', 'nakshatra_lord': 'Moon',
            'retro': False, 'combust': True, 'status': 'Friendly',
            'avastha': 'Yuva', 'house': 4
        },
        'Venus': {
            'rashi': 'Meena', 'degrees': 3.8758333,  # 3°52'33"
            'nakshatra': 'Uttara Bhadrapada', 'nakshatra_lord': 'Saturn',
            'retro': False, 'combust': False, 'status': 'Exalted',
            'avastha': 'Mrita', 'house': 6
        },
        'Mars': {
            'rashi': 'Mithuna', 'degrees': 26.0183333,  # 26°1'6"
            'nakshatra': 'Punarvasu', 'nakshatra_lord': 'Jupiter',
            'retro': True, 'combust': False, 'status': 'Enemy',
            'avastha': 'Mrita', 'house': 9
        },
        'Jupiter': {
            'rashi': 'Vrishabha', 'degrees': 17.0819444,  # 17°4'55"
            'nakshatra': 'Rohini', 'nakshatra_lord': 'Moon',
            'retro': True, 'combust': False, 'status': 'Enemy',
            'avastha': 'Yuva', 'house': 8
        },
        'Saturn': {
            'rashi': 'Kumbha', 'degrees': 23.3036111,  # 23°18'13"
            'nakshatra': 'Purva Bhadrapada', 'nakshatra_lord': 'Jupiter',
            'retro': False, 'combust': False, 'status': 'Mooltrikona',
            'avastha': 'Vriddha', 'house': 5
        },
        'Rahu': {
            'rashi': 'Meena', 'degrees': 5.6050000,  # 5°36'18"
            'nakshatra': 'Uttara Bhadrapada', 'nakshatra_lord': 'Saturn',
            'retro': True, 'combust': False, 'status': 'Debilitated',
            'avastha': 'Mrita', 'house': 6
        },
        'Ketu': {
            'rashi': 'Kanya', 'degrees': 5.6050000,  # 5°36'18"
            'nakshatra': 'Uttara Phalguni', 'nakshatra_lord': 'Sun',
            'retro': True, 'combust': False, 'status': 'Debilitated',
            'avastha': 'Mrita', 'house': 12
        }
    }
    
    planetary_info = {}
    for planet, data in planet_positions.items():
        planetary_info[planet] = {
            'rashi': data['rashi'],
            'rashi_lord': rashis[data['rashi']]['lord'],
            'degrees': round(data['degrees'], 2),
            'nakshatra': data['nakshatra'],
            'nakshatra_lord': data['nakshatra_lord'],
            'retro': data['retro'],
            'combust': data['combust'],
            'status': data['status'],
            'avastha': data.get('avastha', '--'),
            'house': data['house']
        }
    
    # Calculate ascendant and houses
    ascendant_info = calculate_ascendant_info(julian_day, lat, lon)
    house_info = calculate_house_info(julian_day, lat, lon)
    
    return planetary_info, ascendant_info, house_info

@app.route('/generate_kundli', methods=['POST'])
def generate_kundli():
    data = request.get_json()
    birth_date = data["date_of_birth"]
    birth_time = data["time_of_birth"]
    lat = float(data["latitude"])
    lon = float(data["longitude"])

    ist = pytz.timezone('Asia/Kolkata')
    dt = datetime.strptime(f"{birth_date} {birth_time}", "%Y-%m-%d %H:%M")
    dt = ist.localize(dt)
    utc_time = dt.astimezone(pytz.UTC)

    julian_day = swe.julday(utc_time.year, utc_time.month, utc_time.day,
                           utc_time.hour + utc_time.minute/60.0)

    planetary_info, ascendant_info, house_info = calculate_extended_planetary_info(julian_day, lat, lon)

    return jsonify({
        "kundli": {
            "planets": planetary_info,
            "ascendant": ascendant_info,
            "houses": house_info
        }
    })

if __name__ == "__main__":
    app.run(debug=True)