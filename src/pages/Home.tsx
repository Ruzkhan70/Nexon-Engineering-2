import { useEffect, useState, useRef } from 'react';
import { motion, useScroll, useTransform, useInView, AnimatePresence, useMotionValue, useAnimationFrame } from 'motion/react';
import { ChevronDown, ArrowRight, Zap, Cpu, Wrench as Tool, Briefcase, Sun, CheckCircle2, Star, Quote, MessageSquare, Send, Factory, Package, LifeBuoy, Construction, Wind, Camera, Settings, Bot, Shield, Activity, Boxes, Video, Hammer, HardHat, UtilityPole, Component, Drill, Anvil, PlugZap, Bolt, Sparkles, Loader2, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';
import InteractiveDotGrid from '../components/InteractiveDotGrid';
import CountUp from '../components/CountUp';
import MagneticButton from '../components/MagneticButton';
import logoAsset from '../assets/images/regenerated_image_1778416443277.png';
import { analyzeProjectRequirement } from '../services/aiService';
import { db, handleFirestoreError, OperationType, auth } from '../lib/firebase';
import { collection, query, where, onSnapshot, addDoc, orderBy, doc, getDoc, updateDoc, increment } from 'firebase/firestore';

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

// --- Testimonial Slider Components ---

function TestimonialSlider({ reviews }: { reviews: any[] }) {
  const x = useMotionValue(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // Default fallback reviews if none in db
  const displayReviews = reviews.length > 0 ? reviews : [
    { author: "Kamal Perera", rating: "5", content: "Excellent industrial electrical work. The team completed our factory wiring on time." },
    { author: "Nimal Silva", rating: "5", content: "Nexon Engineering did our PLC automation upgrade. Production increased by 40%." },
    { author: "Samantha Fernando", rating: "5", content: "Great emergency support! They fixed our machine breakdown within 2 hours." }
  ];

  // We repeat enough times to ensure smooth infinite loop even with 1 item
  const duplicates = displayReviews.length < 3 ? 6 : 3;
  const repeatedReviews = Array.from({ length: duplicates }).flatMap(() => [...displayReviews, { isSpacer: true }]);

  useEffect(() => {
    if (containerRef.current) {
      setContainerWidth(containerRef.current.scrollWidth / duplicates);
    }
  }, [displayReviews, duplicates]);

  useAnimationFrame((time, delta) => {
    if (!isHovered && !isDragging) {
      // Significantly faster speed
      const moveBy = (delta * 0.12); 
      let newX = x.get() - moveBy;

      // Reset when reaching a full cycle
      if (newX <= -containerWidth) {
        newX += containerWidth;
      }
      x.set(newX);
    }
  });

  const onDragEnd = () => {
    setIsDragging(false);
    // After drag, handle wrapping
    let currentX = x.get();
    if (currentX <= -containerWidth) {
      x.set(currentX + containerWidth);
    } else if (currentX > 0) {
      x.set(currentX - containerWidth);
    }
  };

  return (
    <div 
      className="flex py-10"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <motion.div
        drag="x"
        dragElastic={0}
        dragMomentum={true}
        onDragStart={() => setIsDragging(true)}
        onDragEnd={onDragEnd}
        ref={containerRef}
        style={{ x }}
        className="flex gap-8 whitespace-nowrap"
      >
        {repeatedReviews.map((item: any, idx) => (
          item.isSpacer ? (
            <div key={idx} className="w-[300px] md:w-[600px] flex-shrink-0 flex items-center justify-center gap-8 md:gap-16">
              <div className="w-2 h-2 rounded-full bg-white/5" />
              <div className="w-3 h-3 rounded-full bg-[#1E88E5]/20 animate-pulse" />
              <div className="w-2 h-2 rounded-full bg-white/5" />
            </div>
          ) : (
            <div 
              key={idx} 
              className={`w-[280px] md:w-[450px] bg-white/5 backdrop-blur-3xl p-8 md:p-12 rounded-[48px] md:rounded-[60px] border border-white/10 whitespace-normal shadow-2xl flex-shrink-0 relative overflow-hidden group transition-all hover:bg-white/10`}
              style={{ userSelect: 'none' }}
            >
              {/* Glossy overlay */}
              <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />
              
              {item.isService ? (
                <div className="flex flex-col h-full">
                  {item.imageUrl && (
                    <div className="w-full h-40 mb-6 rounded-2xl overflow-hidden shadow-lg border border-white/5 flex-shrink-0">
                      <img 
                        src={item.imageUrl} 
                        alt={item.author} 
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                      />
                    </div>
                  )}
                  <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-[#1E88E5] to-[#00b4d8] rounded-2xl md:rounded-[24px] flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform duration-500 mb-6 md:mb-8 flex-shrink-0">
                       {(() => {
                         const Icon = iconMap[item.icon] || Settings;
                         return <Icon className="text-white" size={32} />;
                       })()}
                  </div>
                  <h3 className="text-2xl md:text-3xl font-black text-white mb-3 md:mb-4 leading-none tracking-tight">{item.author}</h3>
                  <p className="text-[#E1F5FE]/60 text-base md:text-lg mb-8 font-medium leading-relaxed line-clamp-4 flex-grow">{item.content}</p>
                  
                  <Link to="/services" className="inline-flex items-center gap-3 text-[#1E88E5] font-black tracking-widest text-xs md:text-sm group-hover:gap-6 transition-all uppercase mt-auto">
                    EXPLORE <ArrowRight size={18} />
                  </Link>
                </div>
              ) : (
                <>
                  <div className="flex text-amber-500 mb-6 gap-1">
                    {Array.from({ length: 5 }).map((_, sIdx) => (
                      <Star 
                        key={sIdx} 
                        size={16} 
                        fill={sIdx < (parseInt(item.rating) || 5) ? "currentColor" : "none"} 
                        className={sIdx < (parseInt(item.rating) || 5) ? "text-amber-500" : "text-white/10"} 
                      />
                    ))}
                  </div>
                  
                  <Quote className="absolute top-8 right-8 text-white/5 w-20 h-20 -rotate-12" />

                  <p className="text-white/80 text-lg md:text-xl italic mb-10 leading-relaxed relative z-10 font-medium">
                    "{item.content}"
                  </p>

                  <div className="flex items-center gap-5">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#1E88E5] to-[#00b4d8] flex items-center justify-center text-white font-black text-xl shadow-lg">
                      {item.author ? item.author[0] : 'U'}
                    </div>
                    <div>
                      <div className="text-white font-black text-lg tracking-tight uppercase">{item.author}</div>
                      <div className="text-[#1E88E5] font-black text-[10px] uppercase tracking-[0.2em] mt-1">Verified Partner</div>
                    </div>
                  </div>
                </>
              )}
            </div>
          )
        ))}
      </motion.div>
    </div>
  );
}

// --- AI Planner Component ---

function AIPlannerWidget() {
  const [input, setInput] = useState('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleAnalyze = async () => {
    if (!input.trim()) return;
    setLoading(true);
    try {
      const data = await analyzeProjectRequirement(input);
      setResult(data);
    } catch (error) {
      console.error("AI Analysis failed:", error);
      handleFirestoreError(error, OperationType.WRITE, 'ai-analysis');
    }
    setLoading(false);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="max-w-4xl mx-auto px-6 mt-20 mb-32 relative z-30"
    >
      <div className="glass-morphism rounded-[40px] p-8 md:p-12 shadow-2xl overflow-hidden relative group">
        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
          <Sparkles size={120} className="text-royal" />
        </div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-royal/20 flex items-center justify-center text-royal">
              <Sparkles size={20} />
            </div>
            <span className="text-royal font-black uppercase tracking-[0.3em] text-xs">AI Project Matrix</span>
          </div>
          
          <h3 className="text-3xl md:text-5xl font-black text-white mb-6 tracking-tighter">Describe your goal. <br/>We'll build the route.</h3>
          
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <input 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="e.g. My factory conveyor belt is stalling during high heat..."
              className="flex-grow bg-white/10 border border-white/20 rounded-2xl px-6 py-4 text-white focus:border-royal outline-none transition-all font-medium placeholder:text-white/20"
            />
            <button 
              onClick={handleAnalyze}
              disabled={loading || !input}
              className="bg-royal hover:bg-[#00b4d8] text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-3 transition-all disabled:opacity-50"
            >
              {loading ? <Loader2 className="animate-spin" /> : <><Zap size={20} /> ANALYZE</>}
            </button>
          </div>

          <AnimatePresence>
            {result && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="pt-8 border-t border-white/10 overflow-hidden"
              >
                <div className="grid md:grid-cols-2 gap-10">
                  <div>
                    <div className="flex items-center gap-2 text-matrix mb-3">
                      <CheckCircle2 size={16} />
                      <span className="text-[10px] font-black uppercase tracking-widest">Nexon Analysis</span>
                    </div>
                    <p className="text-white/80 leading-relaxed font-medium mb-6 italic">"{result.analysis}"</p>
                    
                    <div className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/5">
                      <div className={`w-3 h-3 rounded-full ${result.urgency === 'High' ? 'bg-rose-500 animate-pulse' : result.urgency === 'Medium' ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                      <span className="text-xs font-black uppercase tracking-widest text-white/40">Priority: </span>
                      <span className="text-xs font-bold text-white">{result.urgency}</span>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <span className="text-[10px] font-black uppercase tracking-widest text-white/40 block mb-2">Recommended Matrix Steps</span>
                    {result.steps.map((step: string, i: number) => (
                      <div key={i} className="flex items-start gap-4 p-4 glass-morphism rounded-xl hover:bg-white/10 transition-all border border-white/5">
                        <div className="w-6 h-6 rounded-lg bg-royal flex items-center justify-center text-[10px] font-black shrink-0">{i+1}</div>
                        <span className="text-sm font-medium text-white/90">{step}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="mt-10 flex justify-end">
                  <Link 
                    to="/contact" 
                    state={{ requirement: input, diagnosis: result }}
                    className="text-royal font-black text-sm uppercase tracking-widest flex items-center gap-2 hover:gap-4 transition-all"
                  >
                    DEPLOY THIS PLAN <ArrowRight size={20} />
                  </Link>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}

export default function Home() {
  const [activeTab, setActiveTab] = useState(0);
  const [siteSettings, setSiteSettings] = useState<any>({
    heroTitle: 'Engineering innovation with precision',
    heroSubtitle: 'Real repair maintenance and automation solutions delivered with unparalleled excellence across Sri Lanka',
    aboutTitle: 'Built on Trust.',
    aboutText: 'Nexon Engineering is a trusted provider of industrial repair, maintenance, and automation services. We specialize in machine servicing, industrial electrical work, and custom engineering solutions designed to improve productivity and reliability.'
  });
  const [services, setServices] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [newReview, setNewReview] = useState({ author: '', rating: 5, content: '' });
  const [hoverRating, setHoverRating] = useState(0);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [notification, setNotification] = useState<{message: string, active: boolean} | null>(null);

  useEffect(() => {
    // Fetch Settings
    const unsubSettings = onSnapshot(doc(db, 'settings', 'global'), (doc) => {
      if (doc.exists()) {
        setSiteSettings(doc.data() as any);
      }
    }, (error) => handleFirestoreError(error, OperationType.GET, 'settings/global'));

    // Fetch Services
    const unsubServices = onSnapshot(query(collection(db, 'services'), where('enabled', '==', true), orderBy('order', 'asc')), (snap) => {
      setServices(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'services (enabled=true)'));

    // Fetch Reviews
    const unsubReviews = onSnapshot(query(collection(db, 'reviews'), where('approved', '==', true), orderBy('timestamp', 'desc')), (snap) => {
      setReviews(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'reviews (approved=true)'));

    return () => {
      unsubSettings();
      unsubServices();
      unsubReviews();
    };
  }, []);

  useEffect(() => {
    // Visitor Count Increment
    const incrementVisitors = async () => {
      const hasVisited = sessionStorage.getItem('visited');
      if (!hasVisited) {
        try {
          const settingsRef = doc(db, 'settings', 'global');
          const docSnap = await getDoc(settingsRef);
          if (docSnap.exists()) {
            await updateDoc(settingsRef, {
              visitorCount: increment(1)
            });
          }
          sessionStorage.setItem('visited', 'true');
        } catch (e) {
          console.error('Error incrementing visitors:', e);
        }
      }
    };
    incrementVisitors();
  }, []);

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReview.author || !newReview.content) return;
    setIsSubmittingReview(true);
    try {
      await addDoc(collection(db, 'reviews'), {
        ...newReview,
        timestamp: new Date().toLocaleString(),
        approved: false // Admin must approve
      });
      setNotification({ message: 'Thank you for your review! It has been submitted successfully and will appear on the site after approval.', active: true });
      setTimeout(() => setNotification(null), 5000);
      setNewReview({ author: '', rating: 5, content: '' });
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const staticStats = [
    { label: 'Projects Done', key: 'statProjects', default: 50 },
    { label: 'Industrial Clients', key: 'statClients', default: 30 },
    { label: 'Years Experience', key: 'statYears', default: 8 },
    { label: 'Support', key: 'statSupport', default: 24 }
  ];

  return (
    <div className="overflow-hidden">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center bg-[#020617] overflow-hidden py-24 md:py-32">
        {/* Animated background grid */}
        <div 
          className="absolute inset-0 opacity-[0.15] pointer-events-none" 
          style={{ 
            backgroundImage: 'linear-gradient(#1E88E5 1px, transparent 1px), linear-gradient(90deg, #1E88E5 1px, transparent 1px)', 
            backgroundSize: '80px 80px',
            maskImage: 'radial-gradient(ellipse at center, black, transparent 80%)'
          }} 
        />
        
        {/* Interactive Background Particles */}
        <div className="absolute inset-0 opacity-40">
          <InteractiveDotGrid />
        </div>

        {/* Scanning Line Effect */}
        <motion.div 
          animate={{ top: ['-10%', '110%'] }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          className="absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#1E88E5]/30 to-transparent z-10 pointer-events-none"
        />

        {/* Industrial Technical Accents */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden select-none">
          {/* Corner Brackets */}
          <div className="absolute top-10 left-10 w-20 h-20 border-t-2 border-l-2 border-white/10 rounded-tl-3xl opacity-30" />
          <div className="absolute top-10 right-10 w-20 h-20 border-t-2 border-r-2 border-white/10 rounded-tr-3xl opacity-30" />
          <div className="absolute bottom-10 left-10 w-20 h-20 border-b-2 border-l-2 border-white/10 rounded-bl-3xl opacity-30" />
          <div className="absolute bottom-10 right-10 w-20 h-20 border-b-2 border-r-2 border-white/10 rounded-br-3xl opacity-30" />
          
          {/* Coordinates / Data Labels */}
          <div className="absolute top-12 left-32 hidden md:flex flex-col gap-1">
            <span className="text-[8px] font-black tracking-[0.4em] text-[#1E88E5] opacity-40 uppercase">System Active</span>
            <span className="text-[10px] font-mono text-white/20">40.7128° N, 74.0060° W</span>
          </div>
          <div className="absolute bottom-12 right-32 hidden md:flex flex-col items-end gap-1">
            <span className="text-[8px] font-black tracking-[0.4em] text-[#1E88E5] opacity-40 uppercase">Encryption Tier</span>
            <span className="text-[10px] font-mono text-white/20">IND-01-VX77</span>
          </div>
        </div>
        
        {/* Glow Effects */}
        <div className="absolute top-1/4 -right-20 w-[600px] h-[600px] bg-[#1E88E5] rounded-full blur-[180px] opacity-[0.08] pointer-events-none" />
        <div className="absolute bottom-1/4 -left-20 w-[500px] h-[500px] bg-[#00b4d8] rounded-full blur-[160px] opacity-[0.08] pointer-events-none" />

        <div className="relative z-20 text-center px-6 max-w-6xl mx-auto flex flex-col items-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, ease: "circOut" }}
            className="mb-4 md:mb-6"
          >
            <div className="inline-flex items-center gap-4 px-5 py-1.5 bg-white/5 border border-white/10 rounded-full mb-5 md:mb-8 backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-[#1E88E5] animate-pulse" />
              <span className="text-[9px] md:text-[10px] font-black tracking-[0.4em] text-white/50 uppercase">Sri Lanka's Engineering Matrix</span>
            </div>
            <img 
              src={logoAsset} 
              alt="NEXON Logo" 
              loading="eager"
              decoding="async"
              className="w-48 md:w-80 mx-auto drop-shadow-[0_0_60px_rgba(30,136,229,0.5)] transition-transform duration-700 hover:scale-[1.02]"
            />
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-4xl md:text-7xl font-black text-white mb-4 md:mb-6 tracking-tighter leading-[0.9] uppercase italic"
          >
            {siteSettings.heroTitle.split(' ').map((word: string, i: number) => (
              <span 
                key={i} 
                className={`inline-block pr-2 ${['engineering', 'innovation', 'precision'].includes(word.toLowerCase()) 
                  ? 'text-transparent bg-clip-text bg-gradient-to-r from-white via-[#00b4d8] to-[#1E88E5] drop-shadow-[0_0_20px_rgba(30,136,229,0.3)]' 
                  : ''
                }`}
              >
                {word}
              </span>
            ))}
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.7 }}
            className="text-[#E1F5FE]/60 text-base md:text-lg max-w-3xl mx-auto mb-8 md:mb-10 leading-relaxed font-medium italic"
          >
            {siteSettings.heroSubtitle}
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="flex flex-col sm:flex-row gap-4 md:gap-8 justify-center items-center"
          >
            <MagneticButton>
              <Link 
                to="/services"
                className="group relative px-10 py-5 bg-[#1E88E5] text-white rounded-full font-black text-sm uppercase tracking-widest overflow-hidden transition-all hover:scale-105 hover:shadow-[0_20px_50px_rgba(30,136,229,0.4)] block text-center min-w-[220px]"
              >
                <span className="relative z-10">Explore Matrix</span>
                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
              </Link>
            </MagneticButton>
            <MagneticButton>
              <Link 
                to="/contact"
                className="px-10 py-5 bg-white/5 backdrop-blur-md border border-white/20 hover:border-[#1E88E5] text-white rounded-full font-black text-sm uppercase tracking-widest transition-all hover:bg-white/10 block text-center min-w-[220px]"
              >
                Get Consultation
              </Link>
            </MagneticButton>
          </motion.div>
        </div>

        <motion.div 
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 opacity-50 z-20 cursor-pointer hover:opacity-100 transition-opacity"
          onClick={() => window.scrollTo({ top: window.innerHeight - 80, behavior: 'smooth' })}
        >
          <div className="flex flex-col items-center gap-2">
            <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em]">Scroll</span>
            <ChevronDown size={32} className="text-[#1E88E5]" />
          </div>
        </motion.div>
      </section>

      {/* Stats Bar */}
      <section className="relative -mt-16 z-20 px-6">
        <div className="max-w-6xl mx-auto bg-[#0A2463]/90 backdrop-blur-2xl rounded-[40px] p-10 md:p-16 shadow-[0_40px_100px_rgba(0,0,0,0.4)] border border-white/10 grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
          {staticStats.map((stat, idx) => (
            <motion.div 
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
            >
              <div className="text-4xl md:text-6xl font-black text-[#00b4d8] mb-2">
                <CountUp end={siteSettings[stat.key] || stat.default} suffix="+" />
              </div>
              <div className="text-[#E1F5FE]/50 text-xs md:text-sm font-bold uppercase tracking-[0.2em]">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* AI Planner Section */}
      <section className="relative z-30 py-20 px-6 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-royal/5 rounded-full blur-[140px] pointer-events-none" />
        <AIPlannerWidget />
      </section>

      {/* Services Scroller */}
      {siteSettings?.featureServices !== false && (
        <section className="py-40 bg-[#020917] relative overflow-hidden">
          {/* Section Hardware Decor */}
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          <div className="absolute top-10 left-10 text-[8px] font-mono text-white/10 tracking-[0.5em] vertical-text">EXPERTISE_MODULE_01</div>

          <div className="max-w-7xl mx-auto px-8 mb-24">
            <div className="flex flex-col md:flex-row items-end justify-between gap-12">
              <div className="max-w-3xl">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-[1px] bg-royal" />
                  <span className="text-royal font-black tracking-[0.4em] uppercase text-xs">Technical Capability Matrix</span>
                </div>
                <h2 className="text-5xl md:text-8xl font-black text-white leading-[0.85] tracking-tighter uppercase italic pr-4">Industrial <br />Successors</h2>
              </div>
              <div className="md:max-w-md pb-4">
                <p className="text-[#E1F5FE]/40 text-lg font-medium leading-relaxed italic border-l-2 border-royal/30 pl-8">
                  From high-voltage factory systems to precision mechanical automation, we provide the backbone for Sri Lankan industry.
                </p>
              </div>
            </div>
          </div>

          <div className="relative cursor-grab active:cursor-grabbing">
            <TestimonialSlider reviews={services.map(s => ({
              id: s.id,
              author: s.title,
              content: s.description,
              rating: '5',
              icon: s.icon,
              imageUrl: s.imageUrl,
              isService: true
            }))} />
          </div>
        </section>
      )}

      {/* About Preview */}
      <section className="py-40 bg-[#F8F9FA] relative overflow-hidden">
        {/* Subtle background tech pattern */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#0A2463 2px, transparent 2px)', backgroundSize: '30px 30px' }} />
        
        <div className="max-w-7xl mx-auto px-8 grid lg:grid-cols-2 gap-24 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-12"
          >
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <span className="text-[#1E88E5] font-black tracking-[0.4em] uppercase text-[10px]">Registry: NXN-SRL-01</span>
                <div className="flex-grow h-[1px] bg-[#0A2463]/10" />
              </div>
              <h2 className="text-6xl md:text-8xl font-black leading-[0.85] tracking-tighter text-[#131313] uppercase italic">{siteSettings.aboutTitle}</h2>
            </div>
            
            <p className="text-xl text-[#0A2463]/70 font-medium leading-relaxed italic pr-12">
              {siteSettings.aboutText}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 pt-8">
              {[
                { label: 'Certified Engineers', sub: 'ISO 9001 Standards' },
                { label: '24/7 Emergency Support', sub: 'Matrix-wide deployment' },
                { label: 'Quality Assurance', sub: 'Zero-fault tolerance' },
                { label: 'Innovative Solutions', sub: 'Custom Matrix design' }
              ].map((item) => (
                <div key={item.label} className="flex items-start gap-4 group">
                  <div className="w-14 h-14 bg-[#1E88E5]/5 rounded-2xl flex items-center justify-center text-[#1E88E5] border border-[#1E88E5]/10 group-hover:bg-[#1E88E5] group-hover:text-white group-hover:scale-110 transition-all duration-500 shadow-sm">
                    <CheckCircle2 size={28} />
                  </div>
                  <div>
                    <span className="font-black text-lg block text-[#0A2463] uppercase tracking-tighter leading-none mb-1">{item.label}</span>
                    <span className="text-[10px] font-black text-[#1E88E5] uppercase tracking-widest opacity-60">{item.sub}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-6">
              <MagneticButton>
                <Link 
                  to="/about"
                  className="inline-flex items-center gap-6 px-12 py-6 bg-[#0A2463] text-white rounded-full font-black text-sm uppercase tracking-[0.2em] hover:bg-[#1E88E5] transition-all shadow-xl hover:shadow-[#1E88E5]/20 group"
                >
                  Decode Our Mission <ArrowRight size={22} className="group-hover:translate-x-2 transition-transform" />
                </Link>
              </MagneticButton>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
            {/* Geometric Framing */}
            <div className="absolute -top-10 -right-10 w-40 h-40 border-t-4 border-r-4 border-[#1E88E5]/20 rounded-tr-[80px]" />
            <div className="absolute -bottom-10 -left-10 w-40 h-40 border-b-4 border-l-4 border-[#1E88E5]/20 rounded-bl-[80px]" />
            
            <div className="absolute -inset-8 bg-royal/10 rounded-[80px] blur-3xl pointer-events-none" />
            <img 
              src={new URL('../assets/images/about-preview.png', import.meta.url).href} 
              alt="Nexon Engineering Team" 
              loading="lazy"
              decoding="async"
              className="relative z-10 w-full aspect-[4/5] object-cover rounded-[60px] shadow-[0_50px_100px_rgba(0,0,0,0.15)] border-[16px] border-white"
            />
            
            {/* Tech Badge */}
            <div className="absolute -bottom-6 -right-6 z-20 bg-royal text-white p-8 rounded-[40px] shadow-2xl border-4 border-white">
              <div className="text-4xl font-black italic tracking-tighter leading-none mb-1">08+</div>
              <div className="text-[10px] font-black uppercase tracking-widest opacity-80 whitespace-nowrap">Years of Dominance</div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Testimonials Ticker */}
      {siteSettings?.featureReviews !== false && (
        <section className="py-40 bg-[#020917] overflow-hidden relative">
          {/* Background Grid */}
          <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '100px 100px' }} />
          
          <div className="text-center mb-24 px-6 relative z-10">
            <span className="text-royal font-black tracking-[0.5em] uppercase text-xs mb-6 block">Industry Validation</span>
            <h2 className="text-5xl md:text-8xl font-black text-white tracking-tighter uppercase italic drop-shadow-[0_0_30px_rgba(30,136,229,0.2)]">Trusted by<br/>Operations Leaders</h2>
          </div>
          
          <div className="relative group/slider cursor-grab active:cursor-grabbing z-10">
            <TestimonialSlider reviews={reviews} />
          </div>

          {/* Review Submission Section */}
          <div className="max-w-5xl mx-auto px-6 mt-32 relative z-10">
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[60px] p-10 md:p-20 text-center relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 p-12 opacity-5 scale-150 group-hover:rotate-12 transition-transform duration-1000">
                <Quote size={180} />
              </div>
              
              <div className="relative z-10">
                <div className="w-20 h-20 bg-royal/20 rounded-3xl flex items-center justify-center text-royal mx-auto mb-10 border border-royal/30">
                  <MessageSquare size={40} />
                </div>
                <h3 className="text-4xl md:text-6xl font-black text-white mb-8 italic tracking-tighter uppercase">Submit Your Verdict</h3>
                <p className="text-[#E1F5FE]/50 text-xl mb-16 max-w-2xl mx-auto italic font-medium leading-relaxed">
                  Join our network of precision partners. Share your project experience with the Nexon Matrix.
                </p>
                
                <form onSubmit={handleReviewSubmit} className="space-y-8 max-w-3xl mx-auto">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="relative group">
                      <input 
                        type="text" 
                        required
                        value={newReview.author}
                        onChange={(e) => setNewReview({...newReview, author: e.target.value})}
                        placeholder="Project Signature (Your Name)"
                        className="w-full bg-white/5 border border-white/10 rounded-3xl px-8 py-6 text-white focus:border-royal outline-none transition-all placeholder:text-white/20 font-bold tracking-tight"
                      />
                      <div className="absolute right-6 top-1/2 -translate-y-1/2 text-white/10 group-focus-within:text-royal transition-colors">
                        <Send size={20} />
                      </div>
                    </div>
                    
                    <div className="bg-[#0F172A]/50 border border-white/10 rounded-3xl px-8 py-6 flex items-center justify-between group-within:border-royal transition-all">
                      <span className="text-white/30 text-[10px] font-black uppercase tracking-[0.2em]">Efficiency Rating:</span>
                      <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setNewReview({...newReview, rating: star})}
                            onMouseEnter={() => setHoverRating(star)}
                            onMouseLeave={() => setHoverRating(0)}
                            className="transition-all transform hover:scale-150 focus:outline-none"
                          >
                            <Star 
                              size={26} 
                              fill={(hoverRating || newReview.rating) >= star ? "#1E88E5" : "none"} 
                              className={(hoverRating || newReview.rating) >= star ? "text-[#1E88E5] drop-shadow-[0_0_10px_rgba(30,136,229,0.5)]" : "text-white/10"} 
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div className="relative">
                    <textarea 
                      placeholder="Enter detailed technical feedback..."
                      required
                      value={newReview.content}
                      onChange={(e) => setNewReview({...newReview, content: e.target.value})}
                      rows={5}
                      className="w-full bg-white/5 border border-white/10 rounded-[40px] px-10 py-8 text-white focus:border-royal outline-none transition-all resize-none font-medium text-lg italic placeholder:text-white/15"
                    ></textarea>
                  </div>

                  <MagneticButton>
                    <button 
                      type="submit"
                      disabled={isSubmittingReview}
                      className="w-full py-10 bg-[#1E88E5] hover:bg-[#2196F3] text-white font-black uppercase tracking-[0.8em] text-[12px] rounded-full flex items-center justify-center gap-8 transition-all duration-1000 border border-white/20 shadow-[0_0_60px_rgba(30,136,229,0.3)] hover:shadow-[0_0_90px_rgba(30,136,229,0.6)] disabled:opacity-50 group overflow-hidden relative"
                    >
                      <span className="relative z-10 flex items-center gap-4">
                        {isSubmittingReview ? 'INITIALIZING UPLOAD...' : 'SUBMIT VERDICT'}
                      </span>
                      
                      {isSubmittingReview ? (
                        <Loader2 className="animate-spin relative z-10 text-white" size={20} />
                      ) : (
                        <Zap size={20} className="relative z-10 text-white group-hover:scale-150 group-hover:rotate-12 transition-all duration-500" />
                      )}

                      {/* Gloss & Flare Overlays */}
                      <div className="absolute inset-0 bg-gradient-to-tr from-white/5 via-transparent to-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out" />
                      
                      {/* Corner Accents - Technical Detail */}
                      <div className="absolute top-2 left-2 w-1.5 h-1.5 border-t border-l border-white/40" />
                      <div className="absolute top-2 right-2 w-1.5 h-1.5 border-t border-r border-white/40" />
                      <div className="absolute bottom-2 left-2 w-1.5 h-1.5 border-b border-l border-white/40" />
                      <div className="absolute bottom-2 right-2 w-1.5 h-1.5 border-b border-r border-white/40" />
                    </button>
                  </MagneticButton>
                </form>
              </div>
            </motion.div>
          </div>
        </section>
      )}

      {/* Final CTA */}
      <section className="py-56 bg-[#131313] relative overflow-hidden text-center">
        {/* Animated matrix background */}
        <div className="absolute inset-0 opacity-5" style={{ 
          backgroundImage: 'radial-gradient(#1E88E5 1px, transparent 1px)', 
          backgroundSize: '40px 40px' 
        }} />
        
        {/* Large Decorative Text */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[20vw] font-black text-white opacity-[0.02] uppercase tracking-tighter italic whitespace-nowrap select-none">
          NEXON MATRIX E
        </div>

        <div className="max-w-5xl mx-auto px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="space-y-12"
          >
            <div className="inline-block p-4 bg-royal/10 border border-royal/20 rounded-3xl mb-4">
              <Zap className="text-royal" size={40} />
            </div>
            <h2 className="text-6xl md:text-9xl font-black text-white leading-[0.8] tracking-tighter uppercase italic pr-4">
              Initiate your <br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00b4d8] to-royal">Project Matrix</span>
            </h2>
            <p className="text-white/40 text-xl md:text-2xl max-w-2xl mx-auto font-medium italic border-b border-royal/20 pb-12">
              Deploy Nexon expertise to your facility today. Consult with our Matrix engineers for an industrial-grade solution.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-8 justify-center items-center pt-8">
              <MagneticButton>
                <Link 
                  to="/contact"
                  className="px-16 py-7 bg-royal text-white rounded-full font-black text-xl uppercase tracking-[0.2em] hover:scale-110 transition-all shadow-[0_30px_60px_rgba(30,136,229,0.3)] group overflow-hidden relative block"
                >
                  <span className="relative z-10 text-center">Establish Contact</span>
                  <div className="absolute inset-0 bg-white/20 translate-y-[100%] group-hover:translate-y-0 transition-transform duration-500" />
                </Link>
              </MagneticButton>
              
              <Link 
                to="/services"
                className="px-16 py-7 bg-white/5 backdrop-blur-xl border border-white/10 hover:border-royal text-white rounded-full font-black text-xl uppercase tracking-[0.2em] transition-all hover:bg-white/10"
              >
                Inspect Services
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Submission Notification */}
      <AnimatePresence>
        {notification?.active && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] px-8 py-4 bg-emerald-500 text-white rounded-3xl shadow-2xl font-black text-sm uppercase tracking-widest flex items-center gap-4"
          >
            <CheckCircle2 size={24} />
            {notification.message}
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
