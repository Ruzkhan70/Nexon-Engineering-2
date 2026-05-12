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
    onSnapshot(doc(db, 'settings', 'global'), (snap) => {
      if (snap.exists()) setSiteSettings(snap.data());
    }, (error) => handleFirestoreError(error, OperationType.GET, 'settings/global'));

    // Fetch categories
    const unsubscribeCats = onSnapshot(query(collection(db, 'serviceCategories'), orderBy('order', 'asc')), (snap) => {
      const catsData = snap.docs.map(doc => ({ id: doc.id, title: doc.data().title })) as {id: string, title: string}[];
      setCategories(catsData);
    });

    const q = query(collection(db, 'services'), where('enabled', '==', true), orderBy('order', 'asc'));
    const unsubscribeServices = onSnapshot(q, (snap) => {
      const servicesData = snap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as any[];
      setServices(servicesData);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'services (enabled=true)');
      setLoading(false);
    });

    return () => {
      unsubscribeCats();
      unsubscribeServices();
    };
  }, []);

  const filteredServices = activeCategory === 'all' 
    ? services 
    : services.filter(s => s.category === activeCategory);

  return (
    <div className="pt-32 pb-40 bg-[#020617] relative overflow-hidden min-h-screen">
      {/* Background Polish */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-20%,rgba(0,180,216,0.1),transparent_50%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px] pointer-events-none [mask-image:radial-gradient(ellipse_at_center,black,transparent_80%)]" />

      <div className="max-w-7xl mx-auto px-8 relative z-10">
        {/* Header */}
        <div className="max-w-4xl mb-24">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-4 mb-6"
          >
            <div className="h-[1px] w-12 bg-royal" />
            <span className="text-royal font-black tracking-[0.4em] uppercase text-[10px]">Technical Capability Matrix</span>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-8xl font-black text-white tracking-tighter leading-[0.9] mb-10"
          >
            Universal <span className="text-royal italic italic-outline-white">Engineering</span> <br className="hidden md:block" />Solutions
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-white/40 text-xl font-medium leading-relaxed"
          >
            {siteSettings?.servicesSubtitle || 'Deployment-ready industrial expertise across electrical, mechanical, and strategic engineering sectors.'}
          </motion.p>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="text-royal animate-spin" size={40} />
            <span className="text-white/20 font-black uppercase tracking-widest text-[10px]">Synchronizing Matrix...</span>
          </div>
        ) : (
          <>
            {/* Category Navigation */}
            <div className="sticky top-24 z-50 mb-16">
              <div className="bg-[#0B1426]/80 backdrop-blur-3xl p-2 rounded-full border border-white/5 shadow-2xl flex flex-wrap items-center gap-2 max-w-fit">
                <button
                  onClick={() => setActiveCategory('all')}
                  className={`px-8 py-4 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
                    activeCategory === 'all' ? 'bg-royal text-white shadow-lg shadow-royal/20' : 'text-white/40 hover:text-white hover:bg-white/5'
                  }`}
                >
                  All Divisions
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className={`px-8 py-4 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
                      activeCategory === cat.id ? 'bg-royal text-white shadow-lg shadow-royal/20' : 'text-white/40 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {cat.title}
                  </button>
                ))}
              </div>
            </div>

            {/* Services Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <AnimatePresence mode="popLayout">
                {filteredServices.map((service, idx) => {
              const Icon = iconMap[service.icon] || Settings;
              const refId = `NXSRV-${service.id.slice(0, 4).toUpperCase()}`;
              
              return (
                <motion.div
                  key={service.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: idx * 0.05 }}
                  className="group relative bg-[#0B1426] border border-white/5 p-8 rounded-[40px] flex flex-col justify-between hover:border-royal/30 transition-all duration-500 overflow-hidden"
                >
                  {/* Blueprint Lines */}
                  <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/5 to-transparent group-hover:via-royal/20" />
                  <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/5 to-transparent group-hover:via-royal/20" />
                  
                  <div>
                    {/* Header: Icon & Ref */}
                    <div className="flex justify-between items-start mb-10">
                      <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center text-royal border border-white/5 group-hover:bg-royal group-hover:text-white group-hover:border-royal transition-all duration-500 shadow-inner">
                        <Icon size={32} />
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="text-[8px] font-black tracking-[0.2em] text-white/20 group-hover:text-royal transition-colors">SERIALIZED CODE</span>
                        <span className="text-xs font-black text-white/10 group-hover:text-white/30 transition-colors uppercase">{refId}</span>
                      </div>
                    </div>

                    {/* Image Placeholder or Actual */}
                    {service.imageUrl && (
                      <div className="w-full h-48 mb-8 rounded-[32px] overflow-hidden transition-all duration-700 relative">
                        <img 
                          src={service.imageUrl} 
                          alt={service.title} 
                          draggable="false"
                          className="w-full h-full object-cover scale-105 group-hover:scale-100 transition-transform duration-700 select-none"
                        />
                      </div>
                    )}

                    <h3 className="text-3xl font-black text-white mb-4 leading-tight group-hover:text-royal transition-colors italic tracking-tighter">
                      {service.title}
                    </h3>
                    
                    <p className="text-white/40 text-lg leading-relaxed font-medium line-clamp-4 group-hover:text-white/60 transition-colors">
                      {service.description}
                    </p>
                  </div>

                  {/* Tech Specs Simulated Footnote */}
                  <div className="mt-10 pt-10 border-t border-white/5 grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <span className="block text-[8px] font-black text-white/20 uppercase tracking-widest">Complexity</span>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((level) => (
                          <div key={level} className={`h-1 flex-grow rounded-full ${level <= (idx % 3 + 3) ? 'bg-royal' : 'bg-white/5'}`} />
                        ))}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <span className="block text-[8px] font-black text-white/20 uppercase tracking-widest">Priority Class</span>
                      <span className="text-[10px] font-bold text-white/60 uppercase">Tier {idx % 3 + 1} Industrial</span>
                    </div>
                  </div>

                  <button 
                    onClick={() => navigate('/contact', { state: { subject: `Enquiry: ${service.title}` }})}
                    className="mt-8 w-full py-5 bg-white/5 hover:bg-royal text-white rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-3 group/btn"
                  >
                    Initiate Consultation
                    <ArrowRight size={14} className="group-hover/btn:translate-x-2 transition-transform" />
                  </button>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </>
    )}

    {/* Feature Bento Grid */}
        <div className="mt-64 relative">
          <div className="absolute -top-32 right-0 w-96 h-96 bg-royal/10 blur-[120px] rounded-full pointer-events-none" />
          
          <div className="text-center mb-24">
            <h2 className="text-5xl md:text-7xl font-black text-white tracking-tighter mb-8 leading-none">
              Engineered <span className="text-royal">Reliability</span> <br />at Scale
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 md:grid-rows-2 gap-6 min-h-[600px]">
             {/* Main Bento */}
             <div className="md:col-span-2 md:row-span-2 bg-gradient-to-br from-royal to-[#005f73] p-8 md:p-16 rounded-[40px] md:rounded-[60px] flex flex-col justify-end relative overflow-hidden group shadow-2xl">
                <div className="absolute top-0 right-0 p-12 opacity-10 group-hover:opacity-20 transition-opacity">
                  <Factory size={240} className="text-white" />
                </div>
                <div className="relative z-10">
                   <div className="w-16 h-16 bg-white/20 backdrop-blur-xl rounded-3xl flex items-center justify-center mb-8 border border-white/20">
                      <Shield className="text-white" size={32} />
                   </div>
                   <h3 className="text-3xl md:text-4xl font-black text-white mb-6 uppercase leading-tight tracking-tighter">Gold-Standard industrial Compliance</h3>
                   <p className="text-lg md:text-xl text-white/80 leading-relaxed font-medium">
                     Nexon Engineering follows rigorous international ISO and safety standards. Every repair, installation, and design is stress-tested for maximum longevity and environmental harmony.
                   </p>
                </div>
             </div>

             {/* Small Bento top */}
             <div className="bg-[#0B1426] p-12 rounded-[50px] border border-white/5 flex flex-col justify-between hover:border-royal/40 transition-all group">
                <div className="text-royal group-hover:scale-110 transition-transform"><Zap size={40} /></div>
                <div>
                   <div className="text-4xl font-black text-white mb-2 leading-none">24<span className="text-royal italic text-2xl">HR</span></div>
                   <p className="text-white/30 text-xs font-bold uppercase tracking-widest leading-relaxed">Emergency Response Protocol</p>
                </div>
             </div>

             <div className="bg-[#0B1426] p-12 rounded-[50px] border border-white/5 flex flex-col justify-between hover:border-royal/40 transition-all group">
                <div className="text-emerald-500 group-hover:scale-110 transition-transform"><Activity size={40} /></div>
                <div>
                   <div className="text-4xl font-black text-white mb-2 leading-none">99.9<span className="text-emerald-500 italic text-2xl">%</span></div>
                   <p className="text-white/30 text-xs font-bold uppercase tracking-widest leading-relaxed">System Runtime Guarantee</p>
                </div>
             </div>

             {/* Dynamic Stats Bento */}
             <div className="md:col-span-2 bg-[#0B1426] p-12 rounded-[50px] border border-white/5 relative overflow-hidden flex items-center gap-12 group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-royal/5 blur-[80px] rounded-full" />
                <div className="shrink-0 flex -space-x-4">
                  {[1,2,3,4].map(idx => (
                    <div key={idx} className="w-16 h-16 rounded-full bg-white/5 border-2 border-[#0B1426] flex items-center justify-center text-royal font-black text-xl shadow-xl">
                      {idx}
                    </div>
                  ))}
                  <div className="w-16 h-16 rounded-full bg-royal border-2 border-[#0B1426] flex items-center justify-center text-white font-black text-xl shadow-xl">+</div>
                </div>
                <div>
                   <h4 className="text-2xl font-black text-white uppercase italic tracking-tighter mb-2">500+ Engineered Repairs</h4>
                   <p className="text-white/30 text-sm font-medium">Successfully deployed solutions across hospitality, textile, and manufacturing sectors since 2017.</p>
                </div>
             </div>
          </div>
        </div>

        {/* Support Section */}
        <div className="mt-20 md:mt-40 bg-white/5 p-10 md:p-20 rounded-[40px] md:rounded-[60px] border border-white/5 text-center relative overflow-hidden group">
           <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,180,216,0.05),transparent_70%)] opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
           
           <div className="relative z-10">
             <LifeBuoy className="mx-auto text-royal mb-8 group-hover:rotate-45 transition-transform duration-700" size={64} />
             <h3 className="text-3xl md:text-4xl font-black text-white tracking-tighter mb-6 italic">Support Pipeline Always Online</h3>
             <p className="text-white/40 max-w-2xl mx-auto text-lg md:text-xl mb-12">
               Have a complex engineering challenge? Our technical triage team is ready to analyze your requirements and provide a strategic roadmap.
             </p>
              <button 
                type="button"
                onClick={() => navigate('/contact', { 
                  state: { 
                    subject: 'TECHNICAL TICKET: New Challenge', 
                    message: 'I would like to open a technical ticket for a new industrial engineering challenge. Please assign a matrix engineer for analysis.' 
                  } 
                })}
                className="w-full md:w-auto relative z-20 px-10 md:px-16 py-5 md:py-6 bg-royal hover:bg-[#00b4d8] text-white rounded-2xl md:rounded-[32px] font-black uppercase text-[10px] md:text-xs tracking-[0.2em] transition-all shadow-xl shadow-royal/40 active:scale-95 cursor-pointer"
              >
               Open Technical Ticket
             </button>
           </div>
        </div>
      </div>
    </div>
  );
}
