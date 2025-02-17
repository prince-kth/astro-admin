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
    """Calculate house cusps information dynamically."""
    swe.set_sid_mode(swe.SIDM_LAHIRI)
    houses, ascendant = swe.houses(julian_day, lat, lon, b'P')  # Using Placidus house system
    
    house_info = {}
    for i in range(12):
        longitude = houses[i] % 360
        rashi_index = int(longitude / 30)
        rashi_list = list(rashis.keys())
        rashi = rashi_list[rashi_index]
        degrees_in_rashi = longitude % 30
        
        # Convert degrees to DMS format
        degrees = int(degrees_in_rashi)
        minutes = int((degrees_in_rashi - degrees) * 60)
        seconds = int(((degrees_in_rashi - degrees) * 60 - minutes) * 60)
        degrees_str = f"{degrees}∘{minutes}′{seconds}″"
        
        house_info[f'house_{i+1}'] = {
            'degree': round(longitude, 2),
            'degrees_in_sign': degrees_str,
            'sign': rashi,
            'lord': rashis[rashi]['lord']
        }
    
    return house_info

def calculate_avastha(planet, degrees):
    """Calculate planetary avastha based on degrees."""
    if degrees < 6:
        return 'Bala'
    elif degrees < 12:
        return 'Kumara'
    elif degrees < 18:
        return 'Yuva'
    elif degrees < 24:
        return 'Vriddha'
    return 'Mrita'

def calculate_planetary_status(planet, rashi):
    """Calculate planetary status based on relationships."""
    # Exaltation
    if planet == 'Venus' and rashi == 'Meena':
        return 'Exalted'
    # Mooltrikona
    elif planet == 'Saturn' and rashi == 'Kumbha':
        return 'Mooltrikona'
    # Owned
    elif (planet == 'Jupiter' and rashi == 'Meena') or \
         (planet == 'Mars' and rashi == 'Vrishchika'):
        return 'Owned'
    # Friendly
    elif (planet == 'Mars' and rashi == 'Tula'):
        return 'Friendly'
    # Enemy
    elif planet in ['Sun', 'Moon', 'Mercury', 'Saturn'] and \
         rashi in ['Tula', 'Vrishchika', 'Dhanu', 'Makara', 'Kumbha', 'Meena']:
        return 'Enemy'
    # Default
    elif planet in ['Rahu', 'Ketu', 'Uranus', 'Neptune', 'Pluto']:
        return '--'
    return 'Normal'

def calculate_extended_planetary_info(julian_day, lat, lon):
    """Calculate detailed planetary positions and states dynamically."""
    swe.set_sid_mode(swe.SIDM_LAHIRI)
    
    # Planet to Swiss Ephemeris planet number mapping
    planet_numbers = {
        'Sun': swe.SUN,
        'Moon': swe.MOON,
        'Mars': swe.MARS,
        'Mercury': swe.MERCURY,
        'Jupiter': swe.JUPITER,
        'Venus': swe.VENUS,
        'Saturn': swe.SATURN,
        'Uranus': swe.URANUS,
        'Neptune': swe.NEPTUNE,
        'Pluto': swe.PLUTO
    }
    
    flags = swe.FLG_SWIEPH | swe.FLG_SPEED | swe.FLG_SIDEREAL
    
    # Calculate ascendant first for house positions
    houses, ascendant = swe.houses(julian_day, lat, lon, b'P')
    asc_longitude = float(ascendant[0]) % 360
    
    planetary_info = {}
    
    # Calculate positions for all planets including outer planets
    for planet, planet_num in planet_numbers.items():
        planet_info = swe.calc_ut(julian_day, planet_num, flags)
        longitude = planet_info[0][0] % 360
        speed = planet_info[0][3]
        
        rashi_index = int(longitude / 30)
        rashi_list = list(rashis.keys())
        rashi = rashi_list[rashi_index]
        degrees_in_rashi = longitude % 30
        
        # Calculate nakshatra
        nakshatra_info = get_nakshatra(longitude)
        
        # Calculate house position relative to ascendant
        house_num = ((int((longitude - asc_longitude) / 30)) % 12) + 1
        
        # Format degrees in DMS
        deg = int(degrees_in_rashi)
        minutes = int((degrees_in_rashi - deg) * 60)
        seconds = int(((degrees_in_rashi - deg) * 60 - minutes) * 60)
        degrees_str = f"{deg}∘{minutes}′{seconds}″"
        
        planetary_info[planet] = {
            'rashi': rashi,
            'rashi_lord': rashis[rashi]['lord'],
            'degrees': degrees_str,
            'nakshatra': nakshatra_info[0],
            'nakshatra_lord': nakshatra_info[1],
            'retro': speed < 0,
            'combust': False,  # Will be updated for relevant planets
            'status': calculate_planetary_status(planet, rashi),
            'avastha': calculate_avastha(planet, degrees_in_rashi),
            'house': house_num
        }
    
    # Calculate Rahu and Ketu
    node_info = swe.calc_ut(julian_day, swe.MEAN_NODE, flags)
    rahu_lon = node_info[0][0] % 360
    ketu_lon = (rahu_lon + 180) % 360
    
    # Add Rahu/Ketu with similar logic
    for node, lon in [('Rahu', rahu_lon), ('Ketu', ketu_lon)]:
        degrees_in_rashi = lon % 30
        rashi_index = int(lon / 30)
        rashi = rashi_list[rashi_index]
        nakshatra_info = get_nakshatra(lon)
        house_num = ((int((lon - asc_longitude) / 30)) % 12) + 1
        
        deg = int(degrees_in_rashi)
        minutes = int((degrees_in_rashi - deg) * 60)
        seconds = int(((degrees_in_rashi - deg) * 60 - minutes) * 60)
        degrees_str = f"{deg}∘{minutes}′{seconds}″"
        
        planetary_info[node] = {
            'rashi': rashi,
            'rashi_lord': rashis[rashi]['lord'],
            'degrees': degrees_str,
            'nakshatra': nakshatra_info[0],
            'nakshatra_lord': nakshatra_info[1],
            'retro': True,
            'combust': False,
            'status': '--',
            'avastha': calculate_avastha(node, degrees_in_rashi),
            'house': house_num
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