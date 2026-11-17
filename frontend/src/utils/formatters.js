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
  return 'Based on historical data';
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
