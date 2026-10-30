/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { mapOcmPoiToStation, type RawOcmPoi } from './src/services/ocmService.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

// Open Charge Map API Configuration
const OCM_BASE_URL = 'https://api.openchargemap.io/v3';

/**
 * Health check endpoint indicating whether OPENCHARGEMAP_API_KEY is configured
 */
app.get('/api/health', (req, res) => {
  const hasKey = Boolean(process.env.OPENCHARGEMAP_API_KEY && process.env.OPENCHARGEMAP_API_KEY.trim());
  res.json({
    status: 'ok',
    service: 'ChargeFinder EV Server',
    hasOpenChargeMapKey: hasKey,
    environment: process.env.NODE_ENV || 'development',
  });
});

/**
 * Server-side proxy for Open Charge Map POI API
 * Never exposes the OPENCHARGEMAP_API_KEY to frontend clients.
 */
app.get('/api/stations', async (req, res) => {
  const apiKey = process.env.OPENCHARGEMAP_API_KEY?.trim();

  const lat = parseFloat(req.query.lat as string) || 20.2961; // Bhubaneswar central lat
  const lng = parseFloat(req.query.lng as string) || 85.8245; // Bhubaneswar central lng
  const distance = parseFloat(req.query.distance as string) || 45; // in KM
  const maxResults = parseInt(req.query.maxresults as string, 10) || 50;

  if (!apiKey) {
    return res.status(200).json({
      success: false,
      source: 'Demonstration Prototype',
      count: 0,
      hasApiKey: false,
      error: 'MISSING_API_KEY',
      message:
        'Open Charge Map API key is not configured. Please add the secret OPENCHARGEMAP_API_KEY in the Secrets panel in AI Studio.',
      stations: [],
    });
  }

  try {
    const ocmUrl = new URL(`${OCM_BASE_URL}/poi/`);
    ocmUrl.searchParams.set('latitude', lat.toString());
    ocmUrl.searchParams.set('longitude', lng.toString());
    ocmUrl.searchParams.set('distance', distance.toString());
    ocmUrl.searchParams.set('distanceunit', 'KM');
    ocmUrl.searchParams.set('countrycode', 'IN');
    ocmUrl.searchParams.set('maxresults', maxResults.toString());
    ocmUrl.searchParams.set('compact', 'false');
    ocmUrl.searchParams.set('verbose', 'false');
    ocmUrl.searchParams.set('includecomments', 'true');
    // Supply key as query param and header for maximum compatibility
    ocmUrl.searchParams.set('key', apiKey);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000);

    const ocmResponse = await fetch(ocmUrl.toString(), {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'X-API-Key': apiKey,
        'User-Agent': 'ChargeFinder-EV/1.0 (Bhubaneswar EV Locator)',
      },
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!ocmResponse.ok) {
      const errorText = await ocmResponse.text().catch(() => '');
      console.error(`[OCM API Error] HTTP ${ocmResponse.status}:`, errorText);

      return res.status(200).json({
        success: false,
        source: 'Fallback',
        count: 0,
        hasApiKey: true,
        error: `OCM_HTTP_${ocmResponse.status}`,
        message:
          ocmResponse.status === 401 || ocmResponse.status === 403
            ? 'Open Charge Map API key was rejected. Please verify the key in AI Studio Secrets.'
            : `Open Charge Map API responded with status ${ocmResponse.status}: ${errorText.slice(0, 150)}`,
        stations: [],
      });
    }

    const rawData = await ocmResponse.json();

    if (!Array.isArray(rawData)) {
      console.warn('[OCM API] Unexpected response format (not an array):', rawData);
      return res.status(200).json({
        success: false,
        source: 'Fallback',
        count: 0,
        hasApiKey: true,
        error: 'INVALID_DATA_FORMAT',
        message: 'Open Charge Map returned an unexpected data structure.',
        stations: [],
      });
    }

    const mappedStations = rawData.map((poi: RawOcmPoi) =>
      mapOcmPoiToStation(poi, { lat, lng })
    );

    return res.json({
      success: true,
      source: 'Open Charge Map API',
      count: mappedStations.length,
      hasApiKey: true,
      query: { lat, lng, distanceKm: distance, maxResults },
      stations: mappedStations,
    });
  } catch (err: unknown) {
    const isAbort = (err as Error)?.name === 'AbortError';
    const errorMsg = isAbort ? 'Open Charge Map API request timed out after 12s.' : (err as Error)?.message || 'Failed to fetch OCM data';
    console.error('[OCM Proxy Error]:', errorMsg);

    return res.status(200).json({
      success: false,
      source: 'Fallback',
      count: 0,
      hasApiKey: true,
      error: isAbort ? 'TIMEOUT' : 'FETCH_FAILED',
      message: errorMsg,
      stations: [],
    });
  }
});

// Mount Vite in dev mode or serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.resolve(__dirname, 'dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
  });
} else {
  const { createServer: createViteServer } = await import('vite');
  const vite = await createViteServer({
    server: { middlewareMode: true, host: '0.0.0.0', port: PORT },
    appType: 'spa',
  });
  app.use(vite.middlewares);
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`ChargeFinder EV full-stack server running on http://0.0.0.0:${PORT}`);
});
