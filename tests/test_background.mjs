#!/usr/bin/env node
// Dependency-free regression test for the "make the background red" feature.
//
// Run: node tests/test_background.mjs
//
// Checks (against the repo root's index.html):
//   AC-2: the `body` rule's `background` declaration is red-dominant and no
//         longer contains the old purple gradient colors (#667eea / #764ba2).
//   AC-3: all other visual elements (mouse body/ears/eyes/nose/tail, trail
//         dots, heading/info text color) are byte-for-byte unchanged.
//   AC-4: the new red is dark enough that white text (h1 / .info) keeps a
//         WCAG contrast ratio of at least 4.5:1 against it.
//   AC-5: no other non-doc file in the repo still references the old
//         gradient colors.
//
// On any failure this prints every failing assertion with a clear message
// and exits 1. On success it prints a summary and exits 0.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');
const INDEX_PATH = path.join(ROOT, 'index.html');

const failures = [];

function escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Find the body of a single CSS rule `selector { ... }` in a stylesheet
 * string, being careful not to match compound/descendant selectors that
 * merely contain `selector` as a substring (e.g. looking up `.eye` must not
 * match `.eye-left`, and `.trail-dot` must not match `.trail-dot.red`).
 */
function findRuleBlock(css, selector) {
  const esc = escapeRegex(selector);
  const isClass = selector.startsWith('.');
  const pre = isClass ? '(?<![\\w.-])' : '(?<![\\w-])';
  const post = '(?![\\w.-])';
  const re = new RegExp(pre + esc + post + '\\s*\\{([^}]*)\\}', 'i');
  const m = re.exec(css);
  return m ? m[1] : null;
}

function hexToRgb(hex) {
  let h = hex;
  if (h.length === 3) {
    h = h.split('').map((c) => c + c).join('');
  }
  const num = parseInt(h, 16);
  return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255 };
}

// Best-effort support for CSS named colors in the red family, in case an
// implementation uses a named color instead of hex/rgb.
const NAMED_REDS = {
  red: [255, 0, 0],
  darkred: [139, 0, 0],
  firebrick: [178, 34, 34],
  crimson: [220, 20, 60],
  indianred: [205, 92, 92],
  maroon: [128, 0, 0],
  tomato: [255, 99, 71],
  orangered: [255, 69, 0],
  salmon: [250, 128, 114],
};

function matchNamedColor(value) {
  const lower = value.toLowerCase();
  for (const name of Object.keys(NAMED_REDS)) {
    const re = new RegExp(`(?<![\\w-])${name}(?![\\w-])`);
    if (re.test(lower)) {
      const [r, g, b] = NAMED_REDS[name];
      return { raw: name, r, g, b };
    }
  }
  return null;
}

/** Extract every color stop (hex, rgb()/rgba(), or a known red named color) from a CSS value. */
function parseColorStops(value) {
  const stops = [];

  const hexRe = /#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})\b/g;
  let m;
  while ((m = hexRe.exec(value))) {
    stops.push({ raw: m[0], ...hexToRgb(m[1]) });
  }

  const rgbRe = /rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/g;
  while ((m = rgbRe.exec(value))) {
    stops.push({ raw: m[0], r: Number(m[1]), g: Number(m[2]), b: Number(m[3]) });
  }

  if (stops.length === 0) {
    const named = matchNamedColor(value);
    if (named) stops.push(named);
  }

  return stops;
}

function srgbChannelToLinear(c) {
  const v = c / 255;
  return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
}

function relativeLuminance(r, g, b) {
  return (
    0.2126 * srgbChannelToLinear(r) +
    0.7152 * srgbChannelToLinear(g) +
    0.0722 * srgbChannelToLinear(b)
  );
}

/** WCAG contrast ratio of an rgb color against opaque white (#ffffff). */
function contrastWithWhite(r, g, b) {
  const L = relativeLuminance(r, g, b);
  const LWhite = 1.0;
  return (LWhite + 0.05) / (L + 0.05);
}

function walk(dir, relBase, excludedTop) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  let files = [];
  for (const entry of entries) {
    if (relBase === '' && excludedTop.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    const rel = relBase === '' ? entry.name : `${relBase}/${entry.name}`;
    if (entry.isDirectory()) {
      files = files.concat(walk(full, rel, excludedTop));
    } else if (entry.isFile()) {
      files.push({ full, rel });
    }
  }
  return files;
}

// ---------------------------------------------------------------------------

if (!fs.existsSync(INDEX_PATH)) {
  console.error(`FAIL: could not find index.html at ${INDEX_PATH}`);
  process.exit(1);
}

const html = fs.readFileSync(INDEX_PATH, 'utf8');

// --- AC-2: body background is red-dominant, and the old purple hexes are gone ---

