import React from "react";
import { rankAppearance } from "./result-identity.js";
export function RankBadge({ index }) {
  const style = rankAppearance(index),
    medal = index < 3;
  return (
    <svg
      className={`rank-badge ${medal ? "podium-medal" : "position-badge"}`}
      viewBox="0 0 36 42"
      role="img"
      aria-label={style.label}
    >
      {medal && (
        <>
          <path d="M9 25 6 40 17 34 20 39 21 25Z" fill={style.metal} />
          <path d="M18 25 21 40 27 34 32 37 27 24Z" fill={style.color} />
        </>
      )}
      <circle
        cx="18"
        cy={medal ? 17 : 21}
        r="15"
        fill={style.fill}
        stroke={style.metal}
        strokeWidth={medal ? 2 : 1}
      />
      {medal && (
        <circle
          cx="18"
          cy="17"
          r="11"
          fill="none"
          stroke={style.metal}
          strokeWidth="1"
        />
      )}
      <text
        x="18"
        y={medal ? 22 : 26}
        textAnchor="middle"
        fill={style.color}
        fontFamily="Arial,sans-serif"
        fontSize="15"
        fontWeight="800"
      >
        {index + 1}
      </text>
    </svg>
  );
}
