// 02/03 — the two companies, each card speaking its own brand language,
// with the live landing page auto-scrolling inside a browser window.
import fs from 'node:fs';
import { Svg, T, measure, wrap, clipCard, dotPattern, rng, n } from './lib.mjs';

const W = 840;
const H = 340;
const shot = (name) =>
  'data:image/jpeg;base64,' + fs.readFileSync(new URL(`../screens/${name}-lp.jpg`, import.meta.url)).toString('base64');
// Official logos live in ../brand.
const brand = (file) => fs.readFileSync(new URL(`../brand/${file}`, import.meta.url));

// Browser window with an auto-scrolling page screenshot.
function browser(s, o) {
  const { x, y, w, h, url, img, imgH, bar, barText, frameFill, stroke, pill, id } = o;
  const barH = 30;
  const vh = h - barH;
  const scale = w / 728;
  const fullH = imgH * scale;
  const travel = fullH - vh;
  const stops = [0, travel * 0.36, travel * 0.7, travel];
  s.css(`
    .${id}s{animation:${id}s 16s cubic-bezier(.65,0,.35,1) infinite}
    @keyframes ${id}s{
      0%,14%{transform:translateY(0)}
      24%,38%{transform:translateY(-${n(stops[1])}px)}
      48%,62%{transform:translateY(-${n(stops[2])}px)}
      72%,86%{transform:translateY(-${n(stops[3])}px)}
      96%,100%{transform:translateY(0)}}
  `);
  s.def(`<clipPath id="${id}v"><rect x="${x}" y="${y + barH}" width="${w}" height="${vh}" rx="0"/></clipPath>`);
  s.def(`<clipPath id="${id}w"><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="12"/></clipPath>`);
  const urlW = measure(url, 'mono400', 10.5) + 34;
  return [
    `<g clip-path="url(#${id}w)">`,
    `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${frameFill}"/>`,
    `<rect x="${x}" y="${y}" width="${w}" height="${barH}" fill="${bar}"/>`,
    [0, 1, 2].map((i) => `<circle cx="${x + 15 + i * 13}" cy="${y + barH / 2}" r="4" fill="${barText}" opacity=".35"/>`).join(''),
    `<rect x="${n(x + w / 2 - urlW / 2)}" y="${y + 7}" width="${n(urlW)}" height="16" rx="8" fill="${pill}"/>`,
    `<path transform="translate(${n(x + w / 2 - urlW / 2 + 10)} ${y + 11}) scale(.33)" d="M7 10V7a5 5 0 0 1 10 0v3M5 10h14v11H5z" stroke="${barText}" stroke-width="3" fill="none" opacity=".7"/>`,
    s.text(url, { x: x + w / 2 + 7, y: y + 18.6, font: 'mono400', size: 10.5, fill: barText, anchor: 'middle' }),
    `<g clip-path="url(#${id}v)"><g class="${id}s"><image href="${img}" x="${x}" y="${y + barH}" width="${w}" height="${n(fullH)}" preserveAspectRatio="xMidYMin slice"/></g></g>`,
    `</g>`,
    `<rect x="${x + 0.5}" y="${y + 0.5}" width="${w - 1}" height="${h - 1}" rx="12" stroke="${stroke}"/>`,
  ];
}

// Pill row (tags), returns svg + width used.
function tags(s, list, x, y, o) {
  let cx = x;
  const out = [];
  for (const t of list) {
    const tw = measure(t, 'mono500', 9.5, 1) + 18;
    out.push(
      `<rect x="${n(cx)}" y="${y - 13}" width="${n(tw)}" height="19" rx="9.5" stroke="${o.stroke}" fill="${o.fill ?? 'none'}"/>`,
      s.text(t, { x: cx + tw / 2, y: y, font: 'mono500', size: 9.5, ls: 1, fill: o.text, anchor: 'middle' }),
    );
    cx += tw + 6;
  }
  return out.join('');
}

function cta(s, text, x, y, o) {
  const tw = measure(text, o.font, 12.5) + 50;
  return [
    `<g class="cta">`,
    `<rect x="${x}" y="${y}" width="${n(tw)}" height="34" rx="17" fill="${o.bg}"/>`,
    s.text(text, { x: x + 18, y: y + 21.5, font: o.font, size: 12.5, fill: o.fg }),
    `<g class="nudge"><path d="M${n(x + tw - 26)} ${y + 17}h9m-3.5-3.5 3.5 3.5-3.5 3.5" stroke="${o.fg}" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></g>`,
    `</g>`,
  ].join('');
}

const COMMON_CSS = `
  .nudge{animation:nudge 2.2s ease-in-out infinite}
  @keyframes nudge{0%,60%,100%{transform:translateX(0)}30%{transform:translateX(3px)}}
`;

