import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { ExternalLink, Filter, Calendar, User, EyeOff, Boxes, Layers, ArrowUpRight, Cpu, Sparkles, Loader2 } from 'lucide-react';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, query, where, onSnapshot, doc, orderBy } from 'firebase/firestore';
import MagneticButton from '../components/MagneticButton';

export default function Projects() {
  const [filter, setFilter] = useState('All');
  const [projects, setProjects] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [siteSettings, setSiteSettings] = useState<any>(null);
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubSettings = onSnapshot(doc(db, 'settings', 'global'), (docSnap) => {
      if (docSnap.exists()) {
        setSiteSettings(docSnap.data());
      }
    }, (error) => handleFirestoreError(error, OperationType.GET, 'settings/global'));

    const unsubCats = onSnapshot(query(collection(db, 'projectCategories'), orderBy('order', 'asc')), (snap) => {
      setCategories(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'projectCategories'));

    const q = query(collection(db, 'projects'), where('enabled', '==', true));
    const unsubProjects = onSnapshot(q, (snap) => {
      setProjects(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'projects');
      setLoading(false);
    });

    return () => {
      unsubSettings();
      unsubCats();
      unsubProjects();
    };
  }, []);

  const getCategoryTitle = (catId: string) => {
    return categories.find(c => c.id === catId)?.title || catId;
  };

  const filterOptions = ['All', ...categories.map(c => c.id)];

  const filteredProjects = projects.filter(p => {
    if (filter === 'All') return true;
    
    // Check if category matches by ID
    if (p.category === filter) return true;
    
    // Check if category matches by title (common in demo or imported data)
    const categoryObj = categories.find(c => c.id === filter);
    if (categoryObj && (p.category === categoryObj.title || p.category === categoryObj.name)) return true;
    
    return false;
  }).filter((p, idx, self) => self.findIndex(t => t.title === p.title) === idx);

  if (siteSettings?.featureProjects === false) {
    return (
      <div className="pt-60 pb-60 bg-navy flex flex-col items-center justify-center text-center px-8 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '40px 40px' }} />
        </div>
        <EyeOff size={80} className="text-royal/20 mb-8" />
        <h1 className="text-4xl md:text-6xl font-black text-white mb-4">Portfolio Currently <span className="text-royal">Private</span></h1>
        <p className="text-white/40 text-xl max-w-2xl font-medium">This section is currently being updated to reflect our latest technical achievements.</p>
      </div>
    );
  }

  return (
    <div className="pt-32 pb-32 bg-navy relative min-h-screen">
      {/* Background Technical Grid */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '100px 100px' }} />
      <div className="absolute inset-0 opacity-[0.05] pointer-events-none" style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '20px 20px' }} />

      <div className="max-w-7xl mx-auto px-8 relative z-10">
        {/* Header Section */}
        <div className="grid lg:grid-cols-2 gap-16 items-end mb-32">
          <div>
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3 mb-6"
            >
              <div className="w-10 h-1 bg-royal rounded-full" />
              <span className="text-royal font-black uppercase tracking-[0.4em] text-[10px]">Matrix Portfolio</span>
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-6xl md:text-9xl font-black text-white tracking-tighter leading-[0.8] mb-10 pr-4"
            >
              PROJECT <br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-royal via-matrix to-royal bg-300% animate-gradient inline-block pr-1">ASSETS</span>
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-white/40 text-xl max-w-lg font-medium leading-relaxed"
            >
              {siteSettings?.projectsSubtitle || 'Deconstructing industrial challenges into systematic engineering victories.'}
            </motion.p>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-10 gap-4">
              <Loader2 className="text-royal animate-spin" size={40} />
              <span className="text-white/20 font-black uppercase tracking-widest text-[10px]">Processing Project Matrix...</span>
            </div>
          ) : (
            <div className="flex flex-col items-center md:items-end gap-8">
             <div className="flex flex-wrap justify-center md:justify-end gap-3 p-1.5 glass-morphism rounded-[24px]">
                {filterOptions.map((catId) => (
                  <button
                    key={catId}
                    onClick={() => setFilter(catId)}
                    className={`relative px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
                      filter === catId ? 'text-white' : 'text-white/30 hover:text-white/60'
                    }`}
                  >
                    {filter === catId && (
                      <motion.div 
                        layoutId="activeFilter"
                        className="absolute inset-0 bg-royal rounded-2xl shadow-[0_10px_20px_rgba(30,136,229,0.3)]"
                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                      />
                    )}
                    <span className="relative z-10">{catId === 'All' ? 'Full Stack' : getCategoryTitle(catId)}</span>
                  </button>
                ))}
             </div>
             
           <div className="flex items-center gap-6 font-mono text-[10px] text-white/20 uppercase tracking-[0.3em]">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-matrix" />
                  Live Operations
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-royal" />
                  Optimization Phase
                </div>
             </div>
          </div>
        )}
      </div>

      {siteSettings?.featureProjects !== false && !loading && (
        <div className="max-w-7xl mx-auto px-8 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mt-16">
          <AnimatePresence mode="popLayout">
            {filteredProjects.map((project, idx) => {
              // Create a modular feel by varying column spans
              const spans = [
                'md:col-span-8', 'md:col-span-4', 
                'md:col-span-4', 'md:col-span-8',
                'md:col-span-12'
              ];
              const spanClass = spans[idx % spans.length];

              return (
                <motion.div
                  key={project.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ scale: 1.015, y: -5 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.5, delay: idx * 0.05 }}
                  onMouseEnter={() => setHoveredIdx(idx)}
                  onMouseLeave={() => setHoveredIdx(null)}
                  onClick={() => navigate(`/projects/${project.id}`)}
                   className={`${spanClass} group relative h-[400px] md:h-[500px] overflow-hidden rounded-[32px] md:rounded-[40px] border border-white/5 bg-white/5 hover:border-royal/80 hover:shadow-[0_30px_60px_rgba(30,136,229,0.1)] transition-all duration-300 cursor-pointer`}
                >
                  <img 
                    src={project.imageUrl || project.image} 
                    alt={project.title} 
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105 opacity-40 group-hover:opacity-70"
                  />
                  
                  {/* Backdrop Gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-navy via-navy/40 to-transparent" />

                  {/* Corner Label */}
                  <div className="absolute top-8 left-8 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl glass-morphism flex items-center justify-center text-royal border border-white/10 group-hover:scale-110 group-hover:bg-royal group-hover:text-white transition-all shadow-xl">
                       <Cpu size={20} />
                    </div>
                    <div className="font-mono text-[9px] font-black uppercase tracking-[0.4em] text-white/40 bg-navy/80 backdrop-blur-md px-4 py-2 rounded-full border border-white/5">
                      Spec_ID: {project.id.slice(0, 8)}
                    </div>
                  </div>

                  <div className="absolute top-8 right-8">
                    <div className="w-10 h-10 rounded-full glass-morphism flex items-center justify-center text-white/40 group-hover:text-royal group-hover:shadow-[0_0_20px_rgba(30,136,229,0.3)] transition-all">
                      <ArrowUpRight size={20} />
                    </div>
                  </div>

                  {/* Content Container */}
                  <div className="absolute inset-x-0 bottom-0 p-8 md:p-12">
                    <motion.div 
                      initial={false}
                      animate={{ y: hoveredIdx === idx ? 0 : 20 }}
                      className="space-y-6"
                    >
                      <div className="flex flex-wrap gap-2">
                        <span className="px-5 py-1.5 bg-royal/10 text-royal rounded-full text-[9px] font-black uppercase tracking-[0.2em] border border-royal/20 backdrop-blur-md">
                          {getCategoryTitle(project.category)}
                        </span>
                        {project.status && (
                          <span className={`px-5 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.2em] border backdrop-blur-md ${
                            project.status === 'ongoing' 
                              ? 'bg-matrix/10 text-matrix border-matrix/20 animate-pulse' 
                              : 'bg-white/5 text-white/60 border-white/10'
                          }`}>
                            {project.status === 'ongoing' ? 'Ongoing Operation' : 'Completed Project'}
                          </span>
                        )}
                      </div>

                      <h3 className="text-4xl md:text-5xl font-black text-white tracking-tighter leading-none group-hover:text-shadow-glow transition-all">
                        {project.title}
                      </h3>

                      <p className={`text-white/40 text-lg font-medium max-w-xl transition-all duration-500 line-clamp-2 ${hoveredIdx === idx ? 'opacity-100' : 'opacity-0 h-0 overflow-hidden'}`}>
                        {project.description}
                      </p>

                      <div className="flex items-center gap-10 pt-8 border-t border-white/10 font-mono">
                        <div className="flex flex-col gap-1">
                          <span className="text-[10px] text-white/20 uppercase tracking-widest">Operator/Client</span>
                          <span className="text-xs font-bold text-white/80">{project.client}</span>
                        </div>
                        <div className="flex flex-col gap-1">
                          <span className="text-[10px] text-white/20 uppercase tracking-widest">Deployment</span>
                          <span className="text-xs font-bold text-white/80">{project.year}</span>
                        </div>
                      </div>
                    </motion.div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>
    )}

    {/* Large Footer CTA */}
        <motion.section 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-32 md:mt-60 relative h-[450px] md:h-[600px] flex items-center justify-center overflow-hidden rounded-[40px] md:rounded-[80px]"
        >
            <div className="absolute inset-0 bg-royal/10 backdrop-blur-3xl" />
            <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, #1E88E5 1px, transparent 0)', backgroundSize: '60px 60px', opacity: 0.1 }} />
            
            <div className="relative z-10 text-center px-8 max-w-4xl">
              <div className="flex justify-center mb-10">
                <div className="w-20 h-20 rounded-full bg-navy border-4 border-royal flex items-center justify-center text-royal animate-pulse">
                  <Sparkles size={40} />
                </div>
              </div>
              <h2 className="text-5xl md:text-8xl font-black text-white mb-10 tracking-tighter leading-none italic uppercase">
                Ready to <br/><span className="text-royal">Matrix</span> yours?
              </h2>
              
              <div className="flex justify-center">
                <MagneticButton strength={60}>
                  <button 
                    onClick={() => navigate('/contact')}
                    className="px-10 md:px-16 py-6 md:py-8 bg-royal hover:bg-[#00b4d8] text-white rounded-[24px] md:rounded-[40px] font-black text-xl md:text-2xl uppercase tracking-widest transition-all shadow-[0_30px_100px_rgba(30,136,229,0.5)] group"
                  >
                    <span className="flex items-center gap-4">
                      Initiate Matrix <ArrowUpRight className="group-hover:translate-x-2 group-hover:-translate-y-2 transition-transform" />
                    </span>
                  </button>
                </MagneticButton>
              </div>
            </div>
        </motion.section>

        {/* Bottom Technical Footer */}
        <div className="mt-20 border-t border-white/5 pt-10 flex flex-col md:flex-row justify-between items-center gap-8 font-mono text-[9px] text-white/20 uppercase tracking-[0.5em]">
          <div>NXN-PRJ-PORTFOLIO-REV-2026.05</div>
          <div className="flex gap-10">
            <span>SECURE TRANS-MATRIX ENCRYPTION ACTIVE</span>
            <span>LATENCY: 14ms</span>
          </div>
        </div>
      </div>
    </div>
  );
}
