// Shared helpers for the profile SVG generator: fonts (subset + embedded),
// text measurement, icons and small drawing utilities.
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import opentype from 'opentype.js';
import subsetFont from 'subset-font';

const NM = fileURLToPath(new URL('../node_modules/', import.meta.url));

export const T = {
  ink: '#0A0A0B',
  ink2: '#0F0F11',
  ink3: '#151518',
  line: '#1E1E23',
  line2: '#2A2A30',
  text: '#EDEDEF',
  muted: '#8B8B94',
  faint: '#55555E',
  ghost: '#34343B',
  lime: '#C6F432',
  limeDim: '#8FB021',
  cyan: '#39C7D8',
  orange: '#FF7039',
  cream: '#F8EFE3',
  green: '#0D3B1E',
};

const GEIST = 'geist/dist/fonts/geist-sans/';
const GEIST_MONO = 'geist/dist/fonts/geist-mono/';
const FS = '@fontsource/';

const FONT_FILES = {
  sans400: GEIST + 'Geist-Regular.ttf',
  sans500: GEIST + 'Geist-Medium.ttf',
  sans600: GEIST + 'Geist-SemiBold.ttf',
  sans700: GEIST + 'Geist-Bold.ttf',
  sans900: GEIST + 'Geist-Black.ttf',
  mono400: GEIST_MONO + 'GeistMono-Regular.ttf',
  mono500: GEIST_MONO + 'GeistMono-Medium.ttf',
  serifI: FS + 'instrument-serif/files/instrument-serif-latin-400-italic.woff',
  serif: FS + 'instrument-serif/files/instrument-serif-latin-400-normal.woff',
  dmSerif: FS + 'dm-serif-display/files/dm-serif-display-latin-400-normal.woff',
  dmSerifI: FS + 'dm-serif-display/files/dm-serif-display-latin-400-italic.woff',
  dmSans400: FS + 'dm-sans/files/dm-sans-latin-400-normal.woff',
  dmSans500: FS + 'dm-sans/files/dm-sans-latin-500-normal.woff',
  dmSans700: FS + 'dm-sans/files/dm-sans-latin-700-normal.woff',
  bvp400: FS + 'be-vietnam-pro/files/be-vietnam-pro-latin-400-normal.woff',
  bvp600: FS + 'be-vietnam-pro/files/be-vietnam-pro-latin-600-normal.woff',
  bvp800: FS + 'be-vietnam-pro/files/be-vietnam-pro-latin-800-normal.woff',
};

const FALLBACK = {
  mono: "ui-monospace,SFMono-Regular,Menlo,Consolas,monospace",
  serif: "Georgia,'Times New Roman',serif",
  sans: "-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif",
};
const fallbackFor = (k) =>
  k.startsWith('mono') ? FALLBACK.mono : /serif|dmSerif/i.test(k) ? FALLBACK.serif : FALLBACK.sans;

const parsed = new Map();
export function font(key) {
  if (!parsed.has(key)) {
    const buf = fs.readFileSync(NM + FONT_FILES[key]);
    parsed.set(key, opentype.parse(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength)));
  }
  return parsed.get(key);
}

// Manual layout (cmap + kerning only): opentype.js trips over Geist's GSUB.
function layout(str, key, size) {
  const f = font(key);
  const scale = size / f.unitsPerEm;
  const glyphs = [...str].map((c) => f.charToGlyph(c));
  const pos = [];
  let x = 0;
  glyphs.forEach((g, i) => {
    pos.push(x);
    x += (g.advanceWidth ?? 0) * scale;
    if (i < glyphs.length - 1) x += f.getKerningValue(g, glyphs[i + 1]) * scale;
  });
  return { glyphs, pos, width: x };
}

export function measure(str, key, size, ls = 0) {
  return layout(str, key, size).width + ls * [...str].length;
}

// Outline path of a string (for halftone sampling).
export function textPath(str, key, x, y, size) {
  const { glyphs, pos } = layout(str, key, size);
  const out = new opentype.Path();
  glyphs.forEach((g, i) => out.extend(g.getPath(x + pos[i], y, size)));
  return out;
}

