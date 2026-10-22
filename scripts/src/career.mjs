// 04 — career rendered as `git log --graph`.
import { Svg, T, measure, frame, clipCard, n } from './lib.mjs';

const W = 840;

const COMMITS = [
  { lane: 0, hash: 'a1f3c9e', refs: [['HEAD → main', T.lime], ['wegrow', T.cyan]], type: 'feat', msg: 'co-founded WeGrow — AI-powered growth systems', date: 'jun 2026', dot: T.cyan },
  { lane: 1, hash: '7be21d4', refs: [['tarsi-ai', T.orange]], type: 'feat', msg: 'co-founded Tarsi AI — the AI brand ecosystem', date: 'apr 2026', dot: T.orange },
  { lane: 0, hash: '3c9e1aa', type: 'feat', msg: 'senior full-stack @ Breach Insurance · crypto insurtech, Boston', date: 'jan 2025', detail: '−80% load time · +30% app performance · real-time wallet monitoring (WebSockets + Go)' },
  { lane: 0, hash: '9d02b7f', type: 'refactor', msg: '14+ legacy judicial systems modernized @ Qintess · TJPA Court', date: 'apr 2024', detail: 'Angular · Vue · Spring Boot — +40% performance, −30% support requests' },
  { lane: 0, hash: 'e44a10c', type: 'feat', msg: 'full-stack MERN @ Cert One', date: 'sep 2022', detail: 'SQL → MongoDB migration (+35% query perf) · AWS S3 · Firebase Auth' },
  { lane: 0, hash: '1b7f0c2', type: 'merge', msg: 'shipped an e-commerce @ i9 Tecnologia', date: 'aug 2021', detail: '+300% online sales · React · Node.js · Firebase · Redis' },
  { lane: 1, hash: '5c0ffee', type: 'chore', msg: 'web dev intern @ Metasense — Braga, PT (remote)', date: 'may 2020' },
  { lane: 1, hash: '2e4b1d9', type: 'chore', msg: 'apprentice dev @ Key2enable assistive tech — Abu Dhabi', date: 'sep 2019' },
  { lane: 0, hash: '0000001', refs: [['root', T.muted]], type: 'init', msg: 'guitar & music-theory teacher', date: '2018' },
];

const TYPE_FILL = { feat: T.lime, refactor: T.cyan, merge: '#C9C9D1', chore: T.muted, init: T.muted };

