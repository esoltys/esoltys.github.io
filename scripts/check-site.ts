// Consistency checks for the static site that html-validate and a link checker
// can't see. Run with `bun scripts/check-site.ts`; exits non-zero on any problem.
//
// - Every data-i18n / data-i18n-html key in luminous/index.html exists in each
//   luminous/i18n/<lang>.js, and no dictionary carries keys the markup dropped.
// - Every data-localized-src screenshot exists for all languages, with the
//   filename's exact case (GitHub Pages is case-sensitive; Windows is not).
// - The SoftwareApplication JSON-LD shared by both pages (same @id) agrees on
//   every field both declare, and the release version matches the hero badge
//   and llms.txt.

import { readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";

const root = join(import.meta.dir, "..");
const luminous = join(root, "luminous");
const problems: string[] = [];

const read = (path: string) => readFileSync(join(root, path), "utf8");
const page = read("luminous/index.html");
const homePage = read("index.html");

// Same order as SUPPORTED_LANGS in luminous/main.js; English lives in the markup.
const LANGS = ["fr", "de", "es", "it", "ru", "uk"];

// --- Translation keys ---------------------------------------------------------

const markupKeys = new Set(
  [...page.matchAll(/\sdata-i18n(?:-html)?="([^"]+)"/g)].map((m) => m[1]),
);

const dictionaries: Record<string, Record<string, string>> = {};
for (const lang of LANGS) {
  const dict = (await import(join(luminous, "i18n", `${lang}.js`))).default;
  dictionaries[lang] = dict;
  for (const key of markupKeys) {
    if (!(key in dict)) problems.push(`i18n/${lang}.js: missing key "${key}"`);
  }
  for (const key of Object.keys(dict)) {
    if (!markupKeys.has(key)) problems.push(`i18n/${lang}.js: key "${key}" is not used in index.html`);
  }
}

// --- Localized screenshots ----------------------------------------------------

// readdirSync returns names as stored, so a Set lookup is case-exact everywhere.
const listings = new Map<string, Set<string>>();
const existsExactly = (path: string) => {
  const dir = dirname(path);
  if (!listings.has(dir)) listings.set(dir, new Set(readdirSync(join(luminous, dir))));
  return listings.get(dir)!.has(path.slice(dir.length + 1));
};

for (const [tag] of page.matchAll(/<img\b[^>]*\bdata-localized-src\b[^>]*>/g)) {
  const src = tag.match(/\ssrc="\.\/([^"]+)"/)?.[1];
  if (!src?.includes("-EN.")) {
    problems.push(`index.html: data-localized-src image has no "-EN." src: ${tag.slice(0, 80)}…`);
    continue;
  }
  for (const lang of ["en", ...LANGS]) {
    const file = src.replace("-EN.", `-${lang.toUpperCase()}.`);
    if (!existsExactly(file)) problems.push(`missing screenshot (exact case): luminous/${file}`);
  }
}

// --- SoftwareApplication metadata ---------------------------------------------

const APP_ID = "https://esoltys.dev/luminous/#app";

function findApp(html: string, label: string): Record<string, unknown> | undefined {
  for (const [, json] of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
    let data: unknown;
    try {
      data = JSON.parse(json);
    } catch (error) {
      problems.push(`${label}: JSON-LD does not parse (${(error as Error).message})`);
      continue;
    }
    const nodes = (data as { "@graph"?: unknown[] })["@graph"] ?? [data];
    const app = nodes.find((node) => (node as { "@id"?: string })["@id"] === APP_ID);
    if (app) return app as Record<string, unknown>;
  }
  problems.push(`${label}: no JSON-LD node with @id ${APP_ID}`);
}

const app = findApp(page, "luminous/index.html");
const homeApp = findApp(homePage, "index.html");

if (app && homeApp) {
  for (const field of Object.keys(homeApp)) {
    if (field in app && JSON.stringify(app[field]) !== JSON.stringify(homeApp[field])) {
      problems.push(`SoftwareApplication "${field}" differs: index.html has ${JSON.stringify(homeApp[field])}, luminous/index.html has ${JSON.stringify(app[field])}`);
    }
  }
}

const version = app?.softwareVersion as string | undefined;
if (version) {
  const badge = page.match(/data-i18n="hero\.badge">([^<]*)</)?.[1] ?? "";
  if (!badge.includes(version)) problems.push(`hero badge "${badge}" does not mention softwareVersion ${version}`);
  for (const lang of LANGS) {
    const localized = dictionaries[lang]["hero.badge"] ?? "";
    if (!localized.includes(version)) problems.push(`i18n/${lang}.js: hero.badge "${localized}" does not mention ${version}`);
  }
  if (!read("luminous/llms.txt").includes(`version ${version}`)) {
    problems.push(`luminous/llms.txt does not mention "version ${version}"`);
  }
} else if (app) {
  problems.push("luminous/index.html: SoftwareApplication has no softwareVersion");
}

// --- Report -------------------------------------------------------------------

if (problems.length) {
  console.error(problems.map((p) => `✖ ${p}`).join("\n"));
  console.error(`\n${problems.length} problem(s)`);
  process.exit(1);
}
console.log(`✔ ${markupKeys.size} translation keys × ${LANGS.length} languages, screenshots, and app metadata are consistent`);