export const esc = (s) =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const r2 = (n) => Math.round(n * 100) / 100;
export const n = r2;

export class Svg {
  constructor(w, h, title) {
    Object.assign(this, { w, h, title });
    this.chars = {};
    this.styles = [];
    this.defs = [];
    this.parts = [];
  }

  use(key, str) {
    (this.chars[key] ??= new Set());
    for (const c of str) this.chars[key].add(c);
    return `f-${key}`;
  }

  // text(str | runs[], opts). runs: [{t, fill?, font?, cls?, op?}]
  text(content, o = {}) {
    const key = o.font ?? 'sans400';
    const runs = typeof content === 'string' ? null : content;
    const attrs = [
      `x="${r2(o.x ?? 0)}"`,
      `y="${r2(o.y ?? 0)}"`,
      `class="${[this.use(key, runs ? '' : content), o.cls].filter(Boolean).join(' ')}"`,
      `font-size="${o.size ?? 14}"`,
      o.fill && `fill="${o.fill}"`,
      o.anchor && `text-anchor="${o.anchor}"`,
      o.ls && `letter-spacing="${o.ls}"`,
      o.op != null && `opacity="${o.op}"`,
      o.style && `style="${o.style}"`,
      o.pre && 'xml:space="preserve"',
      o.attrs,
    ].filter(Boolean);
    const body = runs
      ? runs
          .map((r) => {
            const k = r.font ?? key;
            const cls = [k !== key && this.use(k, r.t), r.cls].filter(Boolean).join(' ');
            if (k === key) this.use(key, r.t);
            const a = [cls && `class="${cls}"`, r.fill && `fill="${r.fill}"`, r.op != null && `opacity="${r.op}"`, r.dx != null && `dx="${r.dx}"`]
              .filter(Boolean)
              .join(' ');
            return a ? `<tspan ${a}>${esc(r.t)}</tspan>` : esc(r.t);
          })
          .join('')
      : esc(content);
    return `<text ${attrs.join(' ')}>${body}</text>`;
  }

  add(...s) {
    this.parts.push(...s.flat());
    return this;
  }
  css(s) {
    this.styles.push(s);
    return this;
  }
  def(...s) {
    this.defs.push(...s.flat());
    return this;
  }

  async render() {
    const faces = await Promise.all(
      Object.entries(this.chars)
        .filter(([, set]) => set.size)
        .map(async ([k, set]) => {
          const buf = fs.readFileSync(NM + FONT_FILES[k]);
          const sub = await subsetFont(buf, [...set].join('') + ' ', { targetFormat: 'woff2' });
          return `@font-face{font-family:'f-${k}';src:url(data:font/woff2;base64,${sub.toString('base64')}) format('woff2')}.f-${k}{font-family:'f-${k}',${fallbackFor(k)}}`;
        }),
    );
    return [
      `<svg xmlns="http://www.w3.org/2000/svg" width="${this.w}" height="${this.h}" viewBox="0 0 ${this.w} ${this.h}" fill="none" role="img" aria-label="${esc(this.title)}">`,
      `<title>${esc(this.title)}</title>`,
      `<style>${faces.join('')}${this.styles.join('')}</style>`,
      `<defs>${this.defs.join('')}</defs>`,
      ...this.parts,
      `</svg>`,
    ].join('\n');
  }
}

// ---- drawing utilities -------------------------------------------------

// A simple-icons glyph (24x24 viewBox) placed at x,y with given size.
export function icon(si, x, y, size, fill, extra = '') {
  return `<path transform="translate(${r2(x)} ${r2(y)}) scale(${r2(size / 24)})" d="${si.path}" fill="${fill}" ${extra}/>`;
}

// LinkedIn isn't in simple-icons anymore; this is a plain "in" mark.
export const linkedinPath =
  'M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13zM7.12 20.45H3.56V9h3.56v11.45z';

