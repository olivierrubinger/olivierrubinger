// Link pills under the hero (one SVG per link, since each needs its own href).
import * as si from 'simple-icons';
import { Svg, T, measure, linkedinPath, n } from './lib.mjs';

const H = 40;

const ICONS = {
  linkedin: (x, y, s, c) => `<path transform="translate(${x} ${y}) scale(${s / 24})" d="${linkedinPath}" fill="${c}"/>`,
  mail: (x, y, s, c) =>
    `<g transform="translate(${x} ${y}) scale(${s / 24})" fill="none" stroke="${c}" stroke-width="2" stroke-linejoin="round"><rect x="2.5" y="4.5" width="19" height="15" rx="2.5"/><path d="m3.5 6.5 8.5 6.5 8.5-6.5"/></g>`,
  cv: (x, y, s, c) =>
    `<g transform="translate(${x} ${y}) scale(${s / 24})" fill="none" stroke="${c}" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2.5H6.5a2 2 0 0 0-2 2v15a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2V8z"/><path d="M14 2.5V8h5.5M8.5 13h7M8.5 17h5"/></g>`,
  whatsapp: (x, y, s, c) => `<path transform="translate(${x} ${y}) scale(${s / 24})" d="${si.siWhatsapp.path}" fill="${c}"/>`,
  instagram: (x, y, s, c) => `<path transform="translate(${x} ${y}) scale(${s / 24})" d="${si.siInstagram.path}" fill="${c}"/>`,
};

async function pill(name, label, ic, primary = false) {
  const tw = measure(label, 'sans500', 13.5);
  const W = Math.round(tw + 62);
  const s = new Svg(W, H, label);
  const bg = primary ? T.lime : '#0F0F11';
  const fg = primary ? '#10140A' : T.text;
  const icc = primary ? '#10140A' : '#A9A9B3';
  s.css(`
    .sh{animation:sh 5.5s cubic-bezier(.6,0,.4,1) infinite}
    @keyframes sh{0%,62%{transform:translateX(-80px)}100%{transform:translateX(${W + 80}px)}}
  `);
  s.def(
    `<clipPath id="p"><rect x=".5" y=".5" width="${W - 1}" height="${H - 1}" rx="${H / 2}"/></clipPath>`,
    `<linearGradient id="g" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".5" stop-color="#fff" stop-opacity="${primary ? 0.55 : 0.09}"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>`,
  );
  s.add(
    `<rect x=".5" y=".5" width="${W - 1}" height="${H - 1}" rx="${H / 2}" fill="${bg}" stroke="${primary ? T.lime : '#27272D'}"/>`,
    `<g clip-path="url(#p)"><g class="sh"><rect x="0" y="0" width="60" height="${H}" fill="url(#g)" transform="skewX(-20)"/></g></g>`,
    ICONS[ic](20, 12, 16, icc),
    s.text(label, { x: 44, y: 24.8, font: 'sans500', size: 13.5, fill: fg }),
  );
  return [name, await s.render()];
}

export async function build() {
  const list = await Promise.all([
    pill('btn-linkedin', 'LinkedIn', 'linkedin'),
    pill('btn-email', 'Email', 'mail'),
    pill('btn-resume', 'Résumé', 'cv', true),
    pill('btn-whatsapp', 'WhatsApp', 'whatsapp'),
    pill('btn-instagram', 'Instagram', 'instagram'),
  ]);
  return Object.fromEntries(list);
}
