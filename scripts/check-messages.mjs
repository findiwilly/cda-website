/**
 * Message-file drift check.
 *
 * The project convention is that `src/messages/fr.json` and `en.json` are
 * updated in the same commit, French first. That is a convention, not a
 * mechanism: nothing in Next.js fails a build when one file has a key the other
 * does not. `useTranslations("contact.form")` throws only if the *whole*
 * namespace is missing, so a single added key fails silently at runtime in
 * whichever language forgot it — on a bilingual site whose primary market is
 * French.
 *
 * This is what makes the convention enforceable. Run via `npm run messages`,
 * and in CI before lint.
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (locale) =>
  JSON.parse(readFileSync(join(root, `src/messages/${locale}.json`), "utf8"));

/**
 * Every leaf key, dot-pathed. Arrays count as a single leaf, so their elements
 * are not counted as keys — but they are length-checked below, because a French
 * list of 8 legal sections against an English list of 7 is a real bug that key
 * counting alone would miss.
 *
 * The separator is joined in at the recursion step, not appended to the prefix.
 * Appending it here and returning `prefix` unchanged leaves a trailing dot on
 * every key, which looks like a harmless cosmetic quirk and is not:
 * `valueAt` then resolves `notFound.title.` to `undefined`, and every check
 * that reads a value through it silently passes on everything.
 */
function flatten(value, prefix = "") {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return prefix ? [prefix] : [];
  }
  return Object.entries(value).flatMap(([key, child]) =>
    flatten(child, prefix ? `${prefix}.${key}` : key),
  );
}

/** Dot-path → element count, for every array in the tree. */
function arrays(value, prefix = "", out = {}) {
  if (typeof value !== "object" || value === null) return out;
  for (const [key, child] of Object.entries(value)) {
    const path = `${prefix}${key}`;
    if (Array.isArray(child)) out[path] = child.length;
    else arrays(child, `${path}.`, out);
  }
  return out;
}

function valueAt(obj, dotPath) {
  return dotPath.split(".").reduce((node, part) => node?.[part], obj);
}

/**
 * ICU placeholders are part of a translation contract, not decoration. Passing
 * a missing value to `t()` throws at render time, so a key that gained a
 * placeholder in one language and not the other is broken the same way a missing
 * key is — and just as invisible at build time.
 */
function placeholders(text) {
  return typeof text === "string"
    ? [...text.matchAll(/\{\s*([A-Za-z0-9_]+)\s*(?:,|\})/g)].map((m) => m[1]).sort()
    : [];
}

const fr = read("fr");
const en = read("en");

const frKeys = flatten(fr).sort();
const enKeys = flatten(en).sort();
const frSet = new Set(frKeys);
const enSet = new Set(enKeys);

const failures = [];
const report = (title, lines) => {
  console.error(`\n✗ ${title}:\n  ${lines.join("\n  ")}`);
};

const onlyFr = frKeys.filter((key) => !enSet.has(key));
const onlyEn = enKeys.filter((key) => !frSet.has(key));

if (onlyFr.length > 0) {
  report("present in fr.json, missing from en.json", onlyFr);
  failures.push(`${onlyFr.length} key(s) missing from en.json`);
}
if (onlyEn.length > 0) {
  report("present in en.json, missing from fr.json", onlyEn);
  failures.push(`${onlyEn.length} key(s) missing from fr.json`);
}

const placeholderMismatches = frKeys.filter((key) => {
  if (!enSet.has(key)) return false;
  return placeholders(valueAt(fr, key)).join(",") !== placeholders(valueAt(en, key)).join(",");
});
if (placeholderMismatches.length > 0) {
  report("placeholder mismatch between fr and en", placeholderMismatches);
  failures.push(`${placeholderMismatches.length} placeholder mismatch(es)`);
}

const frArrays = arrays(fr);
const enArrays = arrays(en);
const arrayPaths = [...new Set([...Object.keys(frArrays), ...Object.keys(enArrays)])].sort();
const arrayMismatches = arrayPaths.filter(
  (path) => frArrays[path] !== enArrays[path],
);
if (arrayMismatches.length > 0) {
  report(
    "array length mismatch between fr and en",
    arrayMismatches.map((p) => `${p}: fr ${frArrays[p] ?? "absent"}, en ${enArrays[p] ?? "absent"}`),
  );
  failures.push(`${arrayMismatches.length} array length mismatch(es)`);
}

const emptyValues = [];
for (const [locale, obj, keys] of [
  ["fr", fr, frKeys],
  ["en", en, enKeys],
]) {
  for (const key of keys) {
    const value = valueAt(obj, key);
    if (typeof value === "string" && value.trim() === "") emptyValues.push(`${locale}:${key}`);
  }
}
if (emptyValues.length > 0) {
  report("empty values (a blank string is a translation gap, not a translation)", emptyValues);
  failures.push(`${emptyValues.length} empty value(s)`);
}

console.log(`fr ${frKeys.length} keys, en ${enKeys.length} keys`);
console.log(`arrays: ${Object.keys(frArrays).length}`);
console.log(`namespaces: ${Object.keys(fr).join(" ")}`);

if (failures.length > 0) {
  console.error(`\nMessages: FAILED — ${failures.join("; ")}`);
  process.exit(1);
}

console.log("\nMessages: OK — same keys, same array lengths, matching placeholders, no empty values.");