export async function build() {
  const top = 128;
  const ys = [];
  let y = top;
  for (const c of COMMITS) {
    ys.push(y);
    y += c.detail ? 50 : 34;
  }
  const H = y + 38;
  const s = new Svg(W, H, "Career as a git log: co-founded WeGrow and Tarsi AI (2026), Breach Insurance (2025), Qintess/TJPA Court (2024), Cert One (2022), i9 Tecnologia (2021), Metasense (2020), Key2enable (2019), music teacher (2018)");

  const L = [54, 80];
  const step = 0.2;
  const appear = (i) => 0.35 + i * step;

  s.css(`
    .row{opacity:0;animation:row .55s cubic-bezier(.2,.7,.2,1) forwards}
    @keyframes row{from{opacity:0;transform:translateX(-8px)}to{opacity:1;transform:none}}
    .draw{stroke-dasharray:1;stroke-dashoffset:1;animation:draw linear forwards}
    @keyframes draw{to{stroke-dashoffset:0}}
    .pop{transform-box:fill-box;transform-origin:center;transform:scale(0);animation:pop .4s cubic-bezier(.3,1.6,.5,1) forwards}
    @keyframes pop{to{transform:scale(1)}}
    .ring{transform-box:fill-box;transform-origin:center;animation:ring 2.2s ease-out infinite}
    @keyframes ring{0%{transform:scale(1);opacity:.8}100%{transform:scale(2.6);opacity:0}}
    .flow{opacity:0;animation:flow 4.2s cubic-bezier(.5,0,.5,1) infinite}
    @keyframes flow{0%{opacity:0;transform:translateY(0)}8%{opacity:1}88%{opacity:1}100%{opacity:0;transform:translateY(${n(ys.at(-1) - ys[0])}px)}}
  `);
  s.def(
    `<linearGradient id="lane0" x1="0" y1="${ys[0]}" x2="0" y2="${ys.at(-1)}" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="${T.lime}"/><stop offset=".45" stop-color="#5E6B2A"/><stop offset="1" stop-color="${T.line2}"/></linearGradient>`,
    `<radialGradient id="flowG"><stop offset="0" stop-color="${T.lime}" stop-opacity=".9"/><stop offset="1" stop-color="${T.lime}" stop-opacity="0"/></radialGradient>`,
  );

  const clip = clipCard(s);
  s.add(frame(s), `<g ${clip}>`);

  // header
  s.add(
    s.text([{ t: '04', fill: T.lime }, { t: '  —  CAREER', fill: T.muted }], { x: 32, y: 44, font: 'mono500', size: 11, ls: 1.4 }),
    s.text('9 commits · 3 branches · since 2018', { x: W - 32, y: 44, font: 'mono500', size: 10.5, ls: 1.2, fill: T.faint, anchor: 'end' }),
    s.text([{ t: '$ ', fill: T.lime }, { t: 'git log --graph --decorate ', fill: T.text }, { t: 'career', fill: T.cyan }], {
      x: 32, y: 84, font: 'mono400', size: 13,
    }),
    `<path d="M32 100.5H${W - 32}" stroke="${T.line}" stroke-dasharray="2 4"/>`,
  );

  // graph edges
  const i = (k) => ys[k];
  const lane0 = `M${L[0]} ${i(0)}V${i(8)}`;
  const tarsiBranch = `M${L[1]} ${i(1)}V${i(2) - 22}C${L[1]} ${i(2) - 8} ${L[0]} ${i(2) - 14} ${L[0]} ${i(2)}`;
  const sideBranch = `M${L[0]} ${i(5)}C${L[0]} ${i(5) + 14} ${L[1]} ${i(5) + 8} ${L[1]} ${i(5) + 22}V${i(8) - 22}C${L[1]} ${i(8) - 8} ${L[0]} ${i(8) - 14} ${L[0]} ${i(8)}`;
  const total = appear(COMMITS.length - 1) - appear(0) + 0.3;
  s.add(
    `<path class="draw" pathLength="1" d="${lane0}" stroke="url(#lane0)" stroke-width="2" style="animation-duration:${n(total)}s;animation-delay:${appear(0)}s"/>`,
    `<path class="draw" pathLength="1" d="${tarsiBranch}" stroke="${T.orange}" stroke-opacity=".75" stroke-width="2" style="animation-duration:.5s;animation-delay:${n(appear(1))}s"/>`,
    `<path class="draw" pathLength="1" d="${sideBranch}" stroke="${T.faint}" stroke-width="2" style="animation-duration:${n(step * 3.2)}s;animation-delay:${n(appear(5))}s"/>`,
  );
  // pulse travelling down main
  s.add(
    `<g class="flow" style="animation-delay:${n(appear(COMMITS.length) + 0.4)}s"><circle cx="${L[0]}" cy="${i(0)}" r="9" fill="url(#flowG)"/><circle cx="${L[0]}" cy="${i(0)}" r="2.4" fill="#fff"/></g>`,
  );

  // commits
  const HX = 112;
  const DATE_X = W - 32;
  COMMITS.forEach((c, k) => {
    const cy = ys[k];
    const cx = L[c.lane];
    const t = appear(k);
    const dotFill = c.dot ?? (k === 0 ? T.lime : T.ink);
    const dotStroke = c.dot ?? (c.lane === 1 ? T.muted : T.lime);
    if (k === 0) s.add(`<circle class="ring" cx="${cx}" cy="${cy}" r="6" stroke="${T.cyan}" stroke-width="1.5"/>`);
    s.add(
      `<circle class="pop" cx="${cx}" cy="${cy}" r="5.5" fill="${dotFill === T.ink ? T.ink : dotFill}" stroke="${dotStroke}" stroke-width="2" style="animation-delay:${n(t)}s"/>`,
    );

    const parts = [];
    let x = HX;
    parts.push(s.text(c.hash, { x, y: cy + 4.5, font: 'mono400', size: 12.5, fill: '#6E6E78' }));
    x += measure(c.hash, 'mono400', 12.5) + 12;
    for (const [ref, col] of c.refs ?? []) {
      const rw = measure(ref, 'mono500', 10.5) + 16;
      parts.push(
        `<rect x="${n(x)}" y="${cy - 9}" width="${n(rw)}" height="18" rx="5" fill="${col}" fill-opacity=".1" stroke="${col}" stroke-opacity=".55"/>`,
        s.text(ref, { x: x + rw / 2, y: cy + 3.8, font: 'mono500', size: 10.5, fill: col, anchor: 'middle' }),
      );
      x += rw + 6;
    }
    x += 4;
    parts.push(
      s.text(
        [
          { t: c.type, fill: TYPE_FILL[c.type] },
          { t: ': ', fill: T.faint },
          { t: c.msg, fill: c.lane === 1 && !c.dot ? T.muted : T.text },
        ],
        { x, y: cy + 4.5, font: 'mono400', size: 12.5 },
      ),
      s.text(c.date, { x: DATE_X, y: cy + 4.5, font: 'mono400', size: 11.5, fill: T.faint, anchor: 'end' }),
    );
    if (c.detail)
      parts.push(s.text([{ t: '↳ ', fill: T.ghost }, { t: c.detail, fill: T.muted }], { x: HX, y: cy + 25, font: 'mono400', size: 11.5 }));
    s.add(`<g class="row" style="animation-delay:${n(t)}s">${parts.join('')}</g>`);
  });

  s.add('</g>');
  return s.render();
}
