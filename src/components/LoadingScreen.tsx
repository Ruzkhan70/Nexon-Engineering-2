import { motion, AnimatePresence } from 'motion/react';
import { useEffect, useState, useRef } from 'react';
import logoLarge from '../assets/images/logo-large.png';

/* ─── Boot sequence steps ─────────────────────────────────── */
const bootSequence = [
  { label: 'INITIALIZING_CORE_SYSTEMS',      pct: 14 },
  { label: 'LOADING_ENGINEERING_MATRIX',     pct: 28 },
  { label: 'ESTABLISHING_SECURE_LINK',       pct: 42 },
  { label: 'VERIFYING_ASSETS_INTEGRITY',     pct: 58 },
  { label: 'CALIBRATING_INDUSTRIAL_MODULES', pct: 74 },
  { label: 'BOOTING_INDUSTRIAL_INTERFACE',   pct: 88 },
  { label: 'SYSTEM_DEPLOYMENT_READY',        pct: 100 },
];

/* ─── Floating particle ──────────────────────────────────── */
function Particle({ x, y, delay, size }: { x: string; y: string; delay: number; size: number }) {
  return (
    <motion.div
      className="absolute rounded-full pointer-events-none"
      style={{
        left: x, top: y,
        width: size, height: size,
        background: size > 2.5
          ? 'radial-gradient(circle, rgba(96,195,255,0.9), rgba(30,136,229,0.3))'
          : 'rgba(96,195,255,0.5)',
      }}
      animate={{
        y: [0, -(40 + Math.random() * 60), 0],
        opacity: [0, 0.9, 0],
        scale: [0.5, 1.2, 0.5],
      }}
      transition={{ duration: 6 + Math.random() * 6, repeat: Infinity, delay, ease: 'easeInOut' }}
    />
  );
}

/* ─── Corner bracket SVG ─────────────────────────────────── */
function CornerBracket({ pos }: { pos: 'tl' | 'tr' | 'bl' | 'br' }) {
  const flip = { tl: '', tr: 'scaleX(-1)', bl: 'scaleY(-1)', br: 'scale(-1,-1)' }[pos];
  return (
    <motion.svg
      className="absolute pointer-events-none"
      style={{
        top:    pos.startsWith('t') ? 20 : undefined,
        bottom: pos.startsWith('b') ? 20 : undefined,
        left:   pos.endsWith('l')   ? 20 : undefined,
        right:  pos.endsWith('r')   ? 20 : undefined,
        transform: flip,
        width: 60, height: 60,
      }}
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, delay: 0.2 }}
    >
      <path d="M58 4 L4 4 L4 58" stroke="url(#corner-grad)" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      <circle cx="4" cy="4" r="3" fill="#1E88E5" fillOpacity="0.8">
        <animate attributeName="opacity" values="0.4;1;0.4" dur="2s" repeatCount="indefinite" />
      </circle>
      <defs>
        <linearGradient id="corner-grad" x1="100%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#60C3FF" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#1E88E5" stopOpacity="0.1" />
        </linearGradient>
      </defs>
    </motion.svg>
  );
}

/* ─── Hexagon grid background ────────────────────────────── */
function HexGrid() {
  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity: 0.03 }}>
      <defs>
        <pattern id="hex-pattern" x="0" y="0" width="60" height="52" patternUnits="userSpaceOnUse">
          <polygon
            points="15,0 45,0 60,26 45,52 15,52 0,26"
            fill="none" stroke="#60C3FF" strokeWidth="0.8"
          />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#hex-pattern)" />
    </svg>
  );
}

