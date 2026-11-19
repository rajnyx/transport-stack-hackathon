/**
 * Centralized formatting and normalization utilities for CrowdWise.
 * Standardizes time displays, stop names, confidence descriptions, and crowd levels.
 */

/**
 * Formats any time string ("18:00", "08:30:00", 30600 seconds) into strict 12-hour am/pm format.
 * Example: "18:00" -> "6:00 pm", "08:05" -> "8:05 am".
 */
export function formatTime12h(timeInput) {
  if (timeInput === null || timeInput === undefined || timeInput === '') {
    return '';
  }

  // If already formatted like "6:00 pm", return cleaned
  if (typeof timeInput === 'string' && (timeInput.includes('am') || timeInput.includes('pm') || timeInput.includes('AM') || timeInput.includes('PM'))) {
    return timeInput.toLowerCase().trim();
  }

  let hours = 0;
  let minutes = 0;

  if (typeof timeInput === 'number') {
    // Seconds from midnight
    hours = Math.floor(timeInput / 3600);
    minutes = Math.floor((timeInput % 3600) / 60);
  } else if (typeof timeInput === 'string') {
    const parts = timeInput.trim().split(':');
    if (parts.length >= 2) {
      hours = parseInt(parts[0], 10) || 0;
      minutes = parseInt(parts[1], 10) || 0;
    } else {
      return timeInput;
    }
  } else if (timeInput instanceof Date) {
    hours = timeInput.getHours();
    minutes = timeInput.getMinutes();
  }

  const period = hours >= 12 ? 'pm' : 'am';
  const displayHours = hours % 12 || 12;
  const displayMinutes = minutes.toString().padStart(2, '0');

  return `${displayHours}:${displayMinutes} ${period}`;
}

/**
 * Normalizes stop names:
 * - Proper Title Case
 * - Preserves well-known transit acronyms (ISBT, ITO, AIIMS, NDLS, DTC, CP, etc.)
 * - Cleans up artifacts like "KarKarDooma" -> "Karkardooma"
 */
const ACRONYMS = new Set([
  'ISBT', 'ITO', 'AIIMS', 'NDLS', 'DTC', 'DIMTS', 'CP', 'IGI', 'IIT', 'DMRC',
  'NH-1', 'NH-8', 'NH-24', 'GT', 'GPO', 'RLY', 'STN', 'SEC', 'PKT', 'BLK'
]);

export function normalizeStopName(rawName) {
  if (!rawName || typeof rawName !== 'string') return '';

  let cleaned = rawName
    .replace(/KarKarDooma/gi, 'Karkardooma')
    .replace(/karkardooma/gi, 'Karkardooma')
    .replace(/\s+/g, ' ')
    .trim();

  // Words split
  const words = cleaned.split(' ');
  const formatted = words.map((w, idx) => {
    // Check if word has parentheses or punctuation
    const cleanWord = w.replace(/[^a-zA-Z0-9-]/g, '').toUpperCase();
    if (ACRONYMS.has(cleanWord)) {
      return w.toUpperCase();
    }
    if (w.startsWith('(') && w.endsWith(')')) {
      const inner = w.slice(1, -1).toUpperCase();
      if (ACRONYMS.has(inner) || inner === 'T' || inner === 'TERMINAL') {
        return `(${inner})`;
      }
    }
    if (w.toUpperCase() === '(T)') return '(T)';

    // Title case
    return w.charAt(0).toUpperCase() + w.slice(1).toLowerCase();
  });

  return formatted.join(' ');
}

/**
 * Maps confidence tier or sample volume to plain honest language.
 * "Based on a lot of data / some data / little data / Not enough data".
 */
export function formatConfidence(confidence, ticketCount = null) {
  if (ticketCount !== null && ticketCount < 10) {
    return 'Not enough data';
  }

  const c = String(confidence || '').toLowerCase();
  if (c === 'high' || c === 'lot') {
    return 'Based on a lot of data';
  }
  if (c === 'medium' || c === 'med' || c === 'some') {
    return 'Based on some data';
  }
  if (c === 'low' || c === 'little') {
    return 'Based on little data';
  }
  if (c === 'thin' || c === 'not enough' || c === 'none') {
    return 'Not enough data';
  }
  return 'Not enough data';
}

/**
 * Standardizes crowd level to exactly one of the four verified canonical terms:
 * - "Not crowded" (green)
 * - "Fairly crowded" (amber)
 * - "Very crowded" (red)
 * - "Not enough data" (grey)
 */
