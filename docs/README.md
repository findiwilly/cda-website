# CDA Website — Change Documentation

Every change to this project is documented here. One file per work stream, written in
the same order the work lands.

Each entry follows a fixed shape so it can be skimmed or grepped:

| Field | Meaning |
| --- | --- |
| **Status** | `Planned` → `In progress` → `Done` |
| **Spec** | The `CLAUDE.md` line this work answers to |
| **Problem** | What was broken, in concrete terms |
| **Change** | What was actually done, file by file |
| **Files** | Everything touched |
| **Verify** | How to confirm it works |
| **Notes** | Trade-offs, follow-ups, things deliberately not done |

## Index

| # | Work stream | Status |
| --- | --- | --- |
| 00 | [Environment & credentials](00-environment.md) | Done |
| A | [Fix broken CI deployment](a-fix-ci.md) | Done |
| B | [SEO foundation](b-seo-foundation.md) | Done |
| C | [Lead form accessibility + Cal.com embed](c-lead-form-and-calcom.md) | Done |
| D | [Background & side imagery](d-imagery.md) | Layout done, photos pending |
| E | [Admin panel: auth, blog, testimonials](e-admin-panel.md) | Done |
| F | [Legal pages](f-legal-pages.md) | Done |
| G | [Testimonials page + submission form](g-testimonials.md) | Done |
| H | [FAQ page](h-faq-page.md) | Done |
| I | [Blog index & article rendering](i-blog-content.md) | Done |
| J | [Real content, live credentials, bugs found](j-content-and-credentials.md) | Done |

`I` was added beyond the original A–H scope. The blog was part of the admin-panel
work, but the markdown → sanitized-HTML pipeline has two traps in it that fail
silently, so it is documented on its own rather than as a paragraph inside `E`.

`J` replaced the placeholder seed content with researched content and wired the
real credentials. It found two bugs that only appear once a database-backed build
runs: a cross-locale `generateStaticParams` that served soft 404s, and seeded
posts that rendered two `h1`s each.

## Before you ship

None of this is written down anywhere else, so it is written down here.

**Must happen:**

- [ ] Create the admin account. `npm run seed` seeds content but was deliberately
      run without `ADMIN_EMAIL`, so there is no admin yet:
      ```bash
      ADMIN_PASSWORD='a password you have not typed into a chat' npm run seed
      ```
      See [J](j-content-and-credentials.md).
- [ ] **Rotate the MongoDB password and the Cloudinary API secret.** Both were
      pasted into a chat in plaintext. `.env.local` is gitignored, but the values
      are in that conversation's history. Then update `.env.local`.
- [ ] **Regenerate the Gmail app password.** The configured one is rejected by
      Google (`535 5.7.8`) in every combination of spacing and port. See [00](00-environment.md).
- [ ] Get the legal pages reviewed by someone qualified. See
      [F](f-legal-pages.md). They are an accurate starting draft, not legal advice.
- [ ] Add the imprint page (`mentions légales`) — registered name, address,
      SIRET/SIREN, RCS, hosting provider. The numbers are business registration
      data and were deliberately not invented.
- [ ] Replace the demo `LocalBusiness` data in `src/lib/constants.ts` `SITE` —
      address, phone, geo coordinates. `whatsappNumber` is still a placeholder.
- [ ] Rename the GitHub Actions check from `Deploy` to `CI` in any branch
      protection rules. See [A](a-fix-ci.md).

**Should happen:**

- [ ] **Review the seeded FAQs against what you actually charge and promise.**
      They follow `contact.faq` in the message files. If a number there is wrong,
      the FAQ is now wrong in two places. See [J](j-content-and-credentials.md).
- [ ] **Collect real testimonials.** The collection is seeded empty on purpose —
      see [J](j-content-and-credentials.md) for why a seed script must not invent
      them. The page renders its empty state until then.
- [ ] **Drop in the stock photography.** Both arrangements are built and wired to
      `src/lib/images.ts`; the SVG stands in only because photo bytes could not
      be downloaded in the build environment. Filenames, search terms and sizes
      are in `public/img/photos/README.md`. **Rewrite the two `imageAlt` strings
      when you do** — see [D](d-imagery.md).
