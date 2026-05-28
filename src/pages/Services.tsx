import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, query, where, onSnapshot, orderBy, doc } from 'firebase/firestore';
import { ArrowRight, Settings, Zap, Cpu, Wrench as Tool, Bot, Sun, Shield, Package, LifeBuoy, Factory, Wind, Construction, Camera, Activity, Boxes, Video, Hammer, HardHat, UtilityPole, Component, Drill, Anvil, PlugZap, Bolt, Loader2 } from 'lucide-react';

const iconMap: { [key: string]: any } = {
  // Emoji mappings
  '🔧': Tool,
  '⚡': Zap,
  '🤖': Bot,
  '📟': Cpu,
  '🏭': Factory,
  '📦': Package,
  '🛠️': LifeBuoy,
  '🏗️': Construction,
  '💨': Wind,
  '☀️': Sun,
  '📹': Camera,
  'Solar and Security Systems': Sun,
  'Solar & Security Systems': Sun,
  'Sola and security system': Sun,
  // Named mappings from AI
  'Settings': Settings,
  'Activity': Activity,
  'Shield': Shield,
  'Zap': Zap,
  'Cpu': Cpu,
  'Boxes': Boxes,
  'Wrench': Tool,
  'Factory': Factory,
  'Sun': Sun,
  'Video': Video,
  'Wind': Wind,
  'Hammer': Hammer,
  'HardHat': HardHat,
  'UtilityPole': UtilityPole,
  'Component': Component,
  'Drill': Drill,
  'Anvil': Anvil,
  'Tool': Tool,
  'PlugZap': PlugZap,
  'Bolt': Bolt
};

