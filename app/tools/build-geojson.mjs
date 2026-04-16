#!/usr/bin/env node
/**
 * Convert world-atlas countries-110m topojson → static GeoJSON served by the app.
 *
 * - Produces static/geo/countries-110m.json (lean, offline-safe).
 * - Rewrites polygons crossing the ±180° antimeridian so they never produce
 *   the "line-across-the-world" rendering artefact. Strategy: for any ring
 *   that spans more than 180° of longitude, we detect each dateline jump
 *   and split the ring into two rings (one per hemisphere) by inserting
 *   synthetic dateline points with linearly-interpolated latitude.
 *   This matches how `d3-geo` handles antimeridian cuts, but tailored for
 *   our simple rendering needs (no projection remapping).
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { feature } from 'topojson-client';

const here = dirname(fileURLToPath(import.meta.url));
const appRoot = resolve(here, '..');

const topology = JSON.parse(
  readFileSync(resolve(appRoot, 'node_modules/world-atlas/countries-110m.json'), 'utf8')
);

const collection = feature(topology, topology.objects.countries);

/**
 * Split a ring into per-hemisphere sub-rings (never crossing the dateline).
 * We walk the ring exactly once. For every jump > 180° in longitude, we
 * close the current chain by appending a dateline point, and start a new
 * chain on the opposite side. Chains belonging to the same hemisphere are
 * then stitched together along the dateline.
 *
 * Returns: Array of closed rings, each entirely in the east or west hemisphere.
 */
function splitRingAtAntimeridian(ring) {
  if (ring.length < 4) return [ring];
  const chains = []; // each chain: { side: 'E' | 'W', points: [[lng,lat], ...] }
  let current = { side: hemisphere(ring[0][0]), points: [ring[0]] };
  for (let i = 1; i < ring.length; i++) {
    const prev = ring[i - 1];
    const cur = ring[i];
    const dlng = cur[0] - prev[0];
    if (Math.abs(dlng) > 180) {
      const exitingEast = dlng < 0; // we're leaving the east hemisphere toward west
      const exitLng = exitingEast ? 180 : -180;
      const enterLng = -exitLng;
      // interpolate latitude using unwrapped prev→cur longitudes
      const unwrappedCur = exitingEast ? cur[0] + 360 : cur[0] - 360;
      const t = (exitLng - prev[0]) / (unwrappedCur - prev[0]);
      const lat = prev[1] + (cur[1] - prev[1]) * t;
      current.points.push([exitLng, lat]);
      chains.push(current);
      current = { side: exitingEast ? 'W' : 'E', points: [[enterLng, lat], cur] };
    } else {
      current.points.push(cur);
    }
  }
  chains.push(current);

  if (chains.length === 1) return [ring]; // no crossing found, return as-is

  // Group by side and stitch: a closed ring always returns to start, so the last
  // chain's side matches the first chain's side. We merge last→first, then walk
  // adjacent chains of the same side to close their rings along the dateline.
  if (chains.length >= 2 && chains[0].side === chains[chains.length - 1].side) {
    const last = chains.pop();
    chains[0] = { side: chains[0].side, points: [...last.points, ...chains[0].points.slice(1)] };
  }

  // For each chain, close the ring along the dateline (vertical segment at ±180°).
  const closed = [];
  for (const ch of chains) {
    const pts = ch.points;
    const f = pts[0];
    const l = pts[pts.length - 1];
    const ring = [...pts];
    if (f[0] !== l[0] || f[1] !== l[1]) ring.push(f); // close
    if (ring.length >= 4) closed.push(ring);
  }
  return closed;
}

function hemisphere(lng) {
  return lng >= 0 ? 'E' : 'W';
}

let splitCount = 0;
for (const f of collection.features) {
  const id = String(f.id).padStart(3, '0');
  f.id = id;
  if (f.properties) f.properties.iso = id;
  const g = f.geometry;
  if (!g) continue;
  if (g.type === 'Polygon') {
    const rings = splitRingAtAntimeridian(g.coordinates[0]);
    if (rings.length > 1) {
      splitCount += rings.length - 1;
      f.geometry = { type: 'MultiPolygon', coordinates: rings.map((r) => [r]) };
    } else {
      g.coordinates[0] = rings[0];
    }
  } else if (g.type === 'MultiPolygon') {
    const newPolys = [];
    for (const poly of g.coordinates) {
      const rings = splitRingAtAntimeridian(poly[0]);
      if (rings.length > 1) splitCount += rings.length - 1;
      for (const outer of rings) newPolys.push([outer]);
    }
    g.coordinates = newPolys;
  }
}

const out = resolve(appRoot, 'static/geo');
mkdirSync(out, { recursive: true });
const target = resolve(out, 'countries-110m.json');
writeFileSync(target, JSON.stringify(collection));
console.log(
  `✔ ${target}  (${collection.features.length} features, ${splitCount} antimeridian split(s))`
);