- [ ] Set `NEXT_PUBLIC_SITE_URL` to the real origin in Vercel. Canonical URLs,
      the sitemap and schema.org `image` all derive from it.
- [ ] Decide on second-admin access, and add an audit trail when you do.
      There is no admin creation UI and no password reset flow. See
      [E](e-admin-panel.md).
- [ ] If analytics is ever added, a consent banner is required and
      [the cookie policy](f-legal-pages.md) must be updated in the same change.
- [ ] Point the Cal.com booking URL at the real calendar. See
      [C](c-lead-form-and-calcom.md).
- [ ] Register the sitemap in Google Search Console.

## Conventions used across all work

- **Design system is not negotiable.** Every new page reuses `SectionHeader`,
  `Reveal` / `Stagger`, the `ink` / `cdagreen` / `cdared` / `cdayellow` palette,
  and the `max-w-content` container. No new ad-hoc styling vocabulary.
- **Motion values come from `src/lib/motion-tokens.ts` only.** No inline
  durations, easings, or distances anywhere — including the admin panel.
- **All copy lives in `src/messages/fr.json` and `en.json`,** French first, both
  files updated in the same commit. Admin-authored content (blog, testimonials,
  FAQs) is the sole exception, since it is user-generated data by definition.
  **This convention is enforced, not just documented:** `npm run messages`
  (`scripts/check-messages.mjs`) fails on a key present in one file and not the
  other, an array whose length differs between the two, an ICU placeholder set
  that differs, or an empty string. It runs in `npm run verify` and as the first
  step of CI.
  **The same applies to seeded content,** which is not really user-generated:
  `npm run seed:check` validates the FAQs and posts in
  `scripts/seed-content.ts` for locale parity, broken translation links, heading
  levels, and English leaking into French. It runs in `verify` and in CI.
- **Mobile-first.** Cameroon traffic is mostly mobile and often low-bandwidth, so
  every page is built mobile-first and JS stays lean.
- **Build and lint must pass** before anything is considered done:
  `npm run build` and `npm run lint`. `npm run verify` runs every check —
  messages, seeded content, lint, typecheck, build — and is what CI runs.

## Environment gotchas

Not bugs in the site, but traps that cost time. All four have been hit.

- **On Windows, use `npm.cmd`, not `npm`.** PowerShell's execution policy blocks
  `npm.ps1`.
- **Piping `npm.cmd` output to `Select-Object` reports "Command exited with
  code 1" spuriously**, because stderr streams as `NativeCommandError`. Verify an
  exit code with:
  ```powershell
  npm.cmd run build *>&1 | Out-File build.log; Write-Host "EXITCODE=$LASTEXITCODE"
  ```
- **The message files are CRLF.** Rewriting them with `JSON.stringify` and `"\n"`
  reformats the entire file and buries the real change in whitespace noise. Match
  the existing line endings.
- **Do not read or write these files with a tool that guesses the encoding.**
  `slugify()` in `src/lib/markdown.ts` had a literal `U+0300`–`U+036F` range that
  looked fine in Node and turned into a character class matching nothing under a
  bare `Get-Content` in Windows PowerShell. It uses `\u` escapes now, and the
  comment there says why. See [I](i-blog-content.md).
- **PowerShell deletes an environment variable when you set it to `""`.**
  `$env:FOO = ""` removes `FOO` entirely, so anything that reloads `.env.local`
  with `??=` puts the real value straight back. To pass a defined-but-blank value
  — which is how `npm run seed` is told to skip admin creation — use a single
  space: `$env:ADMIN_EMAIL = " "`. See [J](j-content-and-credentials.md).
- **Any env var whose value contains spaces must be quoted.** The Gmail app
  password is 16 letters in `4-4-4-4` groups. Unquoted, the parser truncates it
  at the first space and Google answers with a generic
  `535 Username and Password not accepted`. Any hand-rolled `.env` reader in this
  repo has to strip surrounding quotes; `dotenv` does, a `split("=")` does not.
- **An SMTP auth failure does not tell you which mistake you made.** Google's
  `535` is identical for a wrong password, a revoked app password, and 2FA having
  been changed since it was created. Google also shows app passwords *with*
  spaces while some clients need them concatenated. `npm run env:check` tries the
  plausible combinations so the ambiguity does not cost an afternoon.