export default function Services() {
  const [services, setServices] = useState<any[]>([]);
  const [categories, setCategories] = useState<{id: string, title: string}[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [siteSettings, setSiteSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Sync settings
    const unsubSettings = onSnapshot(doc(db, 'settings', 'global'), (snap) => {
      if (snap.exists()) setSiteSettings(snap.data());
    }, (error) => handleFirestoreError(error, OperationType.GET, 'settings/global'));

    // Fetch categories
    const unsubscribeCats = onSnapshot(collection(db, 'serviceCategories'), (snap) => {
      const catsData = snap.docs
        .map(doc => ({ 
          id: doc.id, 
          title: doc.data().name || doc.data().title || doc.id,
          order: doc.data().order || 0,
          enabled: doc.data().enabled !== false
        }))
        .filter(c => c.enabled)
        .sort((a, b) => a.order - b.order) as {id: string, title: string}[];
      setCategories(catsData);
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'serviceCategories'));

    // Fetch services - Simplified query to avoid index requirements during initial setup
    const q = query(collection(db, 'services'));
    const unsubscribeServices = onSnapshot(q, (snap) => {
      const servicesData = snap.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter((s: any) => s.enabled !== false) // Default to true if missing
        .sort((a: any, b: any) => (a.order || 0) - (b.order || 0)) as any[];
      
      setServices(servicesData);
      setLoading(false);
    }, (error) => {
      console.error("Services fetch error:", error);
      handleFirestoreError(error, OperationType.LIST, 'services');
      setLoading(false);
    });

    // Safety timeout to ensure loading screen doesn't persist indefinitely
    const timer = setTimeout(() => {
      setLoading(false);
    }, 5000);

    return () => {
      unsubSettings();
      unsubscribeCats();
      unsubscribeServices();
      clearTimeout(timer);
    };
  }, []);

  const filteredServices = activeCategory === 'all' 
    ? services 
    : services.filter(s => s.category === activeCategory);

  return (
    <div className="pt-32 pb-40 bg-[#020617] relative overflow-hidden min-h-screen">
      {/* Background Polish */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-20%,rgba(0,180,216,0.1),transparent_50%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px] pointer-events-none [mask-image:radial-gradient(ellipse_at_center,black,transparent)] opacity-20" />
      <div className="max-w-7xl mx-auto px-6 md:px-8 relative z-10">
        {/* Header */}
        <div className="max-w-4xl mb-24">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-4 mb-6"
          >
            <div className="h-[1px] w-12 bg-royal" />
            <span className="text-royal font-black tracking-[0.4em] uppercase text-[10px]">Technical Excellence & Innovation</span>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-8xl font-black text-white tracking-tighter leading-[0.9] mb-10"
          >
            Universal <span className="text-royal italic italic-outline-white">Engineering</span> <br className="hidden md:block" />Solutions
          </motion.h1>
          
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-white/40 text-xl font-medium leading-relaxed"
            >
              {siteSettings?.servicesSubtitle || 'Deployment-ready industrial expertise across electrical, mechanical, and strategic engineering.'}
            </motion.div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-40 gap-8 min-h-[400px]">
            <div className="relative">
              <Loader2 className="text-royal animate-spin" size={64} />
              <div className="absolute inset-0 bg-royal/20 blur-2xl rounded-full animate-pulse" />
            </div>
            <div className="text-center">
              <span className="text-white/60 font-black uppercase tracking-[0.5em] text-xs block mb-2">Systems Online</span>
              <span className="text-royal font-bold text-[10px] uppercase tracking-widest animate-pulse">Establishing Secure Connection...</span>
            </div>
          </div>
        ) : (
          <>
            <div className="sticky top-28 z-50 mb-20 flex justify-center w-full">
              <nav className="bg-[#0A0F1E]/95 backdrop-blur-3xl p-3 md:p-4 rounded-[32px] md:rounded-[40px] border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5),0_0_20px_rgba(30,136,229,0.1)] flex flex-wrap justify-center items-center gap-3 max-w-[95vw] md:max-w-5xl px-6 md:px-8 min-h-[80px]">
                <button
                  onClick={() => setActiveCategory('all')}
                  className="relative px-6 md:px-8 py-3.5 md:py-4 rounded-full text-[10px] md:text-[11px] font-black uppercase tracking-widest transition-all z-10 cursor-pointer group flex-shrink-0"
                >
                  <span className={`relative z-20 transition-colors duration-300 whitespace-nowrap ${activeCategory === 'all' ? 'text-white' : 'text-white/40 group-hover:text-white/70'}`}>
                    All Divisions
                  </span>
                  {activeCategory === 'all' && (
                    <motion.div
                      layoutId="serviceTab"
                      className="absolute inset-0 bg-royal rounded-full z-10 shadow-lg shadow-royal/40"
                      transition={{ type: "spring", bounce: 0.15, duration: 0.5 }}
                    />
                  )}
                </button>

                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className="relative px-6 md:px-8 py-3.5 md:py-4 rounded-full text-[10px] md:text-[11px] font-black uppercase tracking-widest transition-all z-10 cursor-pointer group flex-shrink-0"
                  >
                    <span className={`relative z-20 transition-colors duration-300 whitespace-nowrap ${activeCategory === cat.id ? 'text-white' : 'text-white/40 group-hover:text-white/70'}`}>
                      {cat.title}
                    </span>
                    {activeCategory === cat.id && (
                      <motion.div
                        layoutId="serviceTab"
                        className="absolute inset-0 bg-royal rounded-full z-10 shadow-lg shadow-royal/40"
                        transition={{ type: "spring", bounce: 0.15, duration: 0.5 }}
                      />
                    )}
                  </button>
                ))}
              </nav>
            </div>
            {/* Services Grid */}
            <div className="min-h-[500px]">
              <AnimatePresence mode="popLayout" initial={false}>
                {filteredServices.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
                    {filteredServices.map((service, idx) => {
                      const Icon = iconMap[service.icon] || Settings;
                      const refId = `NXSRV-${service.id.slice(0, 4).toUpperCase()}`;
                      
                      return (
                        <motion.div
                          key={service.id}
                          layout
                          initial={{ opacity: 0, y: 30 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          transition={{ duration: 0.5, delay: idx * 0.05 }}
                          className="group relative bg-[#0B1426] border border-white/5 p-8 md:p-10 rounded-[40px] md:rounded-[50px] flex flex-col justify-between hover:border-royal/50 hover:shadow-[0_20px_60px_-15px_rgba(0,180,216,0.15)] transition-all duration-700 overflow-hidden"
                        >
                          {/* Blueprint Lines */}
                          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/5 to-transparent group-hover:via-royal/40" />
                          <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/5 to-transparent group-hover:via-royal/40" />
                          <div className="absolute top-0 right-0 w-[1px] h-full bg-gradient-to-b from-transparent via-white/5 to-transparent group-hover:via-royal/20" />
                          <div className="absolute top-0 left-0 w-[1px] h-full bg-gradient-to-b from-transparent via-white/5 to-transparent group-hover:via-royal/20" />
                          
                          <div>
                            {/* Header: Icon & Ref */}
                            <div className="flex justify-between items-start mb-12">
                              <div className="w-20 h-20 rounded-[32px] bg-white/5 flex items-center justify-center text-royal border border-white/10 group-hover:bg-royal group-hover:text-white group-hover:border-royal group-hover:rotate-6 transition-all duration-700 shadow-2xl relative">
                                <Icon size={36} />
                                <div className="absolute inset-0 bg-royal/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                              </div>
                              <div className="flex flex-col items-end">
                                <span className="text-[10px] font-black tracking-[0.3em] text-white/20 group-hover:text-royal transition-colors">SERIALIZED CODE</span>
                                <span className="text-sm font-black text-white/10 group-hover:text-white/30 transition-colors uppercase font-mono">{refId}</span>
                              </div>
                            </div>

                            {/* Image Showcase */}
                            {service.imageUrl && (
                              <div className="w-full h-56 mb-10 rounded-[40px] overflow-hidden transition-all duration-1000 relative ring-1 ring-white/5 group-hover:ring-royal/30">
                                <img 
                                  src={service.imageUrl} 
                                  alt={service.title} 
                                  draggable="false"
                                  referrerPolicy="no-referrer"
                                  className="w-full h-full object-cover scale-110 group-hover:scale-100 transition-transform duration-1000 select-none"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-[#0B1426] via-transparent to-transparent opacity-60" />
                              </div>
                            )}

                            <h3 className="text-3xl md:text-4xl font-black text-white mb-6 leading-tight group-hover:text-royal transition-colors italic tracking-tighter uppercase">
                              {service.title}
                            </h3>
                            
                            <p className="text-white/50 text-lg leading-relaxed font-medium line-clamp-4 group-hover:text-white/80 transition-colors mb-10">
                              {service.description}
                            </p>
                          </div>

                          {/* Tech Specs */}
                          <div className="pt-10 border-t border-white/10 grid grid-cols-2 gap-8 mb-8">
                            <div className="space-y-3">
                              <span className="block text-[10px] font-black text-white/30 uppercase tracking-[.25em]">Complexity</span>
                              <div className="flex gap-1.5 h-1.5">
                                {[1, 2, 3, 4, 5].map((level) => (
                                  <div key={level} className={`flex-grow rounded-full transition-colors duration-700 ${level <= (idx % 3 + 3) ? 'bg-royal' : 'bg-white/10'}`} />
                                ))}
                              </div>
                            </div>
                            <div className="space-y-2">
                              <span className="block text-[10px] font-black text-white/30 uppercase tracking-[.25em]">Deployment</span>
                              <span className="text-xs font-bold text-royal/80 uppercase flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-royal animate-pulse" />
                                High Priority
                              </span>
                            </div>
                          </div>

                          <button 
                            onClick={() => navigate('/contact', { state: { subject: `Enquiry: ${service.title}` }})}
                            className="w-full py-6 bg-white/5 hover:bg-royal text-white rounded-[24px] font-black text-xs uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-4 group/btn shadow-[0_10px_30px_-10px_rgba(0,0,0,0.5)] border border-white/5 hover:border-royal"
                          >
                            Initiate Protocol
                            <ArrowRight size={18} className="group-hover/btn:translate-x-3 transition-transform" />
                          </button>
                        </motion.div>
                      );
                    })}
                  </div>
                ) : (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center justify-center py-40 border-2 border-dashed border-white/10 rounded-[80px] bg-white/[0.02]"
                  >
                    <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center mb-10 border border-white/10">
                      <Settings className="text-white/20 animate-spin-slow" size={48} />
                    </div>
                    <h3 className="text-3xl font-black text-white/60 uppercase tracking-tighter italic mb-4">Division Unavailable</h3>
                    <p className="text-white/30 max-w-md text-center font-medium leading-relaxed">
                      No engineering units are currently assigned to the <span className="text-royal font-bold">"{categories.find(c => c.id === activeCategory)?.title || activeCategory}"</span> division.
                    </p>
                    <button 
                      onClick={() => setActiveCategory('all')}
                      className="mt-10 px-10 py-5 bg-white/5 hover:bg-white/10 text-white font-black text-[10px] uppercase tracking-widest rounded-full border border-white/10 transition-all"
                    >
                      Return to Universal View
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Feature Bento Grid */}
            <div className="mt-64 relative">
              <div className="absolute -top-32 right-0 w-96 h-96 bg-royal/10 blur-[120px] rounded-full pointer-events-none" />
              
              <div className="text-center mb-24">
                <h2 className="text-6xl md:text-8xl font-black text-white tracking-tighter mb-8 leading-none uppercase italic">
                  Engineered <span className="text-royal">Reliability</span> <br />at Scale
                </h2>
                <div className="w-32 h-2 bg-royal mx-auto rounded-full" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 md:grid-rows-2 gap-8 min-h-[600px]">
                 {/* Main Bento */}
                 <div className="md:col-span-2 md:row-span-2 bg-gradient-to-br from-royal to-[#005f73] p-10 md:p-20 rounded-[50px] md:rounded-[80px] flex flex-col justify-end relative overflow-hidden group shadow-3xl">
                    <div className="absolute top-0 right-0 p-16 opacity-10 group-hover:opacity-20 transition-opacity transform group-hover:scale-110 duration-1000">
                      <Factory size={320} className="text-white" />
                    </div>
                    <div className="relative z-10">
                       <div className="w-20 h-20 bg-white/20 backdrop-blur-2xl rounded-3xl flex items-center justify-center mb-10 border border-white/20 shadow-2xl">
                          <Shield className="text-white" size={40} />
                       </div>
                       <h3 className="text-4xl md:text-5xl font-black text-white mb-8 uppercase leading-tight tracking-tighter">Gold-Standard industrial Compliance</h3>
                       <p className="text-xl md:text-2xl text-white/90 leading-relaxed font-medium">
                         Nexon Engineering follows rigorous international ISO and safety standards. Every repair, installation, and design is stress-tested for maximum longevity and environmental harmony.
                       </p>
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
                 </div>

                 {/* Small Bento top */}
                 <div className="bg-[#0B1426] p-12 rounded-[60px] border border-white/10 flex flex-col justify-between hover:border-royal/50 hover:shadow-[0_20px_50px_rgba(30,136,229,0.1)] transition-all group relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-5">
                      <Zap size={120} className="text-royal" />
                    </div>
                    <div className="text-royal group-hover:scale-110 transition-transform origin-left"><Zap size={48} /></div>
                    <div>
                       <div className="text-5xl font-black text-white mb-2 leading-none">24<span className="text-royal italic text-3xl">HR</span></div>
                       <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.3em] leading-relaxed">Emergency Response Protocol</p>
                    </div>
                 </div>

                 <div className="bg-[#0B1426] p-12 rounded-[60px] border border-white/10 flex flex-col justify-between hover:border-emerald-500/50 hover:shadow-[0_20px_50px_rgba(16,185,129,0.1)] transition-all group relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-5">
                      <Activity size={120} className="text-emerald-500" />
                    </div>
                    <div className="text-emerald-500 group-hover:scale-110 transition-transform origin-left"><Activity size={48} /></div>
                    <div>
                       <div className="text-5xl font-black text-white mb-2 leading-none">99.9<span className="text-emerald-500 italic text-3xl">%</span></div>
                       <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.3em] leading-relaxed">System Runtime Guarantee</p>
                    </div>
                 </div>

                 {/* Dynamic Stats Bento */}
                 <div className="md:col-span-2 bg-[#0B1426] p-12 rounded-[60px] border border-white/10 relative overflow-hidden flex items-center gap-16 group hover:border-royal/40 transition-all">
                    <div className="absolute top-0 right-0 w-80 h-80 bg-royal/10 blur-[100px] rounded-full" />
                    <div className="shrink-0 flex -space-x-6 relative py-4">
                      {[1,2,3,4].map(idx => (
                        <div key={idx} className="w-20 h-20 rounded-full bg-[#1A2338] border-4 border-[#0B1426] flex items-center justify-center text-royal font-black text-2xl shadow-3xl hover:-translate-y-4 transition-transform group-hover:border-royal/40">
                          {idx}
                        </div>
                      ))}
                      <div className="w-20 h-20 rounded-full bg-royal border-4 border-[#0B1426] flex items-center justify-center text-white font-black text-2xl shadow-3xl">+</div>
                    </div>
                    <div className="relative z-10">
                       <h4 className="text-3xl md:text-4xl font-black text-white uppercase italic tracking-tighter mb-4">500+ Engineered Repairs</h4>
                       <p className="text-white/40 text-lg font-medium leading-relaxed">Successfully deployed solutions across hospitality, textile, and manufacturing domains since 2017.</p>
                    </div>
                 </div>
              </div>
            </div>

            {/* Support Section */}
            <div className="mt-40 md:mt-64 bg-[#0A0F1E] p-12 md:p-24 rounded-[60px] md:rounded-[100px] border border-white/10 text-center relative overflow-hidden group shadow-[0_40px_100px_rgba(0,0,0,0.6)]">
               <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,180,216,0.08),transparent_70%)] opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
               <div className="absolute -top-24 -left-24 w-96 h-96 bg-royal/5 blur-[120px] rounded-full rounded-full" />
               <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-royal/5 blur-[120px] rounded-full rounded-full" />
               
               <div className="relative z-10">
                 <div className="w-24 h-24 rounded-[40px] bg-royal/10 border border-royal/20 flex items-center justify-center mx-auto mb-10 group-hover:rotate-12 transition-transform duration-700">
                   <LifeBuoy className="text-royal" size={48} />
                 </div>
                 <h3 className="text-5xl md:text-7xl font-black text-white tracking-tighter mb-8 uppercase italic">Ready to Serve</h3>
                 <p className="text-white/50 max-w-3xl mx-auto text-xl md:text-2xl mb-16 font-medium leading-relaxed">
                   Have a complex engineering challenge? Our technical triage team is ready to analyze your requirements and provide a strategic roadmap.
                 </p>
                  <button 
                    type="button"
                      onClick={() => navigate('/contact', { 
                        state: { 
                          subject: 'TECHNICAL INQUIRY: New Project', 
                          message: 'I would like to discuss a new industrial engineering challenge. Please assign an engineer for technical analysis.' 
                        } 
                      })}
                      className="w-full md:w-auto relative z-20 px-12 md:px-20 py-6 md:py-8 bg-royal hover:bg-[#00b4d8] text-white rounded-[32px] md:rounded-[40px] font-black uppercase text-xs md:text-sm tracking-[0.3em] transition-all shadow-[0_20px_50px_rgba(0,180,216,0.3)] active:scale-95 cursor-pointer flex items-center justify-center gap-6 mx-auto group/btn"
                    >
                      Process Technical Inquiry
                    <ArrowRight size={24} className="group-hover/btn:translate-x-4 transition-transform" />
                  </button>
               </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