/* ─── Orbital ring ───────────────────────────────────────── */
function OrbitalRing({
  size, duration, direction, color, opacity, dotColor, dotGlow, strokeDash,
}: {
  size: number; duration: number; direction: 1 | -1;
  color: string; opacity: number; dotColor?: string;
  dotGlow?: string; strokeDash?: string;
}) {
  return (
    <motion.div
      className="absolute rounded-full pointer-events-none"
      style={{
        width: size, height: size,
        top: '50%', left: '50%',
        marginTop: -size / 2, marginLeft: -size / 2,
        border: strokeDash ? 'none' : `1px solid ${color}`,
        opacity,
      }}
      animate={{ rotate: direction === 1 ? 360 : -360 }}
      transition={{ duration, repeat: Infinity, ease: 'linear' }}
    >
      {strokeDash && (
        <svg viewBox={`0 0 ${size} ${size}`} className="w-full h-full absolute inset-0">
          <circle
            cx={size / 2} cy={size / 2} r={size / 2 - 1}
            fill="none" stroke={color} strokeWidth="1.2"
            strokeDasharray={strokeDash} strokeLinecap="round" opacity={opacity}
          />
        </svg>
      )}
      {dotColor && (
        <div
          className="absolute rounded-full"
          style={{
            width: 8, height: 8,
            background: dotColor,
            boxShadow: dotGlow,
            top: -4, left: '50%', marginLeft: -4,
          }}
        />
      )}
    </motion.div>
  );
}

