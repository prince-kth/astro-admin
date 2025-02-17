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
    """Calculate detailed planetary positions and states including Ascendant and Houses."""
    swe.set_sid_mode(swe.SIDM_LAHIRI)
    
    # Calculate Sidereal Time (for accurate Ascendant calculation)
    sidereal_time = swe.sidtime(julian_day) + lon / 15  # Correct sidereal time
    ascendant_deg = (sidereal_time * 15) % 360  # Ascendant degree calculation

    # House calculation (Placidus System or Whole Sign System)
    houses, _ = swe.houses(julian_day, lat, lon, b'P')  # 'P' for Placidus system or 'W' for Whole Sign
    ascendant = (houses[0] + 180) % 360  # Correct ascendant
    
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
            
        flags = swe.FLG_SWIEPH | swe.FLG_SPEED | swe.FLG_SIDEREAL
        planet_info = swe.calc_ut(julian_day, planet_num, flags)
        
        longitude = planet_info[0][0]
        speed = planet_info[0][3]
        
        rashi_index = int(longitude / 30)
        rashi_list = list(rashis.keys())
        rashi = rashi_list[rashi_index]
        degrees_in_rashi = longitude % 30
        
        nakshatra_info = get_nakshatra(longitude)
        states = calculate_planetary_states(planet, rashi, degrees_in_rashi, speed)
        
        planetary_info[planet] = {
            'rashi': rashi,
            'rashi_lord': rashis[rashi]['lord'],
            'nakshatra': nakshatra_info[0],
            'nakshatra_lord': nakshatra_info[1],
            'degrees': round(degrees_in_rashi, 2),
            'retro': states['retro'],
            'combust': states['combust'],
            'status': states['status']
        }
    
    # Calculate Rahu and Ketu
    node_flags = swe.FLG_SWIEPH | swe.FLG_SPEED | swe.FLG_SIDEREAL
    rahu_info = swe.calc_ut(julian_day, swe.MEAN_NODE, node_flags)
    rahu_lon = rahu_info[0][0]
    ketu_lon = (rahu_lon + 180) % 360
    
    # Add Rahu info
    rahu_rashi_index = int(rahu_lon / 30)
    rahu_rashi = list(rashis.keys())[rahu_rashi_index]
    rahu_degrees = rahu_lon % 30
    rahu_nakshatra = get_nakshatra(rahu_lon)
    rahu_states = calculate_planetary_states('Rahu', rahu_rashi, rahu_degrees, rahu_info[0][3])
    
    planetary_info['Rahu'] = {
        'rashi': rahu_rashi,
        'rashi_lord': rashis[rahu_rashi]['lord'],
        'nakshatra': rahu_nakshatra[0],
        'nakshatra_lord': rahu_nakshatra[1],
        'degrees': round(rahu_degrees, 2),
        'retro': rahu_states['retro'],
        'combust': False,
        'status': rahu_states['status']
    }
    
    # Add Ketu info
    ketu_rashi_index = int(ketu_lon / 30)
    ketu_rashi = list(rashis.keys())[ketu_rashi_index]
    ketu_degrees = ketu_lon % 30
    ketu_nakshatra = get_nakshatra(ketu_lon)
    ketu_states = calculate_planetary_states('Ketu', ketu_rashi, ketu_degrees, -rahu_info[0][3])
    
    planetary_info['Ketu'] = {
        'rashi': ketu_rashi,
        'rashi_lord': rashis[ketu_rashi]['lord'],
        'nakshatra': ketu_nakshatra[0],
        'nakshatra_lord': ketu_nakshatra[1],
        'degrees': round(ketu_degrees, 2),
        'retro': ketu_states['retro'],
        'combust': False,
        'status': ketu_states['status']
    }

    # Include Ascendant and Houses in the output
    ascendant_rashi = list(rashis.keys())[int(ascendant / 30)]
    planetary_info['Ascendant'] = {
        'rashi': ascendant_rashi,
        'degrees': round(ascendant % 30, 2)
    }
    planetary_info['Houses'] = {
        '1st_house': list(rashis.keys())[int(houses[0] / 30)],
        '2nd_house': list(rashis.keys())[int(houses[1] / 30)],
        '3rd_house': list(rashis.keys())[int(houses[2] / 30)],
        '4th_house': list(rashis.keys())[int(houses[3] / 30)],
        '5th_house': list(rashis.keys())[int(houses[4] / 30)],
        '6th_house': list(rashis.keys())[int(houses[5] / 30)],
        '7th_house': list(rashis.keys())[int(houses[6] / 30)],
        '8th_house': list(rashis.keys())[int(houses[7] / 30)],
        '9th_house': list(rashis.keys())[int(houses[8] / 30)],
        '10th_house': list(rashis.keys())[int(houses[9] / 30)],
        '11th_house': list(rashis.keys())[int(houses[10] / 30)],
        '12th_house': list(rashis.keys())[int(houses[11] / 30)]
    }
    
    return planetary_info

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

    planetary_info = calculate_extended_planetary_info(julian_day, lat, lon)

    return jsonify({"kundli": planetary_info})

if __name__ == "__main__":
    app.run(debug=True)
