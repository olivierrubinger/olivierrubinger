// Builds every card into ../assets. Usage: node build.mjs [hero,stack,...]
import fs from 'node:fs';

const OUT = new URL('../assets/', import.meta.url);
const only = process.argv[2]?.split(',');
const mods = ['hero', 'whoami', 'projects', 'career', 'stack', 'footer', 'buttons'];

fs.mkdirSync(OUT, { recursive: true });
for (const m of mods) {
  if (only && !only.includes(m)) continue;
  const mod = await import(`./src/${m}.mjs`);
  const res = await mod.build();
  const files = typeof res === 'string' ? { [m]: res } : res;
  for (const [name, svg] of Object.entries(files)) {
    fs.writeFileSync(new URL(`${name}.svg`, OUT), svg);
    console.log(name.padEnd(18), (svg.length / 1024).toFixed(1) + ' KB');
  }
}
