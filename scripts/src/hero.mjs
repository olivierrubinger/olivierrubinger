// Hero: halftone dot-matrix name with a light sweep, aurora glow and tagline.
import { Svg, T, textPath, measure, frame, clipCard, dotPattern, dot, pathToPolys, inside, rng, n } from './lib.mjs';

const W = 840;
const H = 360;

function halftone(text, key, size, cx, baseline, pitch) {
  const w = measure(text, key, size);
  const p = textPath(text, key, cx - w / 2, baseline, size);
  const bb = p.getBoundingBox();
  const polys = pathToPolys(p, 8);
  const ss = 4;
  const rMax = pitch * 0.47;
  const dots = [];
  for (let y = Math.floor(bb.y1 / pitch) * pitch; y < bb.y2 + pitch; y += pitch) {
    for (let x = Math.floor(bb.x1 / pitch) * pitch; x < bb.x2 + pitch; x += pitch) {
      let hit = 0;
      for (let i = 0; i < ss; i++)
        for (let j = 0; j < ss; j++)
          if (inside(polys, x + ((i + 0.5) / ss) * pitch, y + ((j + 0.5) / ss) * pitch)) hit++;
      const cov = hit / (ss * ss);
      if (cov > 0.14) dots.push([x + pitch / 2, y + pitch / 2, rMax * Math.sqrt(cov)]);
    }
  }
  return { dots, bb };
}

