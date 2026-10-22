// Spinning ASCII globe frames. Land comes from Natural Earth (world-atlas),
// rasterised once to a 1° grid and cached.
import fs from 'node:fs';
import { createRequire } from 'node:module';
import { feature } from 'topojson-client';
import { geoContains, geoBounds } from 'd3-geo';

const require = createRequire(import.meta.url);
const CACHE = new URL('../.cache-landgrid.json', import.meta.url);

// ISO 3166 numeric ids for the countries Olivier has lived in.
const LIVED = { '076': 'BR', '124': 'CA', '784': 'AE' };

function buildGrid() {
  if (fs.existsSync(CACHE)) return JSON.parse(fs.readFileSync(CACHE, 'utf8'));
  const topo = require('world-atlas/countries-110m.json');
  // bbox prefilter keeps geoContains calls cheap
  const feats = feature(topo, topo.objects.countries).features.map((f) => {
    const [[x0, y0], [x1, y1]] = geoBounds(f);
    return { f, x0, y0, x1, y1, wraps: x0 > x1, lived: !!LIVED[f.id] };
  });
  const grid = [];
  for (let lat = 89.5; lat > -90; lat -= 1) {
    let row = '';
    for (let lon = -179.5; lon < 180; lon += 1) {
      let ch = '0';
      for (const b of feats) {
        if (lat < b.y0 || lat > b.y1) continue;
        if (!b.wraps && (lon < b.x0 || lon > b.x1)) continue;
        if (b.wraps && lon < b.x0 && lon > b.x1) continue;
        if (geoContains(b.f, [lon, lat])) {
          ch = b.lived ? '2' : '1';
          break;
        }
      }
      row += ch;
    }
    grid.push(row);
  }
  fs.writeFileSync(CACHE, JSON.stringify(grid));
  return grid;
}

export function globeFrames({ cols = 36, rows = 19, frames = 40, tilt = 18, startLon = -60 } = {}) {
  const grid = buildGrid();
  const sample = (lat, lon) => {
    const r = Math.min(179, Math.max(0, Math.floor(90 - lat)));
    let c = Math.floor(lon + 180) % 360;
    if (c < 0) c += 360;
    return grid[r][c];
  };
  const ramp = '.:-=+*#%@';
  const tau = (tilt * Math.PI) / 180;
  const L = (() => {
    const v = [-0.45, 0.55, 0.7];
    const m = Math.hypot(...v);
    return v.map((x) => x / m);
  })();

  const out = [];
  for (let f = 0; f < frames; f++) {
    const rot = startLon - (360 * f) / frames; // eastward spin: features drift left → right
    const base = [];
    const lit = [];
    const sea = [];
    for (let r = 0; r < rows; r++) {
      let a = '';
      let b = '';
      let o = '';
      for (let c = 0; c < cols; c++) {
        const u = (c + 0.5 - cols / 2) / (cols / 2);
        const v = (r + 0.5 - rows / 2) / (rows / 2);
        const d2 = u * u + v * v;
        if (d2 > 1) {
          a += ' ';
          b += ' ';
          o += ' ';
          continue;
        }
        const xv = u, yv = -v, zv = Math.sqrt(1 - d2);
        const y = yv * Math.cos(tau) + zv * Math.sin(tau);
        const z = -yv * Math.sin(tau) + zv * Math.cos(tau);
        const lat = (Math.asin(Math.max(-1, Math.min(1, y))) * 180) / Math.PI;
        const lon = (Math.atan2(xv, z) * 180) / Math.PI + rot;
        const wrapped = ((((lon + 180) % 360) + 360) % 360) - 180;
        const bright = Math.max(0, xv * L[0] + yv * L[1] + zv * L[2]);
        const kind = sample(lat, wrapped);
        if (kind === '0') {
          a += ' ';
          b += ' ';
          o += '·';
        } else {
          o += ' ';
          const ch = ramp[Math.min(ramp.length - 1, Math.floor((0.25 + bright * 0.8) * ramp.length))];
          if (kind === '2') {
            a += ' ';
            b += bright > 0.25 ? '@' : '%';
          } else {
            a += ch;
            b += ' ';
          }
        }
      }
      base.push(a);
      lit.push(b);
      sea.push(o);
    }
    out.push({ base, lit, sea });
  }
  return out;
}