let bodyStops = [];
const bodyBlock = findRuleBlock(html, 'body');
if (!bodyBlock) {
  failures.push('[AC-2] Could not find a `body { ... }` rule in index.html');
} else {
  const bgMatch = /(?<![\w-])background\s*:\s*([^;]+);/i.exec(bodyBlock);
  if (!bgMatch) {
    failures.push('[AC-2] Could not find a `background:` declaration inside the `body` rule');
  } else {
    const bgValue = bgMatch[1].trim();
    bodyStops = parseColorStops(bgValue);
    if (bodyStops.length === 0) {
      failures.push(
        `[AC-2] Could not parse any color stops (hex/rgb/known red name) from body background value: "${bgValue}"`
      );
    } else {
      const MARGIN = 15; // red channel must clearly exceed both other channels
      for (const s of bodyStops) {
        const dominant = s.r > s.g + MARGIN && s.r > s.b + MARGIN;
        if (!dominant) {
          failures.push(
            `[AC-2] body background color stop "${s.raw}" (rgb ${s.r}, ${s.g}, ${s.b}) is not clearly red-dominant ` +
              `(red channel must exceed both green and blue by a margin of at least ${MARGIN})`
          );
        }
      }
    }
  }
}

for (const oldColor of ['#667eea', '#764ba2']) {
  const re = new RegExp(escapeRegex(oldColor), 'i');
  if (re.test(html)) {
    failures.push(`[AC-2] index.html still contains the old gradient color ${oldColor}`);
  }
}

// --- AC-3: all other visual elements are byte-for-byte unchanged ---

const unchangedChecks = [
  { selector: '.mouse-body', prop: /background\s*:\s*#fff\s*;/i, desc: '.mouse-body { background: #fff; }' },
  { selector: '.ear-left', prop: /background\s*:\s*#fff\s*;/i, desc: '.ear-left { background: #fff; }' },
  { selector: '.ear-right', prop: /background\s*:\s*#fff\s*;/i, desc: '.ear-right { background: #fff; }' },
  { selector: '.tail', prop: /background\s*:\s*#fff\s*;/i, desc: '.tail { background: #fff; }' },
  { selector: '.eye', prop: /background\s*:\s*#333\s*;/i, desc: '.eye { background: #333; }' },
  { selector: '.nose', prop: /background\s*:\s*#ff6b9d\s*;/i, desc: '.nose { background: #ff6b9d; }' },
  {
    selector: '.trail-dot',
    prop: /background\s*:\s*rgba\(\s*59\s*,\s*130\s*,\s*246\s*,\s*0\.8\s*\)\s*;/i,
    desc: '.trail-dot { background: rgba(59, 130, 246, 0.8); }',
  },
  {
    selector: '.trail-dot.red',
    prop: /background\s*:\s*rgba\(\s*147\s*,\s*197\s*,\s*253\s*,\s*0\.8\s*\)\s*;/i,
    desc: '.trail-dot.red { background: rgba(147, 197, 253, 0.8); }',
  },
  { selector: 'h1', prop: /color\s*:\s*white\s*;/i, desc: 'h1 { color: white; }' },
  { selector: '.info', prop: /color\s*:\s*white\s*;/i, desc: '.info { color: white; }' },
];

for (const check of unchangedChecks) {
  const block = findRuleBlock(html, check.selector);
  if (!block) {
    failures.push(`[AC-3] Could not find a rule block for selector "${check.selector}"`);
    continue;
  }
  if (!check.prop.test(block)) {
    failures.push(
      `[AC-3] Expected "${check.desc}" to remain unchanged, but that declaration was not found in the "${check.selector}" rule`
    );
  }
}

// --- AC-4: white text stays legible (contrast >= 4.5:1) against the new red ---

if (bodyBlock && bodyStops.length === 0) {
  failures.push('[AC-4] Cannot verify text contrast because no color stops could be parsed from the body background');
} else {
  const MIN_CONTRAST = 4.5;
  for (const s of bodyStops) {
    const ratio = contrastWithWhite(s.r, s.g, s.b);
    if (ratio < MIN_CONTRAST) {
      failures.push(
        `[AC-4] body background color stop "${s.raw}" (rgb ${s.r}, ${s.g}, ${s.b}) has a contrast ratio of ` +
          `${ratio.toFixed(2)}:1 against white text, below the required ${MIN_CONTRAST}:1`
      );
    }
  }
}

// --- AC-5: no other non-doc file in the repo references the old gradient colors ---

const EXCLUDED_TOP_DIRS = new Set(['.git', 'docs', 'discovery', 'tests']);
const OLD_COLORS = ['#667eea', '#764ba2'];

let repoFiles = [];
try {
  repoFiles = walk(ROOT, '', EXCLUDED_TOP_DIRS);
} catch (err) {
  failures.push(`[AC-5] Failed to walk the repository looking for stale references: ${err.message}`);
}

for (const file of repoFiles) {
  let content;
  try {
    content = fs.readFileSync(file.full, 'utf8');
  } catch {
    continue; // unreadable (e.g. binary) file: skip
  }
  if (content.includes(' ')) continue; // binary heuristic: skip
  const lower = content.toLowerCase();
  for (const oldColor of OLD_COLORS) {
    if (lower.includes(oldColor.toLowerCase())) {
      failures.push(`[AC-5] File "${file.rel}" still references the old gradient color ${oldColor}`);
    }
  }
}

// ---------------------------------------------------------------------------

if (failures.length > 0) {
  console.error('FAIL: background regression checks failed:\n');
  for (const f of failures) console.error(`  - ${f}`);
  console.error(`\n${failures.length} assertion(s) failed.`);
  process.exit(1);
} else {
  console.log('PASS: all background regression checks passed (AC-2, AC-3, AC-4, AC-5).');
  process.exit(0);
}
