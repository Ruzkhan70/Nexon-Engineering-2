import { motion } from 'motion/react';
import logoAsset from '../assets/images/regenerated_image_1778416445055.png';

interface NexonLogoLoaderProps {
  size?: number;
  className?: string;
}

/**
 * A professional loading spinner using the NEXON logo symbol.
 * Animates a clockwise rotation of the isolated logo symbol.
 */
export default function NexonLogoLoader({ size = 100, className = "" }: NexonLogoLoaderProps) {
  return (
    <div 
      id="nexon-logo-loader-container"
      className={`relative flex items-center justify-center overflow-visible ${className}`}
      style={{ width: size, height: size }}
    >
      {/* Intense Pulsing Background Glow */}
      <motion.div
        animate={{ 
          scale: [0.8, 1.2, 0.8],
          opacity: [0.2, 0.4, 0.2],
        }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="absolute inset-[-20%] bg-[#1E88E5]/30 rounded-full blur-[40px]"
      />

      {/* Main Energy Ring (Matches the video vibe) */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        className="absolute inset-[-10%] z-10"
      >
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_0_20px_rgba(30,136,229,0.6)]">
          <circle 
            cx="50" cy="50" r="48" 
            stroke="#1E88E5" 
            strokeWidth="2" 
            fill="none" 
            strokeDasharray="150 150"
            strokeLinecap="round"
          />
          <motion.circle 
            cx="50" cy="50" r="48" 
            stroke="white" 
            strokeWidth="3" 
            fill="none" 
            strokeDasharray="10 290"
            strokeLinecap="round"
            animate={{ strokeDashoffset: [0, -300] }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          />
        </svg>
      </motion.div>

      {/* Inner Technical Ring */}
      <motion.div
        animate={{ rotate: -360 }}
        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
        className="absolute inset-[5%] z-0"
      >
        <svg viewBox="0 0 100 100" className="w-full h-full opacity-30">
          <circle 
            cx="50" cy="50" r="45" 
            stroke="white" 
            strokeWidth="0.5" 
            fill="none" 
            strokeDasharray="2 4"
          />
        </svg>
      </motion.div>

      {/* Central Logo Asset */}
      <div className="absolute inset-0 z-20 flex items-center justify-center p-2">
        <motion.div
          animate={{ 
            scale: [1, 1.03, 1],
            filter: ["brightness(1) contrast(1)", "brightness(1.2) contrast(1.1)", "brightness(1) contrast(1)"]
          }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="relative w-full h-full flex items-center justify-center"
        >
          <img 
            src={logoAsset} 
            alt="NEXON Core" 
            className="w-full h-full object-contain drop-shadow-[0_0_25px_rgba(30,136,229,0.4)]"
          />
        </motion.div>
      </div>

      {/* Energy Flashes (Simulating the light streaks in the video) */}
      {[...Array(3)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ 
            opacity: [0, 0.8, 0],
            scale: [0.5, 1.5, 2],
            rotate: i * 120
          }}
          transition={{ 
            duration: 3, 
            delay: i * 1, 
            repeat: Infinity,
            ease: "easeOut" 
          }}
          className="absolute inset-0 bg-gradient-to-t from-transparent via-white/10 to-transparent w-[2px] h-full left-1/2 -translate-x-1/2 blur-[2px]"
        />
      ))}
    </div>
  );
}
