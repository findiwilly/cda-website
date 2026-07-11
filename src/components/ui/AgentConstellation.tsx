"use client";

import { motion } from "motion/react";
import { useTranslations } from "next-intl";
import {
  drawLine,
  fadeIn,
  staggerParent,
  viewportOnce,
} from "@/lib/motion-tokens";

const AGENTS = ["cso", "cmo", "coo", "cto", "cfo", "cco"] as const;

/**
 * The AI Agents page's cinematic moment: six C-Suite agents drawing their
 * connections to the client's brand at the center. Pure SVG — no 3D payload.
 */
export function AgentConstellation() {
  const t = useTranslations("aiAgents.agents");
  const cx = 300;
  const cy = 210;
  const r = 150;

  const nodes = AGENTS.map((key, i) => {
    const a = (i / AGENTS.length) * Math.PI * 2 - Math.PI / 2;
    return {
      key,
      x: cx + Math.cos(a) * r,
      y: cy + Math.sin(a) * r * 0.82,
    };
  });

  return (
    <motion.svg
      viewBox="0 0 600 420"
      className="mx-auto w-full max-w-3xl"
      initial="hidden"
      whileInView="visible"
      viewport={viewportOnce}
      variants={staggerParent}
      aria-hidden
    >
      {/* Connections */}
      {nodes.map((n) => (
        <motion.line
          key={`line-${n.key}`}
          x1={cx}
          y1={cy}
          x2={n.x}
          y2={n.y}
          stroke="rgba(0,192,139,0.35)"
          strokeWidth="1"
          variants={drawLine}
        />
      ))}

      {/* Center — the client's brand */}
      <motion.g variants={fadeIn}>
        <circle cx={cx} cy={cy} r="34" fill="rgba(0,122,94,0.12)" />
        <circle
          cx={cx}
          cy={cy}
          r="24"
          fill="#101012"
          stroke="rgba(252,209,22,0.5)"
          strokeWidth="1"
        />
        <text
          x={cx}
          y={cy + 4}
          textAnchor="middle"
          fill="#F2F2F5"
          fontSize="12"
          fontWeight="700"
        >
          CDA
        </text>
      </motion.g>

      {/* Agents */}
      {nodes.map((n) => (
        <motion.g key={n.key} variants={fadeIn}>
          <circle
            cx={n.x}
            cy={n.y}
            r="26"
            fill="#101012"
            stroke="rgba(0,192,139,0.45)"
            strokeWidth="1"
          />
          <text
            x={n.x}
            y={n.y + 4}
            textAnchor="middle"
            fill="#00C08B"
            fontSize="11"
            fontWeight="600"
            style={{ textTransform: "uppercase" }}
          >
            {n.key.toUpperCase()}
          </text>
          <text
            x={n.x}
            y={n.y + 46}
            textAnchor="middle"
            fill="#7C7C87"
            fontSize="9"
          >
            {t(`${n.key}.title`)}
          </text>
        </motion.g>
      ))}
    </motion.svg>
  );
}
