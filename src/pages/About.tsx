import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Target, Eye, ShieldCheck, Award, FlaskConical } from 'lucide-react';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { doc, onSnapshot, collection, query, where } from 'firebase/firestore';
import logoAsset from '../assets/images/regenerated_image_1778416445055.png';

export default function About() {
  const [siteSettings, setSiteSettings] = useState<any>({
    aboutTitle: 'Technical Dominance.',
    aboutPageText: 'Established with a vision to revolutionize industrial engineering in Sri Lanka, Nexon Engineering Services (Pvt) Ltd has grown into a leading provider of maintenance, repair, and automation solutions.',
    aboutMission: '',
    aboutVision: ''
  });
  const [sectors, setSectors] = useState<any[]>([]);

  useEffect(() => {
    const unsubSettings = onSnapshot(doc(db, 'settings', 'global'), (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        setSiteSettings({
          ...data,
          aboutTitle: data.aboutTitle || 'Technical Dominance.',
          aboutPageText: data.aboutText || 'Established with a vision to revolutionize industrial engineering in Sri Lanka, Nexon Engineering Services (Pvt) Ltd has grown into a leading provider of maintenance, repair, and automation solutions.',
          aboutMission: data.aboutMission || 'To deliver reliable, innovative engineering solutions that empower industries to operate efficiently and safely through superior craftsmanship, technical expertise, and an unwavering commitment to customer success.',
          aboutVision: data.aboutVision || 'To be the most trusted and innovative engineering services partner in South Asia, setting global standards for quality, reliability, and technical excellence.'
        });
      }
    }, (error) => handleFirestoreError(error, OperationType.GET, 'settings/global'));

    const unsubSectors = onSnapshot(query(collection(db, 'sectors'), where('enabled', '==', true)), (snap) => {
      const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
      setSectors(data.sort((a, b) => (a.order || 0) - (b.order || 0)));
    }, (error) => {
      console.warn("Sectors access restricted by current rules, using matrix defaults.");
      // Soft fail, don't throw
    });

    return () => {
      unsubSettings();
      unsubSectors();
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
          <div className="grid lg:grid-cols-2 gap-20 items-end">
            <div>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-4 mb-8"
              >
                <div className="h-[1px] w-12 bg-[#1E88E5]" />
                <span className="text-[#1E88E5] font-black tracking-[0.4em] uppercase text-[10px]">Division: Corporate Identity</span>
              </motion.div>
              
              <motion.h1 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-7xl md:text-[9.5rem] font-black text-white tracking-widest leading-[0.8] mb-12 uppercase italic"
              >
                NEXON <br /> <span className="text-[#1E88E5] italic italic-outline-white">ENGINEERING</span>
              </motion.h1>
            </div>
            
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="space-y-8"
            >
              <p className="text-white/50 text-2xl font-medium leading-relaxed max-w-xl italic">
                {siteSettings.aboutPageText}
              </p>
              <div className="flex gap-4">
                 <div className="h-2 w-20 bg-[#1E88E5]" />
                 <div className="h-2 w-8 bg-white/10" />
                 <div className="h-2 w-4 bg-white/10" />
              </div>
            </motion.div>
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
              className="bg-[#0B1426] p-16 rounded-[60px] border border-white/5 relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 p-12 opacity-5 scale-150 -rotate-12 group-hover:rotate-0 transition-transform duration-1000">
                <Eye size={200} />
              </div>
              <div className="relative z-10">
                <div className="w-16 h-16 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center mb-10 text-[#1E88E5]">
                  <Eye size={32} />
                </div>
                <div className="inline-block px-3 py-1 bg-[#1E88E5]/10 border border-[#1E88E5]/20 text-[#1E88E5] text-[8px] font-black uppercase tracking-widest mb-4">Strategic Horizon</div>
                <h2 className="text-5xl font-black mb-8 tracking-tighter text-white uppercase italic">Our Vision</h2>
                <p className="text-xl text-white/40 leading-relaxed font-medium">
                  {siteSettings.aboutVision}
                </p>
              </div>
            </motion.div>

            <motion.div 
              whileInView={{ opacity: 1, y: 0 }}
              initial={{ opacity: 0, y: 50 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="bg-[#1E88E5] p-16 rounded-[60px] relative overflow-hidden group shadow-[0_50px_100px_-20px_rgba(30,136,229,0.3)]"
            >
              <div className="absolute top-0 right-0 p-12 opacity-20 scale-150 rotate-12 group-hover:rotate-0 transition-transform duration-1000">
                <Target size={200} />
              </div>
              <div className="relative z-10">
                <div className="w-16 h-16 bg-white/20 border border-white/30 rounded-2xl flex items-center justify-center mb-10 text-white">
                  <Target size={32} />
                </div>
                <div className="inline-block px-3 py-1 bg-white/10 border border-white/20 text-white text-[8px] font-black uppercase tracking-widest mb-4">Operational Protocol</div>
                <h2 className="text-5xl font-black mb-8 tracking-tighter text-white uppercase italic">Our Mission</h2>
                <p className="text-xl text-white/90 leading-relaxed font-medium">
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
              <h2 className="text-7xl font-black text-white tracking-widest leading-none uppercase italic">Core <span className="text-[#1E88E5] block italic italic-outline-white">Doctrines</span></h2>
            </div>
            <p className="text-white/30 text-xl font-medium max-w-sm border-l-2 border-[#1E88E5] pl-8">
              The fundamental principles that govern our technical execution and safety protocols.
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
                className="bg-[#0B1426] border border-white/5 p-12 rounded-[50px] relative group hover:border-[#1E88E5]/50 transition-all duration-500"
              >
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

      {/* Industrial History Section */}
      <section className="py-40 bg-[#0B1426] relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none opacity-20" />
        
        <div className="max-w-7xl mx-auto px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-32 items-center">
            <div className="space-y-12">
               <div>
                  <div className="flex items-center gap-4 mb-4">
                    <span className="text-[#1E88E5] font-black text-xs tracking-widest">EST. 2017</span>
                    <div className="h-[1px] flex-grow bg-white/10" />
                  </div>
                  <h2 className="text-7xl md:text-8xl font-black text-white leading-[0.8] tracking-widest uppercase italic">08 Years of <br /><span className="text-[#1E88E5] italic italic-outline-white">Evolution</span></h2>
               </div>

               <p className="text-white/50 text-2xl font-medium leading-relaxed">
                  Since our inception, we have successfully completed over <span className="text-white">500 industrial repairs</span> and <span className="text-white font-black italic">50+ Tier-1 engineering projects</span>. We survive on technical complexity and deliver solutions where others find failure.
               </p>

               <div className="grid grid-cols-2 gap-10">
                  <div className="p-8 bg-white/5 rounded-[40px] border border-white/5">
                     <div className="text-5xl font-black text-[#1E88E5] mb-2 italic">100+</div>
                     <div className="text-white/20 text-[10px] font-black uppercase tracking-widest">Active Industrial Partners</div>
                  </div>
                  <div className="p-8 bg-[#1E88E5]/10 border border-[#1E88E5]/20 rounded-[40px]">
                     <div className="text-5xl font-black text-white mb-2 italic">99%</div>
                     <div className="text-white/40 text-[10px] font-black uppercase tracking-widest">Client Success Index</div>
                  </div>
               </div>
            </div>

            <div className="relative group">
                <div className="absolute -inset-8 border-2 border-[#1E88E5]/20 rounded-[70px] pointer-events-none" />
                <div className="absolute -top-4 -left-4 w-12 h-12 border-t-2 border-l-2 border-[#1E88E5] rounded-tl-3xl" />
                <div className="absolute -bottom-4 -right-4 w-12 h-12 border-b-2 border-r-2 border-[#1E88E5] rounded-br-3xl" />
                
                <div className="relative z-10 rounded-[60px] overflow-hidden grayscale hover:grayscale-0 transition-all duration-700 shadow-2xl border-4 border-white/5">
                  <div className="absolute inset-0 bg-[#1E88E5]/20 pointer-events-none group-hover:opacity-0 transition-opacity" />
                  <img 
                    src={logoAsset} 
                    alt="Nexon Corporate Emblem" 
                    className="w-full object-contain p-20 scale-125 group-hover:scale-110 transition-transform duration-1000"
                  />
                </div>
            </div>
          </div>
        </div>
      </section>

      {/* Industrial Sectors */}
      <section className="py-40">
        <div className="max-w-7xl mx-auto px-8">
           <div className="text-center mb-32">
              <h2 className="text-6xl font-black text-white tracking-widest uppercase italic italic-outline-white">Operated <span className="text-[#1E88E5] italic italic-solid">Terrains</span></h2>
              <p className="text-white/20 text-xs font-black uppercase tracking-[0.4em] mt-4">Cross-Sector Technical Deployment</p>
           </div>

           <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
              {(sectors.length > 0 ? sectors : [
                { title: 'Maritime', icon: '🚢' },
                { title: 'Garments', icon: '🏭' },
                { title: 'Hotels', icon: '🏢' },
                { title: 'Utilities', icon: '⚡' },
                { title: 'Packaging', icon: '📦' },
                { title: 'Automotive', icon: '🏎️' }
              ]).map((sector, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-white/5 p-8 rounded-[40px] border border-white/5 flex flex-col items-center gap-6 group hover:bg-[#1E88E5] transition-all duration-500"
                >
                  <div className="text-white/20 group-hover:text-white transition-colors text-4xl">
                     {typeof sector.icon === 'string' ? sector.icon : <sector.icon size={40} />}
                  </div>
                  <span className="text-white/40 group-hover:text-white font-black uppercase text-[10px] tracking-widest text-center">{sector.title || sector.name}</span>
                </motion.div>
              ))}
           </div>
        </div>
      </section>

      {/* Final Call to Legacy */}
      <section className="py-60 relative">
        <div className="max-w-4xl mx-auto px-8 text-center">
           <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              className="space-y-16"
           >
              <h2 className="text-7xl md:text-9xl font-black text-white leading-none tracking-widest uppercase italic">The Future is <br /><span className="text-[#1E88E5] italic italic-outline-white">Engineered</span></h2>
              <p className="text-white/40 text-2xl font-medium leading-relaxed max-w-2xl mx-auto">
                Join the network of elite industrial partners who trust Nexon with their most critical operations.
              </p>
              <div className="flex flex-col md:flex-row gap-8 justify-center">
                 <button className="px-16 py-8 bg-[#1E88E5] rounded-[40px] text-white font-black text-xs uppercase tracking-[0.3em] hover:shadow-[0_20px_50px_rgba(30,136,229,0.5)] transition-all">Download Portfolio</button>
                 <button className="px-16 py-8 bg-white/5 border border-white/10 rounded-[40px] text-white font-black text-xs uppercase tracking-[0.3em] hover:bg-white/10 transition-all">Contact Pipeline</button>
              </div>
           </motion.div>
        </div>
      </section>
    </div>
  );
}