export function canonicalCrowdLevel(rawLevel, load = null, confidence = null) {
  if (confidence === 'none' || (load !== null && isNaN(load))) {
    return 'Not enough data';
  }

  const s = String(rawLevel || '').toLowerCase();
  if (s.includes('not enough') || s.includes('insufficient') || s.includes('unknown')) {
    return 'Not enough data';
  }
  if (s.includes('not crowded') || s.includes('low') || s.includes('seats')) {
    return 'Not crowded';
  }
  if (s.includes('fairly') || s.includes('moderate') || s.includes('standing')) {
    return 'Fairly crowded';
  }
  if (s.includes('very') || s.includes('high') || s.includes('crowded') || s.includes('crush')) {
    return 'Very crowded';
  }

  // If numeric load is provided
  if (typeof load === 'number') {
    if (load < 0.72) return 'Not crowded';
    if (load < 1.72) return 'Fairly crowded';
    return 'Very crowded';
  }

  return 'Not crowded';
}

export const CANONICAL_DELHI_25_STOPS = [
  { id: '917', name: 'Anand Vihar ISBT', dist: '0.0 km', distNum: 0.0, minOffset: 0, lat: 28.64888, lon: 77.31838, isOrigin: true, isDestination: false },
  { id: '7699', name: 'Anand Vihar ISBT Main Road', dist: '+0.2 km', distNum: 0.2, minOffset: 1, lat: 28.64701, lon: 77.31796, isOrigin: false, isDestination: false },
  { id: '913', name: 'EDM Mall / Gazipur Depot', dist: '+0.8 km', distNum: 0.8, minOffset: 2, lat: 28.64192, lon: 77.31609, isOrigin: false, isDestination: false },
  { id: '7742', name: 'Hasanpur Village', dist: '+1.6 km', distNum: 1.6, minOffset: 4, lat: 28.63612, lon: 77.31082, isOrigin: false, isDestination: false },
  { id: '1165', name: 'Hasanpur Depot', dist: '+1.9 km', distNum: 1.9, minOffset: 5, lat: 28.63594, lon: 77.30806, isOrigin: false, isDestination: false },
  { id: '2190', name: 'KarKarDooma Crossing', dist: '+3.2 km', distNum: 3.2, minOffset: 8, lat: 28.64295, lon: 77.29732, isOrigin: false, isDestination: false },
  { id: '2216', name: 'New Rajdhani Enclave / Preet Vihar', dist: '+3.4 km', distNum: 3.4, minOffset: 9, lat: 28.64184, lon: 77.29592, isOrigin: false, isDestination: false },
  { id: '7886', name: 'Swasthya Vihar / Preet Vihar', dist: '+3.9 km', distNum: 3.9, minOffset: 11, lat: 28.63915, lon: 77.29208, isOrigin: false, isDestination: false },
  { id: '2193', name: 'Nirman Vihar', dist: '+4.4 km', distNum: 4.4, minOffset: 12, lat: 28.63685, lon: 77.28761, isOrigin: false, isDestination: false },
  { id: '2194', name: 'Shakarpur Crossing', dist: '+4.7 km', distNum: 4.7, minOffset: 14, lat: 28.63537, lon: 77.28495, isOrigin: false, isDestination: false },
  { id: '8833', name: 'Shakarpur (Vikas Marg)', dist: '+5.1 km', distNum: 5.1, minOffset: 15, lat: 28.63338, lon: 77.28195, isOrigin: false, isDestination: false },
  { id: '7888', name: 'Laxmi Nagar (Vikas Marg)', dist: '+5.4 km', distNum: 5.4, minOffset: 17, lat: 28.63129, lon: 77.2788, isOrigin: false, isDestination: false },
  { id: '813', name: 'Rainy Well', dist: '+7.2 km', distNum: 7.2, minOffset: 21, lat: 28.62803, lon: 77.26093, isOrigin: false, isDestination: false },
  { id: '814', name: 'Delhi Secretariat', dist: '+8.1 km', distNum: 8.1, minOffset: 23, lat: 28.62795, lon: 77.25235, isOrigin: false, isDestination: false },
  { id: '2197', name: 'ITO AGCR /  ITO', dist: '+8.8 km', distNum: 8.8, minOffset: 25, lat: 28.62792, lon: 77.24447, isOrigin: false, isDestination: false },
  { id: '339', name: 'Tilak Bridge', dist: '+9.5 km', distNum: 9.5, minOffset: 27, lat: 28.6253, lon: 77.2387, isOrigin: false, isDestination: false },
  { id: '7723', name: 'Mandi House', dist: '+9.9 km', distNum: 9.9, minOffset: 28, lat: 28.62551, lon: 77.234, isOrigin: false, isDestination: false },
  { id: '1074', name: 'MODERN SCHOOL BARA KHAMBA ROAD', dist: '+10.6 km', distNum: 10.6, minOffset: 30, lat: 28.62787, lon: 77.2281, isOrigin: false, isDestination: false },
  { id: '1075', name: 'Barakhamba Metro Station', dist: '+10.9 km', distNum: 10.9, minOffset: 31, lat: 28.6294, lon: 77.2253, isOrigin: false, isDestination: false },
  { id: '1461', name: 'Statesman House', dist: '+11.0 km', distNum: 11.0, minOffset: 32, lat: 28.6303, lon: 77.2239, isOrigin: false, isDestination: false },
  { id: '3884', name: 'Hanuman Mandir / Shivaji Stadium', dist: '+12.0 km', distNum: 12.0, minOffset: 34, lat: 28.63027, lon: 77.21413, isOrigin: false, isDestination: false },
  { id: '3885', name: 'Gurudwara Bangla Sahib', dist: '+12.5 km', distNum: 12.5, minOffset: 36, lat: 28.62813, lon: 77.2094, isOrigin: false, isDestination: false },
  { id: '5294', name: 'NDPO', dist: '+12.9 km', distNum: 12.9, minOffset: 37, lat: 28.62559, lon: 77.20663, isOrigin: false, isDestination: false },
  { id: '1655', name: 'NDPO /  Pt Pant Marg', dist: '+13.1 km', distNum: 13.1, minOffset: 38, lat: 28.6235, lon: 77.2065, isOrigin: false, isDestination: false },
  { id: '1656', name: 'Kendriya Terminal (Pt. Pant Marg)', dist: '+13.4 km', distNum: 13.4, minOffset: 40, lat: 28.62127, lon: 77.20633, isOrigin: false, isDestination: true },
];

