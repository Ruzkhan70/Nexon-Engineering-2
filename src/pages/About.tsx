import { useEffect, useState, useRef } from 'react';
import { motion, useInView, useAnimation } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { Target, Eye, ShieldCheck, Award, FlaskConical, ArrowRight, Zap, History, Settings, Briefcase, Globe } from 'lucide-react';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { doc, onSnapshot, collection, query, where } from 'firebase/firestore';
import teamImage from '../assets/images/about-preview.png';

function Counter({ value, duration = 2, suffix = "" }: { value: number, duration?: number, suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (isInView) {
      let start = 0;
      const end = value;
      const range = end - start;
      const increment = end > start ? 1 : -1;
      const totalSteps = 60 * duration;
      const stepTime = (duration * 1000) / totalSteps;
      const stepValue = range / totalSteps;

      let current = start;
      const timer = setInterval(() => {
        current += stepValue;
        if ((increment > 0 && current >= end) || (increment < 0 && current <= end)) {
          setCount(end);
          clearInterval(timer);
        } else {
          setCount(Math.floor(current));
        }
      }, stepTime);

      return () => clearInterval(timer);
    }
  }, [isInView, value, duration]);

  return <span ref={ref}>{count}{suffix}</span>;
}

export default function About() {
  const [siteSettings, setSiteSettings] = useState<any>({
    aboutTitle: 'Technical Dominance.',
    aboutPageText: 'Established with a vision to revolutionize industrial engineering in Sri Lanka, Nexon Engineering Services (Pvt) Ltd has grown into a leading provider of maintenance, repair, and automation solutions.',
    aboutMission: '',
    aboutVision: '',
    statYears: 8,
    statProjects: 100,
    statRepairs: 500,
    aboutValuesTitle: 'Technical Standards',
    aboutValuesSubtitle: 'The fundamental principles that govern our technical execution and safety protocols.',
    aboutTechnicalTitle: 'Operational NEXON',
    aboutTechnicalSubtitle: 'Our expertise is partitioned into four primary technical domains, each monitored and executed by specialized Matrix engineers.',
  });
  const navigate = useNavigate();

  useEffect(() => {
    const unsubSettings = onSnapshot(doc(db, 'settings', 'global'), (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        setSiteSettings({
          ...data,
          aboutTitle: data.aboutTitle || 'Technical Dominance.',
          aboutPageText: data.aboutText || 'Established with a vision to revolutionize industrial engineering in Sri Lanka, Nexon Engineering Services (Pvt) Ltd has grown into a leading provider of maintenance, repair, and automation solutions.',
          aboutMission: data.aboutMission || 'To deliver reliable, innovative engineering solutions that empower industries to operate efficiently and safely through superior craftsmanship, technical expertise, and an unwavering commitment to customer success.',
          aboutVision: data.aboutVision || 'To be the most trusted and innovative engineering services partner in South Asia, setting global standards for quality, reliability, and technical excellence.',
          statYears: Number(data.statYears) || 8,
          statProjects: Number(data.statProjects) || 100,
          statRepairs: Number(data.statRepairs) || 500,
          aboutValuesTitle: data.aboutValuesTitle || 'Technical Standards',
          aboutValuesSubtitle: data.aboutValuesSubtitle || 'The fundamental principles that govern our technical execution and safety protocols.',
          aboutTechnicalTitle: data.aboutTechnicalTitle || 'Operational NEXON',
          aboutTechnicalSubtitle: data.aboutTechnicalSubtitle || 'Our expertise is partitioned into four primary technical domains, each monitored and executed by specialized Matrix engineers.',
        });
      }
    }, (error) => handleFirestoreError(error, OperationType.GET, 'settings/global'));

    return () => {
      unsubSettings();
    };
  }, []);

  const coreValues = [
    { 
      title: siteSettings.aboutValue1Title || 'Reliability Index', 
      icon: ShieldCheck, 
      desc: siteSettings.aboutValue1Desc || '99.9% operational uptime commitment across all deployed mechanical and electrical infrastructures.', 
      code: 'VAL-01' 
    },
    { 
      title: siteSettings.aboutValue2Title || 'Precision Logic', 
      icon: Target, 
      desc: siteSettings.aboutValue2Desc || 'Micron-level accuracy in component fabrication and strategic system tuning for high-output environments.', 
      code: 'VAL-02' 
    },
    { 
      title: siteSettings.aboutValue3Title || 'AI Integration', 
      icon: FlaskConical, 
      desc: siteSettings.aboutValue3Desc || 'Leveraging neural diagnostics and automated failure analysis to predict system fatigue before it occurs.', 
      code: 'VAL-03' 
    },
    { 
      title: siteSettings.aboutValue4Title || 'Legacy Integrity', 
      icon: Award, 
      desc: siteSettings.aboutValue4Desc || 'Preserving engineering heritage while implementing future-proof modernization across heavy industry.', 
      code: 'VAL-04' 
    },
  ];

  return (
    <div className="bg-[#020617] overflow-hidden min-h-screen">
      {/* Background Schema */}
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_50%_-20%,rgba(0,180,216,0.1),transparent_50%)] pointer-events-none" />
      <div className="fixed inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px] pointer-events-none [mask-image:radial-gradient(ellipse_at_center,black,transparent:80%)]" />

      {/* Hero Section: Technical Heritage */}
      <section className="relative pt-48 pb-40">
        <div className="max-w-7xl mx-auto px-8 relative z-10">
          <div className="relative">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-4 mb-4"
            >
              <div className="h-[1px] w-12 bg-[#1E88E5]" />
              <span className="text-[#1E88E5] font-black tracking-[0.4em] uppercase text-[10px]">Division: Corporate Identity</span>
            </motion.div>
            
            <div className="flex flex-col space-y-2">
              <motion.h1 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-4xl sm:text-5xl md:text-8xl lg:text-9xl font-black text-white tracking-tight sm:tracking-widest leading-none uppercase italic pr-4 md:pr-8"
              >
                NEXON
              </motion.h1>

              <motion.h1 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="text-4xl sm:text-5xl md:text-8xl lg:text-9xl font-black text-[#1E88E5] tracking-tight sm:tracking-widest leading-none uppercase italic italic-outline-white pr-4 md:pr-8"
              >
                ENGINEERING
              </motion.h1>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="space-y-8 max-w-4xl"
              >
                <p className="text-white/60 text-xl md:text-3xl font-medium leading-relaxed italic">
                  {siteSettings.aboutPageText}
                </p>
                <div className="flex gap-4">
                   <div className="h-2 w-24 bg-[#1E88E5]" />
                   <div className="h-2 w-10 bg-white/10" />
                   <div className="h-2 w-5 bg-white/10" />
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Corporate Doctrines (Mission/Vision) */}
      <section className="py-20 relative">
        <div className="max-w-7xl mx-auto px-8">
          <div className="grid md:grid-cols-2 gap-12">
            <motion.div 
              whileInView={{ opacity: 1, y: 0 }}
              initial={{ opacity: 0, y: 50 }}
              viewport={{ once: true }}
              className="bg-[#0B1426] p-8 md:p-16 rounded-[40px] md:rounded-[60px] border border-white/5 relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 p-12 opacity-5 scale-150 -rotate-12 group-hover:rotate-0 transition-transform duration-1000">
                <Eye size={200} />
              </div>
              <div className="relative z-10">
                <div className="w-16 h-16 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center mb-10 text-[#1E88E5]">
                  <Eye size={32} />
                </div>
                <div className="inline-block px-3 py-1 bg-[#1E88E5]/10 border border-[#1E88E5]/20 text-[#1E88E5] text-[8px] font-black uppercase tracking-widest mb-4">Strategic Horizon</div>
                <h2 className="text-4xl md:text-5xl font-black mb-8 tracking-tighter text-white uppercase italic">Our Vision</h2>
                <p className="text-lg md:text-xl text-white/40 leading-relaxed font-medium">
                  {siteSettings.aboutVision}
                </p>
              </div>
            </motion.div>

            <motion.div 
              whileInView={{ opacity: 1, y: 0 }}
              initial={{ opacity: 0, y: 50 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="bg-[#1E88E5] p-8 md:p-16 rounded-[40px] md:rounded-[60px] relative overflow-hidden group shadow-[0_50px_100px_-20px_rgba(30,136,229,0.3)]"
            >
              <div className="absolute top-0 right-0 p-12 opacity-20 scale-150 rotate-12 group-hover:rotate-0 transition-transform duration-1000">
                <Target size={200} />
              </div>
              <div className="relative z-10">
                <div className="w-16 h-16 bg-white/20 border border-white/30 rounded-2xl flex items-center justify-center mb-10 text-white">
                  <Target size={32} />
                </div>
                <div className="inline-block px-3 py-1 bg-white/10 border border-white/20 text-white text-[8px] font-black uppercase tracking-widest mb-4">Operational Protocol</div>
                <h2 className="text-4xl md:text-5xl font-black mb-8 tracking-tighter text-white uppercase italic">Our Mission</h2>
                <p className="text-lg md:text-xl text-white/90 leading-relaxed font-medium">
                  {siteSettings.aboutMission}
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Engineering Values Matrix */}
      <section className="py-40">
        <div className="max-w-7xl mx-auto px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-24 gap-8">
            <div className="max-w-2xl">
              <span className="text-[#1E88E5] font-black tracking-[0.4em] uppercase text-[10px] mb-4 block">Quality Control Standards</span>
              <h2 className="text-5xl md:text-7xl font-black text-white tracking-widest leading-none uppercase italic">
                {siteSettings.aboutValuesTitle.split(' ').map((word, i) => (
                  i === siteSettings.aboutValuesTitle.split(' ').length - 1 
                    ? <span key={i} className="text-[#1E88E5] block italic italic-outline-white">{word}</span>
                    : <span key={i}>{word} </span>
                ))}
              </h2>
            </div>
            <p className="text-white/30 text-xl font-medium max-w-sm border-l-2 border-[#1E88E5] pl-8">
              {siteSettings.aboutValuesSubtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {coreValues.map((value, idx) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="bg-[#0B1426] border border-white/5 p-8 md:p-12 rounded-[40px] md:rounded-[50px] relative group hover:border-[#1E88E5]/50 transition-all duration-500 overflow-hidden"
              >
                {/* Blueprint markings */}
                <div className="absolute top-0 left-0 w-8 h-8 border-t border-l border-white/10 group-hover:border-[#1E88E5]/30" />
                <div className="absolute top-0 right-0 w-8 h-8 border-t border-r border-white/10 group-hover:border-[#1E88E5]/30" />
                <div className="absolute bottom-0 left-0 w-8 h-8 border-b border-l border-white/10 group-hover:border-[#1E88E5]/30" />
                <div className="absolute bottom-0 right-0 w-8 h-8 border-b border-r border-white/10 group-hover:border-[#1E88E5]/30" />
                
                <div className="absolute top-6 right-10 text-[10px] font-black text-white/10 group-hover:text-[#1E88E5] transition-colors">{value.code}</div>
                <div className="w-16 h-16 bg-white/5 rounded-[24px] flex items-center justify-center text-[#1E88E5] mb-10 border border-white/5 group-hover:bg-[#1E88E5] group-hover:text-white transition-all shadow-inner">
                  <value.icon size={32} />
                </div>
                <h3 className="text-2xl font-black text-white mb-6 uppercase tracking-tighter italic">{value.title}</h3>
                <p className="text-white/40 text-lg leading-relaxed font-medium group-hover:text-white/60 transition-colors">{value.desc}</p>
                
                <div className="mt-10 flex gap-1">
                   {[1,2,3,4,5,6,7,8].map(i => (
                     <div key={i} className={`h-1 flex-grow rounded-full ${i <= 3 ? 'bg-[#1E88E5]' : 'bg-white/5'}`} />
                   ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Technical Disciplines - The Matrix */}
      <section className="py-40 bg-[#020617] relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_100%_50%,rgba(30,136,229,0.05),transparent_50%)]" />
        <div className="max-w-7xl mx-auto px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <div>
              <span className="text-[#1E88E5] font-black tracking-[0.4em] uppercase text-[10px] mb-4 block">Operational Domains</span>
              <h2 className="text-4xl sm:text-5xl md:text-7xl font-black text-white tracking-tighter md:tracking-widest leading-none uppercase italic mb-8 pr-4">
                {siteSettings.aboutTechnicalTitle.split(' ').map((word, i) => (
                  i === siteSettings.aboutTechnicalTitle.split(' ').length - 1 
                    ? <span key={i} className="text-[#1E88E5] block italic italic-outline-white">{word}</span>
                    : <span key={i}>{word} </span>
                ))}
              </h2>
              <p className="text-lg md:text-xl text-white/40 font-medium leading-relaxed mb-12">
                {siteSettings.aboutTechnicalSubtitle}
              </p>
              
              <div className="space-y-4">
                {[
                  { name: 'Mechanical Engineering', level: '01', desc: 'Heavy machinery overhaul, precision fabrication, and hydraulic systems diagnostics.' },
                  { name: 'Electrical Systems', level: '02', desc: 'Industrial power distribution, control panel engineering, and harmonic analysis.' },
                  { name: 'Automation & PLC', level: '03', desc: 'Logic programming, HMI development, and integrated factory automation cycles.' },
                  { name: 'Predictive Maintenance', level: '04', desc: 'IOT sensor deployment and thermal imaging for pre-critical failure detection.' },
                ].map((domain, idx) => (
                  <motion.div 
                    key={domain.name}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="flex items-center gap-8 p-6 group cursor-default"
                  >
                    <div className="text-white/10 font-black text-2xl group-hover:text-[#1E88E5] transition-colors">{domain.level}</div>
                    <div>
                      <h4 className="text-white font-black uppercase text-sm tracking-widest mb-1 group-hover:text-[#1E88E5] transition-colors">{domain.name}</h4>
                      <p className="text-white/30 text-xs font-medium group-hover:text-white/50 transition-colors">{domain.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="aspect-square bg-[#0B1426] border border-white/5 rounded-[60px] relative overflow-hidden group">
                 {/* Decorative technical grid overlay */}
                 <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none" />
                 
                 <div className="absolute inset-20 border border-[#1E88E5]/20 rounded-full animate-[spin_20s_linear_infinite]" />
                 <div className="absolute inset-40 border-2 border-dashed border-[#1E88E5]/10 rounded-full animate-[spin_30s_linear_infinite_reverse]" />
                 
                 <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-32 h-32 bg-[#1E88E5]/20 backdrop-blur-3xl rounded-full flex items-center justify-center border border-[#1E88E5]/40 animate-pulse">
                       <Settings className="text-[#1E88E5]" size={48} />
                    </div>
                 </div>

                 {/* Floating Data Points */}
                 <div className="absolute top-20 left-20 p-4 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl animate-bounce">
                    <div className="text-[8px] text-[#1E88E5] font-black uppercase mb-1">Status</div>
                    <div className="text-xs text-white font-bold italic">OPTIMAL</div>
                 </div>
                 <div className="absolute bottom-20 right-20 p-4 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl animate-[bounce_2s_infinite_1s]">
                    <div className="text-[8px] text-[#1E88E5] font-black uppercase mb-1">Load</div>
                    <div className="text-xs text-white font-bold italic">94.8%</div>
                 </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Industrial History Section */}
      <section className="py-40 bg-[#0B1426] relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none opacity-20" />
        
        <div className="max-w-7xl mx-auto px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 lg:gap-32 items-center">
            <div className="space-y-12 relative z-20">
               <div>
                  <div className="flex items-center gap-4 mb-4">
                    <span className="text-[#1E88E5] font-black text-xs tracking-widest">EST. 2017</span>
                    <div className="h-[1px] flex-grow bg-white/10" />
                  </div>
                  <h2 className="text-5xl sm:text-6xl lg:text-8xl font-black text-white leading-[0.8] tracking-tighter uppercase italic pr-4 md:pr-8">{String(siteSettings.statYears).padStart(2, '0')} Years of <br /><span className="inline-block text-[#1E88E5] italic italic-outline-white pr-6 md:pr-10">Evolution</span></h2>
               </div>

               <p className="text-white/50 text-2xl font-medium leading-relaxed">
                  Since our inception, we have successfully completed over <span className="text-white">{siteSettings.statRepairs} industrial repairs</span> and <span className="text-white font-black italic">{siteSettings.statProjects}+ Tier-1 engineering projects</span>. We survive on technical complexity and deliver solutions where others find failure.
               </p>

               <div className="grid grid-cols-2 gap-10">
                  <div className="p-8 bg-white/5 rounded-[40px] border border-white/5 group hover:border-[#1E88E5]/30 transition-all">
                     <div className="text-5xl font-black text-[#1E88E5] mb-2 italic">
                        <Counter value={siteSettings.statProjects} suffix="+" />
                     </div>
                     <div className="text-white/20 text-[10px] font-black uppercase tracking-widest group-hover:text-white/40 transition-colors">Active Industrial Partners</div>
                  </div>
                  <div className="p-8 bg-[#1E88E5]/10 border border-[#1E88E5]/20 rounded-[40px] group hover:bg-[#1E88E5]/20 transition-all">
                     <div className="text-5xl font-black text-white mb-2 italic">
                        <Counter value={siteSettings.statRepairs} suffix="+" />
                     </div>
                     <div className="text-white/40 text-[10px] font-black uppercase tracking-widest group-hover:text-white/60 transition-colors">Industrial Repairs Conducted</div>
                  </div>
               </div>
            </div>

            <div className="relative group">
                <div className="absolute -inset-4 md:-inset-8 border-2 border-[#1E88E5]/20 rounded-[40px] md:rounded-[70px] pointer-events-none" />
                <div className="absolute -top-4 -left-4 w-12 h-12 border-t-2 border-l-2 border-[#1E88E5] rounded-tl-3xl" />
                <div className="absolute -bottom-4 -right-4 w-12 h-12 border-b-2 border-r-2 border-[#1E88E5] rounded-br-3xl" />
                
                <div className="relative z-10 rounded-[32px] md:rounded-[60px] overflow-hidden grayscale hover:grayscale-0 transition-all duration-700 shadow-2xl border-4 border-white/5">
                  <div className="absolute inset-0 bg-[#1E88E5]/20 pointer-events-none group-hover:opacity-0 transition-opacity" />
                  <img 
                    src={teamImage} 
                    alt="Nexon Engineering Team" 
                    draggable="false"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 select-none"
                  />
                </div>
            </div>
          </div>
        </div>
      </section>


      {/* Final Call to Legacy */}
      <section className="py-60 relative">
        <div className="max-w-4xl mx-auto px-8 text-center relative z-10">
           <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              className="space-y-8 md:space-y-16"
           >
              <h2 className="text-5xl md:text-9xl font-black text-white leading-none tracking-widest uppercase italic">The Future is <br /><span className="text-[#1E88E5] italic italic-outline-white">Engineered</span></h2>
              <p className="text-lg md:text-2xl text-white/40 font-medium leading-relaxed max-w-2xl mx-auto">
                Join the network of elite industrial partners who trust Nexon with their most critical operations.
              </p>
              <div className="flex flex-col md:flex-row gap-4 md:gap-8 justify-center items-center">
                 <button 
                  onClick={() => navigate('/projects')}
                  className="w-full md:w-auto px-10 md:px-16 py-6 md:py-8 bg-[#1E88E5] rounded-2xl md:rounded-[40px] text-white font-black text-[10px] md:text-xs uppercase tracking-[0.3em] hover:shadow-[0_20px_50px_rgba(30,136,229,0.5)] transition-all cursor-pointer"
                >
                  Inspect Matrix Projects
                </button>
                 <button 
                  onClick={() => navigate('/contact')}
                  className="w-full md:w-auto px-10 md:px-16 py-6 md:py-8 bg-white/5 border border-white/10 rounded-2xl md:rounded-[40px] text-white font-black text-[10px] md:text-xs uppercase tracking-[0.3em] hover:bg-white/10 transition-all cursor-pointer"
                >
                  Establish Contact
                </button>
              </div>
           </motion.div>
        </div>

        {/* Technical Status Bar */}
        <div className="absolute bottom-0 left-0 w-full p-8 border-t border-white/5 bg-[#020617] flex justify-between items-center text-[8px] font-black tracking-[0.3em] text-white/20 uppercase">
           <div className="flex gap-8">
              <span className="flex items-center gap-2"><div className="w-1 h-1 bg-green-500 rounded-full animate-pulse" /> Nexon Link: Active</span>
              <span>Encrypted Data Cycle: Synchronized</span>
           </div>
           <div>© 2017-{new Date().getFullYear()} NEXON ENGINEERING SERVICES (PVT) LTD</div>
        </div>
      </section>
    </div>
  );
}