export async function build() {
  const s = new Svg(W, H, 'Olivier Rubinger, Senior Full-Stack Engineer, co-founder of WeGrow and Tarsi AI');
  const rand = rng(42);

  s.css(`
    .drift1{animation:drift1 16s ease-in-out infinite alternate}
    .drift2{animation:drift2 19s ease-in-out infinite alternate}
    @keyframes drift1{from{transform:translate(0,0)}to{transform:translate(120px,40px)}}
    @keyframes drift2{from{transform:translate(0,0)}to{transform:translate(-140px,-30px)}}
    .tw{animation:tw 4.8s ease-in-out infinite;opacity:0}
    @keyframes tw{0%,100%{opacity:0}45%,55%{opacity:1}}
    .pulse{animation:pulse 2.4s ease-out infinite;transform-box:fill-box;transform-origin:center}
    @keyframes pulse{0%{transform:scale(1);opacity:.7}100%{transform:scale(3.2);opacity:0}}
    .rise{opacity:0;animation:rise .9s cubic-bezier(.2,.7,.2,1) forwards}
    @keyframes rise{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}
    .bob{animation:bob 1.8s ease-in-out infinite}
    @keyframes bob{0%,100%{transform:translateY(0)}50%{transform:translateY(3px)}}
    .scan{animation:scan 1.7s cubic-bezier(.6,0,.3,1) .25s forwards;opacity:0}
    @keyframes scan{0%{opacity:1;transform:translateX(0)}90%{opacity:1}100%{opacity:0;transform:translateX(${W}px)}}
  `);

  s.def(
    dotPattern('grid', 18, 0.85, '#fff', 0.11),
    `<radialGradient id="vig" cx="50%" cy="46%" r="62%"><stop offset="0" stop-color="#fff"/><stop offset=".55" stop-color="#fff" stop-opacity=".55"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>`,
    `<mask id="gridMask"><rect width="${W}" height="${H}" fill="url(#vig)"/></mask>`,
    `<radialGradient id="glowL"><stop offset="0" stop-color="${T.lime}" stop-opacity=".13"/><stop offset="1" stop-color="${T.lime}" stop-opacity="0"/></radialGradient>`,
    `<radialGradient id="glowC"><stop offset="0" stop-color="${T.cyan}" stop-opacity=".16"/><stop offset="1" stop-color="${T.cyan}" stop-opacity="0"/></radialGradient>`,
    `<radialGradient id="glowO"><stop offset="0" stop-color="${T.orange}" stop-opacity=".10"/><stop offset="1" stop-color="${T.orange}" stop-opacity="0"/></radialGradient>`,
    `<linearGradient id="nameFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F4F4F6"/><stop offset="1" stop-color="#9C9CA6"/></linearGradient>`,
    `<linearGradient id="sweep" gradientUnits="userSpaceOnUse" x1="-260" y1="0" x2="0" y2="0">
       <stop offset="0" stop-color="${T.lime}" stop-opacity="0"/>
       <stop offset=".55" stop-color="${T.lime}" stop-opacity=".95"/>
       <stop offset=".62" stop-color="#fff" stop-opacity="1"/>
       <stop offset=".7" stop-color="${T.lime}" stop-opacity=".9"/>
       <stop offset="1" stop-color="${T.lime}" stop-opacity="0"/>
       <animateTransform attributeName="gradientTransform" type="translate" values="0 0;0 0;${W + 300} 0;${W + 300} 0" keyTimes="0;.32;.72;1" dur="7s" begin="1.6s" repeatCount="indefinite"/>
     </linearGradient>`,
    `<mask id="boot"><rect x="0" y="0" width="0" height="${H}" fill="#fff"><animate attributeName="width" from="0" to="${W}" dur="1.7s" begin=".25s" fill="freeze" calcMode="spline" keyTimes="0;1" keySplines=".6 0 .3 1"/></rect></mask>`,
  );

  const clip = clipCard(s);
  s.add(frame(s));
  s.add(`<g ${clip}>`);

  // aurora
  s.add(
    `<g class="drift1"><ellipse cx="170" cy="40" rx="330" ry="170" fill="url(#glowL)"/></g>`,
    `<g class="drift2"><ellipse cx="700" cy="330" rx="340" ry="180" fill="url(#glowC)"/></g>`,
    `<ellipse cx="760" cy="10" rx="220" ry="120" fill="url(#glowO)"/>`,
  );

  // dot grid + twinkles sitting exactly on grid points
  s.add(`<rect width="${W}" height="${H}" fill="url(#grid)" mask="url(#gridMask)"/>`);
  const tw = [];
  for (let i = 0; i < 22; i++) {
    const gx = 9 + 18 * Math.floor(rand() * (W / 18));
    const gy = 9 + 18 * Math.floor(rand() * (H / 18));
    if (gy > 96 && gy < 196) continue; // keep the name area calm
    tw.push(`<circle class="tw" cx="${gx}" cy="${gy}" r="1.6" fill="${T.lime}" style="animation-delay:${n(rand() * 4.8)}s"/>`);
  }
  s.add(tw);

  // top bar
  s.add(
    `<circle cx="36" cy="40" r="3.2" fill="${T.lime}"/><circle class="pulse" cx="36" cy="40" r="3.2" fill="${T.lime}"/>`,
    s.text([{ t: '~/', fill: T.faint }, { t: 'olivierrubinger', fill: T.text }, { t: ' · readme.svg', fill: T.faint }], {
      x: 48, y: 44, font: 'mono400', size: 11.5, ls: 0.3,
    }),
    s.text([{ t: 'BELO HORIZONTE, BR', fill: T.muted }, { t: '  ·  ', fill: T.ghost }, { t: 'UTC−3', fill: T.muted }], {
      x: W - 32, y: 44, font: 'mono500', size: 10.5, ls: 1.4, anchor: 'end',
    }),
  );

  // corner ticks framing the name
  const tick = (x, y, dx, dy) => `<path d="M${x} ${y + dy * 10}V${y}H${x + dx * 10}" stroke="${T.line2}" stroke-width="1"/>`;
  s.add(tick(40, 92, 1, 1), tick(W - 40, 92, -1, 1), tick(40, 206, 1, -1), tick(W - 40, 206, -1, -1));

  // halftone name
  const { dots } = halftone('OLIVIER RUBINGER', 'sans900', 76, W / 2, 177, 4.4);
  const d = dots.map(([x, y, r]) => dot(x, y, r)).join('');
  s.def(`<path id="nm" d="${d}"/>`);
  s.add(
    `<g mask="url(#boot)">`,
    `<use href="#nm" fill="url(#nameFill)"/>`,
    `<use href="#nm" fill="url(#sweep)"/>`,
    `</g>`,
    `<rect class="scan" x="0" y="96" width="1.5" height="106" fill="${T.lime}"/>`,
  );

  // tagline + role
  const tag1 = 'I build the systems behind products that ';
  const tag2 = 'grow.';
  const tw1 = measure(tag1, 'serifI', 33);
  const tw2 = measure(tag2, 'serifI', 33);
  const tx = (W - tw1 - tw2) / 2;
  s.add(
    `<g class="rise" style="animation-delay:1.5s">`,
    s.text([{ t: tag1, fill: T.text }, { t: tag2, fill: T.lime }], { x: tx, y: 262, font: 'serifI', size: 33 }),
    `</g>`,
    `<g class="rise" style="animation-delay:1.8s">`,
    s.text(
      [
        { t: 'Senior Full-Stack Engineer', fill: T.text },
        { t: '   /   ', fill: T.ghost },
        { t: 'Co-founder @ WeGrow & Tarsi AI', fill: T.muted },
      ],
      { x: W / 2, y: 294, font: 'sans500', size: 14, anchor: 'middle', ls: 0.1 },
    ),
    `</g>`,
  );

  // bottom row
  s.add(
    s.text('REACT · NEXT.JS · TYPESCRIPT · NODE.JS · GO', { x: 32, y: H - 28, font: 'mono500', size: 10, ls: 1.5, fill: T.faint }),
    `<g class="bob">`,
    s.text('SCROLL', { x: W - 50, y: H - 28, font: 'mono500', size: 10, ls: 1.5, fill: T.faint, anchor: 'end' }),
    `<path d="M${W - 38} ${H - 38}v10m-4-4l4 4 4-4" stroke="${T.lime}" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>`,
    `</g>`,
  );

  s.add(`</g>`);
  return s.render();
}