// ---------------------------------------------------------------- WeGrow
async function wegrow() {
  const s = new Svg(W, H, 'WeGrow: your entire acquisition system, built and running in 90 days. Co-founded by Olivier Rubinger.');
  const BG = '#040303';
  const C = T.cyan;
  const rand = rng(11);
  s.css(COMMON_CSS + `
    .px{animation:px 3.6s ease-in-out infinite;opacity:.15}
    @keyframes px{0%,100%{opacity:.12}50%{opacity:1}}
  `);
  s.def(
    dotPattern('wgdots', 11, 0.9, '#fff', 0.16),
    `<radialGradient id="wgm1" cx="22%" cy="8%" r="38%"><stop offset="0" stop-color="#fff"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>`,
    `<radialGradient id="wgm2" cx="96%" cy="92%" r="40%"><stop offset="0" stop-color="#fff"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>`,
    `<mask id="wgmask"><rect width="${W}" height="${H}" fill="url(#wgm1)"/><rect width="${W}" height="${H}" fill="url(#wgm2)"/></mask>`,
    `<radialGradient id="wgglow"><stop offset="0" stop-color="${C}" stop-opacity=".22"/><stop offset="1" stop-color="${C}" stop-opacity="0"/></radialGradient>`,
  );
  const clip = clipCard(s, 'wgc');
  s.add(`<rect x=".5" y=".5" width="${W - 1}" height="${H - 1}" rx="18" fill="${BG}" stroke="#1C1B1B"/>`, `<g ${clip}>`);
  s.add(`<rect width="${W}" height="${H}" fill="url(#wgdots)" mask="url(#wgmask)"/>`);
  s.add(`<ellipse cx="640" cy="200" rx="260" ry="170" fill="url(#wgglow)"/>`);

  // cyan pixel cluster (their signature dot field)
  const px = [];
  for (let r = 0; r < 6; r++)
    for (let c = 0; c < 9; c++) {
      const dx = c - 4, dy = r - 2.5;
      if (dx * dx * 0.5 + dy * dy > 8 + rand() * 4) continue;
      px.push(`<rect class="px" x="${330 + c * 9}" y="${258 + r * 9}" width="5" height="5" rx="1" fill="${C}" style="animation-delay:${n(rand() * 3.6)}s"/>`);
    }
  s.add(px);

  // left column
  const X = 40;
  s.add(
    s.text([{ t: '02', fill: C }, { t: '  /  CO-FOUNDER', fill: '#8A8A8A' }, { t: '  ·  SINCE JUN 2026', fill: '#555352' }], { x: X, y: 46, font: 'mono500', size: 11, ls: 1.4 }),
  );
  // official horizontal logo (white on transparent, 620×127)
  const wgH = 40;
  s.add(
    `<image href="data:image/png;base64,${brand('wegrow-logo.png').toString('base64')}" x="${X}" y="68" width="${n((wgH * 620) / 127)}" height="${wgH}"/>`,
  );
  s.add(
    s.text('Your entire acquisition system,', { x: X, y: 140, font: 'bvp600', size: 17, fill: '#fff' }),
    s.text('built and running in 90 days.', { x: X, y: 163, font: 'serifI', size: 21, fill: 'rgba(255,255,255,.82)' }),
  );
  const desc = wrap(
    'We map how customers actually find you, design the process behind it and build the systems that run it: CRM, AI sales agents, prospecting and data.',
    'bvp400', 12.5, 350,
  );
  desc.forEach((l, i) => s.add(s.text(l, { x: X, y: 194 + i * 18.5, font: 'bvp400', size: 12.5, fill: '#8A8A8A' })));
  s.add(tags(s, ['AI SDR', 'CRM', 'GROWTH SYSTEMS', 'DATA'], X, 263, { stroke: '#2A2929', text: '#A5A5A5' }));
  s.add(cta(s, 'lp.bywegrow.com', X, 280, { bg: C, fg: '#041014', font: 'bvp600' }));

  s.add(
    browser(s, {
      id: 'wg', x: 440, y: 34, w: 368, h: 272, url: 'lp.bywegrow.com', img: shot('wegrow'), imgH: 1365,
      bar: '#121111', barText: '#BDBDBD', frameFill: BG, stroke: '#2A2828', pill: '#1C1B1B',
    }),
  );
  s.add('</g>');
  return s.render();
}

