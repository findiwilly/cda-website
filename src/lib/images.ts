/**
 * Image registry.
 *
 * Every image slot in one place, so replacing artwork is a one-file edit instead
 * of a hunt through page components.
 *
 * ## Why there are two sources per slot
 *
 * Photography is the intended end state — real photographs, licensed stock, of
 * real work. What is live right now is authored SVG, because photo **bytes**
 * could not be downloaded in the environment this was built in: outbound HTTP
 * from the build shell is blocked. That is a tooling limit, not a design
 * decision, and it is the reason `photo` sits beside `src` on every entry rather
 * than replacing it.
 *
 * To switch a slot to photography:
 *   1. Drop the file in `public/img/photos/` using the `photo.file` name below.
 *   2. Change that entry's `src` to `photo.src`, and `width`/`height` to the
 *      real pixel dimensions of the file you downloaded.
 *   3. Update the `alt` in both message files to describe the actual photograph.
 *
 * Step 3 is not optional bookkeeping. The current `alt` strings describe
 * illustrations; left unchanged they would misdescribe the image to every
 * screen-reader user.
 *
 * ## Licensing
 *
 * Unsplash and Pexels images are free for commercial use with no attribution
 * required, which is why they are the recommended sources. If you use Getty,
 * Shutterstock or your own photography instead, the licence terms differ and you
 * are responsible for them — including model releases if people are
 * recognisable. Keep the source URL and licence in a comment next to the entry
 * so it can be audited later.
 *
 * ## Do not do this
 *
 * Do not use a stock photograph of a person to stand in for a named member of
 * the CDA team. Illustrating "how we work" with a stranger's face is fine;
 * implying a specific person said or did something they did not is not. The same
 * rule applies to testimonials: see `docs/g-testimonials.md`.
 */

export type ImageSlot = {
  /** Live asset. Authored SVG until the photo is dropped in. */
  src: string;
  width: number;
  height: number;
  /** The drop-in target. `file` is the path under `public/img/photos/`. */
  photo: {
    file: string;
    /** Suggested intrinsic size, so the box can be reserved before load. */
    width: number;
    height: number;
    /** Search terms that surface something usable. */
    search: string;
    /** Suggested source. Both licences permit commercial use. */
    source: "unsplash" | "pexels";
  };
};

/**
 * Photographs chosen deliberately: dark, low-clutter, and legible at low opacity
 * behind text. A busy or bright photo will fight the copy no matter how far the
 * backdrop opacity is turned down.
 */
export const IMAGES = {
  /** `/about` — how the work is done and measured. */
  method: {
    src: "/img/art-dashboard.svg",
    width: 1600,
    height: 1200,
    photo: {
      file: "method.jpg",
      width: 1600,
      height: 1200,
      search: "african professionals reviewing analytics laptop dark office",
      source: "pexels",
    },
  },

  /** `/ai-agents` — the agent answering on a phone. */
  agentOnPhone: {
    src: "/img/art-agent.svg",
    width: 1200,
    height: 1600,
    photo: {
      file: "agent-on-phone.jpg",
      width: 1200,
      height: 1600,
      search: "person using smartphone messaging dark low light",
      source: "unsplash",
    },
  },

  /** Masthead backdrop, for the "reach / mapping" sections. */
  backdropWide: {
    src: "/img/contours.svg",
    width: 2000,
    height: 1125,
    photo: {
      file: "backdrop-wide.jpg",
      width: 2000,
      height: 1125,
      search: "dark empty concrete wall texture moody",
      source: "unsplash",
    },
  },
} as const satisfies Record<string, ImageSlot>;

export type ImageKey = keyof typeof IMAGES;