// Dot-grid pattern definition.
export function dotPattern(id, gap, r, fill, op = 1) {
  return `<pattern id="${id}" width="${gap}" height="${gap}" patternUnits="userSpaceOnUse"><circle cx="${gap / 2}" cy="${gap / 2}" r="${r}" fill="${fill}" opacity="${op}"/></pattern>`;
}

// Circle as path segment (for packing many dots into one <path>).
export const dot = (x, y, r) =>
  `M${r2(x - r)} ${r2(y)}a${r2(r)} ${r2(r)} 0 1 0 ${r2(2 * r)} 0a${r2(r)} ${r2(r)} 0 1 0 ${r2(-2 * r)} 0`;

// Card frame shared by every section.
export function frame(svg, { fill = T.ink, stroke = T.line, rx = 18 } = {}) {
  return `<rect x="0.5" y="0.5" width="${svg.w - 1}" height="${svg.h - 1}" rx="${rx}" fill="${fill}" stroke="${stroke}"/>`;
}

export function clipCard(svg, id = 'card', rx = 18) {
  svg.def(`<clipPath id="${id}"><rect x="0.5" y="0.5" width="${svg.w - 1}" height="${svg.h - 1}" rx="${rx}"/></clipPath>`);
  return `clip-path="url(#${id})"`;
}

// Small mono section label: "01 — WHOAMI"
export function label(svg, x, y, num, name, o = {}) {
  return svg.text(
    [
      { t: num, fill: o.numFill ?? T.lime },
      { t: '  —  ' + name.toUpperCase(), fill: o.fill ?? T.muted },
    ],
    { x, y, font: 'mono500', size: 11, ls: 1.4, anchor: o.anchor },
  );
}

// Seeded PRNG so every build is reproducible.
export function rng(seed = 7) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Flatten an opentype path into polygons (arrays of [x,y]).
export function pathToPolys(p, step = 6) {
  const polys = [];
  let cur = [];
  let x = 0, y = 0;
  for (const c of p.commands) {
    if (c.type === 'M') {
      if (cur.length) polys.push(cur);
      cur = [[c.x, c.y]];
      x = c.x; y = c.y;
    } else if (c.type === 'L') {
      cur.push([c.x, c.y]); x = c.x; y = c.y;
    } else if (c.type === 'Q') {
      for (let i = 1; i <= step; i++) {
        const t = i / step, u = 1 - t;
        cur.push([u * u * x + 2 * u * t * c.x1 + t * t * c.x, u * u * y + 2 * u * t * c.y1 + t * t * c.y]);
      }
      x = c.x; y = c.y;
    } else if (c.type === 'C') {
      for (let i = 1; i <= step; i++) {
        const t = i / step, u = 1 - t;
        cur.push([
          u * u * u * x + 3 * u * u * t * c.x1 + 3 * u * t * t * c.x2 + t * t * t * c.x,
          u * u * u * y + 3 * u * u * t * c.y1 + 3 * u * t * t * c.y2 + t * t * t * c.y,
        ]);
      }
      x = c.x; y = c.y;
    } else if (c.type === 'Z') {
      if (cur.length) polys.push(cur);
      cur = [];
    }
  }
  if (cur.length) polys.push(cur);
  return polys;
}

// Nonzero winding test across all polygons.
export function inside(polys, px, py) {
  let wn = 0;
  for (const poly of polys) {
    for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
      const [xi, yi] = poly[i];
      const [xj, yj] = poly[j];
      if (yj <= py) {
        if (yi > py && (xi - xj) * (py - yj) - (px - xj) * (yi - yj) > 0) wn++;
      } else if (yi <= py && (xi - xj) * (py - yj) - (px - xj) * (yi - yj) < 0) wn--;
    }
  }
  return wn !== 0;
}

// Greedy word wrap using real glyph metrics.
export function wrap(str, key, size, maxW) {
  const words = str.split(' ');
  const lines = [];
  let cur = '';
  for (const w of words) {
    const next = cur ? cur + ' ' + w : w;
    if (measure(next, key, size) > maxW && cur) {
      lines.push(cur);
      cur = w;
    } else cur = next;
  }
  if (cur) lines.push(cur);
  return lines;
}
