// 01 — whoami: a terminal that types `whoami` and `neofetch`,
// with a spinning ASCII globe as the distro logo.
import { Svg, T, measure, clipCard, esc, n } from './lib.mjs';
import { globeFrames } from './globe.mjs';

const W = 840;
const H = 492;
const BG = '#0C0C0E';

export async function build() {
  const s = new Svg(W, H, 'Terminal running whoami and neofetch: Olivier Rubinger, Senior Full-Stack Engineer, co-founder of WeGrow and Tarsi AI');
  const FS = 13.5;
  const cw = measure('M', 'mono400', FS);
  const X0 = 30;

  s.css(`
    .on{opacity:0;animation:on .01s linear forwards}
    @keyframes on{to{opacity:1}}
    .fade{opacity:0;animation:fade .5s ease-out forwards}
    @keyframes fade{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:none}}
    .life{opacity:0}
    .blink{animation:blink 1.05s steps(1,end) infinite}
    @keyframes blink{0%{opacity:1}50%{opacity:0}}
    .fr{opacity:0;animation:fr 8s steps(1,end) infinite}
    @keyframes fr{0%{opacity:1}2.5%{opacity:0}100%{opacity:0}}
    .g0{fill:#A3A3AD}.g1{fill:${T.lime}}.g2{fill:#3A3A43}
  `);

  const clip = clipCard(s, 'card', 16);
  s.add(`<rect x=".5" y=".5" width="${W - 1}" height="${H - 1}" rx="16" fill="${BG}" stroke="${T.line}"/>`);
  s.add(`<g ${clip}>`);

  // title bar
  s.add(
    `<rect width="${W}" height="40" fill="#111114"/><path d="M0 40.5H${W}" stroke="${T.line}"/>`,
    [24, 44, 64].map((x) => `<circle cx="${x}" cy="20" r="5.5" fill="#26262C"/>`).join(''),
    s.text([{ t: 'olivier@rubinger', fill: T.muted }, { t: ': ~ · zsh', fill: T.faint }], {
      x: W / 2, y: 24.5, font: 'mono400', size: 11.5, anchor: 'middle',
    }),
    s.text([{ t: '01', fill: T.lime }, { t: '  /  WHOAMI', fill: T.faint }], {
      x: W - 22, y: 24.5, font: 'mono500', size: 10.5, ls: 1.4, anchor: 'end',
    }),
  );

  // --- typing helpers -------------------------------------------------
  const prompt = () => [{ t: '→ ', fill: T.lime }, { t: '~ ', fill: T.cyan }];
  const promptW = measure('→ ~ ', 'mono400', FS);

  // A typed command: cover slides right in steps, cursor rides along.
  let k = 0;
  function typed(cmd, y, start, perChar = 0.075, hideAt) {
    const id = `t${k++}`;
    const x = X0 + promptW;
    const w = cw * cmd.length;
    const dur = perChar * cmd.length;
    s.css(`
      .${id}c{animation:${id}m ${n(dur)}s steps(${cmd.length},end) ${n(start)}s forwards}
      @keyframes ${id}m{to{transform:translateX(${n(w)}px)}}
      .${id}l{animation:${id}v ${n(hideAt)}s linear forwards}
      @keyframes ${id}v{0%,${n(99.9)}%{opacity:1}100%{opacity:0}}
    `);
    return [
      s.text(cmd, { x, y, font: 'mono400', size: FS, fill: T.text }),
      `<rect class="${id}c" x="${n(x)}" y="${y - 14}" width="${n(w + 2)}" height="19" fill="${BG}"/>`,
      `<g class="${id}l"><rect class="${id}c" x="${n(x)}" y="${y - 13}" width="${n(cw)}" height="17" fill="${T.lime}" opacity=".9"/></g>`,
    ];
  }
  const at = (t, inner, cls = 'on') => `<g class="${cls}" style="animation-delay:${n(t)}s">${inner}</g>`;

  // line 1: whoami
  let y = 74;
  s.add(s.text(prompt(), { x: X0, y, font: 'mono400', size: FS }), typed('whoami', y, 0.55, 0.08, 1.3));
  y += 24;
  s.add(
    at(
      1.3,
      s.text(
        [
          { t: 'olivier rubinger', fill: T.text },
          { t: '  ·  ', fill: T.ghost },
          { t: 'engineer, founder, ex-guitar teacher', fill: T.muted },
        ],
        { x: X0, y, font: 'mono400', size: FS },
      ),
    ),
  );

  // line 3: neofetch
  y += 32;
  s.add(at(1.55, s.text(prompt(), { x: X0, y, font: 'mono400', size: FS })));
  s.add(at(1.55, typed('neofetch', y, 1.85, 0.07, 2.65).join('')));

  // --- neofetch block --------------------------------------------------
  const top = y + 26;
  const GF = 11;
  const gcw = measure('M', 'mono500', GF);
  const LH = 12.4;
  const COLS = 38;
  const ROWS = Math.round((COLS * gcw) / LH);
  const frames = globeFrames({ cols: COLS, rows: ROWS, frames: 40, tilt: 16, startLon: -75 });
  const gx = X0 + 2;
  const gy = top + 18;
  const rowsToSpans = (lines, cls) =>
    lines
      .map((line, r) => {
        const first = line.search(/\S/);
        if (first < 0) return '';
        const body = line.slice(first).replace(/\s+$/, '');
        return `<tspan x="${n(gx + first * gcw)}" y="${n(gy + r * LH)}">${esc(body)}</tspan>`;
      })
      .join('');
  const frameEls = frames
    .map((f, i) => {
      const delay = -(8 - (i * 8) / frames.length);
      const sea = `<text class="${s.use('mono500', f.sea.join(''))} g2" font-size="${GF}" xml:space="preserve">${rowsToSpans(f.sea)}</text>`;
      const base = `<text class="${s.use('mono500', f.base.join(''))} g0" font-size="${GF}" xml:space="preserve">${rowsToSpans(f.base)}</text>`;
      const lit = f.lit.some((l) => l.trim())
        ? `<text class="${s.use('mono500', f.lit.join(''))} g1" font-size="${GF}" xml:space="preserve">${rowsToSpans(f.lit)}</text>`
        : '';
      return `<g class="fr" style="animation-delay:${n(delay)}s">${sea}${base}${lit}</g>`;
    })
    .join('');
  // faint orbit ring behind the globe
  const gcx = gx + (COLS * gcw) / 2;
  const gcy = gy - 9 + (ROWS * LH) / 2;
  const gr = (COLS * gcw) / 2;
  s.add(
    at(
      2.75,
      frameEls +
        `<rect x="${n(gcx - 62)}" y="${n(gy + ROWS * LH + 4)}" width="7" height="7" rx="1.5" fill="${T.lime}"/>` +
        s.text('lived here', { x: gcx - 49, y: gy + ROWS * LH + 11, font: 'mono400', size: 10.5, fill: T.faint }) +
        s.text([{ t: '·  ', fill: T.ghost }, { t: 'spins 24/7', fill: T.faint }], { x: gcx + 22, y: gy + ROWS * LH + 11, font: 'mono400', size: 10.5 }),
      'fade',
    ),
  );

  // info column
  const ix = 334;
  const kx = ix;
  const vx = ix + 86;
  const rows = [
    ['Role', [{ t: 'Senior Full-Stack Software Engineer' }]],
    ['Day job', [{ t: 'Breach Insurance' }, { t: ' · crypto insurtech, Boston', fill: T.muted }]],
    ['Founder', [{ t: 'WeGrow' }, { t: ' · ', fill: T.ghost }, { t: 'Tarsi AI' }]],
    ['Home', [{ t: 'Belo Horizonte, Brazil' }]],
    ['Lived', [{ t: 'Brazil' }, { t: ' · ', fill: T.ghost }, { t: 'Canada' }, { t: ' · ', fill: T.ghost }, { t: 'UAE' }]],
    ['Uptime', [{ t: '24 years' }, { t: ' · ', fill: T.ghost }, { t: '6+ yrs shipping software', fill: T.muted }]],
    ['Speaks', [{ t: 'pt  en  es  it' }, { t: '  + latin', fill: T.muted }]],
    ['Stack', [{ t: 'React · Next.js · TypeScript · Node · Go' }]],
    ['Into', [{ t: 'real-time systems, clean architecture' }]],
    ['', [{ t: 'and interfaces that feel fast', fill: T.muted }]],
    ['Offline', [{ t: 'guitar & music theory' }]],
  ];
  let iy = top + 14;
  const t0 = 2.85;
  s.add(
    at(
      t0,
      s.text([{ t: 'olivier', fill: T.lime }, { t: '@', fill: T.muted }, { t: 'rubinger', fill: T.lime }], {
        x: kx, y: iy, font: 'mono500', size: FS,
      }) + `<path d="M${kx} ${iy + 10}h${n(cw * 16)}" stroke="${T.line2}" stroke-dasharray="${n(cw * 0.6)} ${n(cw * 0.4)}"/>`,
      'fade',
    ),
  );
  iy += 30;
  rows.forEach(([key, val], i) => {
    s.add(
      at(
        t0 + 0.07 * (i + 1),
        (key ? s.text(key, { x: kx, y: iy, font: 'mono500', size: FS, fill: T.lime }) : '') +
          s.text(val.map((v) => ({ fill: T.text, ...v })), { x: vx, y: iy, font: 'mono400', size: FS }),
        'fade',
      ),
    );
    iy += 21.5;
  });
  // palette blocks — personal + brand colours
  iy += 6;
  const pal = ['#1C1C20', T.lime, T.cyan, T.orange, T.cream, '#0C511B', '#7D7D88', T.text];
  s.add(
    at(
      t0 + 0.07 * (rows.length + 1),
      pal.map((c, i) => `<rect x="${kx + i * 30}" y="${iy - 12}" width="26" height="14" rx="3" fill="${c}"/>`).join(''),
      'fade',
    ),
  );

  // final prompt with blinking cursor + autosuggestion
  const fy = H - 30;
  s.add(
    at(
      3.9,
      s.text(prompt(), { x: X0, y: fy, font: 'mono400', size: FS }) +
        `<rect class="blink" x="${n(X0 + promptW)}" y="${fy - 13}" width="${n(cw)}" height="17" fill="${T.lime}" opacity=".9"/>` +
        s.text('cd ~/projects', { x: X0 + promptW + cw * 1.5, y: fy, font: 'mono400', size: FS, fill: T.ghost }),
    ),
  );

  s.add(`</g>`);
  return s.render();
}
