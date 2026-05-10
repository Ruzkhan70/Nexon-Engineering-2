import { motion, AnimatePresence } from 'motion/react';
import { useEffect, useState } from 'react';
import NexonLogoLoader from './NexonLogoLoader';

const bootMessages = [
  "INITIALIZING_CORE_SYSTEMS",
  "LOADING_ENGINEERING_MATRIX",
  "ESTABLISHING_SECURE_LINK",
  "VERIFYING_ASSETS_INTEGRITY",
  "BOOTING_INDUSTRIAL_INTERFACE",
  "SYSTEM_DEPLOYMENT_READY"
];

export default function LoadingScreen() {
  const [currentMsg, setCurrentMsg] = useState(0);
  const [progress, setProgress] = useState(0);
  const [sessionId] = useState(() => Math.random().toString(36).substring(2, 10).toUpperCase());

  useEffect(() => {
    const msgInterval = setInterval(() => {
      setCurrentMsg(prev => (prev + 1) % bootMessages.length);
    }, 800);

    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) return 0;
        return prev + 1;
      });
    }, 30);

    return () => {
      clearInterval(msgInterval);
      clearInterval(progressInterval);
    };
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8, ease: "easeInOut" }}
      className="fixed inset-0 z-[9999] bg-[#020617] flex flex-col items-center justify-center overflow-hidden"
    >
      {/* Enhanced Background Atmosphere */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(30,136,229,0.1),transparent_70%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:60px_60px] pointer-events-none [mask-image:radial-gradient(ellipse_at_center,black,transparent_90%)]" />
      
      {/* Background Particles/Dust */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ y: "100%", x: Math.random() * 100 + "%" }}
            animate={{ y: "-10%" }}
            transition={{ 
              duration: Math.random() * 10 + 10, 
              repeat: Infinity, 
              ease: "linear",
              delay: Math.random() * 20
            }}
            className="absolute w-[1px] h-10 bg-gradient-to-t from-transparent via-[#1E88E5] to-transparent"
          />
        ))}
      </div>

      {/* Scanning Line */}
      <motion.div 
        animate={{ y: ["-100%", "200%"] }}
        transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
        className="absolute inset-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#1E88E5]/10 to-transparent z-0 pointer-events-none"
      />

      {/* Frame Elements */}
      <div className="absolute inset-10 border border-white/5 pointer-events-none rounded-[40px]">
        {/* Corner Brackets */}
        <div className="absolute top-0 left-0 w-12 h-12 border-t-2 border-l-2 border-[#1E88E5]/20 rounded-tl-3xl" />
        <div className="absolute top-0 right-0 w-12 h-12 border-t-2 border-r-2 border-[#1E88E5]/20 rounded-tr-3xl" />
        <div className="absolute bottom-0 left-0 w-12 h-12 border-b-2 border-l-2 border-[#1E88E5]/20 rounded-bl-3xl" />
        <div className="absolute bottom-0 right-0 w-12 h-12 border-b-2 border-r-2 border-[#1E88E5]/20 rounded-br-3xl" />
        
        {/* Right Status */}
        <div className="absolute top-1/2 right-8 -translate-y-1/2 flex flex-col gap-4 items-center opacity-20 hidden md:flex">
          {[...Array(8)].map((_, i) => (
            <div key={i} className={`w-1 h-8 rounded-full ${i < (progress / 12.5) ? 'bg-[#1E88E5]' : 'bg-white/5'}`} />
          ))}
        </div>
      </div>

      <div className="relative z-10 flex flex-col items-center">
        {/* Logo Section */}
        <div className="relative mb-24 scale-[1.8] md:scale-[2.2]">
          <NexonLogoLoader size={160} />
          
          {/* Compass Rings */}
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
            className="absolute -inset-16 border border-dashed border-[#1E88E5]/10 rounded-full"
          />
          <motion.div 
            animate={{ rotate: -360 }}
            transition={{ duration: 35, repeat: Infinity, ease: "linear" }}
            className="absolute -inset-24 border border-dotted border-[#1E88E5]/5 rounded-full"
          />
        </div>

        {/* Text & Progress Section */}
        <div className="text-center w-full max-w-sm px-6">
          <div className="flex flex-col items-center">
            <div className="h-8 mb-4">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentMsg}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="text-[#1E88E5] text-[10px] font-black tracking-[0.4em] uppercase"
                >
                  {bootMessages[currentMsg]}
                </motion.div>
              </AnimatePresence>
            </div>
            
            <div className="w-full h-[2px] bg-white/5 rounded-full overflow-hidden relative mb-4">
              <motion.div 
                className="absolute top-0 left-0 h-full bg-[#1E88E5] shadow-[0_0_15px_rgba(30,136,229,0.5)]"
                style={{ width: `${progress}%` }}
              />
            </div>

            <div className="flex justify-between w-full opacity-30">
               <span className="text-[10px] font-black text-white uppercase tracking-widest italic">System Deployment</span>
               <span className="text-[10px] font-black text-white italic">{progress}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Footer Information */}
      <div className="absolute bottom-12 left-12 right-12 flex justify-between items-end opacity-20">
         <div className="text-[8px] font-black text-white/50 space-y-1">
            <div>&copy; 2026 NEXON ENGINEERING</div>
            <div>VER: 4.1.0_LATEST_STABLE</div>
         </div>
         <div className="flex gap-1">
            {[...Array(4)].map((_, i) => (
              <motion.div 
                key={i}
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ duration: 1, delay: i * 0.2, repeat: Infinity }}
                className="w-1.5 h-1.5 bg-[#1E88E5] rounded-full"
              />
            ))}
         </div>
      </div>
    </motion.div>
  );
}
