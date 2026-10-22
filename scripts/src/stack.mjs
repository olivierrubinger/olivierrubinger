// 05 — stack as a 60% mechanical keyboard; keys press themselves and
// light up in each technology's brand colour.
import * as si from 'simple-icons';
import { Svg, T, measure, frame, clipCard, icon, rng, n } from './lib.mjs';

const W = 840;

// [simple-icon, label, glow colour override]
const tech = (ic, label, glow) => ({ kind: 'tech', ic, label, glow: glow ?? '#' + ic.hex, w: 1 });
const legend = (t, w = 1, o = {}) => ({ kind: 'mod', t, w, ...o });

const ROWS = [
  [
    legend('front', 1, { cat: true }),
    tech(si.siReact, 'react'),
    tech(si.siNextdotjs, 'next.js', '#FFFFFF'),
    tech(si.siTypescript, 'ts'),
    tech(si.siJavascript, 'js'),
    tech(si.siAngular, 'angular', '#DD0031'),
    tech(si.siVuedotjs, 'vue'),
    tech(si.siTailwindcss, 'tailwind'),
    tech(si.siRedux, 'redux', '#9B6BFF'),
    tech(si.siReactquery, 'query'),
    legend('0'), legend('-'), legend('='),
    legend('⌫ legacy', 2),
  ],
  [
    legend('back', 1.5, { cat: true }),
    tech(si.siNodedotjs, 'node'),
    tech(si.siGo, 'go'),
    tech(si.siNestjs, 'nest'),
    tech(si.siExpress, 'express', '#FFFFFF'),
    tech(si.siSpring, 'spring'),
    tech(si.siPython, 'python', '#FFD43B'),
    tech(si.siDjango, 'django', '#44B78B'),
    tech(si.siDotnet, '.net', '#8A63F5'),
    tech(si.siSocketdotio, 'ws', '#FFFFFF'),
    legend('p'), legend('['), legend(']'),
    legend('\\', 1.5),
  ],
  [
    legend('data', 1.75, { cat: true }),
    tech(si.siPostgresql, 'postgres', '#6C9EFF'),
    tech(si.siMongodb, 'mongo'),
    tech(si.siPrisma, 'prisma', '#7C8CFF'),
    tech(si.siSupabase, 'supabase'),
    tech(si.siRedis, 'redis'),
    tech(si.siMysql, 'mysql', '#5D9BD3'),
    tech(si.siFirebase, 'firebase', '#FFA000'),
    legend('k'), legend('l'), legend(';'), legend("'"),
    legend('ship ↵', 2.25, { accent: true }),
  ],
  [
    legend('infra', 2.25, { cat: true }),
    tech(si.siDocker, 'docker'),
    tech(si.siVercel, 'vercel', '#FFFFFF'),
    tech(si.siGithubactions, 'actions'),
    tech(si.siNginx, 'nginx', '#18B84A'),
    tech(si.siGit, 'git'),
    legend('n'), legend('m'), legend(','), legend('.'), legend('/'),
    legend('shift ⇧', 2.75),
  ],
  [
    legend('ctrl', 1.25), legend('opt', 1.25), legend('cmd', 1.25),
    legend('space for new ideas', 6.25, { space: true }),
    legend('cmd', 1.25), legend('fn', 1.25), legend('menu', 1.25), legend('ctrl', 1.25),
  ],
];
const DAILY = new Set(['react', 'next.js', 'ts', 'node', 'go']);

