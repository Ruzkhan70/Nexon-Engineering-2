import { useEffect, useState, useRef, useMemo } from 'react';
import { motion, useScroll, useTransform, useInView, AnimatePresence, useMotionValue, useAnimationFrame } from 'motion/react';
import { ChevronDown, ArrowRight, Zap, Cpu, Wrench as Tool, Briefcase, Sun, CheckCircle2, Star, Quote, MessageSquare, Send, Factory, Package, LifeBuoy, Construction, Wind, Camera, Settings, Bot, Shield, Activity, Boxes, Video, Hammer, HardHat, UtilityPole, Component, Drill, Anvil, PlugZap, Bolt, Sparkles, Loader2, AlertTriangle } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import InteractiveDotGrid from '../components/InteractiveDotGrid';
import CountUp from '../components/CountUp';
import MagneticButton from '../components/MagneticButton';
import logoAsset from '../assets/images/regenerated_image_1778416443277.png';
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

// --- Testimonial Slider Components ---

function TestimonialSlider({ reviews }: { reviews: any[] }) {
  const x = useMotionValue(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // Default fallback reviews if none in db
  const displayReviews = reviews;

  // Reduced duplicates (4) for better performance while maintaining smooth infinite transition
  const duplicates = displayReviews.length === 0 ? 0 : 4;
  
  const repeatedReviews = useMemo(() => {
    return Array.from({ length: duplicates }).flatMap(() => [...displayReviews, { isSpacer: true }]);
  }, [displayReviews, duplicates]);

  useEffect(() => {
    if (containerRef.current && duplicates > 0 && displayReviews.length > 0) {
      const children = containerRef.current.children;
      const itemsPerSet = displayReviews.length + 1;
      
      if (children.length >= itemsPerSet * 2) {
        const firstItem = children[0] as HTMLElement;
        const secondSetFirstItem = children[itemsPerSet] as HTMLElement;
        
        const calculatedWidth = secondSetFirstItem.offsetLeft - firstItem.offsetLeft;
        if (calculatedWidth > 0) {
          setContainerWidth(calculatedWidth);
          // Start centered to allow dragging both directions
          x.set(-calculatedWidth * 1.5);
        }
      }
    }
  }, [displayReviews, duplicates, x]);

  useAnimationFrame((_, delta) => {
    if (containerWidth <= 0 || isDragging) return;

    let currentX = x.get();
    
    // Auto-scroll logic (only when not interacting)
    if (!isHovered) {
      const moveBy = delta * 0.08; // Slightly slower for smoother perceived motion
      currentX -= moveBy;
    }

    // Continuous wrapping logic
    // We stay between -containerWidth * 3 and -containerWidth
    const minX = -containerWidth * 3;
    const maxX = -containerWidth;
    const range = containerWidth;

    if (currentX < minX) {
      currentX += range;
    } else if (currentX > maxX) {
      currentX -= range;
    }

    x.set(currentX);
  });

  const onDragEnd = () => {
    setIsDragging(false);
  };

  if (displayReviews.length === 0) return null;

  return (
    <div 
      className="flex py-10 overflow-visible touch-none"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <motion.div
        drag="x"
        dragConstraints={{ left: -containerWidth * 4, right: 0 }}
        dragElastic={0.05}
        dragMomentum={true}
        onDragStart={() => setIsDragging(true)}
        onDragEnd={onDragEnd}
        ref={containerRef}
        style={{ x, willChange: 'transform' }}
        className="flex gap-8 whitespace-nowrap cursor-grab active:cursor-grabbing p-4 select-none"
      >
        {repeatedReviews.map((item: any, idx) => (
          item.isSpacer ? (
            <div key={idx} className="w-[80px] md:w-[200px] flex-shrink-0 flex items-center justify-center gap-4 md:gap-8 opacity-40">
              <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
              <div className="w-2 h-2 rounded-full bg-[#1E88E5]/40 animate-pulse" />
              <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
            </div>
          ) : (
            <div 
              key={idx} 
              className="w-[280px] md:w-[450px] bg-white/5 backdrop-blur-xl p-8 md:p-12 rounded-[48px] md:rounded-[60px] border border-white/10 whitespace-normal shadow-2xl flex-shrink-0 relative overflow-hidden group transition-all hover:bg-white/10 hover:border-[#1E88E5]/30"
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
                        draggable="false"
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 select-none" 
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

export default function Home() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);
  const [siteSettings, setSiteSettings] = useState<any>({
    heroTitle: 'Engineering innovation with precision',
    heroSubtitle: 'Real repair maintenance and automation solutions delivered with unparalleled excellence across Sri Lanka',
    aboutTitle: 'Built on Trust.',
    aboutText: 'Nexon Engineering is a trusted provider of industrial repair, maintenance, and automation services. We specialize in machine servicing, industrial electrical work, and custom engineering solutions designed to improve productivity and reliability.'
  });
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiResult, setAiResult] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleAnalyze = async () => {
    if (!aiPrompt.trim()) return;
    setIsAnalyzing(true);
    setAiResult(null);
    try {
      const response = await fetch('/api/analyze-project', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: aiPrompt }),
      });
      const data = await response.json();
      setAiResult(data);
    } catch (error) {
      console.error('Analysis failed:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleDeploy = () => {
    navigate('/contact', { state: { 
      requirement: aiPrompt,
      diagnosis: {
        analysis: aiResult.analysis,
        urgency: aiResult.priority,
        recommendedService: aiResult.steps[0], 
        steps: aiResult.steps
      }
    }});
  };
  const [services, setServices] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
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
    }, (error) => {
      console.warn("Global settings restricted, using default matrix configuration.");
    });

    // Fetch Services - Simplified query to avoid index requirements
    const unsubServices = onSnapshot(collection(db, 'services'), (snap) => {
      const data = snap.docs
        .map(doc => ({ id: doc.id, ...doc.data() } as any))
        .filter(s => s.enabled !== false)
        .sort((a, b) => (a.order || 0) - (b.order || 0));
      setServices(data);
    }, (error) => {
      console.warn("Services data restricted, utilizing core capability fallbacks.");
    });

    // Fetch Projects - Added for Home visibility
    const unsubProjects = onSnapshot(collection(db, 'projects'), (snap) => {
      const data = snap.docs
        .map(doc => ({ id: doc.id, ...doc.data() } as any))
        .filter(p => p.enabled !== false);
      setProjects(data.slice(0, 3)); // Show top 3 featured projects
    }, (error) => {
      console.warn("Projects data restricted.");
    });

    // Fetch Clients - Added for Home visibility
    const unsubClients = onSnapshot(collection(db, 'clients'), (snap) => {
      const data = snap.docs
        .map(doc => ({ id: doc.id, ...doc.data() } as any))
        .filter(c => c.enabled !== false)
        .sort((a, b) => (a.order || 0) - (b.order || 0));
      setClients(data);
    }, (error) => {
      console.warn("Clients data restricted.");
    });

    // Fetch Reviews - Simplified query
    const unsubReviews = onSnapshot(collection(db, 'reviews'), (snap) => {
      const data = snap.docs
        .map(doc => ({ id: doc.id, ...doc.data() } as any))
        .filter(r => r.approved === true)
        .sort((a, b) => {
          const t1 = new Date(a.timestamp).getTime();
          const t2 = new Date(b.timestamp).getTime();
          return t2 - t1;
        });
      setReviews(data);
    }, (error) => {
      console.warn("Review database restricted, showing verified partner testimonials.");
    });

    return () => {
      unsubSettings();
      unsubServices();
      unsubProjects();
      unsubClients();
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
              <span className="text-[9px] md:text-[10px] font-black tracking-[0.4em] text-white/50 uppercase">Sri Lanka's Premier Engineering Partner</span>
            </div>
            <img 
              src={logoAsset} 
              alt="NEXON Logo" 
              loading="eager"
              decoding="async"
              draggable="false"
              className="w-48 md:w-80 mx-auto drop-shadow-[0_0_60px_rgba(30,136,229,0.5)] transition-transform duration-700 hover:scale-[1.02] select-none"
            />
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-4xl md:text-7xl font-black text-white mb-10 md:mb-16 tracking-tighter leading-[0.9] uppercase italic"
          >
            {(siteSettings?.heroTitle || "Engineering innovation with precision").split(' ').map((word: string, i: number) => (
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
            {siteSettings?.heroSubtitle || "Real repair maintenance and automation solutions delivered with unparalleled excellence across Sri Lanka"}
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
                <span className="relative z-10">Our Services</span>
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
        <div className="max-w-6xl mx-auto bg-[#0A2463]/90 backdrop-blur-2xl rounded-[32px] md:rounded-[40px] p-8 md:p-16 shadow-[0_40px_100px_rgba(0,0,0,0.4)] border border-white/10 grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 text-center">
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

      {/* AI Project Matrix Section */}
      <section className="py-32 bg-[#020617] relative">
        <div className="max-w-4xl mx-auto px-6">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-[#0A1629] border border-white/10 rounded-[40px] md:rounded-[60px] p-8 md:p-16 relative overflow-hidden shadow-[0_40px_100px_rgba(0,0,0,0.5)]"
          >
            <div className="absolute top-0 right-0 p-12 opacity-[0.03] pointer-events-none">
              <Sparkles size={200} className="text-[#1E88E5]" />
            </div>

            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-2xl bg-[#1E88E5]/20 flex items-center justify-center text-[#1E88E5]">
                  <Bot size={20} />
                </div>
                <span className="text-[#1E88E5] font-black text-[10px] uppercase tracking-[0.4em]">AI Project Matrix</span>
              </div>

              <h2 className="text-4xl md:text-6xl font-black text-white mb-12 tracking-tighter leading-none italic uppercase">
                Describe your goal. <br />
                <span className="text-white/40 italic italic-outline-white">We'll build the route.</span>
              </h2>

              <div className="relative mb-12 group">
                <input 
                  type="text" 
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAnalyze()}
                  placeholder="e.g. My factory conveyor belt is stalling during high heat..."
                  className="w-full bg-white/5 border border-white/10 rounded-3xl md:rounded-[32px] px-8 py-6 md:py-8 text-white text-lg focus:outline-none focus:border-[#1E88E5] transition-all pr-40 placeholder:text-white/20 font-medium"
                />
                <button 
                  onClick={handleAnalyze}
                  disabled={isAnalyzing || !aiPrompt.trim()}
                  className="absolute right-3 top-3 bottom-3 px-8 bg-[#1E88E5] text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-3 hover:bg-[#2196F3] transition-all disabled:opacity-50"
                >
                  {isAnalyzing ? <Loader2 size={18} className="animate-spin" /> : <Zap size={18} />}
                  <span>{isAnalyzing ? 'Analyzing' : 'Analyze'}</span>
                </button>
              </div>

              <AnimatePresence mode="wait">
                {aiResult && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="grid md:grid-cols-2 gap-12 pt-8 border-t border-white/10 overflow-hidden"
                  >
                    <div className="space-y-8">
                      <div>
                        <div className="flex items-center gap-2 mb-4">
                          <CheckCircle2 size={16} className="text-emerald-500" />
                          <span className="text-emerald-500 font-black text-[10px] uppercase tracking-widest">Nexon Analysis</span>
                        </div>
                        <p className="text-white/80 text-xl italic font-medium leading-relaxed">
                          "{aiResult.analysis}"
                        </p>
                      </div>

                      <div className="inline-flex items-center gap-4 px-6 py-3 bg-white/5 rounded-2xl border border-white/10">
                        <div className={`w-3 h-3 rounded-full ${aiResult.priority === 'High' ? 'bg-rose-500 animate-pulse' : aiResult.priority === 'Medium' ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                        <span className="text-white/40 text-[10px] font-black uppercase tracking-widest">Priority:</span>
                        <span className="text-white font-black text-sm uppercase">{aiResult.priority}</span>
                      </div>
                    </div>

                    <div className="flex flex-col">
                      <span className="text-white/30 font-black text-[10px] uppercase tracking-widest mb-6 block">Recommended Matrix Steps</span>
                      <div className="space-y-4">
                        {aiResult.steps.map((step: string, i: number) => (
                          <motion.div 
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.1 }}
                            key={i} 
                            className="flex items-center gap-5 p-5 bg-white/5 rounded-2xl border border-white/5 hover:border-[#1E88E5]/30 transition-colors group"
                          >
                            <div className="w-8 h-8 rounded-lg bg-[#1E88E5] flex items-center justify-center text-white font-black text-xs shrink-0 shadow-lg group-hover:scale-110 transition-transform">
                              {i + 1}
                            </div>
                            <span className="text-white/70 text-sm font-bold leading-tight group-hover:text-white transition-colors">{step}</span>
                          </motion.div>
                        ))}
                      </div>
                      <button 
                        onClick={handleDeploy}
                        className="flex items-center gap-4 text-[#1E88E5] font-black uppercase text-xs tracking-[0.3em] mt-10 hover:gap-8 transition-all group w-full justify-end cursor-pointer"
                      >
                        DEPLOY THIS PLAN <ArrowRight size={20} />
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
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
                  <span className="text-royal font-black tracking-[0.4em] uppercase text-xs">Excellence in Engineering</span>
                </div>
                <h2 className="text-5xl md:text-8xl font-black text-white leading-[0.85] tracking-tighter uppercase italic pr-4">Industrial <br />Solutions</h2>
              </div>
              <div className="md:max-w-md pb-4">
                <p className="text-[#E1F5FE]/40 text-lg font-medium leading-relaxed italic border-l-2 border-royal/30 pl-8">
                  From high-voltage factory systems to precision mechanical automation, we provide the backbone for Sri Lankan industry.
                </p>
              </div>
            </div>
          </div>

          <div className="relative">
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
        
        <div className="max-w-7xl mx-auto px-8 grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
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
              <h2 className="text-5xl md:text-8xl font-black leading-[0.85] tracking-tighter text-[#131313] uppercase italic">{siteSettings?.aboutTitle || "Built on Trust."}</h2>
            </div>
            
            <p className="text-lg md:text-xl text-[#0A2463]/70 font-medium leading-relaxed italic pr-0 md:pr-12">
              {siteSettings?.aboutText || "Nexon Engineering is a trusted provider of industrial repair, maintenance, and automation services."}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 pt-8">
              {[
                { label: 'Certified Engineers', sub: 'Standard Compliance' },
                { label: '24/7 Emergency Support', sub: 'Island-wide deployment' },
                { label: 'Quality Assurance', sub: 'Zero-fault tolerance' },
                { label: 'Innovative Solutions', sub: 'Custom engineering design' }
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
            className="relative mt-20 lg:mt-0"
          >
            {/* Geometric Framing */}
            <div className="absolute -top-6 md:-top-10 -right-6 md:-right-10 w-24 md:w-40 h-24 md:h-40 border-t-4 border-r-4 border-[#1E88E5]/20 rounded-tr-[40px] md:rounded-tr-[80px]" />
            <div className="absolute -bottom-6 md:-bottom-10 -left-6 md:-left-10 w-24 md:w-40 h-24 md:h-40 border-b-4 border-l-4 border-[#1E88E5]/20 rounded-bl-[40px] md:rounded-bl-[80px]" />
            
            <div className="absolute -inset-4 md:-inset-8 bg-royal/10 rounded-[40px] md:rounded-[80px] blur-2xl md:blur-3xl pointer-events-none" />
            <img 
              src={new URL('../assets/images/about-preview.png', import.meta.url).href} 
              alt="Nexon Engineering Team" 
              loading="lazy"
              decoding="async"
              draggable="false"
              className="relative z-10 w-full aspect-[4/5] object-cover rounded-[40px] md:rounded-[60px] shadow-[0_50px_100px_rgba(0,0,0,0.15)] border-[8px] md:border-[16px] border-white select-none"
            />
            
            {/* Tech Badge */}
            <div className="absolute -bottom-4 md:-bottom-6 -right-4 md:-right-6 z-20 bg-royal text-white p-6 md:p-8 rounded-[30px] md:rounded-[40px] shadow-2xl border-4 border-white">
              <div className="text-3xl md:text-4xl font-black italic tracking-tighter leading-none mb-1">08+</div>
              <div className="text-[9px] md:text-[10px] font-black uppercase tracking-widest opacity-80 whitespace-nowrap">Years of Dominance</div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Featured Projects Section */}
      {siteSettings?.featureProjects !== false && projects.length > 0 && (
        <section className="py-40 bg-[#020617] relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-8">
            <div className="flex flex-col md:flex-row items-end justify-between mb-24 gap-8">
              <div>
                <span className="text-royal font-black tracking-[0.5em] uppercase text-[10px] mb-4 block">Proven Performance</span>
                <h2 className="text-5xl md:text-8xl font-black text-white tracking-tighter leading-[0.85] uppercase italic">Strategic <br /><span className="text-royal">Portfolio</span></h2>
              </div>
              <Link to="/projects" className="group flex items-center gap-4 text-white font-black uppercase text-xs tracking-widest hover:text-royal transition-colors pb-4">
                View All Projects <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {projects.map((project, idx) => (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  onClick={() => navigate?.(`/projects/${project.id}`)}
                  className="group relative h-[500px] rounded-[40px] overflow-hidden border border-white/5 cursor-pointer"
                >
                  <img 
                    src={project.imageUrl || project.image} 
                    alt={project.title} 
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 opacity-40"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                  <div className="absolute inset-0 p-10 flex flex-col justify-end">
                    <span className="text-royal font-black text-[10px] uppercase tracking-[0.3em] mb-4">{project.category}</span>
                    <h3 className="text-3xl font-black text-white uppercase italic tracking-tighter mb-4">{project.title}</h3>
                    <p className="text-white/40 text-sm font-medium line-clamp-2 transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                      {project.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Clients Section */}
      {siteSettings?.featureClients !== false && clients.length > 0 && (
        <section className="py-32 bg-[#0A0F1E] border-t border-white/5 overflow-hidden">
          <div className="max-w-7xl mx-auto px-6 mb-16">
            <div className="flex flex-col md:flex-row justify-between items-end gap-8">
              <div>
                <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter">Trusted by Industry Leaders</h2>
                <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.4em] mt-2">The Global NEXON Ecosystem</p>
              </div>
            </div>
          </div>
          
          <div className="relative flex overflow-x-hidden">
            <div className="animate-marquee whitespace-nowrap flex items-center">
              {[...clients, ...clients].map((client, i) => (
                <div key={i} className="mx-12 grayscale opacity-30 hover:grayscale-0 hover:opacity-100 transition-all duration-700">
                  <img 
                    src={client.logoUrl} 
                    alt={client.name} 
                    className="h-12 md:h-16 w-auto object-contain"
                  />
                </div>
              ))}
            </div>
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
            <h2 className="text-5xl md:text-9xl font-black text-white leading-[0.8] tracking-tighter uppercase italic pr-4">
              Initiate your <br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00b4d8] to-royal">Engineering Project</span>
            </h2>
            <p className="text-white/40 text-xl md:text-2xl max-w-2xl mx-auto font-medium italic border-b border-royal/20 pb-12">
              Deploy Nexon expertise to your facility today. Consult with our engineers for an industrial-grade solution.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-8 justify-center items-center pt-12">
              <MagneticButton>
                <Link 
                  to="/contact"
                  className="px-16 py-7 bg-royal text-white rounded-full font-black text-xl uppercase tracking-[0.2em] hover:scale-110 transition-all shadow-[0_30px_60px_rgba(30,136,229,0.3)] group overflow-hidden relative block"
                >
                  <span className="relative z-10 text-center">Establish Contact</span>
                  <div className="absolute inset-0 bg-white/20 translate-y-[100%] group-hover:translate-y-0 transition-transform duration-500" />
                </Link>
              </MagneticButton>
              
              <MagneticButton>
                <Link 
                  to="/services"
                  className="px-16 py-7 bg-white/5 backdrop-blur-xl border border-white/10 hover:border-royal text-white rounded-full font-black text-xl uppercase tracking-[0.2em] transition-all hover:bg-white/10 block"
                >
                  Inspect Services
                </Link>
              </MagneticButton>
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