/* ════════════════════════════════════════════════════════════
   MAIN LOADING SCREEN
════════════════════════════════════════════════════════════ */
export default function LoadingScreen({ onComplete }: { onComplete?: () => void }) {
  const [step, setStep]         = useState(0);
  const [progress, setProgress] = useState(0);
  const [sessionId]             = useState(() =>
    Math.random().toString(36).substring(2, 10).toUpperCase()
  );
  const progressRef    = useRef(0);
  const completedRef   = useRef(false);
  const onCompleteRef  = useRef(onComplete);
  onCompleteRef.current = onComplete;

  /* Advance boot sequence */
  useEffect(() => {
    const target = bootSequence[step].pct;
    const isLastStep = step === bootSequence.length - 1;

    const interval = setInterval(() => {
      // 1.0/tick × 22ms × 14pct ≈ 308ms fill + 300ms delay × 7 steps + 400ms hold ≈ 4.5s
      progressRef.current = Math.min(progressRef.current + 1.0, target);
      setProgress(Math.floor(progressRef.current));

      if (progressRef.current >= target) {
        clearInterval(interval);

        if (!isLastStep) {
          // Move to next step after a brief pause
          setTimeout(() => setStep(s => s + 1), 300);
        } else if (!completedRef.current) {
          // Progress is now exactly 100 — hold briefly then signal parent
          completedRef.current = true;
          setTimeout(() => {
            onCompleteRef.current?.();
          }, 400);
        }
      }
    }, 22);
    return () => clearInterval(interval);
  }, [step]);

  /* Stable particle positions */
  const particles = useRef(
    [...Array(40)].map(() => ({
      x:     `${Math.random() * 100}%`,
      y:     `${Math.random() * 100}%`,
      delay: Math.random() * 8,
      size:  Math.random() > 0.8 ? 3 + Math.random() * 3 : 1.5 + Math.random() * 1.5,
    }))
  );

  return (
    <motion.div
      id="loading-screen"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.06, filter: 'blur(8px)' }}
      transition={{ duration: 1.1, ease: 'easeInOut' }}
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center overflow-hidden select-none"
      style={{ background: '#020617' }}
    >
      {/* ── Layered background atmosphere ── */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `
            radial-gradient(ellipse 80% 60% at 50% 45%, rgba(30,136,229,0.13) 0%, transparent 70%),
            radial-gradient(ellipse 40% 30% at 20% 80%, rgba(96,195,255,0.05) 0%, transparent 60%),
            radial-gradient(ellipse 40% 30% at 80% 20%, rgba(30,136,229,0.07) 0%, transparent 60%)
          `,
        }}
      />

      {/* ── Hexagonal grid ── */}
      <HexGrid />

      {/* ── Fine dot grid ── */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(rgba(96,195,255,0.25) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
          maskImage: 'radial-gradient(ellipse 80% 80% at center, black 20%, transparent 80%)',
          opacity: 0.15,
        }}
      />

      {/* ── Ambient floating particles ── */}
      {particles.current.map((p, i) => (
        <Particle key={i} x={p.x} y={p.y} delay={p.delay} size={p.size} />
      ))}

      {/* ── Slow horizontal scan line ── */}
      <motion.div
        className="absolute left-0 right-0 h-px pointer-events-none"
        style={{
          background: 'linear-gradient(90deg, transparent 5%, rgba(30,136,229,0.25) 50%, transparent 95%)',
        }}
        animate={{ top: ['-1%', '101%'] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
      />

      {/* ── Frame border ── */}
      <motion.div
        className="absolute pointer-events-none rounded-[28px]"
        style={{
          inset: 16,
          border: '1px solid rgba(30,136,229,0.08)',
          boxShadow: 'inset 0 0 60px rgba(30,136,229,0.03)',
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.5 }}
      />

      {/* ── Corner brackets ── */}
      <CornerBracket pos="tl" />
      <CornerBracket pos="tr" />
      <CornerBracket pos="bl" />
      <CornerBracket pos="br" />

      {/* ── Left side data bars ── */}
      <div className="absolute left-8 top-1/2 -translate-y-1/2 hidden md:flex flex-col gap-2.5 items-center">
        {[...Array(11)].map((_, i) => {
          const lit = i < Math.ceil(progress / 9.1);
          const h = i % 3 === 0 ? 24 : i % 3 === 1 ? 14 : 8;
          return (
            <motion.div
              key={i}
              style={{
                width: 3, height: h,
                borderRadius: 2,
                background: lit ? '#1E88E5' : 'rgba(255,255,255,0.04)',
                boxShadow: lit ? '0 0 10px rgba(30,136,229,0.7)' : 'none',
                opacity: lit ? 1 : 0.3,
              }}
              animate={lit ? { opacity: [0.6, 1, 0.6] } : {}}
              transition={{ duration: 1.4, delay: i * 0.07, repeat: Infinity }}
            />
          );
        })}
      </div>

      {/* ── Right side data bars (mirrored) ── */}
      <div className="absolute right-8 top-1/2 -translate-y-1/2 hidden md:flex flex-col gap-2.5 items-center">
        {[...Array(11)].map((_, i) => {
          const idx = 10 - i;
          const lit = idx < Math.ceil(progress / 9.1);
          const h = idx % 3 === 0 ? 24 : idx % 3 === 1 ? 14 : 8;
          return (
            <motion.div
              key={i}
              style={{
                width: 3, height: h,
                borderRadius: 2,
                background: lit ? '#60C3FF' : 'rgba(255,255,255,0.04)',
                boxShadow: lit ? '0 0 10px rgba(96,195,255,0.6)' : 'none',
                opacity: lit ? 1 : 0.3,
              }}
              animate={lit ? { opacity: [0.5, 1, 0.5] } : {}}
              transition={{ duration: 1.6, delay: i * 0.05, repeat: Infinity }}
            />
          );
        })}
      </div>

      {/* ══════════════════════════════════════════
          MAIN CONTENT
      ══════════════════════════════════════════ */}
      <div className="relative z-10 flex flex-col items-center" style={{ gap: 0 }}>

        {/* ── Logo + Orbital system ── */}
        <div className="relative flex items-center justify-center" style={{ marginBottom: 72 }}>

          {/* Outermost slow dashed ring */}
          <OrbitalRing
            size={380} duration={50} direction={1}
            color="rgba(30,136,229,0.07)" opacity={1}
            strokeDash="8 24"
          />

          {/* Data-tick ring */}
          <motion.div
            className="absolute pointer-events-none"
            style={{ width: 300, height: 300, top: '50%', left: '50%', marginTop: -150, marginLeft: -150 }}
            animate={{ rotate: -360 }}
            transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
          >
            <svg viewBox="0 0 300 300" className="w-full h-full">
              {[...Array(48)].map((_, i) => {
                const angle = (i / 48) * 360;
                const rad   = (angle * Math.PI) / 180;
                const len   = i % 8 === 0 ? 14 : i % 4 === 0 ? 8 : 4;
                const r1    = 148;
                const r2    = r1 - len;
                return (
                  <line
                    key={i}
                    x1={150 + Math.cos(rad) * r1} y1={150 + Math.sin(rad) * r1}
                    x2={150 + Math.cos(rad) * r2} y2={150 + Math.sin(rad) * r2}
                    stroke={i % 8 === 0 ? '#60C3FF' : '#1E88E5'}
                    strokeWidth={i % 8 === 0 ? 1.5 : 0.7}
                    opacity={i % 8 === 0 ? 0.5 : 0.15}
                  />
                );
              })}
              <circle cx="150" cy="150" r="148" fill="none" stroke="#1E88E5" strokeWidth="0.4" opacity="0.12" />
            </svg>
          </motion.div>

          {/* Mid orbit with bright dot */}
          <OrbitalRing
            size={290} duration={18} direction={1}
            color="rgba(96,195,255,0.1)" opacity={1}
            dotColor="#60C3FF" dotGlow="0 0 16px 6px rgba(96,195,255,0.8)"
          />

          {/* Inner orbit with blue dot */}
          <OrbitalRing
            size={248} duration={11} direction={-1}
            color="rgba(30,136,229,0.12)" opacity={1}
            dotColor="#1E88E5" dotGlow="0 0 12px 4px rgba(30,136,229,0.9)"
          />

          {/* ── Pulsing multi-layer glow behind logo ── */}
          {/* Outermost soft bloom */}
          <motion.div
            className="absolute rounded-full pointer-events-none"
            style={{
              width: 280, height: 280,
              top: '50%', left: '50%',
              marginTop: -140, marginLeft: -140,
            }}
            animate={{ opacity: [0.15, 0.45, 0.15], scale: [0.85, 1.2, 0.85] }}
            transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
          >
            <div
              className="w-full h-full rounded-full"
              style={{ background: 'radial-gradient(circle, rgba(30,136,229,0.55) 0%, rgba(30,136,229,0.05) 60%, transparent 80%)' }}
            />
          </motion.div>

          {/* Mid-layer flicker */}
          <motion.div
            className="absolute rounded-full pointer-events-none"
            style={{
              width: 220, height: 220,
              top: '50%', left: '50%',
              marginTop: -110, marginLeft: -110,
            }}
            animate={{ opacity: [0.2, 0.6, 0.2], scale: [0.9, 1.1, 0.9] }}
            transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut', delay: 0.4 }}
          >
            <div
              className="w-full h-full rounded-full"
              style={{ background: 'radial-gradient(circle, rgba(96,195,255,0.4) 0%, transparent 70%)' }}
            />
          </motion.div>

          {/* ── THE ACTUAL LOGO IMAGE ── */}
          <motion.div
            id="loading-logo-wrapper"
            className="relative z-20"
            initial={{ scale: 0.5, opacity: 0, filter: 'blur(20px)' }}
            animate={{ scale: 1, opacity: 1, filter: 'blur(0px)' }}
            transition={{ duration: 1.0, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Glowing ring behind the logo */}
            <motion.div
              className="absolute inset-0 rounded-full pointer-events-none"
              style={{
                boxShadow: '0 0 0 2px rgba(30,136,229,0.25), 0 0 30px 10px rgba(30,136,229,0.2), 0 0 60px 20px rgba(30,136,229,0.08)',
              }}
              animate={{ boxShadow: [
                '0 0 0 2px rgba(30,136,229,0.2),  0 0 30px 10px rgba(30,136,229,0.15), 0 0 60px 20px rgba(30,136,229,0.05)',
                '0 0 0 3px rgba(96,195,255,0.4),  0 0 50px 20px rgba(96,195,255,0.25), 0 0 90px 40px rgba(30,136,229,0.12)',
                '0 0 0 2px rgba(30,136,229,0.2),  0 0 30px 10px rgba(30,136,229,0.15), 0 0 60px 20px rgba(30,136,229,0.05)',
              ]}}
              transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
            />

            {/* White circular glow plate */}
            <div
              className="absolute inset-0 rounded-full pointer-events-none"
              style={{
                background: 'radial-gradient(circle at 40% 35%, rgba(255,255,255,0.08) 0%, transparent 65%)',
              }}
            />

            <motion.img
              src={logoLarge}
              alt="Nexon Engineering Logo"
              draggable={false}
              style={{
                width: 220,
                height: 220,
                borderRadius: '50%',
                display: 'block',
                userSelect: 'none',
                position: 'relative',
                zIndex: 2,
              }}
              animate={{ filter: [
                'drop-shadow(0 0 8px rgba(30,136,229,0.5)) brightness(1)',
                'drop-shadow(0 0 22px rgba(96,195,255,0.8)) brightness(1.08)',
                'drop-shadow(0 0 8px rgba(30,136,229,0.5)) brightness(1)',
              ]}}
              transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
            />

            {/* Arc accent - top left */}
            <svg
              className="absolute pointer-events-none"
              style={{ inset: -14, width: 'calc(100% + 28px)', height: 'calc(100% + 28px)' }}
              viewBox="0 0 248 248"
            >
              <motion.circle
                cx="124" cy="124" r="120"
                fill="none" stroke="#60C3FF" strokeWidth="1.2"
                strokeDasharray="50 703" strokeLinecap="round"
                opacity={0.7}
                animate={{ strokeDashoffset: [0, -753] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
              />
              <motion.circle
                cx="124" cy="124" r="120"
                fill="none" stroke="#1E88E5" strokeWidth="0.6"
                strokeDasharray="20 733" strokeLinecap="round"
                opacity={0.4}
                animate={{ strokeDashoffset: [0, 753] }}
                transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
              />
            </svg>
          </motion.div>
        </div>

        {/* ── Company name + tagline ── */}
        <motion.div
          className="text-center"
          style={{ marginBottom: 32 }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
        >
          <motion.div
            style={{
              fontSize: 22,
              fontFamily: "'JetBrains Mono', 'Courier New', monospace",
              fontWeight: 700,
              letterSpacing: '0.45em',
              color: '#F8F9FA',
              textTransform: 'uppercase',
              lineHeight: 1,
              marginBottom: 8,
            }}
            animate={{ opacity: [0.85, 1, 0.85] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          >
            NEXON
          </motion.div>
          <div
            style={{
              fontSize: 9,
              fontFamily: "'JetBrains Mono', monospace",
              fontWeight: 600,
              letterSpacing: '0.55em',
              color: '#1E88E5',
              textTransform: 'uppercase',
            }}
          >
            ENGINEERING
          </div>
        </motion.div>

        {/* ── Boot status label ── */}
        <div style={{ height: 22, marginBottom: 20 }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, y: 10, filter: 'blur(6px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -10, filter: 'blur(6px)' }}
              transition={{ duration: 0.3 }}
              style={{
                fontSize: 8.5,
                fontFamily: "'JetBrains Mono', monospace",
                fontWeight: 700,
                letterSpacing: '0.38em',
                color: '#60C3FF',
                textShadow: '0 0 16px rgba(96,195,255,0.7)',
                textAlign: 'center',
              }}
            >
              {`> ${bootSequence[step].label}`}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* ── Progress track ── */}
        <div style={{ width: 340, position: 'relative', marginBottom: 14 }}>

          {/* Glow track bg */}
          <div
            style={{
              width: '100%', height: 3,
              borderRadius: 8,
              background: 'rgba(255,255,255,0.04)',
              boxShadow: 'inset 0 0 8px rgba(0,0,0,0.5)',
              position: 'relative',
              overflow: 'visible',
            }}
          >
            {/* Fill */}
            <motion.div
              style={{
                height: '100%',
                width: `${progress}%`,
                borderRadius: 8,
                background: 'linear-gradient(90deg, #0D47A1, #1E88E5 40%, #60C3FF)',
                boxShadow: '0 0 12px rgba(96,195,255,0.5)',
                position: 'relative',
              }}
              transition={{ duration: 0.08 }}
            />
          </div>

          {/* Glowing leading dot */}
          <motion.div
            style={{
              position: 'absolute',
              top: '50%',
              left: `${progress}%`,
              transform: 'translate(-50%, -50%)',
              width: 10, height: 10,
              borderRadius: '50%',
              background: '#ffffff',
              boxShadow: '0 0 0 3px rgba(96,195,255,0.3), 0 0 14px 5px rgba(96,195,255,0.8)',
            }}
          />

          {/* Step ticks */}
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3 }}>
            {bootSequence.map((s, i) => (
              <div
                key={i}
                style={{
                  position: 'absolute',
                  left: `${s.pct}%`,
                  top: -3, width: 1, height: 9,
                  background: progress >= s.pct ? 'rgba(96,195,255,0.9)' : 'rgba(255,255,255,0.08)',
                  boxShadow: progress >= s.pct ? '0 0 4px rgba(96,195,255,0.8)' : 'none',
                  transition: 'background 0.3s, box-shadow 0.3s',
                }}
              />
            ))}
          </div>
        </div>

        {/* ── Progress labels ── */}
        <div
          style={{
            width: 340,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: 8,
            fontFamily: "'JetBrains Mono', monospace",
            fontWeight: 800,
            color: 'rgba(255,255,255,0.22)',
            letterSpacing: '0.22em',
          }}
        >
          <span>SYSTEM DEPLOYMENT</span>
          <motion.span
            style={{ color: '#60C3FF', textShadow: '0 0 8px rgba(96,195,255,0.6)' }}
            animate={{ opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 0.9, repeat: Infinity }}
          >
            {progress}%
          </motion.span>
        </div>
      </div>

      {/* ══════════════════════════════════════════
          BOTTOM HUD
      ══════════════════════════════════════════ */}
      <motion.div
        className="absolute bottom-7 left-10 right-10 flex justify-between items-end"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.3 }}
        transition={{ duration: 1.2, delay: 0.4 }}
      >
        <div
          style={{
            fontSize: 7.5,
            fontFamily: "'JetBrains Mono', monospace",
            fontWeight: 700,
            color: 'rgba(255,255,255,0.45)',
            lineHeight: 1.8,
          }}
        >
          <div>© 2026 NEXON ENGINEERING</div>
          <div>VER: 4.1.0_LATEST_STABLE</div>
          <div style={{ color: '#60C3FF', marginTop: 2 }}>SESSION: {sessionId}</div>
        </div>

        {/* Status indicator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ display: 'flex', gap: 4 }}>
            {[...Array(4)].map((_, i) => (
              <motion.div
                key={i}
                style={{
                  width: 5, height: 5, borderRadius: '50%',
                  background: '#1E88E5',
                }}
                animate={{ opacity: [1, 0.2, 1], scale: [1, 0.65, 1] }}
                transition={{ duration: 0.85, delay: i * 0.2, repeat: Infinity }}
              />
            ))}
          </div>
          <span
            style={{
              fontSize: 7.5,
              fontFamily: "'JetBrains Mono', monospace",
              fontWeight: 700,
              color: '#1E88E5',
              letterSpacing: '0.25em',
            }}
          >
            ONLINE
          </span>
        </div>
      </motion.div>

      {/* TOP — session marker */}
      <motion.div
        className="absolute top-9 right-14 hidden md:block"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.3 }}
        transition={{ duration: 1.2, delay: 0.6 }}
        style={{
          fontSize: 7.5,
          fontFamily: "'JetBrains Mono', monospace",
          fontWeight: 700,
          color: 'rgba(30,136,229,0.8)',
          letterSpacing: '0.28em',
        }}
      >
        NXN‑ENG &nbsp;//&nbsp; {new Date().getFullYear()}
      </motion.div>

      {/* TOP LEFT — version tag */}
      <motion.div
        className="absolute top-9 left-14 hidden md:block"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.25 }}
        transition={{ duration: 1.2, delay: 0.6 }}
        style={{
          fontSize: 7.5,
          fontFamily: "'JetBrains Mono', monospace",
          fontWeight: 700,
          color: 'rgba(96,195,255,0.8)',
          letterSpacing: '0.28em',
        }}
      >
        INDUSTRIAL AUTOMATION
      </motion.div>
    </motion.div>
  );
}
