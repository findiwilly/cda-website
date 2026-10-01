# A — Fix broken CI deployment

**Status:** Done
**Spec:** `CLAUDE.md` — "CI must fail a bad pull request", "Vercel for hosting"
**Problem:** `.github/workflows/nextjs.yml` could never have worked, in three
independent ways:

1. **It deployed something that does not exist.** The upload step ran
   `actions/upload-pages-artifact` against `./out`, but `next.config.mjs` sets no
   `output: "export"`. There is no `out` directory. The step would have failed on
   every push to `main`.
2. **It linted nothing.** No ESLint step, no typecheck. TypeScript errors
   reached production undetected — `tsc --noEmit` is the only thing that catches
   them, because Next's build transpiles without checking types.
3. **It could never have hosted this project anyway.** The site now has an admin
   panel, `/api/*` route handlers, MongoDB reads and SMTP notifications. None of
   that exists in a static export.

**Change:**

**`.github/workflows/nextjs.yml` — fully rewritten.** The name is now `CI`, not
`Deploy`, because it no longer deploys. It runs on push and pull request to
`main`, and has a single `verify` job:

```yaml
npm ci
npm run messages
npm run lint
npm run typecheck
npm run build
```

Decisions worth stating:

- **`npm ci`, not `npm install`.** The lockfile is the source of truth; `ci`
  fails loudly if `package.json` and `package-lock.json` have drifted, which
  `install` silently papers over.
- **`npm run messages` runs first.** The bilingual-message convention
  (`docs/README.md`) is the one rule in this project that nothing else would
  catch. A key added to `fr.json` and forgotten in `en.json` compiles, lints,
  type-checks and builds cleanly — it only fails at render time, in whichever
  language forgot it, for whichever visitor happens to hit that page.
- **Node 20 with `cache: npm`.** Matches the local toolchain and lets the runner
  cache `~/.npm`.
- **`permissions: contents: read`** at the workflow level. The default `GITHUB_TOKEN`
  scope is broader than any job here needs.
- **No secrets, at all.** The only env var set is
  `NEXT_PUBLIC_SITE_URL: https://example.com`. This is the whole point: a
  production build must succeed with no credentials, so a pull request opened
  from a fork — which has no access to secrets and never will — runs the exact
  same verification as `main`. If CI needed a secret, fork PRs would be
  un-buildable and would go unchecked.
- **Deployment moved to Vercel's Git integration**, which builds on its own
  infrastructure with the real secrets. This workflow's remaining job is to fail
  a bad pull request *before* that integration ever sees it.

**Files:**

- `.github/workflows/nextjs.yml` (rewritten)
- `scripts/check-messages.mjs` (new)
- `package.json` — added `typecheck`, `messages`, `seed`, `verify`

**Verify:**

```bash
npm run verify   # messages && lint && typecheck && build
```

Then push a branch and confirm the `CI` check appears on the PR, and that
merging shows a green `CI` run on `main` alongside the Vercel deployment.

**Notes:**

- **GitHub Pages is not a target for this project.** It cannot serve a server
  runtime. The original workflow predated the admin panel, and no amount of
  fixing it would make it viable now. See `CLAUDE.md` for the Vercel decision.
- `npm run verify` exists so the same checks can be run locally. CI calls
  them individually so each failure is attributed to its own step rather than
  collapsing into one.
- **`scripts/check-messages.mjs` was written with a bug that made two of its
  four checks permanently dead.** `flatten` appended the path separator to the
  prefix and returned that prefix unchanged, so every key came out as
  `notFound.title.` with a trailing dot. Key *set* comparison still worked —
  both sides were wrong the same way — so the checker reported zero drift and
  looked healthy. But `valueAt` resolved every dotted path to `undefined`, so the
  placeholder and empty-value checks silently passed on everything. It was found
  by deliberately mutating each failure mode and asserting the checker caught it,
  not by reading the code. Worth doing for any checker before trusting it.
- The workflow name in the Actions tab is `CI`. Anything referring to the old
  `Deploy` check — branch protection rules, badges in the README — needs
  updating when this is first pushed.