/**
 * CrowdWise API Client
 * Centralized API calls with consistent error handling and standard envelope unwrapping.
 */

const BASE_URL = '/api';

export async function fetchApi(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  try {
    const res = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });
    const json = await res.json();
    if (!res.ok || json.ok === false) {
      throw new Error(json.error?.message || `API error: ${res.status}`);
    }
    return json;
  } catch (err) {
    console.error(`API Request to ${url} failed:`, err);
    throw err;
  }
}

export async function checkHealth() {
  return fetchApi('/health');
}

export async function searchStops(query, limit = 8) {
  if (!query || query.trim().length === 0) return [];
  const res = await fetchApi(`/stops/search?q=${encodeURIComponent(query)}&limit=${limit}`);
  if (Array.isArray(res.data)) return res.data;
  return res.data?.matches || [];
}

export async function getSuggestedStops(limit = 8) {
  try {
    const res = await fetchApi(`/stops/suggested?limit=${limit}`);
    if (Array.isArray(res.data)) return res.data;
    return res.data?.matches || [];
  } catch {
    return [];
  }
}

export async function planJourney({ originId, destId, departureTime, preference, date, offsetMinutes = 0 }) {
  const params = new URLSearchParams({
    origin_id: originId,
    dest_id: destId,
  });
  if (departureTime) params.append('departure_time', departureTime);
  if (preference) params.append('preference', preference);
  if (date) params.append('date', date);
  if (offsetMinutes !== undefined && offsetMinutes !== null) {
    params.append('offset_minutes', String(offsetMinutes));
  }

  return fetchApi(`/journey/plan?${params.toString()}`);
}

export async function getRouteFlow(routeId, { direction = 'UP', hour = 8, dayType = 'weekday' } = {}) {
  const cleanRouteId = String(routeId || '433UP').trim();
  const params = new URLSearchParams({
    direction: direction.toUpperCase(),
    hour: String(hour),
    day_type: dayType.toLowerCase(),
  });
  return fetchApi(`/routes/${encodeURIComponent(cleanRouteId)}/flow?${params.toString()}`);
}

export async function getRouteDetails(routeId) {
  return fetchApi(`/routes/${encodeURIComponent(routeId)}`);
}

export async function getRouteCrowdProfile(routeId, dayType = 'WEEKDAY') {
  return fetchApi(`/crowd/profile/${encodeURIComponent(routeId)}?day_type=${dayType}`);
}

export async function getAnalyticsSummary() {
  return fetchApi('/analytics/summary');
}

export async function getDailyVolume() {
  return fetchApi('/analytics/daily-volume');
}

export async function getDataQualityReport() {
  return fetchApi('/data-quality');
}

export async function getModelMetrics() {
  return fetchApi('/model/metrics');
}

export async function getSanityValidation() {
  return fetchApi('/validation/sanity');
}

export async function getOperatorActionSheet({ day_type = 'weekday', hour_start = 0, hour_end = 23, min_confidence = '' } = {}) {
  const params = new URLSearchParams({
    day_type: day_type.toLowerCase(),
    hour_start: String(hour_start),
    hour_end: String(hour_end),
  });
  if (min_confidence) {
    params.append('min_confidence', min_confidence.toLowerCase());
  }
  return fetchApi(`/analytics/operator-action-sheet?${params.toString()}`);
}

export async function getCorridorsMap({ hour = 8, day_type = 'weekday', limit = 50, min_lat, max_lat } = {}) {
  const params = new URLSearchParams({
    hour: String(hour),
    day_type: day_type.toLowerCase(),
    limit: String(limit),
  });
  if (min_lat !== undefined && min_lat !== null) params.append('min_lat', String(min_lat));
  if (max_lat !== undefined && max_lat !== null) params.append('max_lat', String(max_lat));
  return fetchApi(`/analytics/corridors-map?${params.toString()}`);
}

export async function getSensitivity({ day_type = 'WEEKDAY', hour, limit = 10 } = {}) {
  const params = new URLSearchParams({
    day_type: day_type.toUpperCase(),
    limit: String(limit),
  });
  if (hour !== undefined && hour !== null) {
    params.append('hour', String(hour));
  }
  return fetchApi(`/analytics/sensitivity?${params.toString()}`);
}

export function getNetworkExportUrl({ format = 'csv', day_type = 'weekday', hour = 8 } = {}) {
  const params = new URLSearchParams({
    format: format.toLowerCase(),
    day_type: day_type.toLowerCase(),
    hour: String(hour),
  });
  return `/api/analytics/export?${params.toString()}`;
}

export function getRouteExportUrl(routeId, { format = 'csv', day_type = 'weekday', hour = 8 } = {}) {
  const cleanRouteId = String(routeId || '433UP').trim();
  const params = new URLSearchParams({
    format: format.toLowerCase(),
    day_type: day_type.toLowerCase(),
    hour: String(hour),
  });
  return `/api/routes/${encodeURIComponent(cleanRouteId)}/export?${params.toString()}`;
}


