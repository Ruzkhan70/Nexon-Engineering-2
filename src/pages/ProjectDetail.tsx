import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, Calendar, User, MapPin, CheckCircle2, ChevronRight, 
  ChevronLeft, ExternalLink, Cpu, Boxes, Activity, Zap, Shield, 
  Maximize2, ArrowUpRight, Clock
} from 'lucide-react';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { doc, getDoc, collection, query, where, limit, getDocs } from 'firebase/firestore';

export default function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [relatedProjects, setRelatedProjects] = useState<any[]>([]);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        if (!id) return;
        const docRef = doc(db, 'projects', id);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const data = docSnap.data();
          setProject({ id: docSnap.id, ...data });
          
          // Fetch related projects in same category
          if (data.category) {
            const q = query(
              collection(db, 'projects'), 
              where('category', '==', data.category),
              where('enabled', '==', true),
              limit(4)
            );
            const relatedSnap = await getDocs(q);
            setRelatedProjects(relatedSnap.docs
              .map(d => ({ id: d.id, ...d.data() }))
              .filter(p => p.id !== id)
            );
          }
        } else {
          navigate('/projects');
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [id, navigate]);

  if (loading) {
    return (
      <motion.div 
        key="loading-project"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="min-h-[100vh] bg-[#020917] flex items-center justify-center relative z-[60]"
      >
        <div className="flex flex-col items-center gap-6">
          <div className="w-16 h-16 border-4 border-royal border-t-transparent rounded-full animate-spin shadow-[0_0_30px_rgba(30,136,229,0.4)]" />
          <div className="text-[10px] font-black uppercase tracking-[0.5em] text-royal animate-pulse text-center">Syncing Matrix Core...</div>
        </div>
      </motion.div>
    );
  }

  if (!project) return null;

  const gallery = project.gallery || [];
  const allImages = [
    { url: project.imageUrl || project.image, caption: 'Main Asset' },
    ...gallery
  ].filter(img => img.url);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-[#020917] text-white pt-32 pb-40 relative overflow-hidden"
    >
      {/* Background Technical Overlays */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '100px 100px' }} />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(30,136,229,0.1),transparent_70%)]" />

      <div className="max-w-7xl mx-auto px-8 relative z-10">
        {/* Back Button */}
        <motion.button 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate('/projects')}
          className="flex items-center gap-4 text-white/40 hover:text-royal transition-all font-black text-[10px] uppercase tracking-widest mb-16 group"
        >
          <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center group-hover:border-royal group-hover:bg-royal group-hover:text-white transition-all">
            <ArrowLeft size={16} />
          </div>
          Return to Matrix
        </motion.button>

        {/* Hero Section */}
        <div className="grid lg:grid-cols-2 gap-20 items-start mb-32">
          <div className="space-y-12">
            <div className="space-y-6">
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-3"
              >
                <span className="px-5 py-1.5 bg-royal/10 text-royal rounded-full text-[10px] font-black uppercase tracking-widest border border-royal/20">
                  {project.category}
                </span>
                <span className={`px-5 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                  project.status === 'ongoing' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-400/20' : 'bg-white/5 text-white/30 border-white/10'
                }`}>
                  {project.status === 'ongoing' ? 'Active Operation' : 'Asset Deployed'}
                </span>
              </motion.div>

              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-4xl md:text-8xl font-black tracking-tighter leading-[0.9] italic pr-4"
              >
                {project.title}
              </motion.h1>
              
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-white/40 text-xl font-medium leading-relaxed max-w-xl"
              >
                {project.description}
              </motion.p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 py-10 border-y border-white/5">
              {[
                { label: 'Client', value: project.client, icon: User },
                { label: 'Deployment', value: project.year, icon: Calendar },
                { label: 'Site', value: project.location || 'Undisclosed', icon: MapPin },
                { label: 'Matrix ID', value: project.id.slice(0, 8), icon: Cpu }
              ].map((spec, sIdx) => (
                <motion.div 
                  key={spec.label}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + sIdx * 0.1 }}
                  className="space-y-2"
                >
                  <div className="flex items-center gap-2 text-royal/40 font-black text-[9px] uppercase tracking-widest">
                    <spec.icon size={12} />
                    {spec.label}
                  </div>
                  <div className="text-sm font-black text-white/80 uppercase truncate">{spec.value}</div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Featured Visual */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={() => {
              setLightboxIndex(activeImage);
              setIsLightboxOpen(true);
            }}
            className="relative h-[400px] md:h-[600px] rounded-[32px] md:rounded-[64px] overflow-hidden border border-white/10 shadow-2xl group cursor-pointer"
          >
            <AnimatePresence mode="wait">
              <motion.img 
                key={activeImage}
                src={allImages[activeImage]?.url}
                initial={{ opacity: 0, scale: 1.1 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="absolute inset-0 w-full h-full object-cover"
              />
            </AnimatePresence>
            <div className="absolute inset-0 bg-gradient-to-t from-navy via-transparent to-transparent opacity-60" />
            
            {allImages.length > 1 && (
              <div className="absolute bottom-10 inset-x-10 flex justify-between items-center">
                 <div className="flex gap-3">
                   <button 
                     onClick={() => setActiveImage(prev => (prev === 0 ? allImages.length - 1 : prev - 1))}
                     className="w-12 h-12 bg-white/10 backdrop-blur-3xl rounded-full flex items-center justify-center hover:bg-royal hover:text-white transition-all border border-white/10"
                   >
                     <ChevronLeft size={20} />
                   </button>
                   <button 
                     onClick={() => setActiveImage(prev => (prev === allImages.length - 1 ? 0 : prev + 1))}
                     className="w-12 h-12 bg-white/10 backdrop-blur-3xl rounded-full flex items-center justify-center hover:bg-royal hover:text-white transition-all border border-white/10"
                   >
                     <ChevronRight size={20} />
                   </button>
                 </div>
                 <div className="text-[10px] font-black uppercase tracking-widest bg-navy/80 px-5 py-2 rounded-full border border-white/10 italic">
                   {activeImage + 1} / {allImages.length} Visual Assets
                 </div>
              </div>
            )}
          </motion.div>
        </div>

        {/* Detailed Content */}
        <div className="grid lg:grid-cols-12 gap-20 mb-40">
          <div className="lg:col-span-8 space-y-20">
            <section className="space-y-8">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-royal/10 text-royal rounded-2xl flex items-center justify-center border border-royal/20">
                  <Activity size={24} />
                </div>
                <h2 className="text-4xl font-black uppercase italic tracking-tighter">Case Analysis</h2>
              </div>
              <div className="prose prose-invert max-w-none prose-p:text-xl prose-p:text-white/60 prose-p:leading-relaxed prose-p:font-medium">
                {project.fullDescription || project.description}
              </div>
            </section>

            {(project.challenges || project.solutions) && (
              <div className="grid md:grid-cols-2 gap-10">
                {project.challenges && (
                  <div className="bg-white/5 p-8 md:p-10 rounded-[32px] md:rounded-[48px] border border-white/10 space-y-6">
                    <div className="text-royal/60 font-black text-[10px] uppercase tracking-[0.3em]">Operational Challenges</div>
                    <p className="text-white/60 font-medium italic">"{project.challenges}"</p>
                  </div>
                )}
                {project.solutions && (
                  <div className="bg-royal/5 p-8 md:p-10 rounded-[32px] md:rounded-[48px] border border-royal/20 space-y-6">
                    <div className="text-matrix font-black text-[10px] uppercase tracking-[0.3em]">Engineered Solutions</div>
                    <p className="text-white/60 font-medium italic">"{project.solutions}"</p>
                  </div>
                )}
              </div>
            )}

            {project.features && project.features.length > 0 && (
              <section className="space-y-10">
                <div className="text-royal font-black text-[10px] uppercase tracking-[0.3em] flex items-center gap-4">
                  <Shield size={14} /> Core Deliverables
                </div>
                <div className="grid sm:grid-cols-2 gap-6">
                  {project.features.map((feature: string, fIdx: number) => (
                    <motion.div 
                      key={fIdx}
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: fIdx * 0.1 }}
                      className="flex items-center gap-4 bg-white/5 p-6 rounded-3xl border border-white/5 hover:border-royal/40 transition-all group"
                    >
                      <div className="w-8 h-8 rounded-full bg-matrix/10 text-matrix flex items-center justify-center shrink-0 group-hover:bg-matrix group-hover:text-white transition-all">
                        <CheckCircle2 size={16} />
                      </div>
                      <span className="text-white/60 font-bold text-sm uppercase tracking-wide">{feature}</span>
                    </motion.div>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Sidebar Gallery Thumbnails */}
          <div className="lg:col-span-4 space-y-12">
             <div className="bg-[#0B1426] p-8 md:p-10 rounded-[32px] md:rounded-[56px] border border-white/5 shadow-2xl">
                <h3 className="text-xl font-black italic uppercase tracking-tighter mb-8 border-b border-white/5 pb-4">Asset Manifest</h3>
                <div className="grid grid-cols-2 gap-4">
                  {allImages.map((img, idx) => (
                    <button 
                      key={idx}
                      onClick={() => {
                        setActiveImage(idx);
                        setLightboxIndex(idx);
                        setIsLightboxOpen(true);
                      }}
                      className={`relative aspect-square rounded-2xl overflow-hidden border-2 transition-all hover:scale-105 ${activeImage === idx ? 'border-royal brightness-125' : 'border-white/5 opacity-40 hover:opacity-100'}`}
                    >
                      <img src={img.url} alt={`Thumb ${idx}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
                
                {allImages[activeImage]?.caption && (
                  <div className="mt-8 p-6 bg-white/5 rounded-3xl border border-white/5">
                    <div className="text-[10px] font-black uppercase text-royal/60 tracking-widest mb-2">Technical Description</div>
                    <p className="text-xs text-white/60 font-medium italic">{allImages[activeImage].caption}</p>
                  </div>
                )}
             </div>

             <div className="bg-gradient-to-br from-royal to-[#00b4d8] p-8 md:p-10 rounded-[32px] md:rounded-[56px] shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:rotate-12 transition-transform">
                   <Zap size={120} />
                </div>
                <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter mb-6 relative z-10">Technical Support Required?</h3>
                <p className="text-white/70 text-sm font-bold uppercase tracking-widest leading-relaxed mb-10 relative z-10">Our matrix is ready to accommodate your industrial expansion needs.</p>
                <button 
                  onClick={() => navigate('/contact')}
                  className="w-full py-5 bg-white text-navy rounded-3xl font-black text-xs uppercase tracking-widest hover:scale-[1.05] active:scale-95 transition-all shadow-2xl relative z-10"
                >
                  Initiate System Contact
                </button>
             </div>
          </div>
        </div>

        {/* Related Projects */}
        {relatedProjects.length > 0 && (
          <section className="space-y-12">
            <div className="flex justify-between items-end">
               <div>
                  <h2 className="text-4xl font-black italic uppercase tracking-tighter mb-2">Similiar Assets</h2>
                  <p className="text-white/40 text-sm font-bold uppercase tracking-widest">More industrial victories within the {project.category} matrix.</p>
               </div>
               <button 
                onClick={() => navigate('/projects')}
                className="flex items-center gap-2 text-royal font-black text-[10px] uppercase tracking-widest hover:text-white transition-all"
               >
                 View All <ArrowUpRight size={14} />
               </button>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {relatedProjects.map((p) => (
                <motion.div 
                  key={p.id}
                  whileHover={{ y: -10 }}
                  onClick={() => navigate(`/projects/${p.id}`)}
                  className="group relative h-[400px] rounded-[48px] overflow-hidden border border-white/5 cursor-pointer"
                >
                  <img src={p.imageUrl || p.image} className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:opacity-70 group-hover:scale-110 transition-all duration-700" alt={p.title} />
                  <div className="absolute inset-0 bg-gradient-to-t from-navy via-navy/20 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-10">
                     <div className="text-[10px] text-royal font-black uppercase tracking-widest mb-4">{p.year}</div>
                     <h4 className="text-2xl font-black text-white uppercase italic tracking-tighter leading-tight mb-4 group-hover:text-shadow-glow">{p.title}</h4>
                     <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white/40 group-hover:bg-royal group-hover:text-white transition-all transform translate-x-10 opacity-0 group-hover:translate-x-0 group-hover:opacity-100">
                        <ArrowUpRight size={20} />
                     </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Fullscreen Lightbox Overlay */}
      <AnimatePresence>
        {isLightboxOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            data-lenis-prevent
            className="fixed inset-0 z-[100] bg-navy/95 backdrop-blur-2xl flex items-center justify-center p-8 md:p-20"
          >
            <button 
              onClick={() => setIsLightboxOpen(false)}
              className="absolute top-10 right-10 w-16 h-16 bg-white/5 hover:bg-rose-500 rounded-full flex items-center justify-center text-white transition-all z-20"
            >
              <Boxes size={24} className="rotate-45" />
            </button>

            <div className="relative w-full h-full flex flex-col items-center justify-center gap-12">
              <div className="relative w-full flex-grow flex items-center justify-center">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={lightboxIndex}
                    initial={{ opacity: 0, scale: 0.9, y: 40 }}
                    animate={{ opacity: 1, scale: 1, y: 20 }}
                    exit={{ opacity: 0, scale: 1.1, y: 0 }}
                    className="relative max-w-full max-h-full aspect-video rounded-[32px] overflow-hidden border border-white/10 shadow-[0_0_100px_rgba(30,136,229,0.2)]"
                  >
                    <img 
                      src={allImages[lightboxIndex].url} 
                      className="w-full h-full object-contain"
                      alt="Full View"
                    />
                  </motion.div>
                </AnimatePresence>

                {/* Lightbox Nav */}
                <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-between px-4 pointer-events-none">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setLightboxIndex(prev => (prev === 0 ? allImages.length - 1 : prev - 1));
                    }}
                    className="w-20 h-20 bg-white/5 hover:bg-royal hover:scale-110 rounded-full flex items-center justify-center text-white transition-all border border-white/10 pointer-events-auto"
                  >
                    <ChevronLeft size={32} />
                  </button>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setLightboxIndex(prev => (prev === allImages.length - 1 ? 0 : prev + 1));
                    }}
                    className="w-20 h-20 bg-white/5 hover:bg-royal hover:scale-110 rounded-full flex items-center justify-center text-white transition-all border border-white/10 pointer-events-auto"
                  >
                    <ChevronRight size={32} />
                  </button>
                </div>
              </div>

              <div className="text-center space-y-4 max-w-2xl px-12">
                <div className="text-royal font-black text-[10px] uppercase tracking-[0.5em] italic">Project Observation Mode</div>
                <h4 className="text-2xl font-black italic uppercase tracking-tighter text-white">
                  {allImages[lightboxIndex].caption || 'Technical Detail Asset'}
                </h4>
                <div className="flex justify-center gap-2">
                  {allImages.map((_, i) => (
                    <div 
                      key={i} 
                      className={`h-1 rounded-full transition-all duration-500 ${i === lightboxIndex ? 'w-12 bg-royal' : 'w-4 bg-white/10'}`} 
                    />
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
