# Photography drop-in

Photographs are the intended imagery for this site. What is live right now is
authored SVG from `public/img/`, because photo bytes could not be downloaded in
the environment this was built in — outbound HTTP from the build shell is
blocked. So nothing here is broken or missing; it is a two-minute job.

Each file listed below is **expected** but not yet present. Nothing references a
path that does not exist, so the site renders correctly as it stands.

## How to switch a slot to photography

1. Download a photo and save it in this directory using the exact file name.
2. Open `src/lib/images.ts` and point that slot's `src` at the new file, updating
   `width`/`height` to the real pixel dimensions.
3. Update the `alt` text in **both** `src/messages/fr.json` and `src/messages/en.json`.

Step 3 is not optional. The current `alt` strings describe illustrations; left
unchanged they would misdescribe the image to every screen-reader user.

## The slots

| File | Used by | Suggested search | Source |
| --- | --- | --- | --- |
| `method.jpg` | `/about` — how the work is measured | african professionals reviewing analytics laptop dark office | Pexels |
| `agent-on-phone.jpg` | `/ai-agents` — the agent answering on a phone | person using smartphone messaging dark low light | Unsplash |
| `backdrop-wide.jpg` | masthead backdrops (see below) | dark empty concrete wall texture moody | Unsplash |

Sizes and suggested dimensions are in `src/lib/images.ts` beside each entry.

## Masthead backdrops

Eleven section mastheads use `SectionBackdrop`. To move them onto the photograph:

1. Save `backdrop-wide.jpg` here and set `IMAGES.backdropWide.src` to it.
2. Change each call site from `variant="contours"` or `variant="grid"` to
   `variant="photo" src={IMAGES.backdropWide.src}`.

Files: `services`, `resources`, `blog` (index), `blog/[slug]`, `contact`, `faq`,
`testimonials`, `industries`, `industries/[slug]` (×2), `about` (×2),
`ai-agents`.

**A photograph needs a lower opacity than an SVG does, not a higher one.** These
mastheads use `0.04`–`0.06`. For a photo, start at `0.10`–`0.15` and keep the
edge gradient — photographs have high local variance, so the same opacity reads
darker and noisier over body copy. The gradient is what stops the top of a
masthead looking like a pasted-in rectangle.

## Licensing

Unsplash and Pexels are free for commercial use with no attribution required,
which is why they are the recommended sources. Getty, Shutterstock or your own
photography carry different terms, including model releases if people are
recognisable — you are responsible for those, not this repo.

Keep the source URL and licence as a comment next to the entry in
`src/lib/images.ts` so it can be audited later.

## One rule

Do not use a stock photograph of a person to stand in for a named member of the
CDA team. Illustrating "how we work" with an anonymous stranger is fine; implying
a specific person did or said something they did not is not. The same applies to
testimonials — see `docs/g-testimonials.md`.