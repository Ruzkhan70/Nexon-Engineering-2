import { motion } from 'motion/react';

interface NexonLogoLoaderProps {
  size?: number;
  className?: string;
}

/**
 * Premium NEXON Engineering Logo Loader
 * Features: Rotating gears, glowing circuit-board "E" letter, animated traces
 */
export default function NexonLogoLoader({ size = 160, className = "" }: NexonLogoLoaderProps) {
  const s = size;

  // Circuit node positions for the "E" letter traces
  const circuitNodes = [
    { cx: 68, cy: 28 }, { cx: 90, cy: 28 }, { cx: 100, cy: 28 },
    { cx: 68, cy: 50 }, { cx: 82, cy: 50 }, { cx: 92, cy: 50 },
    { cx: 68, cy: 72 }, { cx: 88, cy: 72 }, { cx: 100, cy: 72 },
    { cx: 54, cy: 28 }, { cx: 54, cy: 50 }, { cx: 54, cy: 72 },
    { cx: 54, cy: 38 }, { cx: 54, cy: 62 },
  ];

  return (
    <div
      id="nexon-logo-loader-container"
      className={`relative flex items-center justify-center overflow-visible ${className}`}
      style={{ width: s, height: s }}
    >
      {/* ── Ambient glow core ── */}
      <motion.div
        animate={{ scale: [0.85, 1.25, 0.85], opacity: [0.15, 0.4, 0.15] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute inset-[-30%] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(30,136,229,0.45) 0%, transparent 70%)' }}
      />

      {/* ── Central SVG: Full logo composition ── */}
      <svg
        viewBox="0 0 200 200"
        className="relative z-20 w-full h-full"
        style={{ overflow: 'visible' }}
      >
        <defs>
          {/* Neon blue glow filter */}
          <filter id="glow-blue" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="blur1" />
            <feGaussianBlur stdDeviation="6" result="blur2" />
            <feMerge>
              <feMergeNode in="blur2" />
              <feMergeNode in="blur1" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Stronger glow for the E letter */}
          <filter id="glow-strong" x="-80%" y="-80%" width="260%" height="260%">
            <feGaussianBlur stdDeviation="4" result="blur1" />
            <feGaussianBlur stdDeviation="10" result="blur2" />
            <feMerge>
              <feMergeNode in="blur2" />
              <feMergeNode in="blur1" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Gear tooth path definition */}
          <filter id="gear-glow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Gradient for circuit traces */}
          <linearGradient id="trace-grad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#1E88E5" stopOpacity="0" />
            <stop offset="50%" stopColor="#60C3FF" stopOpacity="1" />
            <stop offset="100%" stopColor="#1E88E5" stopOpacity="0" />
          </linearGradient>

          {/* Radial gradient for logo background */}
          <radialGradient id="logo-bg" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#0A1628" />
            <stop offset="100%" stopColor="#020617" />
          </radialGradient>

          {/* Clip path for gear */}
          <clipPath id="logo-clip">
            <circle cx="100" cy="100" r="95" />
          </clipPath>
        </defs>

        {/* Background circle */}
        <circle cx="100" cy="100" r="92" fill="url(#logo-bg)" />

        {/* Subtle grid overlay */}
        <g opacity="0.04" clipPath="url(#logo-clip)">
          {[...Array(10)].map((_, i) => (
            <line key={`hg-${i}`} x1="10" y1={20 + i * 18} x2="190" y2={20 + i * 18} stroke="#1E88E5" strokeWidth="0.5" />
          ))}
          {[...Array(10)].map((_, i) => (
            <line key={`vg-${i}`} x1={20 + i * 18} y1="10" x2={20 + i * 18} y2="190" stroke="#1E88E5" strokeWidth="0.5" />
          ))}
        </g>

        {/* ─────────────────────────────────────────── */}
        {/* LARGE GEAR — Top Left (Rotating CW) */}
        {/* ─────────────────────────────────────────── */}
        <motion.g
          animate={{ rotate: 360 }}
          transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
          style={{ originX: '38px', originY: '42px', transformOrigin: '38px 42px' }}
          filter="url(#gear-glow)"
        >
          <GearSVG cx={38} cy={42} r={28} teeth={10} color="#1E88E5" opacity={0.9} strokeW={1.2} />
        </motion.g>

        {/* ─────────────────────────────────────────── */}
        {/* SMALL GEAR — Meshes with large (Rotating CCW) */}
        {/* ─────────────────────────────────────────── */}
        <motion.g
          animate={{ rotate: -360 }}
          transition={{ duration: 7, repeat: Infinity, ease: 'linear' }}
          style={{ originX: '72px', originY: '42px', transformOrigin: '72px 42px' }}
          filter="url(#gear-glow)"
        >
          <GearSVG cx={72} cy={42} r={16} teeth={6} color="#60C3FF" opacity={0.85} strokeW={1} />
        </motion.g>

        {/* ─────────────────────────────────────────── */}
        {/* MEDIUM GEAR — Bottom Left (Rotating CW) */}
        {/* ─────────────────────────────────────────── */}
        <motion.g
          animate={{ rotate: 360 }}
          transition={{ duration: 9, repeat: Infinity, ease: 'linear' }}
          style={{ originX: '42px', originY: '158px', transformOrigin: '42px 158px' }}
          filter="url(#gear-glow)"
        >
          <GearSVG cx={42} cy={158} r={22} teeth={8} color="#1E88E5" opacity={0.85} strokeW={1.1} />
        </motion.g>

        {/* ─────────────────────────────────────────── */}
        {/* TINY GEAR — Bottom Right of cluster (CCW) */}
        {/* ─────────────────────────────────────────── */}
        <motion.g
          animate={{ rotate: -360 }}
          transition={{ duration: 5.5, repeat: Infinity, ease: 'linear' }}
          style={{ originX: '72px', originY: '158px', transformOrigin: '72px 158px' }}
          filter="url(#gear-glow)"
        >
          <GearSVG cx={72} cy={158} r={12} teeth={5} color="#60C3FF" opacity={0.8} strokeW={0.8} />
        </motion.g>

        {/* ─────────────────────────────────────────── */}
        {/* CIRCUIT "E" LETTER — Right Side, Glowing   */}
        {/* ─────────────────────────────────────────── */}
        <g filter="url(#glow-strong)">
          {/* E letter body — base strokes */}
          {/* Vertical spine */}
          <line x1="105" y1="22" x2="105" y2="78" stroke="#1a3f6a" strokeWidth="8" strokeLinecap="round" />
          {/* Top bar */}
          <line x1="105" y1="22" x2="152" y2="22" stroke="#1a3f6a" strokeWidth="8" strokeLinecap="round" />
          {/* Middle bar */}
          <line x1="105" y1="50" x2="142" y2="50" stroke="#1a3f6a" strokeWidth="8" strokeLinecap="round" />
          {/* Bottom bar */}
          <line x1="105" y1="78" x2="152" y2="78" stroke="#1a3f6a" strokeWidth="8" strokeLinecap="round" />

          {/* E letter — glowing neon overlay */}
          <motion.line
            x1="105" y1="22" x2="105" y2="78"
            stroke="#60C3FF" strokeWidth="2.5" strokeLinecap="round"
            animate={{ opacity: [0.6, 1, 0.6], filter: ['drop-shadow(0 0 4px #1E88E5)', 'drop-shadow(0 0 10px #60C3FF)', 'drop-shadow(0 0 4px #1E88E5)'] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.line
            x1="105" y1="22" x2="152" y2="22"
            stroke="#60C3FF" strokeWidth="2.5" strokeLinecap="round"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2.5, delay: 0.3, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.line
            x1="105" y1="50" x2="142" y2="50"
            stroke="#60C3FF" strokeWidth="2.5" strokeLinecap="round"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2.5, delay: 0.6, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.line
            x1="105" y1="78" x2="152" y2="78"
            stroke="#60C3FF" strokeWidth="2.5" strokeLinecap="round"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2.5, delay: 0.9, repeat: Infinity, ease: 'easeInOut' }}
          />
        </g>

        {/* ─────────────────────────────────────────── */}
        {/* CIRCUIT TRACES inside the "E"              */}
        {/* ─────────────────────────────────────────── */}

        {/* Trace: top-bar internal branches */}
        <g filter="url(#glow-blue)" opacity="0.9">
          <line x1="120" y1="22" x2="120" y2="32" stroke="#1E88E5" strokeWidth="1" />
          <line x1="120" y1="32" x2="130" y2="32" stroke="#1E88E5" strokeWidth="1" />
          <line x1="136" y1="22" x2="136" y2="36" stroke="#1E88E5" strokeWidth="1" />
          <line x1="148" y1="22" x2="148" y2="30" stroke="#1E88E5" strokeWidth="1" />
          <line x1="148" y1="30" x2="140" y2="30" stroke="#1E88E5" strokeWidth="1" />

          {/* Middle bar internal branches */}
          <line x1="118" y1="50" x2="118" y2="40" stroke="#1E88E5" strokeWidth="1" />
          <line x1="118" y1="40" x2="126" y2="40" stroke="#1E88E5" strokeWidth="1" />
          <line x1="130" y1="50" x2="130" y2="44" stroke="#1E88E5" strokeWidth="1" />
          <line x1="140" y1="50" x2="140" y2="42" stroke="#1E88E5" strokeWidth="1" />
          <line x1="140" y1="42" x2="132" y2="42" stroke="#1E88E5" strokeWidth="1" />

          {/* Bottom bar internal branches */}
          <line x1="122" y1="78" x2="122" y2="68" stroke="#1E88E5" strokeWidth="1" />
          <line x1="134" y1="78" x2="134" y2="70" stroke="#1E88E5" strokeWidth="1" />
          <line x1="134" y1="70" x2="142" y2="70" stroke="#1E88E5" strokeWidth="1" />
          <line x1="148" y1="78" x2="148" y2="66" stroke="#1E88E5" strokeWidth="1" />

          {/* Spine side branches */}
          <line x1="105" y1="34" x2="96" y2="34" stroke="#1E88E5" strokeWidth="1" />
          <line x1="96" y1="34" x2="96" y2="42" stroke="#1E88E5" strokeWidth="1" />
          <line x1="105" y1="62" x2="96" y2="62" stroke="#1E88E5" strokeWidth="1" />
          <line x1="96" y1="62" x2="96" y2="54" stroke="#1E88E5" strokeWidth="1" />
        </g>

        {/* Circuit nodes (dots at trace junctions) */}
        {circuitNodes.map((n, i) => (
          <motion.circle
            key={i}
            cx={n.cx}
            cy={n.cy}
            r="2.5"
            fill="#60C3FF"
            filter="url(#glow-blue)"
            animate={{ opacity: [0.4, 1, 0.4], r: [2, 3, 2] }}
            transition={{ duration: 1.8, delay: i * 0.12, repeat: Infinity, ease: 'easeInOut' }}
          />
        ))}

        {/* ─────────────────────────────────────────── */}
        {/* Animated trace pulse — racing light         */}
        {/* ─────────────────────────────────────────── */}
        <motion.circle
          cx={0} cy={0} r="2.5"
          fill="#ffffff"
          filter="url(#glow-strong)"
          animate={{
            cx: [105, 152, 152, 105, 105, 142, 142, 105, 105],
            cy: [22,   22,  22,  22,  50,  50,  50,  50,  78],
            opacity: [0, 1, 1, 1, 1, 1, 1, 1, 0],
          }}
          transition={{ duration: 3, repeat: Infinity, ease: 'linear', repeatDelay: 0.5 }}
        />

        {/* ─────────────────────────────────────────── */}
        {/* NEXON text (bottom half) — N, X, O, N      */}
        {/* ─────────────────────────────────────────── */}
        <g filter="url(#glow-blue)">
          {/* N */}
          <line x1="20" y1="110" x2="20" y2="140" stroke="#1E88E5" strokeWidth="3" strokeLinecap="round" />
          <line x1="20" y1="110" x2="36" y2="140" stroke="#1E88E5" strokeWidth="3" strokeLinecap="round" />
          <line x1="36" y1="110" x2="36" y2="140" stroke="#1E88E5" strokeWidth="3" strokeLinecap="round" />
          {/* E (small, aligned) */}
          <line x1="44" y1="110" x2="44" y2="140" stroke="#1E88E5" strokeWidth="3" strokeLinecap="round" />
          <line x1="44" y1="110" x2="58" y2="110" stroke="#1E88E5" strokeWidth="3" strokeLinecap="round" />
          <line x1="44" y1="125" x2="56" y2="125" stroke="#1E88E5" strokeWidth="3" strokeLinecap="round" />
          <line x1="44" y1="140" x2="58" y2="140" stroke="#1E88E5" strokeWidth="3" strokeLinecap="round" />
          {/* X */}
          <line x1="66" y1="110" x2="82" y2="140" stroke="#1E88E5" strokeWidth="3" strokeLinecap="round" />
          <line x1="82" y1="110" x2="66" y2="140" stroke="#1E88E5" strokeWidth="3" strokeLinecap="round" />
          {/* O */}
          <rect x="90" y="110" width="18" height="30" rx="9" fill="none" stroke="#1E88E5" strokeWidth="3" />
          {/* N */}
          <line x1="116" y1="110" x2="116" y2="140" stroke="#1E88E5" strokeWidth="3" strokeLinecap="round" />
          <line x1="116" y1="110" x2="132" y2="140" stroke="#1E88E5" strokeWidth="3" strokeLinecap="round" />
          <line x1="132" y1="110" x2="132" y2="140" stroke="#1E88E5" strokeWidth="3" strokeLinecap="round" />
        </g>

        {/* Separator line */}
        <motion.line
          x1="15" y1="102" x2="185" y2="102"
          stroke="#1E88E5" strokeWidth="0.5" opacity="0.3"
          animate={{ opacity: [0.15, 0.5, 0.15] }}
          transition={{ duration: 3, repeat: Infinity }}
        />

        {/* ENGINEERING subtext */}
        <text
          x="100" y="158"
          textAnchor="middle"
          fontSize="7"
          fontFamily="'JetBrains Mono', monospace"
          letterSpacing="4"
          fill="#60C3FF"
          opacity="0.7"
        >
          ENGINEERING
        </text>

        {/* Outer ring */}
        <circle cx="100" cy="100" r="92" fill="none" stroke="#1E88E5" strokeWidth="0.5" opacity="0.2" />
        <motion.circle
          cx="100" cy="100" r="92"
          fill="none"
          stroke="#60C3FF"
          strokeWidth="1.5"
          strokeDasharray="30 550"
          strokeLinecap="round"
          opacity="0.6"
          animate={{ strokeDashoffset: [0, -580] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'linear' }}
          filter="url(#glow-blue)"
        />
      </svg>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   Helper: renders a gear shape (teeth + inner ring + hub)
   at (cx, cy) with given outer-radius, tooth-count, color
   ───────────────────────────────────────────────────────────── */
function GearSVG({
  cx, cy, r, teeth, color, opacity = 1, strokeW = 1
}: {
  cx: number; cy: number; r: number; teeth: number;
  color: string; opacity?: number; strokeW?: number;
}) {
  const innerR = r * 0.65;
  const toothH = r * 0.28;
  const toothW = (2 * Math.PI * r) / (teeth * 2.8);
  const hubR = r * 0.18;

  // Build the gear teeth path
  let d = '';
  for (let i = 0; i < teeth; i++) {
    const angle0 = (i / teeth) * 2 * Math.PI - Math.PI / 2;
    const angle1 = angle0 + Math.PI / teeth * 0.7;
    const angle2 = angle0 + Math.PI / teeth * 1.3;
    const angle3 = angle0 + Math.PI / teeth * 2;

    const ax = (a: number, rad: number) => cx + Math.cos(a) * rad;
    const ay = (a: number, rad: number) => cy + Math.sin(a) * rad;

    if (i === 0) d += `M ${ax(angle0, innerR)} ${ay(angle0, innerR)} `;
    d += `L ${ax(angle1, innerR)} ${ay(angle1, innerR)} `;
    d += `L ${ax(angle1, r + toothH)} ${ay(angle1, r + toothH)} `;
    d += `L ${ax(angle2, r + toothH)} ${ay(angle2, r + toothH)} `;
    d += `L ${ax(angle2, innerR)} ${ay(angle2, innerR)} `;
    d += `L ${ax(angle3, innerR)} ${ay(angle3, innerR)} `;
  }
  d += 'Z';

  return (
    <g opacity={opacity}>
      {/* Gear body fill */}
      <path
        d={d}
        fill={color}
        fillOpacity="0.12"
        stroke={color}
        strokeWidth={strokeW}
        strokeLinejoin="round"
      />
      {/* Inner circle */}
      <circle cx={cx} cy={cy} r={innerR * 0.7} fill="none" stroke={color} strokeWidth={strokeW * 0.7} opacity="0.5" />
      {/* Hub dot */}
      <circle cx={cx} cy={cy} r={hubR} fill={color} opacity="0.8" />
      {/* Cross detail inside gear */}
      <line x1={cx - innerR * 0.5} y1={cy} x2={cx + innerR * 0.5} y2={cy} stroke={color} strokeWidth={strokeW * 0.5} opacity="0.4" />
      <line x1={cx} y1={cy - innerR * 0.5} x2={cx} y2={cy + innerR * 0.5} stroke={color} strokeWidth={strokeW * 0.5} opacity="0.4" />
    </g>
  );
}
