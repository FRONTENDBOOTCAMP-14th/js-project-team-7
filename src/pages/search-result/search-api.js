import pLimit from 'p-limit';
import { CONFIG } from './config.js';

const limit = pLimit(3);
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export function getPhotoUrl(photoReference, apiKey = CONFIG.PHOTO_API_KEY, maxWidth = 400) {
  if (!photoReference || !apiKey) return null;
  return `https://maps.googleapis.com/maps/api/place/photo?maxwidth=${maxWidth}&photo_reference=${photoReference}&key=${apiKey}`;
}

export async function getCityData(cities, option) {
  if (!Array.isArray(cities) || cities.length === 0) {
    console.warn('getCityData: cities must be a non-empty array');
    return [];
  }

  const urlBase = 'https://google-map-places.p.rapidapi.com/maps/api/place/textsearch/json';
  const headers = {
    'x-rapidapi-key': CONFIG.PLACE_API_KEY,
    'x-rapidapi-host': 'google-map-places.p.rapidapi.com',
  };

  const fetchCityData = async (city) => {
    return limit(async () => {
      await delay(CONFIG.API_DELAY_MS);
      try {
        const url = new URL(urlBase);
        url.search = new URLSearchParams({
          query: `${city} ${option}`,
          language: 'ko',
        }).toString();

        console.log(url);

        const response = await fetch(url, {
          method: 'GET',
          headers,
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        console.log(`Fetched data for ${city}:`, data);

        return {
          city,
          results: data.results || [],
          status: 'success',
        };
      } catch (error) {
        console.error(`Failed to fetch data for city ${city}:`, error);
        return {
          city,
          results: [],
          error: error.message,
          status: 'error',
        };
      }
    });
  };

  const requests = cities.map(fetchCityData);
  return Promise.all(requests);
}
