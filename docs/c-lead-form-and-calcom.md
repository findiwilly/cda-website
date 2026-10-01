# C — Lead form accessibility & Cal.com embed

**Status:** Done
**Spec:** `CLAUDE.md` — "Accessibility is non-negotiable", "every input needs a
real label"
**Problem:** Two separate problems, both on the highest-intent page on the site.

**The lead form was unusable without a screen reader.** Five fields, every one of
them styled to look like the placeholder text — meaning the placeholder *was* the
only label. A screen reader announces an unlabelled text input as just "edit
text", so a visitor using one could not tell whether they were entering their name
or their company. There was no `id`/`htmlFor` pairing, no `autocomplete`, no
`aria-describedby` for the help text, no `aria-invalid`, and no error handling at
all: submit failed silently. On a page whose entire purpose is capturing a
phone number, that is the whole conversion funnel.

**The booking link went off-site.** The contact page linked out to Cal.com. The
visitor lost the site, the brand, and the context; Cal.com has no idea what page
referred them. There was also a hardcoded English `eyebrow="FAQ"` on the French
booking block.

**Change:**

### `src/components/ui/LeadForm.tsx` — rewritten

- Every field now has a real `<label htmlFor>` bound to the input's `id`, with
  the placeholder demoted to a format *hint* rather than the label.
- `autoComplete` on all five fields (`name`, `email`, `tel`, `company`, and
  `message` appropriately), so browsers and password managers stop asking.
- Errors are per-field and announced through a summary: `aria-invalid` on the
  input, `aria-describedby` pointing at the message, and a `role="alert"`
  container that **takes focus** on failed submit. Focus is the part that
  matters — a visually-hidden alert that never receives focus is not announced by
  most screen readers when focus is already inside the form.
- Validation errors clear as the user edits the offending field, rather than
  persisting until the next submit.
- Added `contact.form.errorSummary` to both message files.
- Client-side validation is a courtesy, not the boundary: the same Zod schema
  runs again in `POST /api/leads`.

### `src/components/booking/CalEmbed.tsx` — new

- A plain `<iframe>` pointed at the Cal.com booking URL, loaded **on click**
  inside an `IntersectionObserver`, not eagerly on page load. Three reasons:
  Cal's own `embed.js` injects a fixed-height container that fights the
  surrounding layout; it gives no success or failure signal; and a third-party
  script on the contact page is a real cost on a metered connection.
- **A real `<a>` to the same URL renders first** and stays in the DOM as the
  fallback. If the iframe is blocked, blocked by an extension, or simply never
  loads on a flaky connection, the visitor still has a working link — this is the
  part most embed implementations get wrong.
- `contact.booking.embedTitle`, `.openInNewTab` and `.embedFailed` added to both
  message files.

### Accordion accessibility

- `aria-controls` on each trigger, with a stable per-item id.
- `<h3>` wrapper so the trigger participates in the heading outline.
- Panel is `role="region"` with `aria-labelledby` pointing at its trigger, so a
  screen-reader user can jump between questions and their answers.
- The `Plus` icon is `aria-hidden` — the button's own accessible name comes from
  the question text, and "plus" is not part of it.

### Misc

- The booking block's hardcoded `eyebrow="FAQ"` now reads `faq.intro.eyebrow`,
  and the block links to `/faq`.

**Files:**

- `src/components/ui/LeadForm.tsx` (rewritten)
- `src/components/booking/CalEmbed.tsx` (new)
- `src/app/[locale]/contact/page.tsx`
- `src/components/ui/Accordion.tsx`
- `src/app/api/leads/route.ts`
- `src/messages/fr.json`, `src/messages/en.json`

**Verify:**

1. Run `npm run dev`, open `/fr/contact`.
2. **Keyboard only:** Tab through the form. Every stop should announce a label.
   Submit empty — focus should move to the error summary and it should be
   announced.
3. **Screen reader:** VoiceOver (⌘F5) or NVDA. Confirm field names, that errors
   are announced on submit, and that the accordion answers are reachable as
   regions.
4. **Booking:** click the embed. If the iframe does not appear within a few
   seconds, the fallback link must be visible and working.
5. `npx tsc --noEmit` — note that indexing the narrow `errors` object with the
   full `values` key union is a type error; guard with
   `key === "name" || key === "whatsapp"`.

**Notes:**

- `@next/next/no-dangerously-set-innerhtml` **is not a real rule** in
  `eslint-config-next`. An `eslint-disable` comment referencing it fails the
  build with "Definition for rule … was not found". Do not add one.
- `LeadForm` is a client component; it is the only one on the page. Everything
  else on `/contact` stays a server component.
- The Cal.com URL is in `src/lib/constants.ts`. If the booking link changes,
  that constant is the only thing to edit.
- Lead submissions are rate-limited per IP in `src/lib/rate-limit.ts`. That is
  in-memory, so it resets on every serverless cold start — sufficient to stop a
  naive form-spam run, not sufficient as an abuse control. Use a real limiter if
  the form becomes a target.