/**
 * Returns crowd level for a specific leg between stop[i] and stop[i+1].
 * Uses corridor zone variation to reflect data-grounded load.
 * Standard Civic Transit Colors:
 * - Red (#C64B4B): High crowd / Crowded
 * - Amber (#E0A51A): Moderate crowd / Standing room
 * - Green (#145C3A): Low crowd / Seats Available
 * - Grey (#CBD5E1): Not enough data
 */
export function getLegOccupancy(stopIndex, totalStops, zoneForecasts = [], fallbackCategory = 'moderate') {
  if (!totalStops || totalStops <= 1) {
    return {
      rci: 30,
      load: 12,
      level: 'Not crowded',
      category: 'low',
      color: '#145C3A',
      bgClass: 'bg-[#145C3A]',
    };
  }

  // Normalized progress along corridor (0.0 to 1.0)
  const frac = Math.max(0, Math.min(1, stopIndex / Math.max(1, totalStops - 1)));
  const fb = String(fallbackCategory || '').toLowerCase();
  const isHigh = fb.includes('high') || fb.includes('crowd') || fb.includes('very');
  const isMod = fb.includes('mod') || fb.includes('fair') || fb.includes('stand');

  // Relative zone modulation from forecasts if provided
  let zoneMod = 1.0;
  let targetZoneId = null;
  if (Array.isArray(zoneForecasts) && zoneForecasts.length > 0) {
    const zIdx = Math.min(Math.floor(frac * zoneForecasts.length), zoneForecasts.length - 1);
    const z = zoneForecasts[zIdx];
    if (z) {
      targetZoneId = z.zone_id ?? zIdx;
      const validRcis = zoneForecasts.map(item => Number(item.rci ?? item.mean_load ?? 0)).filter(n => !isNaN(n) && n > 0);
      const meanRci = validRcis.length > 0 ? (validRcis.reduce((a, b) => a + b, 0) / validRcis.length) : 0;
      const thisRci = Number(z.rci ?? z.mean_load ?? 0);
      if (meanRci > 0 && !isNaN(thisRci) && thisRci > 0) {
        zoneMod = Math.max(0.70, Math.min(1.35, thisRci / meanRci));
      }
    }
  }

  // Base crowd index without synthetic sinusoidal variation
  let calculatedRci = 30;
  if (isHigh) {
    calculatedRci = 85 * zoneMod;
  } else if (isMod) {
    calculatedRci = 65 * zoneMod;
  } else {
    calculatedRci = 30 * zoneMod;
  }

  const finalRci = Math.round(Math.max(15, Math.min(96, calculatedRci)));

  if (finalRci >= 80) {
    return {
      rci: finalRci,
      load: Math.round(finalRci * 0.6),
      level: 'Very crowded',
      category: 'high',
      color: '#C64B4B',
      bgClass: 'bg-[#C64B4B]',
      zoneId: targetZoneId,
    };
  }

  if (finalRci >= 55) {
    return {
      rci: finalRci,
      load: Math.round(finalRci * 0.6),
      level: 'Fairly crowded',
      category: 'moderate',
      color: '#E0A51A',
      bgClass: 'bg-[#E0A51A]',
      zoneId: targetZoneId,
    };
  }

  return {
    rci: finalRci,
    load: Math.round(finalRci * 0.6),
    level: 'Not crowded',
    category: 'low',
    color: '#145C3A',
    bgClass: 'bg-[#145C3A]',
    zoneId: targetZoneId,
  };
}

