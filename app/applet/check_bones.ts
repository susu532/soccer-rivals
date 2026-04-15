import fs from 'fs';

const data = fs.readFileSync('public/Slow Run_opt.glb', 'utf8');
const matches = data.match(/[a-zA-Z0-9_]+\.position/g);
if (matches) {
  console.log([...new Set(matches)]);
}
