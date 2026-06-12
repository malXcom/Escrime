const fs = require('fs');
const css = fs.readFileSync('src/index.css', 'utf-8');

const regexVars = /(@import.*?\n\n\/\* ═+[\s\S]*?)(\/\* ═+[\s\S]*?RESET)/;
const matchVars = css.match(regexVars);
fs.writeFileSync('src/styles/variables.css', matchVars[1].trim() + '\n');

const rest1 = css.substring(matchVars[1].length);
const splitReset = rest1.split('/* ══════════════════════════════════════════\n   HEADER');
fs.writeFileSync('src/styles/reset.css', splitReset[0].trim() + '\n');

const rest2 = '/* ══════════════════════════════════════════\n   HEADER' + splitReset[1];
const splitLayout = rest2.split('/* ══════════════════════════════════════════\n   CARDS');
fs.writeFileSync('src/styles/layout.css', splitLayout[0].trim() + '\n');

const rest3 = '/* ══════════════════════════════════════════\n   CARDS' + splitLayout[1];
const splitComponents = rest3.split('/* ══════════════════════════════════════════\n   ARENA (COMBAT)');
fs.writeFileSync('src/styles/components.css', splitComponents[0].trim() + '\n');

const rest4 = '/* ══════════════════════════════════════════\n   ARENA (COMBAT)' + splitComponents[1];
fs.writeFileSync('src/styles/arena.css', rest4.trim() + '\n');

const newIndex = `@import './styles/variables.css';
@import './styles/reset.css';
@import './styles/layout.css';
@import './styles/components.css';
@import './styles/arena.css';
`;
fs.writeFileSync('src/index.css', newIndex);
console.log('CSS split successful');
