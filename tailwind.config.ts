import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        // Deep charcoal / near-black backdrop scale
        ink: {
          950: "#0A0A0B",
          900: "#101012",
          800: "#17171A",
          700: "#1F1F24",
          600: "#2A2A31",
          500: "#3A3A43",
          400: "#55555F",
          300: "#7C7C87",
          200: "#ABABB4",
          100: "#D6D6DC",
          50: "#F2F2F5",
        },
        // Cameroon flag accents — glows, gradients, highlights only. Never loud blocks.
        cdagreen: {
          DEFAULT: "#007A5E",
          bright: "#00A67E",
          dim: "#004D3B",
        },
        cdared: {
          DEFAULT: "#CE1126",
          dim: "#7A0A17",
        },
        cdayellow: {
          DEFAULT: "#FCD116",
          dim: "#9C8110",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      fontSize: {
        // Display scale for headlines (fluid)
        "display-xl": [
          "clamp(2.75rem, 7vw, 6rem)",
          { lineHeight: "1.02", letterSpacing: "-0.03em" },
        ],
        "display-lg": [
          "clamp(2.25rem, 5vw, 4.25rem)",
          { lineHeight: "1.05", letterSpacing: "-0.025em" },
        ],
        "display-md": [
          "clamp(1.75rem, 3.5vw, 3rem)",
          { lineHeight: "1.1", letterSpacing: "-0.02em" },
        ],
        "display-sm": [
          "clamp(1.375rem, 2.5vw, 2rem)",
          { lineHeight: "1.15", letterSpacing: "-0.015em" },
        ],
      },
      boxShadow: {
        "glow-green": "0 0 60px -12px rgba(0, 122, 94, 0.45)",
        "glow-yellow": "0 0 60px -12px rgba(252, 209, 22, 0.35)",
        "glow-red": "0 0 60px -12px rgba(206, 17, 38, 0.35)",
        glass: "inset 0 1px 0 0 rgba(255,255,255,0.06)",
      },
      backgroundImage: {
        "gradient-cm":
          "linear-gradient(120deg, #007A5E 0%, #FCD116 55%, #CE1126 110%)",
        "radial-fade":
          "radial-gradient(ellipse at center, rgba(255,255,255,0.04), transparent 70%)",
      },
      animation: {
        "pulse-soft": "pulse-soft 2.4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        marquee: "marquee 40s linear infinite",
      },
      keyframes: {
        "pulse-soft": {
          "0%, 100%": { opacity: "1", transform: "scale(1)" },
          "50%": { opacity: "0.75", transform: "scale(1.04)" },
        },
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
      },
      transitionTimingFunction: {
        // Apple-ish easings — mirror EASE in src/lib/motion.ts
        "out-expo": "cubic-bezier(0.16, 1, 0.3, 1)",
        "in-out-smooth": "cubic-bezier(0.65, 0, 0.35, 1)",
      },
      spacing: {
        section: "clamp(5rem, 12vh, 9rem)",
      },
      maxWidth: {
        content: "72rem",
      },
    },
  },
  plugins: [],
};

export default config;