/**
 * Standard Civic Transit Segment Color Helper
 * Maps corridor segment crowd metric to standard civic colors:
 * - Low Occupancy / Seats Available: #145C3A (Green)
 * - Moderate Occupancy / Standing Room: #E0A51A (Amber/Yellow)
 * - High Occupancy / Crowded: #C64B4B (Red)
 * - Fallback / Insufficient Data: #CBD5E1 (Neutral slate grey)
 */
export function getSegmentColorClass(occupancy) {
  if (occupancy === undefined || occupancy === null) return 'bg-[#CBD5E1]';

  if (typeof occupancy === 'number') {
    const val = occupancy > 1 ? occupancy / 100 : occupancy;
    if (val < 0.60) return 'bg-[#145C3A]';
    if (val < 0.85) return 'bg-[#E0A51A]';
    return 'bg-[#C64B4B]';
  }

  const level = String(occupancy).toLowerCase();
  if (level === 'low' || level === 'seat_available' || level === 'seats' || level === 'not crowded') return 'bg-[#145C3A]';
  if (level === 'medium' || level === 'moderate' || level === 'fairly_crowded' || level === 'fairly crowded') return 'bg-[#E0A51A]';
  if (level === 'high' || level === 'crowded' || level === 'very_crowded' || level === 'very crowded') return 'bg-[#C64B4B]';

  return 'bg-[#CBD5E1]';
}

/**
 * Standard Civic Transit Stop Node Circle Color Helper
 * Returns the tailwind background color class for a stop circle node based on expected crowd.
 * - Low crowd / Seats Available: #145C3A (Green)
 * - Moderate crowd / Standing Room: #E0A51A (Amber/Yellow)
 * - High crowd / Crowded: #C64B4B (Red)
 * - Fallback / Unknown: #BDC7C1 (Slate grey)
 */
export function getStopCrowdColorClass(stop, stopIndex, totalStops, zoneBreakdown = [], crowdCategory = 'moderate') {
  if (stop?.node_color_class) return stop.node_color_class;
  if (stop?.crowd_color) {
    if (stop.crowd_color === '#C64B4B') return 'bg-[#C64B4B]';
    if (stop.crowd_color === '#E0A51A') return 'bg-[#E0A51A]';
    if (stop.crowd_color === '#145C3A') return 'bg-[#145C3A]';
  }

  const occ = stop?.stop_occupancy ?? stop?.occupancyToNextStop ?? stop?.occupancy_to_next_stop;
  if (typeof occ === 'number') {
    const val = occ > 1 ? occ / 100 : occ;
    if (val >= 0.85) return 'bg-[#C64B4B]';
    if (val >= 0.60) return 'bg-[#E0A51A]';
    return 'bg-[#145C3A]';
  }

  const cat = String(stop?.crowd_level || stop?.crowd || '').toLowerCase();
  if (cat.includes('high') || cat.includes('crowd') || cat.includes('very')) return 'bg-[#C64B4B]';
  if (cat.includes('mod') || cat.includes('fair') || cat.includes('stand')) return 'bg-[#E0A51A]';
  if (cat.includes('low') || cat.includes('seat') || cat.includes('not')) return 'bg-[#145C3A]';

  const legOcc = getLegOccupancy(stopIndex, totalStops, zoneBreakdown, crowdCategory);
  if (legOcc.category === 'high' || legOcc.rci >= 85) return 'bg-[#C64B4B]';
  if (legOcc.category === 'moderate' || legOcc.rci >= 60) return 'bg-[#E0A51A]';
  return 'bg-[#145C3A]';
}