// ---------------------------------------------------------------- Tarsi AI
async function tarsi() {
  const s = new Svg(W, H, 'Tarsi AI: behind every great brand. AI-powered brand ecosystem co-founded by Olivier Rubinger.');
  const G = '#0D3B1E';
  const G2 = '#0C511B';
  const O = T.orange;
  const CR = T.cream;
  s.css(COMMON_CSS + `
    .wv1{animation:wv 9s linear infinite}
    .wv2{animation:wv 13s linear infinite reverse}
    .wv3{animation:wv 7s linear infinite}
    @keyframes wv{to{transform:translateX(-160px)}}
    .spk{transform-box:fill-box;transform-origin:center;animation:spk 3.2s ease-in-out infinite}
    @keyframes spk{0%,100%{transform:scale(.55) rotate(0);opacity:.5}50%{transform:scale(1) rotate(45deg);opacity:1}}
    .sun{animation:sun 6s ease-in-out infinite alternate}
    @keyframes sun{from{transform:translateY(8px)}to{transform:translateY(-6px)}}
  `);
  const clip = clipCard(s, 'tc');
  s.add(`<rect x=".5" y=".5" width="${W - 1}" height="${H - 1}" rx="18" fill="${CR}" stroke="#E6DccB"/>`, `<g ${clip}>`);

  // sun + waves (periodic paths, translated by one wavelength for a seamless loop)
  const wave = (y0, amp, len, fill, cls) => {
    let d = `M-20 ${H + 10}V${y0}`;
    for (let x = -20; x <= W + 200; x += len / 2) {
      const up = Math.round((x + 20) / (len / 2)) % 2 === 0;
      d += `q${len / 4} ${up ? -amp : amp} ${len / 2} 0`;
    }
    d += `V${H + 10}Z`;
    return `<path class="${cls}" d="${d}" fill="${fill}"/>`;
  };
  s.add(
    `<g class="sun"><circle cx="760" cy="300" r="66" fill="${O}"/></g>`,
    wave(302, 9, 160, G2, 'wv2'),
    wave(312, 7, 160, O, 'wv1'),
    wave(322, 8, 160, G, 'wv3'),
  );
  // flowing contour lines on the green band, like the brand illustration
  s.add(`<g class="wv3" opacity=".55">${wave(331, 5, 160, 'none', '').replace('fill="none"', `fill="none" stroke="${O}" stroke-width="1.2"`)}</g>`);

  // sparkles
  const star = (x, y, r, fill, d) =>
    `<path class="spk" style="animation-delay:${d}s" d="M${x} ${y - r}C${x + r * 0.15} ${y - r * 0.15} ${x + r * 0.15} ${y - r * 0.15} ${x + r} ${y}C${x + r * 0.15} ${y + r * 0.15} ${x + r * 0.15} ${y + r * 0.15} ${x} ${y + r}C${x - r * 0.15} ${y + r * 0.15} ${x - r * 0.15} ${y + r * 0.15} ${x - r} ${y}C${x - r * 0.15} ${y - r * 0.15} ${x - r * 0.15} ${y - r * 0.15} ${x} ${y - r}Z" fill="${fill}"/>`;
  s.add(
    star(300, 84, 10, O, 0),
    star(420, 222, 6, G, 1.1),
    star(352, 126, 5, O, 2.0),
    star(250, 66, 4, G, 0.6),
    `<circle cx="336" cy="96" r="3.2" fill="${G}"/><circle cx="424" cy="160" r="2.4" fill="${O}"/>`,
  );

  // left column
  const X = 40;
  s.add(s.text([{ t: '03', fill: O }, { t: '  /  CO-FOUNDER', fill: '#5B6B52' }, { t: '  ·  SINCE APR 2026', fill: '#8E9A84' }], { x: X, y: 46, font: 'mono500', size: 11, ls: 1.4 }));
  // official logo, inlined as vector and cropped to the artwork's bbox
  const logo = brand('tarsi-logo.svg')
    .toString()
    .replace(/<\?xml[^>]*>/, '')
    .replace(/^\s*<svg[^>]*>/, '')
    .replace(/<\/svg>\s*$/, '');
  const TB = [741.88, 574.49, 1678.15, 488.56];
  const tH = 50;
  s.add(`<svg x="${X}" y="62" width="${n((tH * TB[2]) / TB[3])}" height="${tH}" viewBox="${TB.join(' ')}">${logo}</svg>`);
  s.add(s.text([{ t: 'Behind every great brand', fill: G }, { t: '.', fill: O }], { x: X, y: 142, font: 'dmSerifI', size: 23 }));
  const desc = wrap(
    'An AI-powered brand ecosystem with professional product photos, custom logos, brandbooks and an online store. Identity, content and presence, all connected.',
    'dmSans400', 12.8, 352,
  );
  desc.forEach((l, i) => s.add(s.text(l, { x: X, y: 174 + i * 18.5, font: 'dmSans400', size: 12.8, fill: '#4A5A42' })));
  s.add(tags(s, ['PRODUCT PHOTOS', 'LOGO', 'BRANDBOOK', 'STORE'], X, 248, { stroke: '#CFC5B2', text: G }));
  s.add(cta(s, 'tarsi-ai.com', X, 264, { bg: G, fg: CR, font: 'dmSans500' }));

  s.add(
    browser(s, {
      id: 'ta', x: 448, y: 30, w: 360, h: 262, url: 'tarsi-ai.com', img: shot('tarsi'), imgH: 1308,
      bar: '#FFFBF4', barText: G, frameFill: CR, stroke: '#D9CEBB', pill: '#F1E7D6',
    }),
  );
  s.add('</g>');
  return s.render();
}

export async function build() {
  return { 'project-wegrow': await wegrow(), 'project-tarsi': await tarsi() };
}
