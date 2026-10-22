// Footer: closing line over a travelling wave of dots in the three brand hues.
import { Svg, T, measure, frame, clipCard, n } from './lib.mjs';

const W = 840;
const H = 250;

export async function build() {
  const s = new Svg(W, H, "Let's build something that grows — open to collaborations, consulting and interesting problems.");
  const COLS = 70;
  const ROWS = 6;
  const gx = W / COLS;
  const DUR = 3.6;
  s.css(`
    .wc{animation:wc ${DUR}s ease-in-out infinite alternate}
    @keyframes wc{from{transform:translateY(-14px)}to{transform:translateY(14px)}}
    .rise{opacity:0;animation:rise 1s cubic-bezier(.2,.7,.2,1) forwards}
    @keyframes rise{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}
    .uline{stroke-dasharray:1;stroke-dashoffset:1;animation:uline 1.2s cubic-bezier(.6,0,.2,1) .9s forwards}
    @keyframes uline{to{stroke-dashoffset:0}}
  `);
  s.def(
    `<linearGradient id="hue" x1="0" y1="0" x2="${W}" y2="0" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="${T.lime}"/><stop offset=".5" stop-color="${T.cyan}"/><stop offset="1" stop-color="${T.orange}"/></linearGradient>`,
    `<linearGradient id="fadeY" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".5" stop-color="#fff"/><stop offset="1" stop-color="#fff" stop-opacity=".2"/></linearGradient>`,
    `<linearGradient id="fadeX" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#000"/><stop offset=".12" stop-color="#fff"/><stop offset=".88" stop-color="#fff"/><stop offset="1" stop-color="#000"/></linearGradient>`,
    `<mask id="waveMask"><rect width="${W}" height="${H}" fill="url(#fadeX)"/></mask>`,
  );
  const clip = clipCard(s);
  s.add(frame(s), `<g ${clip}>`);

  // dot wave: each column bobs with a phase offset → travelling wave
  const cols = [];
  for (let c = 0; c < COLS; c++) {
    const x = gx / 2 + c * gx;
    const dots = [];
    for (let r = 0; r < ROWS; r++) {
      const y = 176 + r * 11;
      const rr = 1.9 - r * 0.22;
      dots.push(`<circle cx="${n(x)}" cy="${y}" r="${n(rr)}" opacity="${n(1 - r * 0.15)}"/>`);
    }
    const delay = -((c / COLS) * DUR * 4) % (DUR * 2);
    cols.push(`<g class="wc" style="animation-delay:${n(delay)}s">${dots.join('')}</g>`);
  }
  s.add(`<g fill="url(#hue)" mask="url(#waveMask)">${cols.join('')}</g>`);

  // headline
  const a = "Let's build something that ";
  const b = 'grows.';
  const size = 40;
  const wa = measure(a, 'serifI', size);
  const wb = measure(b, 'serifI', size);
  const x0 = (W - wa - wb) / 2;
  s.add(
    `<g class="rise" style="animation-delay:.2s">`,
    s.text([{ t: a, fill: T.text }, { t: b, fill: T.lime }], { x: x0, y: 92, font: 'serifI', size }),
    `<path class="uline" pathLength="1" d="M${n(x0 + wa + 2)} 102q${n(wb / 2)} 7 ${n(wb - 6)} -1" stroke="${T.lime}" stroke-width="2" stroke-linecap="round"/>`,
    `</g>`,
    `<g class="rise" style="animation-delay:.5s">`,
    s.text('open to collaborations, consulting & interesting problems', { x: W / 2, y: 132, font: 'mono400', size: 12.5, fill: T.muted, anchor: 'middle' }),
    `</g>`,
  );

  s.add('</g>');
  return s.render();
}
