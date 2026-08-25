export function Logo({ size = 40, dark = false }: { size?: number; dark?: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" aria-label="CampusExpo logo">
      <rect
        x="2"
        y="2"
        width="60"
        height="60"
        rx="16"
        fill={dark ? "#0f2352" : "#ffffff"}
        stroke="#b8912f"
        strokeWidth="2.5"
      />
      <path
        d="M32 16L50 25L32 34L14 25L32 16Z"
        fill="#b8912f"
      />
      <path
        d="M21 29v9c0 3.6 5 6.5 11 6.5S43 41.6 43 38v-9"
        stroke={dark ? "#ffffff" : "#0f2352"}
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path d="M50 25v11" stroke={dark ? "#ffffff" : "#0f2352"} strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}