export async function build() {
  const caseX = 28;
  const caseY = 76;
  const caseW = W - 56;
  const pad = 16;
  const strip = 26;
  const u = (caseW - pad * 2) / 15;
  const gap = 5;
  const kbH = u * 5;
  const caseH = strip + kbH + pad + 10;
  const H = caseY + caseH + 56;
  const s = new Svg(W, H, 'Tech stack keyboard: React, Next.js, TypeScript, JavaScript, Angular, Vue, Tailwind, Redux, React Query, Node.js, Go, NestJS, Express, Spring, Python, Django, .NET, WebSockets, PostgreSQL, MongoDB, Prisma, Supabase, Redis, MySQL, Firebase, Docker, Vercel, GitHub Actions, Nginx, Git');
  const rand = rng(5);

  // press order: shuffled tech keys, one every STEP seconds
  const techKeys = ROWS.flat().filter((k) => k.kind === 'tech');
  const order = techKeys.map((k) => [rand(), k]).sort((a, b) => a[0] - b[0]).map(([, k]) => k);
  const STEP = 0.42;
  const CYCLE = n(order.length * STEP);
  order.forEach((k, i) => (k.delay = n(i * STEP - CYCLE)));
  const pct = (sec) => n((sec / CYCLE) * 100);

  s.css(`
    .kp{animation:kp ${CYCLE}s infinite}
    @keyframes kp{0%{transform:translateY(0)}${pct(0.06)}%,${pct(0.22)}%{transform:translateY(2.6px)}${pct(0.34)}%,100%{transform:translateY(0)}}
    .lit{opacity:0;animation:lit ${CYCLE}s infinite}
    @keyframes lit{0%{opacity:0}${pct(0.06)}%{opacity:1}${pct(1.4)}%{opacity:1}${pct(2.6)}%,100%{opacity:0}}
    .led{animation:led 1.6s steps(1,end) infinite}
    @keyframes led{0%{opacity:1}50%{opacity:.15}}
  `);
  s.def(
    `<linearGradient id="cap" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2A2A30"/><stop offset="1" stop-color="#1F1F24"/></linearGradient>`,
    `<linearGradient id="capA" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#D6FF4D"/><stop offset="1" stop-color="#BDEB27"/></linearGradient>`,
    `<linearGradient id="case" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#18181C"/><stop offset="1" stop-color="#0F0F12"/></linearGradient>`,
  );

  const clip = clipCard(s);
  s.add(frame(s), `<g ${clip}>`);
  s.add(
    s.text([{ t: '05', fill: T.lime }, { t: '  /  STACK', fill: T.muted }], { x: 32, y: 44, font: 'mono500', size: 11, ls: 1.4 }),
    s.text('front · back · data · infra · 30 keys, all of them used', { x: W - 32, y: 44, font: 'mono500', size: 10.5, ls: 0.6, fill: T.faint, anchor: 'end' }),
  );

  // case
  s.add(
    `<rect x="${caseX}" y="${caseY + 6}" width="${caseW}" height="${caseH}" rx="18" fill="#000" opacity=".5"/>`,
    `<rect x="${caseX}" y="${caseY}" width="${caseW}" height="${caseH}" rx="18" fill="url(#case)" stroke="#26262C"/>`,
    `<path d="M${caseX + 18} ${caseY + 1.5}H${caseX + caseW - 18}" stroke="#fff" stroke-opacity=".07"/>`,
    s.text([{ t: 'OR-60', fill: T.muted }, { t: '  stack edition', fill: T.faint }], { x: caseX + pad + 2, y: caseY + 18, font: 'mono500', size: 9.5, ls: 1 }),
  );
  const ledX = caseX + caseW - pad - 4;
  s.add(
    `<circle cx="${ledX}" cy="${caseY + 14.5}" r="2.6" fill="${T.lime}"/>`,
    `<circle class="led" cx="${ledX - 14}" cy="${caseY + 14.5}" r="2.6" fill="${T.cyan}"/>`,
    `<circle cx="${ledX - 28}" cy="${caseY + 14.5}" r="2.6" fill="#2C2C33"/>`,
  );
  const plateY = caseY + strip;
  s.add(`<rect x="${caseX + pad - 6}" y="${plateY - 6}" width="${caseW - pad * 2 + 12}" height="${kbH + 12}" rx="10" fill="#08080A"/>`);

  // keys
  ROWS.forEach((row, r) => {
    let x = caseX + pad;
    const y = plateY + r * u;
    for (const k of row) {
      const kw = k.w * u - gap;
      const kh = u - gap;
      const kx = x + gap / 2;
      const ky = y + gap / 2;
      const accent = k.accent;
      const skirt = accent ? '#93B51A' : '#141417';
      const top = accent ? 'url(#capA)' : 'url(#cap)';
      const tx = kx + 4.5, ty = ky + 2.5, tw = kw - 9, th = kh - 9;
      const inner = [];
      if (k.kind === 'tech') {
        const is = 18.5;
        const ix = tx + tw / 2 - is / 2;
        const iy = ty + 5.5;
        inner.push(icon(k.ic, ix, iy, is, '#7E7E88'));
        inner.push(`<g class="lit" style="animation-delay:${k.delay}s">${icon(k.ic, ix, iy, is, k.glow)}</g>`);
        inner.push(s.text(k.label, { x: tx + tw / 2, y: ty + th - 4.5, font: 'mono500', size: 7.4, fill: T.faint, anchor: 'middle', ls: 0.3 }));
        if (DAILY.has(k.label)) inner.push(`<circle cx="${n(tx + tw - 4.5)}" cy="${n(ty + 4.5)}" r="1.8" fill="${T.lime}"/>`);
      } else {
        const fill = accent ? '#1A2105' : k.cat ? T.lime : k.space ? T.faint : '#4A4A53';
        const size = k.t.length === 1 ? 11 : 8.6;
        if (k.space) inner.push(s.text(k.t, { x: tx + tw / 2, y: ty + th / 2 + 3.5, font: 'mono500', size: 9, ls: 1, fill, anchor: 'middle' }));
        else inner.push(s.text(k.t, { x: tx + 6, y: ty + 14, font: 'mono500', size, ls: k.t.length > 1 ? 0.6 : 0, fill }));
      }
      const glow =
        k.kind === 'tech'
          ? `<g class="lit" style="animation-delay:${k.delay}s"><rect x="${n(kx - 3)}" y="${n(ky - 3)}" width="${n(kw + 6)}" height="${n(kh + 6)}" rx="10" fill="${k.glow}" opacity=".22"/><rect x="${n(kx - 1)}" y="${n(ky - 1)}" width="${n(kw + 2)}" height="${n(kh + 2)}" rx="8.5" fill="none" stroke="${k.glow}" stroke-opacity=".55"/></g>`
          : '';
      s.add(
        glow,
        `<rect x="${n(kx)}" y="${n(ky)}" width="${n(kw)}" height="${n(kh)}" rx="7.5" fill="${skirt}"/>`,
        `<g${k.kind === 'tech' ? ` class="kp" style="animation-delay:${k.delay}s"` : ''}>`,
        `<rect x="${n(tx)}" y="${n(ty)}" width="${n(tw)}" height="${n(th)}" rx="5.5" fill="${top}"/>`,
        `<path d="M${n(tx + 5)} ${n(ty + 0.8)}H${n(tx + tw - 5)}" stroke="#fff" stroke-opacity="${accent ? 0.35 : 0.07}"/>`,
        inner.join(''),
        `</g>`,
      );
      x += k.w * u;
    }
  });

  // caption
  const cy = caseY + caseH + 34;
  const capTxt = 'react · next.js · typescript · node.js · go';
  const lead = 'daily drivers';
  const total = measure(lead, 'mono500', 11, 0.4) + 22 + measure(capTxt, 'mono400', 11);
  const cx0 = W / 2 - total / 2;
  s.add(
    `<circle cx="${n(cx0 + 3)}" cy="${cy - 4}" r="2.6" fill="${T.lime}"/>`,
    s.text(lead, { x: cx0 + 12, y: cy, font: 'mono500', size: 11, ls: 0.4, fill: T.muted }),
    s.text(capTxt, { x: cx0 + 22 + measure(lead, 'mono500', 11, 0.4), y: cy, font: 'mono400', size: 11, fill: T.faint }),
  );

  s.add('</g>');
  return s.render();
}
