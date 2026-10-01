/**
 * Mutation test for `check-seed-content.mjs`.
 *
 * A checker that passes is only meaningful if it can fail. Each case injects a
 * specific defect, asserts the checker rejects it, then restores the file and
 * asserts the restore was byte-exact.
 *
 * Cases deliberately use real English words: an earlier attempt mutated French
 * copy with "rapidement" and "optimisé", which are French, and reported them as
 * MISSED — a broken test that looked like a broken checker.
 */

import { readFileSync, writeFileSync } from "node:fs";
import { spawnSync } from "node:child_process";

const PATH = "scripts/seed-content.ts";
const original = readFileSync(PATH, "utf8");

const CASES = [
  // [label, search, replacement, expected substring in the checker's output]
  ["English adverb (-ly)", "met plusieurs secondes", "met quickly several", "quickly"],
  ["English word from the list", "un site vitrine autour", "un site vitrine with autour", "with"],
  ["English participle (-ed)", "un modèle générique non personnalisé", "un modèle générique non customized", "customized"],
  ["French verb in English copy", "The habit is to design", "The habit is to concevoir", "concevoir"],
  ["Markdown in a FAQ answer", "Les prix constatés sur le marché", "Les **prix** constatés sur le marché", '— "*"'],
  ["Untranslated question", 'question: "How much does a website cost in Cameroon?"', 'question: "Combien coûte un site web au Cameroun ?"', "untranslated"],
  ["Post starting at h1", '      "Les prix des sites web au Cameroun varient', '      "# Les prix des sites web au Cameroun varient', 'expected "## "'],
  ["Seeded testimonial", "export const TESTIMONIAL_SEED: TestimonialSeed[] = [];", "export const TESTIMONIAL_SEED: TestimonialSeed[] = [{ name: \"X\", quote: \"y\", rating: 5, locale: \"fr\", status: \"approved\", source: \"manual\" }];", "must stay empty"],
  ["Broken translation link", 'translationOfSlug: "cost-of-a-website-in-cameroon"', 'translationOfSlug: "does-not-exist"', "missing slug"],
  // Regex anchors, because the interesting defect spans several fields.
  ["Featured flag drifts between locales", /(key: "payment-terms",[\s\S]{0,700}?featured: )true/, "$1false", "featured differs"],
  ["Post body replaced by CJK", /(      "L'habitude est de concevoir pour le poste)/, '      "这是一段中文内容', "CJK characters"],
];

let failures = 0;

for (const [label, search, replacement, expected] of CASES) {
  const mutated = original.replace(search, replacement);

  if (mutated === original) {
    console.log(`  SKIP  ${label} — anchor not found in ${PATH}`);
    failures += 1;
    continue;
  }

  writeFileSync(PATH, mutated);

  const run = spawnSync(
    process.execPath,
    ["--experimental-strip-types", "scripts/check-seed-content.mjs"],
    { encoding: "utf8" },
  );
  const output = `${run.stdout ?? ""}${run.stderr ?? ""}`;
  const rejected = run.status !== 0;
  const named = output.includes(expected);

  if (rejected && named) {
    console.log(`  ok    ${label} — rejected, and reported "${expected}"`);
  } else if (!rejected) {
    console.log(`  FAIL  ${label} — checker exited 0 on a defective file`);
    failures += 1;
  } else {
    console.log(`  FAIL  ${label} — rejected, but never mentioned "${expected}"`);
    console.log(output.split("\n").filter((l) => /FAIL/.test(l)).slice(0, 3).join("\n"));
    failures += 1;
  }
}

writeFileSync(PATH, original);

const restored = readFileSync(PATH, "utf8") === original;
console.log(`\n  file restored byte-for-byte: ${restored}`);
if (!restored) failures += 1;

console.log(
  failures === 0
    ? `\n  checker verified against ${CASES.length} injected defects.\n`
    : `\n  ${failures} problem(s).\n`,
);
process.exit(failures === 0 ? 0 : 1);