import React, { useState, useEffect, FormEvent, useLayoutEffect, useRef } from 'react';
import { motion, AnimatePresence, Reorder } from 'motion/react';
import { 
  Settings as SettingsIcon, Plus, Trash2, Edit2, LogOut, ChevronRight, BarChart3, 
  Users, Briefcase, Mail, CheckCircle2, Eye, EyeOff, Layout, Layers, Menu, Search,
  Zap, Cpu, Boxes, Wrench as Tool, Factory, Sun, Video, Wind, Hammer, HardHat, UtilityPole, Component, Drill, Anvil, PlugZap, Bolt, Package, LifeBuoy, Construction, Camera, Bot,
  Image as ImageIcon, Save, X, PlusCircle, MessageSquare, Calendar, Sparkles,
  Lock, Shield, User as UserIcon, Star, ShieldAlert, ShieldCheck, Fingerprint,
  Hash, Link,
  Smartphone, Laptop, Tablet, Activity, TrendingUp, AlertCircle, Clock, GripVertical, MapPin
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, BarChart, Bar, Legend
} from 'recharts';
import { db, auth, handleFirestoreError, OperationType } from '../lib/firebase';
import { 
  onAuthStateChanged, 
  signOut,
  signInWithEmailAndPassword,
  updateEmail,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider
} from 'firebase/auth';
import emailjs from '@emailjs/browser';
import { 
  generateServiceDescription, 
  suggestIcon, 
  generateProjectCaseStudy, 
  generateProjectChallenges, 
  generateProjectSolutions 
} from '../services/geminiService';
import { suggestProjectCategory } from '../services/aiService';
import { 
  collection, 
  getDocs, 
  getDoc,
  doc, 
  setDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy,
  onSnapshot,
  where,
  writeBatch,
  limit
} from 'firebase/firestore';

export default function Admin() {
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(sessionStorage.getItem('nexon_session_id'));
  const [adminEmail, setAdminEmail] = useState('nexonengineering.service@gmail.com');
  const [notification, setNotification] = useState<{message: string, type: 'info' | 'success' | 'error', active: boolean}>({
    message: '',
    type: 'info',
    active: false
  });

  const logActivity = async (action: string, targetId: string) => {
    try {
      await addDoc(collection(db, 'activity_logs'), {
        adminEmail: auth.currentUser?.email,
        action,
        targetId,
        timestamp: Date.now()
      });
    } catch (e) {
      console.error("Log failed:", e);
    }
  };

  const [showTimeoutModal, setShowTimeoutModal] = useState(false);
  const [countdown, setCountdown] = useState(10);
  const idleTimerRef = useRef<any>(null);
  const countdownTimerRef = useRef<any>(null);

  const [confirmModal, setConfirmModal] = useState<{
    active: boolean;
    message: string;
    onConfirm: () => void;
    title?: string;
    danger?: boolean;
    confirmText?: string;
  }>({
    active: false,
    message: '',
    onConfirm: () => {},
  });

  const askPermission = (
    message: string, 
    onConfirm: () => void, 
    title = "System Authorization", 
    danger = true,
    confirmText = "Execute"
  ) => {
    setConfirmModal({
      active: true,
      message,
      onConfirm,
      title,
      danger,
      confirmText
    });
  };

  const startInactivityTimer = () => {
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    idleTimerRef.current = setTimeout(() => {
      if (user && isAdmin) {
        setShowTimeoutModal(true);
        startCountdown();
      }
    }, 120000); // 2 Minutes
  };

  const startCountdown = () => {
    setCountdown(10);
    if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
    countdownTimerRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(countdownTimerRef.current);
          handleLogout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const stayLoggedIn = () => {
    setShowTimeoutModal(false);
    if (countdownTimerRef.current) {
      clearInterval(countdownTimerRef.current);
      countdownTimerRef.current = null;
    }
    startInactivityTimer();
  };

  const notify = (message: string, type: 'info' | 'success' | 'error' = 'info') => {
    setNotification({ message, type, active: true });
    setTimeout(() => {
      setNotification(prev => ({ ...prev, active: false }));
    }, 4000);
  };

  const getDeviceInfo = () => {
    const ua = navigator.userAgent;
    if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) return 'Tablet';
    if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) return 'Mobile';
    return 'Desktop';
  };

  const createSession = async (authUser: any) => {
    try {
      const sessionId = Math.random().toString(36).substring(2, 15);
      sessionStorage.setItem('nexon_session_id', sessionId);
      
      const deviceType = getDeviceInfo();
      const sessionData = {
        userId: authUser.uid,
        email: authUser.email || 'unknown',
        userAgent: navigator.userAgent,
        deviceType: deviceType,
        lastActive: new Date().toISOString(),
        loginTime: new Date().toISOString(),
        deviceId: `Nexon-${deviceType}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`
      };
      
      console.log("Recording session...", sessionId);
      await setDoc(doc(db, 'sessions', sessionId), sessionData);
      setCurrentSessionId(sessionId);
    } catch (err) {
      console.warn("Session recording failed (Security Rules probably blocking):", err);
      // We don't throw here so the user can still log in even if monitoring fails
      notify('Monitoring system offline: Check Firebase Security Rules', 'error');
    }
  };

  const logFailedAttempt = async (attemptEmail: string, attemptPass: string) => {
    try {
      await addDoc(collection(db, 'failed_logins'), {
        email: attemptEmail,
        password: attemptPass, // User requested this for tracking
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent
      });
    } catch (err) {
       console.error("Failed to log attempt:", err);
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    // Default to admin email if not provided for "Security Key Override" feel
    const loginEmail = email || 'ruzkaanjawahir07@gmail.com';
    
    if (!loginEmail || !password) {
      setLoginError('Identity and security key required');
      return notify('Identity and security key required', 'error');
    }
    
    try {
      setLoading(true);
      notify('Decrypting credentials...', 'info');
      const result = await signInWithEmailAndPassword(auth, loginEmail, password);
      if (result.user) {
        await createSession(result.user);
      }
      notify('Authentication sequence complete. Welcome.', 'success');
    } catch (error: any) {
      console.error(error);
      await logFailedAttempt(loginEmail, password);
      if (error.code === 'auth/operation-not-allowed') {
        const msg = 'CRITICAL: Email/Password login is DISABLED in Firebase Console. Enable it in Auth > Sign-in method.';
        setLoginError(msg);
        notify(msg, 'error');
      } else if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        const msg = 'Invalid identity or security key. Access denied.';
        setLoginError(msg);
        notify(msg, 'error');
      } else {
        const msg = 'Security validation failed: ' + error.message;
        setLoginError(msg);
        notify(msg, 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      const sid = currentSessionId || sessionStorage.getItem('nexon_session_id');
      if (sid) {
        await deleteDoc(doc(db, 'sessions', sid)).catch(() => {});
        sessionStorage.removeItem('nexon_session_id');
        setCurrentSessionId(null);
      }
      setShowTimeoutModal(false);
      if (countdownTimerRef.current) {
        clearInterval(countdownTimerRef.current);
        countdownTimerRef.current = null;
      }
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      await signOut(auth);
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      if (u) {
        setCurrentSessionId(sessionStorage.getItem('nexon_session_id'));
      } else {
        setCurrentSessionId(null);
        sessionStorage.removeItem('nexon_session_id');
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Basic check for admin email
  const isAdmin = user && [
    adminEmail.toLowerCase(), 
    'ruzkaanjawahir07@gmail.com', 
    'nexonengineering.service@gmail.com'
  ].includes(user.email.toLowerCase());

  // Inactivity Listeners
  useEffect(() => {
    if (user && isAdmin) {
      const events = ['mousemove', 'keydown', 'mousedown', 'touchstart', 'scroll'];
      const reset = () => {
        // Use a functional check or just rely on the effect dep if we must, 
        // but we need to ensure we don't clear the countdown timer in cleanup
        // when the modal is shown.
        startInactivityTimer();
      };

      const throttledReset = () => {
        // Only reset if modal is not showing
        if (showTimeoutModal) return;
        reset();
      };

      events.forEach(event => window.addEventListener(event, throttledReset));
      
      if (!showTimeoutModal) {
        startInactivityTimer();
      }

      return () => {
        events.forEach(event => window.removeEventListener(event, throttledReset));
        if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      };
    }
  }, [user, isAdmin, showTimeoutModal]);

  // Session Watchdog
  useEffect(() => {
    if (!user || !currentSessionId) return;
    const sid = currentSessionId;

    // Termination detection
    const unsub = onSnapshot(doc(db, 'sessions', sid), (snap) => {
      if (!snap.exists()) {
        console.log("SESSION REVOKED: Executing emergency lockout.");
        sessionStorage.removeItem('nexon_session_id');
        setCurrentSessionId(null);
        signOut(auth).then(() => {
          // Use a timeout to allow the navigation to clear up
          setTimeout(() => {
            window.location.href = '/admin';
          }, 100);
        });
      }
    }, (error) => {
      // Permission-denied is a strong signal the session document was deleted
      if (error.code === 'permission-denied') {
        sessionStorage.removeItem('nexon_session_id');
        setCurrentSessionId(null);
        signOut(auth).then(() => {
          window.location.href = '/admin';
        });
      }
    });

    // Heartbeat logic
    const heartbeat = setInterval(() => {
      try {
        updateDoc(doc(db, 'sessions', sid), {
          lastActive: new Date().toISOString()
        });
      } catch (err) {
        console.error("Heartbeat failed:", err);
      }
    }, 60000); // Once per minute

    return () => {
      unsub();
      clearInterval(heartbeat);
    };
  }, [user, currentSessionId]);

  // Auto-Session creation for admins without session ID (e.g. new tab)
  useEffect(() => {
    if (user && isAdmin && !currentSessionId && !loading) {
      const sid = sessionStorage.getItem('nexon_session_id');
      if (!sid) {
        createSession(user);
      } else {
        setCurrentSessionId(sid);
      }
    }
  }, [user, isAdmin, currentSessionId, loading]);

  // Stats / Counters
  const [counts, setCounts] = useState({
    services: 0,
    projects: 0,
    clients: 0,
    messages: 0,
    messages_new: 0,
    messages_in_progress: 0,
    messages_completed: 0,
    visitors: 0,
    reviews: 0,
    approvedReviews: 0
  });

  useEffect(() => {
    if (!user) return;
    
    // We also allow the original email if the manual one isn't set yet
    const allowedEmails = [adminEmail, 'ruzkaanjawahir07@gmail.com', 'nexonengineering.service@gmail.com'];
    
    const unsubMessages = onSnapshot(collection(db, 'messages'), (snap) => {
      const data = snap.docs.map(doc => doc.data());
      setCounts(prev => ({ 
        ...prev, 
        messages: snap.size,
        messages_new: data.filter(m => m.status === 'new' || !m.status).length,
        messages_in_progress: data.filter(m => m.status === 'in_progress').length,
        messages_completed: data.filter(m => m.status === 'completed').length
      }));
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'messages'));

    const unsubReviewsCount = onSnapshot(query(collection(db, 'reviews'), where('approved', '==', false)), (snap) => {
      setCounts(prev => ({ ...prev, reviews: snap.size }));
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'reviews (count)'));

    const unsubApprovedReviewsCount = onSnapshot(query(collection(db, 'reviews'), where('approved', '==', true)), (snap) => {
      setCounts(prev => ({ ...prev, approvedReviews: snap.size }));
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'reviews (approved count)'));

    const unsubServices = onSnapshot(collection(db, 'services'), (snap) => {
      setCounts(prev => ({ ...prev, services: snap.size }));
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'services'));

    const unsubProjects = onSnapshot(collection(db, 'projects'), (snap) => {
      setCounts(prev => ({ ...prev, projects: snap.size }));
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'projects'));

    const unsubClients = onSnapshot(collection(db, 'clients'), (snap) => {
      setCounts(prev => ({ ...prev, clients: snap.size }));
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'clients'));

    const unsubSettings = onSnapshot(doc(db, 'settings', 'global'), (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        setCounts(prev => ({ ...prev, visitors: data.visitorCount || 0 }));
        if (data.adminEmail) {
          setAdminEmail(data.adminEmail);
        }
      }
    }, (error) => handleFirestoreError(error, OperationType.GET, 'settings/global'));

    return () => {
      unsubMessages();
      unsubReviewsCount();
      unsubApprovedReviewsCount();
      unsubServices();
      unsubProjects();
      unsubClients();
      unsubSettings();
    };
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#020917] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#1E88E5] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#020917] px-6 relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(30,136,229,0.1),transparent_50%)]" />
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10 w-full max-w-md bg-white/5 backdrop-blur-3xl p-12 rounded-[48px] border border-white/10 shadow-2xl text-center"
        >
          <img 
            src="https://raw.githubusercontent.com/NexonEngineering/nexonengineering.github.io/refs/heads/main/Gemini_Generated_Image_hmrljuhmrljuhmrl-Photoroom.png" 
            className="w-40 mx-auto mb-10 drop-shadow-2xl"
            alt="Nexon"
          />
          <h2 className="text-4xl font-black text-white mb-2 uppercase tracking-tighter">Nexon Command</h2>
          <p className="text-white/40 mb-12 font-black uppercase tracking-[0.3em] text-[10px]">Secure Cloud Management</p>
          
          <div className="space-y-6 text-left">
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-[#1E88E5]">Identity Email</label>
              <input 
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white placeholder-white/10 outline-none focus:border-[#1E88E5] transition-all font-bold"
                placeholder="admin@nexon.com"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-[#1E88E5]">Security Key</label>
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (loginError) setLoginError('');
                  }}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white placeholder-white/10 outline-none focus:border-[#1E88E5] transition-all font-bold pr-12"
                  placeholder="••••••••"
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {loginError && (
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-rose-500/10 border border-rose-500/30 p-4 rounded-2xl flex items-start gap-4"
              >
                <ShieldAlert size={18} className="text-rose-500 shrink-0 mt-0.5" />
                <div className="text-[10px] font-black text-rose-500 uppercase tracking-widest leading-relaxed">
                  {loginError}
                </div>
              </motion.div>
            )}
            <button 
              onClick={handleEmailLogin}
              className="w-full py-4 bg-white/5 border border-white/10 text-white/40 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-white/10 hover:text-white transition-all transition-all"
            >
              AUTHENTICATE VIA SYSTEM KEY
            </button>
          </div>
          
          <p className="mt-8 text-white/20 text-[10px] font-bold uppercase tracking-widest">
            Restricted access for authorized personnel only.
          </p>
        </motion.div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#020917] px-6 text-center">
        <div className="max-w-md space-y-8">
           <X size={80} className="text-rose-500 mx-auto" />
           <h1 className="text-4xl font-black text-white uppercase italic">Access Denied</h1>
           <p className="text-white/40 font-medium">Your account ({user.email}) is not registered as a system administrator. Please contact IT support.</p>
           <button 
            onClick={handleLogout}
            className="px-10 py-4 bg-white/10 text-white rounded-full font-black text-xs uppercase tracking-widest hover:bg-white/20 transition-all"
           >
             Return to base
           </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020917] flex">
      {/* Sidebar */}
      <motion.aside 
        initial={false}
        animate={{ width: isSidebarCollapsed ? 80 : 280 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="bg-[#0B1426] text-white p-4 flex flex-col justify-between fixed h-screen z-50 border-r border-white/5 overflow-hidden"
      >
        <div className="flex flex-col h-full">
          {/* Burger Toggle & Logo */}
          <div className="flex flex-col gap-4 mb-6">
            <button 
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 text-white/40 hover:text-white transition-all self-center"
            >
              <Menu size={18} />
            </button>

            <motion.div 
              animate={{ 
                opacity: isSidebarCollapsed ? 0 : 1,
                scale: isSidebarCollapsed ? 0.5 : 1,
                display: isSidebarCollapsed ? 'none' : 'flex'
              }}
              className="flex items-center gap-3 px-2 overflow-hidden whitespace-nowrap"
            >
               <div className="w-10 h-10 bg-white rounded-xl p-1.5 flex items-center justify-center shrink-0 shadow-[0_0_20px_rgba(255,255,255,0.05)]">
                   <img src={new URL('../assets/images/regenerated_image_1778416445055.png', import.meta.url).href} alt="logo" className="w-full h-full object-contain" />
               </div>
               <div className="overflow-hidden">
                  <div className="font-black text-[10px] uppercase tracking-[0.2em] truncate">NEXON HUB</div>
                  <div className="text-[9px] text-[#00b4d8] font-bold truncate">SYSTEM ACTIVE</div>
               </div>
            </motion.div>
          </div>

          <nav className="space-y-0.5 flex-grow overflow-y-auto pr-2 custom-scrollbar min-h-0">
            {[
              { id: 'dashboard', icon: BarChart3, label: 'Dashboard' },
              { id: 'site', icon: Layout, label: 'Site Content' },
              { id: 'services', icon: SettingsIcon, label: 'Services' },
              { id: 'projects', icon: Briefcase, label: 'Portfolio' },
              { id: 'clients', icon: Users, label: 'Clients' },
              { id: 'sectors', icon: Boxes, label: 'Sectors' },
              { id: 'coverage', icon: MapPin, label: 'Coverage' },
              { id: 'reviews', icon: MessageSquare, label: 'Reviews' },
              { id: 'messages', icon: Mail, label: 'Messages' },
              { id: 'activity', icon: Activity, label: 'Audit Logs' },
              { id: 'security', icon: Shield, label: 'Security' },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl font-black text-[11px] uppercase tracking-widest transition-all group ${
                  activeTab === item.id 
                    ? 'bg-gradient-to-r from-[#1E88E5] to-[#00b4d8] text-white shadow-[0_10px_25px_rgba(30,136,229,0.25)]' 
                    : 'hover:bg-white/5 text-white/40 hover:text-white'
                } ${isSidebarCollapsed ? 'justify-center p-0' : ''}`}
                title={isSidebarCollapsed ? item.label : ''}
              >
                <div className="shrink-0 w-8 h-8 flex items-center justify-center">
                  <item.icon size={16} />
                </div>
                {!isSidebarCollapsed && (
                  <motion.span 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="truncate"
                  >
                    {item.label}
                  </motion.span>
                )}
              </button>
            ))}
          </nav>
          
          <div className="pt-3 mt-auto border-t border-white/5">
            <button 
              onClick={handleLogout}
              className={`w-full flex items-center gap-3 p-3 bg-white/5 rounded-xl text-white/30 hover:text-rose-400 hover:bg-rose-400/10 transition-all font-black text-[10px] uppercase tracking-widest ${isSidebarCollapsed ? 'justify-center p-0 h-14' : ''}`}
              title={isSidebarCollapsed ? "Logout" : ""}
            >
              <div className="shrink-0 w-8 h-8 flex items-center justify-center">
                <LogOut size={16} />
              </div>
              {!isSidebarCollapsed && <span className="truncate">LOGOUT SESSION</span>}
            </button>
          </div>
        </div>
      </motion.aside>

      {/* Main Content Area */}
      <motion.main 
        animate={{ marginLeft: isSidebarCollapsed ? 80 : 280 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="flex-grow p-12 overflow-y-auto min-h-screen"
      >
        <header className="flex justify-between items-center mb-16 bg-[#0B1426] p-8 rounded-[40px] border border-white/5 shadow-2xl">
           <div>
             <h2 className="text-3xl font-black text-white uppercase tracking-tight">{activeTab}</h2>
             <p className="text-white/40 text-sm font-medium">Manage your digital infrastructure with precision.</p>
           </div>
           <div className="flex items-center gap-6">
              <div className="flex items-center gap-4 pr-6 border-r border-white/5">
                 <div className="text-right">
                    <div className="font-black text-sm text-white">{user?.displayName || 'Admin User'}</div>
                    <div className="text-[10px] text-[#00b4d8] font-bold uppercase">{user?.email}</div>
                 </div>
                 {user?.photoURL ? (
                    <img src={user.photoURL} className="w-14 h-14 rounded-2xl border-2 border-white/10" alt="profile" />
                 ) : (
                    <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center font-black text-white border border-white/10">
                      {user?.email[0].toUpperCase()}
                    </div>
                 )}
              </div>
           </div>

           <div className="flex items-center gap-4">
              <button 
                onClick={() => window.open('/', '_blank')}
                className="flex items-center gap-2 px-6 py-4 bg-white/5 text-white/40 rounded-2xl hover:bg-white/10 hover:text-white transition-all font-black text-[10px] uppercase tracking-widest border border-white/5 group"
              >
                <Eye size={16} className="group-hover:text-[#1E88E5] transition-colors" />
                Live Site
              </button>
              <button 
                onClick={() => setActiveTab('security')}
                className={`p-4 bg-white/5 text-white/40 rounded-2xl hover:bg-white/10 hover:text-white transition-all ${activeTab === 'security' ? 'text-[#1E88E5] bg-[#1E88E5]/10' : ''}`}
              >
                <SettingsIcon size={20} />
              </button>
           </div>
        </header>

        <div className="relative">
          <AnimatePresence mode="wait">
            <motion.main
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
              {activeTab === 'dashboard' && <DashboardComponent counts={counts} setActiveTab={setActiveTab} currentSessionId={currentSessionId} logActivity={logActivity} askPermission={askPermission} />}
              {activeTab === 'site' && <SiteContentEditor ImageDropzone={ImageDropzone} notify={notify} askPermission={askPermission} />}
              {activeTab === 'services' && <NestedManager mainType="services" catType="serviceCategories" ImageDropzone={ImageDropzone} logActivity={logActivity} notify={notify} askPermission={askPermission} />}
              {activeTab === 'projects' && <NestedManager mainType="projects" catType="projectCategories" ImageDropzone={ImageDropzone} logActivity={logActivity} notify={notify} askPermission={askPermission} />}
              {activeTab === 'clients' && <GenericManager type="clients" ImageDropzone={ImageDropzone} logActivity={logActivity} notify={notify} askPermission={askPermission} />}
              {activeTab === 'sectors' && <GenericManager type="sectors" ImageDropzone={ImageDropzone} logActivity={logActivity} notify={notify} askPermission={askPermission} />}
              {activeTab === 'coverage' && <GenericManager type="coverageAreas" ImageDropzone={ImageDropzone} logActivity={logActivity} notify={notify} askPermission={askPermission} />}
              {activeTab === 'reviews' && <ReviewsManager notify={notify} logActivity={logActivity} askPermission={askPermission} />}
              {activeTab === 'messages' && <MessagesList notify={notify} logActivity={logActivity} askPermission={askPermission} />}
              {activeTab === 'activity' && <ActivityLogsList logActivity={logActivity} notify={notify} askPermission={askPermission} />}
              {activeTab === 'security' && <AdminSecurity notify={notify} askPermission={askPermission} />}
            </motion.main>
          </AnimatePresence>
        </div>
      </motion.main>

      {/* Custom Confirmation Modal */}
      <AnimatePresence>
        {confirmModal.active && (
          <div className="fixed inset-0 z-[400] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setConfirmModal(prev => ({ ...prev, active: false }))}
              className="absolute inset-0 bg-[#020917]/90 backdrop-blur-3xl"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              data-lenis-prevent
              className="relative w-full max-w-md bg-[#0B1426] border border-white/10 rounded-[64px] p-12 text-center shadow-[0_40px_100px_rgba(0,0,0,1)]"
            >
              <div className={`w-28 h-28 ${confirmModal.danger ? 'bg-rose-500/10 text-rose-500 border-rose-500/20' : 'bg-[#1E88E5]/10 text-[#1E88E5] border-[#1E88E5]/20'} rounded-full flex items-center justify-center mx-auto mb-10 border shadow-2xl`}>
                <Fingerprint size={56} className={confirmModal.danger ? 'animate-pulse' : ''} />
              </div>
              
              <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter mb-4">{confirmModal.title}</h2>
              <p className="text-white/40 font-bold text-sm uppercase tracking-widest leading-relaxed mb-12">
                {confirmModal.message}
              </p>

              <div className="grid grid-cols-2 gap-4">
                <button 
                   onClick={() => setConfirmModal(prev => ({ ...prev, active: false }))}
                   className="py-6 bg-white/5 text-white/40 rounded-3xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-white/10 hover:text-white transition-all order-2"
                >
                  Abort
                </button>
                <button 
                  onClick={() => {
                    confirmModal.onConfirm();
                    setConfirmModal(prev => ({ ...prev, active: false }));
                  }}
                  className={`py-6 ${confirmModal.danger ? 'bg-rose-500 shadow-rose-500/20' : 'bg-gradient-to-r from-[#1E88E5] to-[#00b4d8] shadow-[#1E88E5]/20'} text-white rounded-3xl font-black text-xs uppercase tracking-[0.2em] shadow-2xl hover:scale-[1.05] active:scale-95 transition-all order-1`}
                >
                  {confirmModal.confirmText}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Real-time Notification System */}
      <AnimatePresence>
        {notification.active && (
          <motion.div 
            initial={{ opacity: 0, y: 50, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: 50, x: '-50%' }}
            className={`fixed bottom-12 left-1/2 z-[200] px-8 py-4 rounded-3xl shadow-2xl border backdrop-blur-xl flex items-center gap-4 min-w-[320px] ${
              notification.type === 'success' ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400' :
              notification.type === 'error' ? 'bg-rose-500/20 border-rose-500/50 text-rose-400' :
              'bg-[#1E88E5]/20 border-[#1E88E5]/50 text-[#1E88E5]'
            }`}
          >
            <div className={`p-2 rounded-xl bg-white/10`}>
              {notification.type === 'success' && <CheckCircle2 size={18} />}
              {notification.type === 'error' && <X size={18} />}
              {notification.type === 'info' && <SettingsIcon size={18} />}
            </div>
            <div className="flex-grow">
              <div className="text-[10px] font-black uppercase tracking-widest opacity-50 mb-0.5">
                {notification.type === 'info' ? 'System Status' : notification.type === 'success' ? 'Operation Success' : 'System Error'}
              </div>
              <div className="text-sm font-black tracking-tight">{notification.message}</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Inactivity Timeout Modal */}
      <AnimatePresence>
        {showTimeoutModal && (
          <div className="fixed inset-0 z-[300] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-[#020917]/80 backdrop-blur-2xl"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              data-lenis-prevent
              className="relative w-full max-w-md bg-[#0B1426] border border-white/10 rounded-[48px] p-12 text-center shadow-[0_40px_100px_rgba(0,0,0,0.8)]"
            >
              <div className="w-24 h-24 bg-rose-500/10 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-10 border border-rose-500/20">
                <Shield size={48} className="animate-pulse" />
              </div>
              
              <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter mb-4">Security Timeout</h2>
              <p className="text-white/40 font-bold text-sm uppercase tracking-widest leading-relaxed mb-8">
                Your terminal has been inactive for <span className="text-white">2 minutes</span>. System will auto-lock in:
              </p>

              <div className="text-8xl font-black text-[#1E88E5] mb-12 tabular-nums">
                {countdown}
              </div>

              <div className="space-y-4">
                <button 
                  onClick={stayLoggedIn}
                  className="w-full py-6 bg-gradient-to-r from-[#1E88E5] to-[#00b4d8] text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl hover:scale-[1.02] transition-all"
                >
                  Confirm Presence
                </button>
                <button 
                   onClick={handleLogout}
                   className="w-full py-6 bg-white/5 text-white/40 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-white/10 hover:text-white transition-all"
                >
                  Forced Logout
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

// --- Image Dropzone Component ---
function ImageDropzone({ value, onChange, label, className = "" }: { value: string, onChange: (val: string) => void, label: string, className?: string }) {
  const [dragging, setDragging] = useState(false);

  const compressImage = (dataUrl: string, maxWidth: number = 1200, quality: number = 0.7): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = dataUrl;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = (maxWidth / width) * height;
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
    });
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = async (event) => {
        if (event.target?.result) {
          const compressed = await compressImage(event.target.result as string);
          onChange(compressed);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (event) => {
        if (event.target?.result) {
          const compressed = await compressImage(event.target.result as string);
          onChange(compressed);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <label className="text-[10px] font-black tracking-widest text-white/40 uppercase">{label}</label>
      <div 
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className={`relative group bg-white/5 border-2 border-dashed rounded-[32px] p-8 text-center transition-all ${
          dragging ? 'border-[#1E88E5] bg-[#1E88E5]/10' : 'border-white/10 hover:border-white/20'
        }`}
      >
        {value ? (
          <div className="relative group">
             <img src={value} className="w-full aspect-video object-cover rounded-2xl mx-auto mb-4 bg-black/20" alt="Preview" />
             <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-2xl gap-4">
                <button 
                  type="button"
                  onClick={() => onChange('')}
                  className="p-3 bg-rose-500 text-white rounded-full hover:scale-110 transition-transform shadow-xl"
                >
                  <Trash2 size={18} />
                </button>
                <label className="p-3 bg-[#1E88E5] text-white rounded-full hover:scale-110 transition-transform cursor-pointer shadow-xl">
                  <Edit2 size={18} />
                  <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                </label>
             </div>
          </div>
        ) : (
          <label className="py-12 cursor-pointer block">
            <ImageIcon size={48} className={`mx-auto mb-4 transition-colors ${dragging ? 'text-[#1E88E5]' : 'text-white/10'}`} />
            <p className="text-xs text-white/40 font-bold uppercase tracking-widest">
              DRAG & DROP OR <span className="text-[#1E88E5]">BROWSE</span>
            </p>
            <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
          </label>
        )}
        <input 
          type="text" 
          placeholder="OR PASTE IMAGE URL"
          value={(value && value.startsWith('data:')) ? 'Local Image Loaded' : (value || '')}
          onChange={(e) => onChange(e.target.value)}
          className="w-full mt-4 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs text-white placeholder-white/20 focus:outline-none focus:border-[#1E88E5]"
          disabled={value && value.startsWith('data:')}
        />
      </div>
    </div>
  );
}

// --- Gallery Manager Component ---
function GalleryManager({ images = [], onChange }: { images: any[], onChange: (images: any[]) => void }) {
  const addImage = (url: string) => {
    onChange([...images, { url, caption: '' }]);
  };

  const removeImage = (idx: number) => {
    onChange(images.filter((_, i) => i !== idx));
  };

  const updateCaption = (idx: number, caption: string) => {
    const newImages = [...images];
    newImages[idx].caption = caption;
    onChange(newImages);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <label className="text-[10px] font-black tracking-widest text-white/40 uppercase">Project Asset Gallery</label>
        <span className="text-[9px] font-bold text-white/20 uppercase tracking-widest">{images.length} Assets Attached</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {images.map((img, idx) => (
          <div key={idx} className="relative group bg-white/5 rounded-[32px] overflow-hidden border border-white/10 transition-all p-4">
             <div className="aspect-video rounded-2xl overflow-hidden mb-4 relative">
                <img src={img.url} alt={`Project ${idx}`} className="w-full h-full object-cover" />
                <button 
                  type="button"
                  onClick={() => removeImage(idx)}
                  className="absolute top-4 right-4 w-10 h-10 bg-rose-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:scale-110 shadow-xl"
                >
                  <Trash2 size={16} />
                </button>
             </div>
             <input 
               type="text"
               value={img.caption || ''}
               onChange={(e) => updateCaption(idx, e.target.value)}
               placeholder="Enter caption..."
               className="w-full bg-navy/50 border border-white/5 rounded-xl p-3 text-[10px] font-black text-white/60 focus:border-[#1E88E5] outline-none transition-all uppercase tracking-widest"
             />
          </div>
        ))}
        <div className="relative group bg-white/5 border-2 border-dashed border-white/10 rounded-[32px] p-8 text-center transition-all hover:border-[#1E88E5] hover:bg-[#1E88E5]/5 min-h-[150px] flex flex-col items-center justify-center">
           <input 
             type="file" 
             accept="image/*" 
             onChange={async (e) => {
               const file = e.target.files?.[0];
               if (file) {
                 const reader = new FileReader();
                 reader.onload = async (event) => {
                   if (event.target?.result) {
                     const img = new Image();
                     img.src = event.target.result as string;
                     img.onload = () => {
                       const canvas = document.createElement('canvas');
                       let width = img.width; let height = img.height;
                       if (width > 1200) { height = (1200 / width) * height; width = 1200; }
                       canvas.width = width; canvas.height = height;
                       const ctx = canvas.getContext('2d');
                       ctx?.drawImage(img, 0, 0, width, height);
                       addImage(canvas.toDataURL('image/jpeg', 0.7));
                     };
                   }
                 };
                 reader.readAsDataURL(file);
               }
             }}
             className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
           />
           <PlusCircle size={32} className="text-[#1E88E5] mb-4 group-hover:scale-110 transition-transform" />
           <p className="text-[10px] font-black uppercase tracking-widest text-[#1E88E5]">Attach New Vector</p>
        </div>
      </div>
    </div>
  );
}

// --- Activity Logging System ---
function ActivityLogsList({ logActivity, notify, askPermission }: { logActivity: any, notify: any, askPermission: any }) {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [clearing, setClearing] = useState(false);

  useEffect(() => {
    const q = query(collection(db, 'activity_logs'), orderBy('timestamp', 'desc'), limit(50));
    const unsub = onSnapshot(q, (snap) => {
      setLogs(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'activity_logs'));
    return () => unsub();
  }, []);

  const handleClearLogs = async () => {
    askPermission(
      "PERMANENT DATA PURGE: This will erase all system activity logs from the database. This action is irreversible. Proceed with total audit trail elimination?",
      async () => {
        try {
          setClearing(true);
          notify('Initializing Audit Trail Purge...', 'info');
          
          const q = query(collection(db, 'activity_logs'));
          const snap = await getDocs(q);
          
          if (snap.empty) {
            notify('Audit trail is already empty.', 'info');
            return;
          }

          const batch = writeBatch(db);
          snap.docs.forEach((doc) => {
            batch.delete(doc.ref);
          });
          
          await batch.commit();
          await logActivity('LOGS_PURGED', 'SYSTEM');
          notify('Audit trail successfully eliminated.', 'success');
        } catch (error: any) {
          console.error("Purge failed:", error);
          notify('Purge sequence failed: ' + error.message, 'error');
        } finally {
          setClearing(false);
        }
      },
      "Emergency Purge Protocol"
    );
  };

  if (loading) return <div className="text-center py-20 opacity-20 font-black uppercase tracking-widest text-xs">Accessing audit trail...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end mb-10">
        <div>
          <h2 className="text-4xl font-black text-white italic uppercase tracking-tighter">AUDIT TRAIL</h2>
          <p className="text-[10px] font-black uppercase tracking-widest text-white/20">System-wide behavioral logs</p>
        </div>
        
        {logs.length > 0 && (
          <button 
            onClick={handleClearLogs}
            disabled={clearing}
            className="flex items-center gap-2 px-8 py-4 bg-rose-500/10 border border-rose-500/20 text-rose-500 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-rose-500 hover:text-white transition-all disabled:opacity-50"
          >
            <Trash2 size={14} />
            {clearing ? 'PURGING...' : 'Clear Audit Trail'}
          </button>
        )}
      </div>

      <div className="bg-[#0B1426] rounded-[56px] border border-white/5 overflow-hidden shadow-2xl">
        <table className="w-full text-left">
          <thead className="bg-white/5 border-b border-white/5">
            <tr>
              <th className="px-10 py-8 text-[10px] font-black uppercase tracking-widest text-white/40">Timestamp</th>
              <th className="px-10 py-8 text-[10px] font-black uppercase tracking-widest text-white/40">Operator</th>
              <th className="px-10 py-8 text-[10px] font-black uppercase tracking-widest text-white/40">Action</th>
              <th className="px-10 py-8 text-[10px] font-black uppercase tracking-widest text-white/40 text-right">Identifier</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {logs.map((log) => (
              <tr key={log.id} className="group hover:bg-white/5 transition-all">
                <td className="px-10 py-8">
                  <div className="text-white font-mono text-xs">{new Date(log.timestamp).toLocaleString()}</div>
                </td>
                <td className="px-10 py-8">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-[#1E88E5]/20 rounded-lg flex items-center justify-center text-[#1E88E5] text-[10px] font-black uppercase">
                       {log.adminEmail?.charAt(0)}
                    </div>
                    <div className="text-white/60 font-black text-[10px] uppercase tracking-widest">{log.adminEmail}</div>
                  </div>
                </td>
                <td className="px-10 py-8">
                  <span className={`px-4 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest ${
                    log.action.includes('CREATE') ? 'bg-emerald-500/10 text-emerald-500' :
                    log.action.includes('DELETE') ? 'bg-rose-500/10 text-rose-500' :
                    'bg-[#1E88E5]/10 text-[#1E88E5]'
                  }`}>
                    {log.action}
                  </span>
                </td>
                <td className="px-10 py-8 text-right">
                  <div className="text-[10px] font-mono text-white/20 uppercase tracking-widest">#{log.targetId?.slice(0, 12)}</div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {logs.length === 0 && (
          <div className="py-40 text-center opacity-10 font-black uppercase tracking-[0.5em] text-xs">
             No activity detected in recent cycles
          </div>
        )}
      </div>
    </div>
  );
}

// --- Dashboard Component ---
function DashboardComponent({ counts, setActiveTab, currentSessionId, logActivity, askPermission }: { counts: any, setActiveTab: (tab: string) => void, currentSessionId: string | null, logActivity: any, askPermission: any }) {
  const [recentLogs, setRecentLogs] = useState<any[]>([]);
  const [activeSessions, setActiveSessions] = useState<any[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    // Generate trending analytics based on real global totals
    const generateChartData = () => {
      const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      const totalEngagements = (counts.messages || 0) + (counts.approvedReviews || 0);
      
      const data = days.map((day, i) => {
        // Create a trend that generally grows or fluctuates around the total
        const dayFactor = (i + 1) / 7;
        const baseVisitors = Math.floor((counts.visitors || 0) / 7);
        const baseEngage = Math.floor(totalEngagements / 7);
        
        return {
          name: day,
          visitors: Math.max(0, baseVisitors + Math.floor(Math.sin(i) * 20) + Math.floor(Math.random() * 15)),
          engagements: Math.max(0, baseEngage + Math.floor(Math.cos(i) * 5) + Math.floor(Math.random() * 3)),
        };
      });
      setChartData(data);
    };
    generateChartData();
  }, [counts.visitors, counts.messages, counts.approvedReviews]);

  useEffect(() => {
    const unsub = onSnapshot(query(collection(db, 'failed_logins'), limit(4), orderBy('timestamp', 'desc')), (snap) => {
      setRecentLogs(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'failed_logins (dashboard)'));

    const unsubSessions = onSnapshot(query(collection(db, 'sessions'), limit(20), orderBy('lastActive', 'desc')), (snap) => {
      setActiveSessions(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'sessions (dashboard)'));

    return () => {
      unsub();
      unsubSessions();
    };
  }, []);

  const revokeSession = async (id: string) => {
    askPermission(
      'TERMINATE SESSION? This individual will be immediately locked out of the command center.',
      async () => {
        try {
          await deleteDoc(doc(db, 'sessions', id));
        } catch (err) {
          console.error("Revoke failed:", err);
          handleFirestoreError(err, OperationType.DELETE, `sessions/${id}`);
        }
      },
      "Session Termination"
    );
  };

  return (
    <div className="space-y-12">
      <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-8 gap-6">
        {[
          { label: 'Services', value: counts.services, icon: SettingsIcon, color: 'text-royal', bg: 'bg-royal/10' },
          { label: 'Projects', value: counts.projects, icon: Briefcase, color: 'text-matrix', bg: 'bg-matrix/10' },
          { label: 'New Jobs', value: counts.messages_new, icon: AlertCircle, color: 'text-rose-500', bg: 'bg-rose-500/10' },
          { label: 'In Flux', value: counts.messages_in_progress, icon: Activity, color: 'text-amber-500', bg: 'bg-amber-500/10' },
          { label: 'Completed', value: counts.messages_completed, icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
          { label: 'Reviews', value: counts.reviews, icon: MessageSquare, color: 'text-orange-400', bg: 'bg-orange-400/10' },
          { label: 'Visitors', value: counts.visitors, icon: Eye, color: 'text-purple-400', bg: 'bg-purple-400/10' },
          { label: 'Approved', value: counts.approvedReviews || 0, icon: Star, color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
        ].map((stat, i) => (
          <div key={i} className="bg-[#0B1426] p-6 rounded-[32px] shadow-xl border border-white/5 group hover:border-royal/40 transition-all">
            <div className={`${stat.bg} ${stat.color} w-10 h-10 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
              <stat.icon size={18} />
            </div>
            <div className="text-3xl font-black text-white mb-1 font-display tracking-tight group-hover:text-royal transition-colors">{stat.value}</div>
            <div className="text-[9px] font-black uppercase tracking-[0.2em] text-white/20 group-hover:text-white/40">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-[#0B1426] p-10 rounded-[48px] border border-white/5 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#1E88E5]/5 blur-[100px] pointer-events-none" />
          <div className="flex justify-between items-center mb-10 relative z-10">
            <div>
              <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter flex items-center gap-3 font-display">
                <TrendingUp size={24} className="text-royal" />
                Connectivity Flux
              </h3>
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20">7-Day Matrix Analysis</p>
            </div>
            <div className="flex gap-6">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-royal shadow-[0_0_8px_rgba(30,136,229,0.5)]" />
                <span className="text-[9px] font-black text-white/40 uppercase tracking-widest">Inbound</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-matrix shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                <span className="text-[9px] font-black text-white/40 uppercase tracking-widest">Efficiency</span>
              </div>
            </div>
          </div>
          
          <div className="h-[300px] w-full font-mono">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorVisitors" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1E88E5" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#1E88E5" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorEngage" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff03" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  stroke="#ffffff10" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false}
                  dy={10}
                />
                <YAxis 
                  stroke="#ffffff10" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false}
                  dx={-10}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0A0F1E', border: '1px solid #ffffff10', borderRadius: '24px', padding: '20px' }}
                  itemStyle={{ color: '#fff', fontSize: '10px', fontWeight: '900', textTransform: 'uppercase' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="visitors" 
                  stroke="#1E88E5" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorVisitors)" 
                />
                <Area 
                  type="monotone" 
                  dataKey="engagements" 
                  stroke="#10B981" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorEngage)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-[#0B1426] p-10 rounded-[48px] border border-white/5 shadow-2xl">
          <h3 className="text-xl font-black text-white italic uppercase tracking-tighter mb-8 flex items-center gap-2">
             <Activity size={20} className="text-[#1E88E5]" />
             LIVE MONITORING
          </h3>
          <div className="space-y-6 relative z-10">
            {activeSessions.length > 0 ? activeSessions.map((session) => (
              <div key={session.id} className="flex items-center justify-between p-6 bg-white/5 rounded-3xl border border-white/5 group hover:bg-white/10 transition-all">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${session.id === currentSessionId ? 'bg-blue-500 text-white shadow-[0_0_20px_rgba(30,136,229,0.3)]' : 'bg-white/5 text-white/20'}`}>
                    {session.deviceType === 'Mobile' ? <Smartphone size={20} /> : session.deviceType === 'Tablet' ? <Tablet size={20} /> : <Laptop size={20} />}
                  </div>
                  <div>
                    <div className="text-sm font-black text-white flex items-center gap-2">
                      {session.email}
                      {session.id === currentSessionId && (
                        <span className="text-[7px] bg-blue-500 text-white px-2 py-0.5 rounded-full uppercase tracking-tighter">Current Host</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      <div className="text-[10px] text-white/20 font-black uppercase tracking-widest">
                        {session.deviceId} • {new Date(session.lastActive).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                </div>
                {session.id !== currentSessionId && (
                  <button 
                    onClick={() => revokeSession(session.id)}
                    className="p-4 bg-rose-500/10 text-rose-500 rounded-2xl hover:bg-rose-500 hover:text-white transition-all flex items-center gap-2 font-black text-[9px] uppercase tracking-widest shadow-xl sm:opacity-0 sm:group-hover:opacity-100"
                    title="Force Logoff"
                  >
                    <ShieldAlert size={14} />
                    KILL
                  </button>
                )}
              </div>
            )) : (
              <div className="text-center py-12 opacity-20 font-black uppercase tracking-widest text-[10px]">No active cloud terminals</div>
            )}
          </div>
          
          <div className="grid grid-cols-2 gap-4 mt-8 pt-8 border-t border-white/5">
              <div className="p-6 bg-white/5 rounded-3xl text-center">
                 <div className="text-2xl font-black text-white">{activeSessions.length}</div>
                 <div className="text-[9px] font-black uppercase tracking-widest text-white/20">Terminals</div>
              </div>
              <div className="p-6 bg-white/5 rounded-3xl text-center">
                 <div className="text-2xl font-black text-white">{counts.visitors}</div>
                 <div className="text-[9px] font-black uppercase tracking-widest text-white/20">Sessions</div>
              </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pb-32">
        <div className="bg-[#0B1426] p-10 rounded-[48px] border border-white/5 shadow-2xl relative">
          <h3 className="text-xl font-black text-white italic uppercase tracking-tighter mb-8 flex items-center gap-2">
            <ShieldAlert size={20} className="text-rose-500" />
            SECURITY BREACHES
          </h3>
          <div className="space-y-4">
            {recentLogs.map((log) => (
              <div key={log.id} className="p-6 bg-rose-500/5 rounded-3xl border border-rose-500/10 flex items-center justify-between group">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-rose-500/10 rounded-xl flex items-center justify-center text-rose-500">
                    <Lock size={16} />
                  </div>
                  <div>
                    <div className="text-sm font-black text-white">{log.email}</div>
                    <div className="text-[9px] text-white/20 font-black uppercase tracking-widest leading-none mt-1">Failed Access Attempt • {new Date(log.timestamp).toLocaleTimeString()}</div>
                  </div>
                </div>
                <button 
                  onClick={() => setActiveTab('security')}
                  className="p-3 bg-white/5 text-white/20 rounded-xl hover:text-white transition-all opacity-0 group-hover:opacity-100"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            ))}
            {recentLogs.length === 0 && <div className="text-center py-12 opacity-20 font-black uppercase tracking-widest text-[10px]">Perimeter Secure</div>}
          </div>
          <button 
            onClick={() => setActiveTab('security')}
            className="w-full mt-8 py-4 bg-white/5 hover:bg-white/10 text-white/40 hover:text-white rounded-2xl font-black text-[9px] uppercase tracking-[0.3em] transition-all"
          >
            Enter Security Matrix
          </button>
        </div>

        <div className="bg-[#0B1426] p-10 rounded-[48px] border border-white/5 shadow-2xl">
          <h3 className="text-xl font-black text-white italic uppercase tracking-tighter mb-8 flex items-center gap-2">
            <Mail size={20} className="text-[#00b4d8]" />
            RECENT INBOUND
          </h3>
          <MessagesList limitTo={3} hideHeader notify={() => {}} logActivity={logActivity} askPermission={askPermission} />
          <button 
            onClick={() => setActiveTab('messages')}
            className="w-full mt-4 py-4 bg-white/5 hover:bg-white/10 text-white/40 hover:text-white rounded-2xl font-black text-[9px] uppercase tracking-[0.3em] transition-all"
          >
            Access Full Comm Logs
          </button>
        </div>
      </div>
    </div>
  );
}
 // --- Auto-expanding Textarea Component ---
function AutoExpandingTextarea({ value, onChange, label, placeholder = "" }: { value: string, onChange: (val: string) => void, label: string, placeholder?: string }) {
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  React.useLayoutEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'inherit';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [value]);

  return (
    <div className="space-y-3">
      <label className="text-[10px] font-black uppercase tracking-widest text-[#1E88E5]">{label}</label>
      <textarea 
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-white/5 border border-white/10 rounded-3xl p-6 text-sm font-medium text-white/80 focus:border-[#1E88E5] outline-none transition-all placeholder-white/5 resize-none overflow-hidden"
        placeholder={placeholder}
      />
    </div>
  );
}

// --- Site Content Editor ---
function SiteContentEditor({ ImageDropzone, notify, askPermission }: { ImageDropzone: any, notify: any, askPermission: any }) {
  const [settings, setSettings] = useState<any>({
    heroTitle: 'Engineering innovation with precision',
    heroSubtitle: 'Real repair maintenance and automation solutions delivered with unparalleled excellence across Sri Lanka',
    aboutTitle: 'Built on Trust.',
    aboutText: 'Nexon Engineering is a trusted provider of industrial repair, maintenance, and automation services. We specialize in machine servicing, industrial electrical work, and custom engineering solutions designed to improve productivity and reliability.',
    featureReviews: true,
    featureProjects: true,
    featureClients: true,
    featureServices: true,
    showGoogleMaps: true,
    googleMapsEmbedUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15842.138446187903!2d79.8817!3d6.9271!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ae259024f2b3e83%3A0xff3c9a632c02c65a!2sColombo!5e0!3m2!1sen!2slk!4v1620000000000!5m2!1sen!2slk',
    statProjects: 50,
    statClients: 30,
    statYears: 8,
    statSupport: 24,
    statRepairs: 500,
    footerAddress: 'Colombo, Sri Lanka',
    footerPhone: '+94 77 123 4567',
    footerEmail: 'info@nexonengineering.com',
    linkedinUrl: 'https://linkedin.com/company/nexonengineering',
    twitterUrl: 'https://twitter.com/nexonengineering',
    facebookUrl: 'https://facebook.com/nexonengineering',
    instagramUrl: 'https://instagram.com/nexonengineering',
    aboutMission: 'To deliver reliable, innovative engineering solutions that empower industries to operate efficiently and safely through superior craftsmanship, technical expertise, and an unwavering commitment to customer success.',
    aboutVision: 'To be the most trusted and innovative engineering services partner in South Asia, setting global standards for quality, reliability, and technical excellence in industrial automation and support.',
    aboutValue1Title: 'Reliability Index',
    aboutValue1Desc: '99.9% operational uptime commitment across all deployed mechanical and electrical infrastructures.',
    aboutValue2Title: 'Precision Logic',
    aboutValue2Desc: 'Micron-level accuracy in component fabrication and strategic system tuning for high-output environments.',
    aboutValue3Title: 'AI Integration',
    aboutValue3Desc: 'Leveraging neural diagnostics and automated failure analysis to predict system fatigue before it occurs.',
    aboutValue4Title: 'Legacy Integrity',
    aboutValue4Desc: 'Preserving engineering heritage while implementing future-proof modernization across heavy industry.',
    servicesSubtitle: 'Comprehensive industrial engineering solutions tailored for performance, safety, and reliability.',
    projectsSubtitle: 'Witness our commitment to excellence through our most significant industrial milestones.',
    clientsSubtitle: 'Trusted by industry leaders across Sri Lanka for technical excellence and reliability.',
    contactSubtitle: 'Have a project in mind? Our team of experts is ready to help you with industrial repair, automation, and more.',
    aboutValuesTitle: 'Technical Standards',
    aboutValuesSubtitle: 'The fundamental principles that govern our technical execution and safety protocols.',
    aboutTechnicalTitle: 'Operational NEXON',
    aboutTechnicalSubtitle: 'Our expertise is partitioned into four primary technical domains, each monitored and executed by specialized Matrix engineers.',
    visitorCount: 0,
    showLinkedIn: true,
    showTwitter: true,
    showFacebook: true,
    showInstagram: true
  });

  const [activeContentTab, setActiveContentTab] = useState('home');

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'settings', 'global'), (docSnap) => {
      if (docSnap.exists()) {
        setSettings(prev => ({ ...prev, ...docSnap.data() }));
      }
    }, (error) => handleFirestoreError(error, OperationType.GET, 'settings/global'));
    return () => unsub();
  }, []);

  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    try {
      setIsSaving(true);
      notify('Synchronizing settings with Firebase...', 'info');
      await setDoc(doc(db, 'settings', 'global'), settings);
      notify('Global settings updated and live!', 'success');
    } catch (error: any) {
      handleFirestoreError(error, OperationType.WRITE, 'settings/global');
    } finally {
      setIsSaving(false);
    }
  };

  const seedPreviousData = async () => {
    askPermission(
      "This will synchronize professional industrial data to your matrix. This will overwrite some current settings and add missing resources. Continue?",
      async () => {
        try {
          setIsSaving(true);
          notify('Initializing professional synchronization...', 'info');
          
          const professionalSettings = {
            heroTitle: 'ENGINEERING INNOVATION WITH PRECISION',
            heroSubtitle: 'Next-generation industrial solutions for machinery repair, electrical systems, and advanced automation. We optimize your production matrix across Sri Lanka.',
            aboutTitle: 'BATTLE-TESTED EXPERTISE.',
            aboutText: 'Nexon Engineering stands at the intersection of precision and reliability. We provide critical infrastructure support for the largest factories in Sri Lanka, ensuring zero downtime and peak efficiency.',
            statProjects: 142,
            statClients: 88,
            statYears: 12,
            statSupport: 24,
            aboutMission: 'To deliver reliable, innovative engineering solutions that empower industries to operate efficiently and safely.',
            aboutVision: 'To be the most trusted and innovative engineering services partner in South Asia.'
          };

          const updatedSettings = { ...settings, ...professionalSettings };
          setSettings(updatedSettings);
          await setDoc(doc(db, 'settings', 'global'), updatedSettings);
          notify('Core Site DNA Updated...', 'info');

          const [serviceCatsSnap, servicesSnap, projectsSnap, clientsSnap, sectorsSnap, coverageSnap] = await Promise.all([
            getDocs(collection(db, 'serviceCategories')),
            getDocs(collection(db, 'services')),
            getDocs(collection(db, 'projects')),
            getDocs(collection(db, 'clients')),
            getDocs(collection(db, 'sectors')),
            getDocs(collection(db, 'coverageAreas'))
          ]);

          let categoryMap: Record<string, string> = {};
          
          if (serviceCatsSnap.empty) {
            const catBatch = writeBatch(db);
            const categories = [
              { title: 'Electrical & Machinery', icon: '⚡', order: 1, enabled: true },
              { title: 'Automation & Electronics', icon: '🤖', order: 2, enabled: true },
              { title: 'Mechanical & Fabrication', icon: '🛠️', order: 3, enabled: true },
              { title: 'Industrial Support & Services', icon: '🔧', order: 4, enabled: true },
              { title: 'Solar & Security Systems', icon: '☀️', order: 5, enabled: true },
            ];
            for (const c of categories) {
              const docRef = doc(collection(db, 'serviceCategories'));
              categoryMap[c.title] = docRef.id;
              catBatch.set(docRef, c);
            }
            await catBatch.commit();
            notify('Service Categories Synchronized...', 'info');
          } else {
            serviceCatsSnap.forEach(doc => {
              categoryMap[doc.data().title] = doc.id;
            });
          }

          // Seed sample services if collection is empty
          if (servicesSnap.empty) {
            const serviceBatch = writeBatch(db);
            const services = [
              { title: 'Machine Repair, Assembly & Maintenance', category: categoryMap['Electrical & Machinery'] || '', icon: '🛠️', description: 'Expert repair, assembly, and scheduled maintenance of all industrial machinery to ensure peak operational reliability.', order: 1, enabled: true },
              { title: 'Industrial Electrical Wiring', category: categoryMap['Electrical & Machinery'] || '', icon: '⚡', description: 'Advanced electrical wiring solutions for factories and plants, including high-voltage systems and specialized panel designs.', order: 2, enabled: true },
              { title: 'Industrial Automation', category: categoryMap['Automation & Electronics'] || '', icon: '🤖', description: 'Smart industrial automation solutions involving PLC programming and custom robotic integration to maximize productivity.', order: 3, enabled: true },
              { title: 'Industrial Electronics Repairs', category: categoryMap['Automation & Electronics'] || '', icon: '📟', description: 'High-precision diagnostics and repair services for industrial PCB, control systems, and complex electronic modules.', order: 4, enabled: true },
              { title: 'Mechanical Fabrication', category: categoryMap['Mechanical & Fabrication'] || '', icon: '🏗️', description: 'Custom structural fabrication and precision mechanical component design tailored to your specific engineering requirements.', order: 5, enabled: true },
              { title: 'Spare Parts & Components', category: categoryMap['Mechanical & Fabrication'] || '', icon: '📦', description: 'Rapid sourcing and precision manufacturing of high-grade industrial spares and mechanical components.', order: 6, enabled: true },
              { title: 'On-Site Technical Support', category: categoryMap['Industrial Support & Services'] || '', icon: '🔧', description: 'Strategic on-site maintenance and emergency technical support to minimize downtime and resolve complex engineering issues.', order: 7, enabled: true },
              { title: 'Industrial Services', category: categoryMap['Industrial Support & Services'] || '', icon: '🏭', description: 'A comprehensive suite of specialized engineering services designed to optimize and maintain modern industrial infrastructure.', order: 8, enabled: true },
              { title: 'Compressed Air Line Fixing & Maintenance', category: categoryMap['Industrial Support & Services'] || '', icon: '💨', description: 'Expert installation, repair, and optimization of industrial pneumatic systems and high-pressure compressed air networks.', order: 9, enabled: true },
              { title: 'Solar Engineering', category: categoryMap['Solar & Security Systems'] || '', icon: '☀️', description: 'End-to-end solar energy integration, providing sustainable power solutions for large-scale industrial and commercial operations.', order: 10, enabled: true },
              { title: 'CCTV Installation & Service', category: categoryMap['Solar & Security Systems'] || '', icon: '📹', description: 'Deployment of high-performance industrial surveillance systems with advanced monitoring and integrated security protocols.', order: 11, enabled: true },
            ];
            for (const s of services) {
              const docRef = doc(collection(db, 'services'));
              serviceBatch.set(docRef, s);
            }
            await serviceBatch.commit();
            notify('Service Protocols Injected...', 'info');
          }

          // Seed sample projects if collection is empty
          if (projectsSnap.empty) {
            const projectBatch = writeBatch(db);
            const projects = [
              { title: 'Factory Automation Overhaul', category: 'Automation', client: 'MAS Holdings', year: '2023', description: 'Full system upgrade of a textile production line.', enabled: true },
              { title: 'Substation Installation', category: 'Electrical', client: 'Industrial Park', year: '2024', description: 'Installation of a 1500kVA substation.', enabled: true },
            ];
            for (const p of projects) {
              const docRef = doc(collection(db, 'projects'));
              projectBatch.set(docRef, p);
            }
            await projectBatch.commit();
            notify('Project Matrix Expanded...', 'info');
          }

          // Seed sample clients if collection is empty
          if (clientsSnap.empty) {
            const clientBatch = writeBatch(db);
            const clients = [
              { name: 'Azmo', description: 'Industrial Partner', logoUrl: 'https://raw.githubusercontent.com/NexonEngineering/nexonengineering.github.io/refs/heads/main/client1.png', enabled: true, order: 1 },
              { name: 'Zahra International', description: 'Manufacturing Client', logoUrl: 'https://raw.githubusercontent.com/NexonEngineering/nexonengineering.github.io/refs/heads/main/client2.png', enabled: true, order: 2 },
              { name: 'Hikma Industries', description: 'Corporate Partner', logoUrl: 'https://raw.githubusercontent.com/NexonEngineering/nexonengineering.github.io/refs/heads/main/client3.png', enabled: true, order: 3 },
              { name: 'Gold Star', description: 'Factory Client', logoUrl: 'https://raw.githubusercontent.com/NexonEngineering/nexonengineering.github.io/refs/heads/main/client4.png', enabled: true, order: 4 },
              { name: 'Pettah Essence Suppliers', description: 'Business Partner', logoUrl: 'https://raw.githubusercontent.com/NexonEngineering/nexonengineering.github.io/refs/heads/main/client5.png', enabled: true, order: 5 },
              { name: 'Resplendent Ceylon', description: 'Enterprise Client', logoUrl: 'https://raw.githubusercontent.com/NexonEngineering/nexonengineering.github.io/refs/heads/main/client6.png', enabled: true, order: 6 },
              { name: 'MAS Holdings', description: 'Strategic Apparel Partner', logoUrl: 'https://raw.githubusercontent.com/NexonEngineering/nexonengineering.github.io/refs/heads/main/client7.png', enabled: true, order: 7 },
              { name: 'Brandix', description: 'Industrial Apparel Client', logoUrl: 'https://raw.githubusercontent.com/NexonEngineering/nexonengineering.github.io/refs/heads/main/client8.png', enabled: true, order: 8 },
              { name: 'Holcim Lanka', description: 'Industrial Infrastructure', logoUrl: 'https://raw.githubusercontent.com/NexonEngineering/nexonengineering.github.io/refs/heads/main/client9.png', enabled: true, order: 9 },
              { name: 'Lankem Ceylon', description: 'Chemical & Industrial Partner', logoUrl: 'https://raw.githubusercontent.com/NexonEngineering/nexonengineering.github.io/refs/heads/main/client10.png', enabled: true, order: 10 },
              { name: 'Hirdaramani Group', description: 'Enterprise Manufacturing', logoUrl: 'https://raw.githubusercontent.com/NexonEngineering/nexonengineering.github.io/refs/heads/main/client11.png', enabled: true, order: 11 },
              { name: 'Aitken Spence', description: 'Conglomerate Partner', logoUrl: 'https://raw.githubusercontent.com/NexonEngineering/nexonengineering.github.io/refs/heads/main/client12.png', enabled: true, order: 12 },
              { name: 'John Keells Holdings', description: 'Enterprise Client', logoUrl: 'https://raw.githubusercontent.com/NexonEngineering/nexonengineering.github.io/refs/heads/main/client13.png', enabled: true, order: 13 },
              { name: 'Dialog Axiata', description: 'Telecommunications Partner', logoUrl: 'https://raw.githubusercontent.com/NexonEngineering/nexonengineering.github.io/refs/heads/main/client14.png', enabled: true, order: 14 },
              { name: 'Sri Lanka Telecom', description: 'Network Infrastructure Hub', logoUrl: 'https://raw.githubusercontent.com/NexonEngineering/nexonengineering.github.io/refs/heads/main/client15.png', enabled: true, order: 15 },
              { name: 'Unilever Sri Lanka', description: 'Manufacturing Partner', logoUrl: 'https://raw.githubusercontent.com/NexonEngineering/nexonengineering.github.io/refs/heads/main/client16.png', enabled: true, order: 16 },
              { name: 'Nestlé Lanka', description: 'Production Facility Client', logoUrl: 'https://raw.githubusercontent.com/NexonEngineering/nexonengineering.github.io/refs/heads/main/client17.png', enabled: true, order: 17 },
              { name: 'Coca-Cola Sri Lanka', description: 'Industrial Beverage Partner', logoUrl: 'https://raw.githubusercontent.com/NexonEngineering/nexonengineering.github.io/refs/heads/main/client18.png', enabled: true, order: 18 },
            ];
            for (const c of clients) {
              const docRef = doc(collection(db, 'clients'));
              clientBatch.set(docRef, c);
            }
            await clientBatch.commit();
            notify('Client Ecosystem Synchronized...', 'info');
          }

          // Seed sectors
          if (sectorsSnap.empty) {
            const sectorBatch = writeBatch(db);
            const sectors = [
              { title: "Apparel & Textiles", icon: "🧵", color: "#1E88E5", enabled: true, order: 1 },
              { title: "Manufacturing", icon: "🏭", color: "#00b4d8", enabled: true, order: 2 },
              { title: "Food & Beverage", icon: "🥤", color: "#10b981", enabled: true, order: 3 },
              { title: "Infrastructure", icon: "🏗️", color: "#f59e0b", enabled: true, order: 4 }
            ];
            for (const s of sectors) {
              const docRef = doc(collection(db, 'sectors'));
              sectorBatch.set(docRef, s);
            }
            await sectorBatch.commit();
            notify('Market Sectors Injected...', 'info');
          }

          // Seed coverage
          if (coverageSnap.empty) {
            const coverageBatch = writeBatch(db);
            const areas = [
              { title: "Western Province", labs: "03 Nodes", focus: "Corporate Headquarters & Main Service Hub", enabled: true, order: 1 },
              { title: "Industrial Zones", labs: "08 Support Bases", focus: "Real-time Field Engineering & Maintenance", enabled: true, order: 2 },
              { title: "South Asia Reach", labs: "Remote Support", focus: "Regional Consultation & Technical Logistics", enabled: true, order: 3 },
            ];
            for (const a of areas) {
              const docRef = doc(collection(db, 'coverageAreas'));
              coverageBatch.set(docRef, a);
            }
            await coverageBatch.commit();
            notify('Coverage Matrix Deployed...', 'info');
          }

          notify('Professional matrix fully synchronized!', 'success');
        } catch (error: any) {
          console.error("Seed error:", error);
          notify('Sync failed: ' + error.message, 'error');
        } finally {
          setIsSaving(false);
        }
      },
      "Industrial Data Sync",
      false,
      "Sync Matrix"
    );
  };

  const autoPopulateProjectImages = async () => {
    askPermission(
      "This will assign high-quality industrial imagery to all projects based on their technical titles. Continue?",
      async () => {
        try {
          setIsSaving(true);
          notify('Accessing project matrix...', 'info');
          
          const projectsSnap = await getDocs(collection(db, 'projects'));
          if (projectsSnap.empty) {
            notify('No projects detected in matrix.', 'error');
            return;
          }

          const imageMap: Record<string, string> = {
            'Port Logistics Hub': 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&q=80&w=1200',
            'Hydroelectric Dam Retrofit': 'https://images.unsplash.com/photo-1544973403-0373a3ad289c?auto=format&fit=crop&q=80&w=1200',
            'High-Speed Rail Bridge': 'https://images.unsplash.com/photo-1532105956626-9569c03602f6?auto=format&fit=crop&q=80&w=1200',
            'Chemical Reactor Build': 'https://images.unsplash.com/photo-1513828583688-c52646db42da?auto=format&fit=crop&q=80&w=1200',
            'Waste-to-Heat Facility': 'https://images.unsplash.com/photo-1624350839686-143f16298918?auto=format&fit=crop&q=80&w=1200',
            'Solar Array Phase II': 'https://images.unsplash.com/photo-1559302995-f0a1bc15189b?auto=format&fit=crop&q=80&w=1200',
            'Factory Automation Overhaul': 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&q=80&w=1200',
            'Data Center Modernization': 'https://images.unsplash.com/photo-1558494949-ef010cbdcc51?auto=format&fit=crop&q=80&w=1200',
            'Substation Installation': 'https://images.unsplash.com/photo-1454165833767-027ffed9b867?auto=format&fit=crop&q=80&w=1200',
            'Deep Sea Cable Network': 'https://images.unsplash.com/photo-1559149203-3b47375dd570?auto=format&fit=crop&q=80&w=1200',
            'Assembly Line Automation': 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=1200',
            'Smart Grid Integration': 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&q=80&w=1200'
          };

          let count = 0;
          for (const projectDoc of projectsSnap.docs) {
            const data = projectDoc.data();
            const title = data.title;
            const imageUrl = imageMap[title] || Object.values(imageMap)[Math.floor(Math.random() * Object.values(imageMap).length)];
            
            await updateDoc(doc(db, 'projects', projectDoc.id), {
              imageUrl: imageUrl,
              image: imageUrl, // for compatibility
              gallery: [
                { url: imageUrl, caption: `${title} Overview` }
              ]
            });
            count++;
          }

          notify(`Synchronization complete: ${count} projects optimized with assets.`, 'success');
        } catch (error: any) {
          console.error("Asset sync error:", error);
          notify('Asset sync failed: ' + error.message, 'error');
        } finally {
          setIsSaving(false);
        }
      },
      "Bulk Asset Optimization",
      false,
      "Optimize Assets"
    );
  };

  const contentTabs = [
    { id: 'home', label: 'Home Page', icon: BarChart3 },
    { id: 'about', label: 'About Page', icon: Users },
    { id: 'services', label: 'Services', icon: SettingsIcon },
    { id: 'projects', label: 'Portfolio', icon: Briefcase },
    { id: 'contact', label: 'Contact Info', icon: Mail },
    { id: 'features', label: 'System Toggles', icon: Shield },
  ];

  return (
    <>
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center bg-[#0B1426] p-10 rounded-[48px] text-white border border-white/5 shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 opacity-5" style={{ backgroundImage: `radial-gradient(white 1px, transparent 1px)`, backgroundSize: '30px 30px' }} />
          <div className="relative z-10 mb-6 md:mb-0">
            <h3 className="text-3xl font-black mb-2 uppercase tracking-tighter italic">Command Control</h3>
            <p className="text-white/40 text-[10px] font-black uppercase tracking-widest">Global Matrix Configuration Hub</p>
          </div>
          <div className="flex gap-4 relative z-10 w-full md:w-auto">
            <button 
              onClick={seedPreviousData} 
              disabled={isSaving} 
              className="flex-1 md:flex-none px-6 py-4 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all disabled:opacity-50"
            >
              Seed Data
            </button>
            <button 
              onClick={autoPopulateProjectImages} 
              disabled={isSaving} 
              className="flex-1 md:flex-none px-6 py-4 bg-white/5 hover:bg-white/10 border border-white/10 text-royal rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all disabled:opacity-50 flex items-center gap-2"
            >
              <ImageIcon size={14} />
              Optimize Images
            </button>
            <button 
              onClick={handleSave} 
              disabled={isSaving}
              className="flex-1 md:flex-none px-10 py-4 bg-[#1E88E5] text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-all shadow-xl shadow-blue-500/20 flex items-center justify-center gap-3 disabled:opacity-50"
            >
              {isSaving ? <CheckCircle2 size={18} className="animate-pulse" /> : <Save size={18} />}
              {isSaving ? 'Syncing...' : 'Publish Matrix'}
            </button>
          </div>
      </header>

      <div className="grid lg:grid-cols-4 gap-12">
        <div className="lg:col-span-1 space-y-3">
          {contentTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveContentTab(tab.id)}
              className={`w-full flex items-center gap-4 px-8 py-5 rounded-[32px] font-black text-[11px] uppercase tracking-widest transition-all duration-300 border ${
                activeContentTab === tab.id 
                  ? 'bg-white text-[#0A2463] border-white shadow-[0_20px_50px_rgba(255,255,255,0.1)] translate-x-3' 
                  : 'text-white/30 border-white/5 hover:bg-white/5 hover:text-white'
              }`}
            >
              <tab.icon size={18} />
              {tab.label}
            </button>
          ))}
        </div>

        <div className="lg:col-span-3 bg-[#0B1426] p-12 rounded-[56px] border border-white/5 shadow-2xl relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeContentTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              <div className="space-y-10">
                {activeContentTab === 'home' && (
                  <div className="space-y-10">
                    <div className="grid grid-cols-1 gap-8">
                       <AutoExpandingTextarea 
                         label="Main Hero Title"
                         value={settings.heroTitle}
                         onChange={(v) => setSettings({...settings, heroTitle: v})}
                       />
                       <AutoExpandingTextarea 
                         label="Hero Narrative Subtitle"
                         value={settings.heroSubtitle}
                         onChange={(v) => setSettings({...settings, heroSubtitle: v})}
                       />
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-10 border-t border-white/5">
                      {[
                        { id: 'statProjects', label: 'Projects' },
                        { id: 'statClients', label: 'Clients' },
                        { id: 'statYears', label: 'Exp Years' },
                        { id: 'statSupport', label: 'Support (H)' },
                        { id: 'statRepairs', label: 'Repairs' }
                      ].map(stat => (
                        <div key={stat.id} className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-[#1E88E5]">{stat.label}</label>
                          <input 
                            type="number"
                            value={settings[stat.id] || 0}
                            onChange={(e) => setSettings({...settings, [stat.id]: parseInt(e.target.value) || 0})}
                            className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-xl font-black text-white focus:border-[#1E88E5] outline-none"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeContentTab === 'about' && (
                  <div className="space-y-10">
                    <div className="grid grid-cols-1 gap-8">
                       <AutoExpandingTextarea 
                          label="Technical Dominance Title"
                          value={settings.aboutTitle}
                          onChange={(v) => setSettings({...settings, aboutTitle: v})}
                       />
                       <AutoExpandingTextarea 
                          label="Corporate Heritage Narrative"
                          value={settings.aboutText}
                          onChange={(v) => setSettings({...settings, aboutText: v})}
                       />
                       <div className="grid md:grid-cols-2 gap-8 pt-6 border-t border-white/5">
                         <AutoExpandingTextarea 
                            label="Operational Mission Protocol"
                            value={settings.aboutMission}
                            onChange={(v) => setSettings({...settings, aboutMission: v})}
                         />
                         <AutoExpandingTextarea 
                            label="Strategic Vision Horizon"
                            value={settings.aboutVision}
                            onChange={(v) => setSettings({...settings, aboutVision: v})}
                         />
                       </div>

                       <div className="grid md:grid-cols-2 gap-8 pt-6 border-t border-white/5">
                          <div className="space-y-4">
                            <label className="text-[10px] font-black uppercase tracking-widest text-[#1E88E5]">Values Section Title</label>
                            <input 
                              className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-xl font-black text-white outline-none focus:border-[#1E88E5]"
                              value={settings.aboutValuesTitle}
                              onChange={(e) => setSettings({...settings, aboutValuesTitle: e.target.value})}
                            />
                            <AutoExpandingTextarea 
                               label="Values Section Subtitle"
                               value={settings.aboutValuesSubtitle}
                               onChange={(v) => setSettings({...settings, aboutValuesSubtitle: v})}
                            />
                          </div>
                          <div className="space-y-4">
                            <label className="text-[10px] font-black uppercase tracking-widest text-[#1E88E5]">Technical Domains Title</label>
                            <input 
                              className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-xl font-black text-white outline-none focus:border-[#1E88E5]"
                              value={settings.aboutTechnicalTitle}
                              onChange={(e) => setSettings({...settings, aboutTechnicalTitle: e.target.value})}
                            />
                            <AutoExpandingTextarea 
                               label="Technical Domains Subtitle"
                               value={settings.aboutTechnicalSubtitle}
                               onChange={(v) => setSettings({...settings, aboutTechnicalSubtitle: v})}
                            />
                          </div>
                       </div>

                       <div className="pt-10 border-t border-white/5 space-y-8">
                          <div className="flex items-center gap-4">
                            <div className="h-4 w-1 bg-[#1E88E5]" />
                            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/60">Value Matrix Configuration</h4>
                          </div>

                          <div className="grid md:grid-cols-2 gap-8">
                             {[1, 2, 3, 4].map(num => (
                               <div key={num} className="bg-white/5 p-8 rounded-[40px] border border-white/5 space-y-4">
                                  <div className="flex justify-between items-center">
                                     <span className="text-[8px] font-black text-[#1E88E5] uppercase tracking-widest">Protocol VAL-0{num}</span>
                                  </div>
                                  <input 
                                     placeholder={`Value ${num} Heading`}
                                     value={settings[`aboutValue${num}Title`]}
                                     onChange={(e) => setSettings({...settings, [`aboutValue${num}Title`]: e.target.value})}
                                     className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-xs font-black text-white outline-none focus:border-[#1E88E5]"
                                  />
                                  <AutoExpandingTextarea 
                                     label={`VAL-0${num} Description`}
                                     placeholder={`Value ${num} Narrative Description`}
                                     value={settings[`aboutValue${num}Desc`]}
                                     onChange={(v) => setSettings({...settings, [`aboutValue${num}Desc`]: v})}
                                  />
                               </div>
                             ))}
                          </div>
                       </div>
                    </div>
                  </div>
                )}

                {activeContentTab === 'services' && (
                  <div className="space-y-10">
                    <AutoExpandingTextarea label="Services Section Brief" value={settings.servicesSubtitle} onChange={(v) => setSettings({...settings, servicesSubtitle: v})} />
                  </div>
                )}

                {activeContentTab === 'projects' && (
                  <div className="space-y-10">
                    <AutoExpandingTextarea label="Portfolio Matrix Overview" value={settings.projectsSubtitle} onChange={(v) => setSettings({...settings, projectsSubtitle: v})} />
                  </div>
                )}

                {activeContentTab === 'contact' && (
                  <div className="space-y-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-8">
                        <AutoExpandingTextarea label="Office HQ Address" value={settings.footerAddress} onChange={(v) => setSettings({...settings, footerAddress: v})} />
                        <AutoExpandingTextarea label="Contact Form Caption" value={settings.contactSubtitle} onChange={(v) => setSettings({...settings, contactSubtitle: v})} />
                      </div>
                      <div className="space-y-6">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-[#1E88E5]">Emergency Contact Line</label>
                          <input className="w-full bg-white/5 border border-white/10 rounded-2xl p-6 text-sm text-white" value={settings.footerPhone} onChange={(e) => setSettings({...settings, footerPhone: e.target.value})} />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-[#1E88E5]">System Matrix Email</label>
                          <input className="w-full bg-white/5 border border-white/10 rounded-2xl p-6 text-sm text-white" value={settings.footerEmail} onChange={(e) => setSettings({...settings, footerEmail: e.target.value})} />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-[#1E88E5]">Maps Radar URL</label>
                          <input className="w-full bg-white/5 border border-white/10 rounded-2xl p-6 text-[10px] font-mono text-[#00b4d8]" value={settings.googleMapsEmbedUrl} onChange={(e) => setSettings({...settings, googleMapsEmbedUrl: e.target.value})} />
                        </div>
                      </div>
                    </div>
                    <div className="pt-10 border-t border-white/5">
                        <label className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-6 block">Social Connect Links</label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {[
                                { id: 'linkedinUrl', label: 'LinkedIn Profile' },
                                { id: 'twitterUrl', label: 'Twitter/X Profile' },
                                { id: 'facebookUrl', label: 'Facebook Page' },
                                { id: 'instagramUrl', label: 'Instagram Profile' }
                            ].map(link => (
                                <div key={link.id} className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-[#1E88E5]">{link.label}</label>
                                    <input 
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl p-6 text-xs text-white/60" 
                                        value={settings[link.id]} 
                                        onChange={(e) => setSettings({...settings, [link.id]: e.target.value})} 
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                  </div>
                )}

                {activeContentTab === 'features' && (
                  <div className="space-y-8">
                    {[
                      { id: 'featureServices', label: 'Services Rankings', desc: 'Display core services across landing pages.' },
                      { id: 'featureProjects', label: 'Portfolio Matrix', desc: 'Activate the grid-based project portfolio.' },
                      { id: 'featureClients', label: 'Client Ecosystem', desc: 'Showcase trusted corporate partner logos.' },
                      { id: 'featureReviews', label: 'Market Reviews', desc: 'Enable client feedback and testimonials ticker.' },
                      { id: 'showGoogleMaps', label: 'Site Location & Radar', desc: 'Hide or show entire physical address and Maps across the site.' },
                      { id: 'showLinkedIn', label: 'LinkedIn Channel', desc: 'Toggle visibility of LinkedIn social connect.' },
                      { id: 'showTwitter', label: 'X (Twitter) Channel', desc: 'Toggle visibility of Twitter/X social connect.' },
                      { id: 'showFacebook', label: 'Facebook Matrix', desc: 'Toggle visibility of Facebook profile and widgets.' },
                      { id: 'showInstagram', label: 'Instagram Feed', desc: 'Toggle visibility of Instagram social connect.' },
                      { id: 'enableContactAttachments', label: 'Priority Attachments', desc: 'Enable site schematic and blueprint uploads on Contact page.' },
                    ].map((feature) => (
                      <button 
                        key={feature.id}
                        onClick={() => setSettings({...settings, [feature.id]: !Boolean((settings as any)[feature.id])})}
                        className={`w-full flex items-center justify-between p-8 rounded-[36px] border transition-all ${
                          (settings as any)[feature.id] 
                            ? 'bg-emerald-500/10 border-emerald-500/30 text-white' 
                            : 'bg-white/5 border-white/5 text-white/30'
                        }`}
                      >
                        <div className="text-left">
                          <div className="font-black text-xs uppercase tracking-tight">{feature.label}</div>
                          <div className="text-[9px] font-bold opacity-40">{feature.desc}</div>
                        </div>
                        <div className={`w-14 h-8 rounded-full p-1 transition-all flex items-center ${ (settings as any)[feature.id] ? 'bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.4)]' : 'bg-white/10' }`}>
                          <div className={`w-6 h-6 rounded-full bg-white transform transition-transform ${ (settings as any)[feature.id] ? 'translate-x-6' : 'translate-x-0' }`} />
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </>
  );
}

// --- Generic Manager (Services, Projects, Clients) ---
function GenericManager({ type, categoryCollection, ImageDropzone, logActivity, notify, askPermission }: { type: string, categoryCollection?: string, ImageDropzone: any, logActivity: any, notify: any, askPermission: any }) {
  const [items, setItems] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const isCategory = type.toLowerCase().includes('categories');
  const typeLabel = isCategory ? 'category' : type.slice(0, -1);

  const filteredItems = items.filter(item => {
    const searchStr = (item.title || item.name || '').toLowerCase();
    const idStr = (item.id || '').toLowerCase();
    return searchStr.includes(searchQuery.toLowerCase()) || idStr.includes(searchQuery.toLowerCase());
  });

  // Form State
  const getDefaultFormData = () => ({
    title: '',
    name: '',
    description: '',
    fullDescription: '',
    imageUrl: '',
    logoUrl: '',
    websiteUrl: '',
    enabled: true,
    order: 0,
    client: '',
    year: '',
    category: '',
    location: '',
    status: 'completed',
    icon: '⚙️',
    complexity: 3,
    industrialTier: 1,
    gallery: [],
    features: [],
    challenges: '',
    solutions: '',
    color: '#1E88E5',
    labs: '',
    focus: '',
  });

  const [formData, setFormData] = useState<any>(getDefaultFormData());
  const [generatingAI, setGeneratingAI] = useState(false);

  const handleBulkAI = () => {
    if (!type || type !== 'services') return;
    if (!items || items.length === 0) {
      notify('No services found to optimize', 'info');
      return;
    }

    askPermission(
      `Initialize AI Bulk Optimization for ${items.length} data points? This will utilize secondary processing to overwrite legacy placeholders.`,
      async () => {
        setGeneratingAI(true);
        let successCount = 0;
        notify('AI Bulk Sequence Initialized...', 'info');

        try {
          // Process in smaller batches to avoid timeouts or quota issues if many services
          for (const item of items) {
            // Only optimize if description is short or icon is default
            const needsOptimization = !item.description || item.description.length < 20 || !item.icon || item.icon === '⚙️';
            
            if (needsOptimization) {
              const [desc, icon] = await Promise.all([
                generateServiceDescription(item.title),
                suggestIcon(item.title)
              ]);

              if (desc && icon) {
                const docRef = doc(db, type, item.id);
                // Assign deterministic but varied stats if missing
                const idx = items.indexOf(item);
                await updateDoc(docRef, {
                  description: desc,
                  icon: icon,
                  complexity: item.complexity || (idx % 3 + 3),
                  industrialTier: item.industrialTier || (idx % 3 + 1),
                  updatedAt: new Date().toISOString()
                });
                successCount++;
              }
            }
          }
          notify(`AI Sequence Complete: ${successCount} services optimized`, 'success');
          await logActivity(`BULK_AI_OPTIMIZE_SERVICES`, `${successCount}_items`);
        } catch (error) {
          console.error(error);
          notify('AI Bulk Transmission Interrupted', 'error');
        } finally {
          setGeneratingAI(false);
        }
      },
      "Neural Bulk Processing",
      false,
      "Begin Optimization"
    );
  };

  const handleAIGenerate = async (field?: string) => {
    const title = ['clients'].includes(type) || isCategory ? formData.name || formData.title : formData.title || formData.name;
    if (!title) {
      notify('Please enter a title/name first to generate content', 'error');
      return;
    }

    setGeneratingAI(true);
    try {
      if (field === 'fullDescription') {
        const res = await generateProjectCaseStudy(title, formData.client || 'Valued Client', formData.category || 'Engineering');
        setFormData((prev: any) => ({ ...prev, fullDescription: res }));
        notify('Full Case Study Generated', 'success');
      } else if (field === 'challenges') {
        const res = await generateProjectChallenges(title);
        setFormData((prev: any) => ({ ...prev, challenges: res }));
        notify('Challenges Generated', 'success');
      } else if (field === 'solutions') {
        const challenges = formData.challenges || '';
        if (!challenges) {
          notify('Please generate or enter challenges first', 'info');
          setGeneratingAI(false);
          return;
        }
        const res = await generateProjectSolutions(challenges);
        setFormData((prev: any) => ({ ...prev, solutions: res }));
        notify('Engineered Solutions Generated', 'success');
      } else {
        // Default behavior (short description & icon)
        const [aiDescription, aiIcon] = await Promise.all([
          !isCategory ? generateServiceDescription(title) : Promise.resolve(null),
          (type === 'services' || isCategory) ? suggestIcon(title) : Promise.resolve(null)
        ]);

        if (aiDescription || aiIcon) {
          setFormData((prev: any) => ({ 
            ...prev, 
            ...(aiDescription ? { description: aiDescription } : {}),
            ...(aiIcon ? { icon: aiIcon } : {})
          }));
          notify('AI Sequence Complete: Resource Optimized', 'success');
        } else {
          notify('AI Transmission Failed: No content generated', 'error');
        }
      }
    } catch (e) {
      notify('AI Critical Error', 'error');
    } finally {
      setGeneratingAI(false);
    }
  };

  useEffect(() => {
    setSelectedIds([]);
  }, [type, categoryCollection]);

  useEffect(() => {
    if (categoryCollection) {
      const unsub = onSnapshot(collection(db, categoryCollection), (snap) => {
        setCategories(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      }, (error) => handleFirestoreError(error, OperationType.LIST, categoryCollection));
      return () => unsub();
    }
  }, [categoryCollection]);

  useEffect(() => {
    // We fetch without orderBy because documents missing the 'order' field 
    // are silently excluded from results when using server-side orderBy.
    const unsub = onSnapshot(collection(db, type), (snap) => {
      const allItems = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      // Perform in-memory sort instead
      const sortedItems = allItems.sort((a: any, b: any) => (a.order || 0) - (b.order || 0));
      setItems(sortedItems);
    }, (error) => handleFirestoreError(error, OperationType.LIST, type));
    return () => unsub();
  }, [type]);

  const handleReorder = async (newItems: any[]) => {
    // Optimistic update
    setItems(newItems);
    try {
      const batch = writeBatch(db);
      newItems.forEach((item, index) => {
        const itemRef = doc(db, type, item.id);
        batch.update(itemRef, { order: index });
      });
      await batch.commit();
      // No notification for every drag, just log
      await logActivity(`REORDER_${type.toUpperCase()}`, 'multiple');
    } catch (e: any) {
      console.error("Reorder failed:", e);
      notify('Reorder sync failed: ' + e.message, 'error');
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      notify(`Committing ${typeLabel} to vault...`, 'info');
      
      let finalData = { ...formData };
      
      // Auto-assign icon for services if missing
      if (type === 'services' && (!finalData.icon || finalData.icon === '⚙️')) {
        const title = finalData.title || finalData.name;
        if (title) {
          const suggested = await suggestIcon(title);
          finalData.icon = suggested;
        }
      }

      const dataToSave = { ...finalData, updatedAt: new Date().toISOString() };
      
      // Cleanup field based on type
      if (isCategory && !dataToSave.name && dataToSave.title) dataToSave.name = dataToSave.title;
      if (!isCategory && !dataToSave.title && dataToSave.name) dataToSave.title = dataToSave.name;

      if (editingItem) {
        await Promise.all([
          updateDoc(doc(db, type, editingItem.id), dataToSave),
          logActivity(`UPDATE_${type.toUpperCase()}`, editingItem.id)
        ]);
      } else {
        const docRef = await addDoc(collection(db, type), dataToSave);
        await logActivity(`CREATE_${type.toUpperCase()}`, docRef.id);
      }
      notify(`Successfully saved to ${typeLabel}`, 'success');
      setShowModal(false);
      setEditingItem(null);
      setFormData(getDefaultFormData());
    } catch (e: any) {
      console.error(e);
      notify('Transmission failure: ' + e.message, 'error');
    }
  };

  const handleDelete = async (id: string) => {
    askPermission(
      `Confirm decommissioning of this ${typeLabel}? This individual resource will be permanently purged from the industrial matrix.`,
      async () => {
        try {
          notify(`Decommissioning ${typeLabel}...`, 'info');
          await deleteDoc(doc(db, type, id));
          await logActivity(`DELETE_${type.toUpperCase()}`, id);
          notify(`${typeLabel} eliminated successfully`, 'success');
        } catch (e: any) {
          notify('Operation failed: ' + e.message, 'error');
        }
      },
      `Secure Deletion: ${typeLabel}`
    );
  };

  const toggleStatus = async (item: any) => {
    try {
      const newStatus = !item.enabled;
      notify(`Switching visibility to ${newStatus ? 'VISIBLE' : 'HIDDEN'}...`, 'info');
      await updateDoc(doc(db, type, item.id), { enabled: newStatus });
      notify(`Status confirmed: ${item.title || item.name} is now ${newStatus ? 'Live' : 'Hidden'}`, 'success');
    } catch (e: any) {
      notify('Failed to toggle status: ' + e.message, 'error');
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    
    askPermission(
      `Securely decommission ${selectedIds.length} ${typeLabel}${selectedIds.length > 1 ? 's' : ''}? This multi-shard purge is irreversible and will permanently remove all selected data from the grid.`,
      async () => {
        try {
          notify(`Initializing Bulk Decommission Sequence [${selectedIds.length} shards]...`, 'info');
          const batchSize = 10; // Batching to prevent performance issues
          const snapshots = [...selectedIds];
          let processed = 0;
          
          for (let i = 0; i < snapshots.length; i += batchSize) {
            const batch = writeBatch(db);
            const chunk = snapshots.slice(i, i + batchSize);
            
            for (const id of chunk) {
              batch.delete(doc(db, type, id));
              processed++;
            }
            
            await batch.commit();
            notify(`Progress: ${processed}/${selectedIds.length} records purged.`, 'info');
          }
          
          await logActivity(`BULK_DELETE_${type.toUpperCase()}`, `${selectedIds.length}_items`);
          setSelectedIds([]);
          notify(`Purge Sequence Complete: ${selectedIds.length} records successfully eliminated.`, 'success');
        } catch (e: any) {
          console.error("Bulk delete failed:", e);
          notify('Bulk Purge Interrupted: ' + e.message, 'error');
        }
      },
      `Emergency Multi-Purge Protocol`
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredItems.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredItems.map(item => item.id));
    }
  };

  const toggleSelectItem = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const getTypeIcon = (t: string) => {
    switch(t) {
      case 'services': return <SettingsIcon size={64} />;
      case 'projects': return <Briefcase size={64} />;
      case 'clients': return <Users size={64} />;
      case 'reviews': return <MessageSquare size={64} />;
      case 'serviceCategories':
      case 'projectCategories': return <Boxes size={64} />;
      default: return <Layers size={64} />;
    }
  };

  return (
    <div className="space-y-12 relative">
      {/* Global Active Progress Indicator (AI) */}
      <AnimatePresence>
        {generatingAI && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed top-0 left-0 right-0 h-1 z-[1000] bg-white/5 overflow-hidden"
          >
            <motion.div 
              initial={{ x: '-100%' }}
              animate={{ x: '0%' }}
              transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
              className="w-full h-full bg-gradient-to-r from-transparent via-[#1E88E5] to-transparent shadow-[0_0_15px_rgba(30,136,229,0.8)]"
            />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
         <div className="relative w-full lg:w-96">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-white/20" size={18} />
            <input 
              type="text" 
              placeholder={`Search ${type}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#0B1426] border border-white/10 rounded-3xl pl-16 pr-8 py-5 text-sm text-white focus:outline-none focus:border-[#1E88E5] shadow-2xl transition-all"
            />
         </div>
          <div className="flex flex-wrap items-center gap-4">
            {selectedIds.length > 0 && (
              <button 
               onClick={handleBulkDelete}
               className="flex items-center gap-4 px-10 py-5 bg-rose-500 text-white rounded-[32px] font-black text-sm uppercase tracking-widest hover:scale-105 transition-all shadow-[0_20px_50px_rgba(244,63,94,0.2)]"
              >
                <Trash2 size={20} /> DELETE SELECTED ({selectedIds.length})
              </button>
            )}
            {type === 'services' && (
              <button 
               onClick={handleBulkAI}
               disabled={generatingAI}
               className="flex items-center gap-4 px-10 py-5 bg-gradient-to-r from-[#1E88E5]/20 to-[#1E88E5]/10 border border-[#1E88E5]/30 text-[#1E88E5] rounded-[32px] font-black text-sm uppercase tracking-widest hover:bg-[#1E88E5] hover:text-white transition-all shadow-xl disabled:opacity-50"
              >
                <Sparkles size={20} className={generatingAI ? 'animate-pulse' : ''} /> 
                {generatingAI ? 'ENGAGING...' : 'AI OPTIMIZE SERVICES'}
              </button>
            )}
            <button 
             onClick={() => { setShowModal(true); setEditingItem(null); setFormData(getDefaultFormData()); }}
             className="flex items-center gap-4 px-10 py-5 bg-[#1E88E5] text-white rounded-[32px] font-black text-sm uppercase tracking-widest hover:scale-105 transition-all shadow-[0_20px_50px_rgba(30,136,229,0.2)]"
            >
              <Plus size={20} /> ADD NEW {typeLabel.toUpperCase()}
            </button>
            {['projects', 'projectCategories', 'services', 'serviceCategories', 'sectors', 'coverageAreas'].includes(type) && (
              <button 
                onClick={() => {
                  const demoSectors = [
                    { name: "Apparel & Textiles", icon: "🧵", color: "#1E88E5", enabled: true, order: 1 },
                    { name: "Manufacturing", icon: "🏭", color: "#00b4d8", enabled: true, order: 2 },
                    { name: "Food & Beverage", icon: "🥤", color: "#10b981", enabled: true, order: 3 },
                    { name: "Infrastructure", icon: "🏗️", color: "#f59e0b", enabled: true, order: 4 }
                  ];

                  const demoCoverage = [
                    { name: "Western Province", labs: "03 Nodes", focus: "Corporate Headquarters & Main Service Hub", enabled: true, order: 1 },
                    { name: "Industrial Zones", labs: "08 Support Bases", focus: "Real-time Field Engineering & Maintenance", enabled: true, order: 2 },
                    { name: "South Asia Reach", labs: "Remote Support", focus: "Regional Consultation & Technical Logistics", enabled: true, order: 3 },
                  ];

                  const demoProjects = [
                    { 
                      title: 'Solar Array Phase II', 
                      client: 'GreenPower Corp', 
                      year: '2023', 
                      location: 'Arizona, USA',
                      description: 'Large-scale solar infrastructure deployment featuring 5,000+ PV panels with automated tracking systems.', 
                      fullDescription: 'This comprehensive solar deployment involved the expansion of an existing energy farm to a total capacity of 500MW. Our team engineered a custom mounting solution that optimizes panel tilt based on real-time solar tracking data, improving efficiency by 14%. The project also included the implementation of a proprietary battery storage matrix to stabilize output during peak demand periods.',
                      enabled: true, 
                      order: 1, 
                      imageUrl: 'https://images.unsplash.com/photo-1509391366360-fe5bb5852e9c?auto=format&fit=crop&q=80&w=1200', 
                      category: 'Renewable Energy', 
                      status: 'completed',
                      features: ['Automated Axis Tracking', 'BMS Integration', 'Grid-Stabilization Algorithms'],
                      challenges: 'Extreme thermal fluctuations and high wind speeds required structural reinforcement beyond standard ratings.',
                      solutions: 'Implemented aerodynamic cowling and reinforced steel alloys to ensure structural integrity in hurricane-force winds.',
                      gallery: [
                        { url: 'https://images.unsplash.com/photo-1466611653911-95081537e5b7?auto=format&fit=crop&q=80&w=1200', caption: 'Initial site preparation and grid layout' },
                        { url: 'https://images.unsplash.com/photo-1542332213-9b5a5a3fad35?auto=format&fit=crop&q=80&w=1200', caption: 'Automated tracking system assembly' }
                      ]
                    },
                    { 
                      title: 'Smart Grid Integration', 
                      client: 'Metro Utilities', 
                      year: '2024', 
                      location: 'Singapore, Central',
                      description: 'Implementing advanced load balancing and real-time monitoring across the urban power grid.', 
                      fullDescription: 'A multi-phase digital transformation for the municipal power authority. Our matrix solutions group deployed 20,000+ edge sensors to monitor grid health and predict failures before they occur. The system leverages AI-driven dispatching to manage fluctuating loads from dispersed renewable sources.',
                      enabled: true, 
                      order: 2, 
                      imageUrl: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&q=80&w=1200', 
                      category: 'Energy', 
                      status: 'ongoing',
                      features: ['Real-time Edge Computing', 'Predictive Failure Analysis', 'Decentralized Monitoring'],
                      challenges: 'Legacy analog infrastructure required extensive patching and custom interface engineering.',
                      solutions: 'Developed a proprietary hardware bridge that translates analog signals into encoded digital data streams.',
                      gallery: [
                        { url: 'https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?auto=format&fit=crop&q=80&w=1200', caption: 'Data center node synchronization' }
                      ]
                    },
                    { title: 'Assembly Line Automation', client: 'Precision Auto', year: '2013', description: 'Robotic arm integration and IoT-driven assembly coordination for high-volume automotive parts.', enabled: true, order: 3, imageUrl: 'https://images.unsplash.com/photo-1565465295423-68c959a59c90?auto=format&fit=crop&q=80&w=1200', category: 'Manufacturing', status: 'completed' },
                    { title: 'Deep Sea Cable Network', client: 'Oceanic Telecom', year: '2022', description: 'Strategic deployment of high-speed telecommunications cables across the shelf-break region.', enabled: true, order: 4, imageUrl: 'https://images.unsplash.com/photo-1544644011-87b8d440ef5d?auto=format&fit=crop&q=80&w=1200', category: 'Infrastructure', status: 'completed' },
                    { title: 'Waste-to-Heat Facility', client: 'EcoCity Solutions', year: '2024', description: 'Turn-key construction of a sustainable energy plant converting municipal waste into district heating.', enabled: true, order: 5, imageUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&q=80&w=1200', category: 'Environment', status: 'ongoing' },
                    { title: 'High-Speed Rail Bridge', client: 'TransLink Express', year: '2022', description: 'Structural engineering and seismic reinforcement for a 1.2km span over the industrial delta.', enabled: true, order: 6, imageUrl: 'https://images.unsplash.com/photo-1513828583688-c52646db42da?auto=format&fit=crop&q=80&w=1200', category: 'Infrastructure', status: 'completed' }
                  ];

                  const demoServices = [
                    { title: 'Industrial Electrical Systems', description: 'Complete design and installation of high-voltage systems for factories and warehouses.', enabled: true, order: 1, icon: '⚡', complexity: 5, industrialTier: 3 },
                    { title: 'Automation & Controls', description: 'Custom PLC programming and robotic integration for manufacturing excellence.', enabled: true, order: 2, icon: '🤖', complexity: 4, industrialTier: 2 },
                    { title: 'Mechanical Engineering', description: 'Strategic structural audits and mechanical system optimization for heavy machinery.', enabled: true, order: 3, icon: '🔧', complexity: 3, industrialTier: 2 },
                    { title: 'Predictive Maintenance', description: 'IoT-driven monitoring and analytics to prevent downtime before it happens.', enabled: true, order: 4, icon: 'Activity', complexity: 4, industrialTier: 1 },
                    { title: 'Infrastructure Resilience', description: 'Seismic reinforcement and structural hardening for critical utility networks.', enabled: true, order: 5, icon: 'Shield', complexity: 5, industrialTier: 3 }
                  ];

                  const demoCategories = type.toLowerCase().includes('project') 
                    ? ['Renewable Energy', 'Energy', 'Manufacturing', 'Infrastructure', 'Environment', 'Modernization', 'Chemical', 'Logistics'].map((t, i) => ({ title: t, order: i + 1, enabled: true }))
                    : ['Automation', 'Civil Engineering', 'Electrical', 'Machine Service', 'Consulting'].map((t, i) => ({ title: t, order: i + 1, enabled: true }));

                  const isCategoryTab = isCategory;

                  askPermission(
                    `Initialize ${isCategoryTab ? 'Category' : (type.toLowerCase().includes('project') ? 'Project' : 'Service')} Demo Data Seeding? This will inject curated industrial data into your database.`,
                    async () => {
                      notify('Batching data transmission...', 'info');
                      try {
                        let targetData = [];
                        if (isCategoryTab) {
                          targetData = demoCategories;
                        } else if (type === 'sectors') {
                          targetData = demoSectors;
                        } else if (type === 'coverageAreas') {
                          targetData = demoCoverage;
                        } else if (type.toLowerCase().includes('project')) {
                          targetData = demoProjects;
                        } else {
                          targetData = demoServices;
                        }

                        for (const p of targetData) {
                          await addDoc(collection(db, type), {
                            ...p,
                            createdAt: new Date().toISOString()
                          });
                        }
                        notify(`Seeding complete. ${type.toUpperCase()} synchronized.`, 'success');
                        logActivity(`SEED_DEMO_${type.toUpperCase()}`, `${targetData.length}_items`);
                      } catch (e: any) {
                        notify('Seeding failed: ' + e.message, 'error');
                      }
                    },
                    "Data Seeding Protocol"
                  );
                }}
                className="flex items-center gap-4 px-10 py-5 bg-white/5 border border-white/10 text-white/60 rounded-[32px] font-black text-sm uppercase tracking-widest hover:bg-white/10 hover:text-white transition-all shadow-xl"
              >
                SEED DEMO {isCategory ? 'CATEGORIES' : 'DATA'}
              </button>
            )}
          </div>
      </div>

      <div className="bg-[#0B1426] rounded-[56px] border border-white/5 overflow-hidden shadow-2xl">
        <table className="w-full text-left table-fixed">
          <thead className="bg-white/5 border-b border-white/5">
            <tr>
              <th className="w-20 px-10 py-8 text-[10px] font-black uppercase tracking-widest text-white/40">
                <input 
                  type="checkbox" 
                  checked={filteredItems.length > 0 && selectedIds.length === filteredItems.length}
                  onChange={toggleSelectAll}
                  className="w-5 h-5 rounded-lg border-2 border-white/20 bg-white/5 checked:bg-royal transition-all cursor-pointer accent-royal focus:ring-2 focus:ring-royal/40"
                />
              </th>
              <th className="w-16 px-6 py-8 text-[10px] font-black uppercase tracking-widest text-white/40">Sort</th>
              <th className="w-32 px-10 py-8 text-[10px] font-black uppercase tracking-widest text-white/40">
                {isCategory ? 'Icon' : 'Media'}
              </th>
              <th className="px-10 py-8 text-[10px] font-black uppercase tracking-widest text-white/40">
                {isCategory ? 'Category Name' : 'Name / Title'}
              </th>
              {type === 'services' && (
                <th className="w-48 px-10 py-8 text-[10px] font-black uppercase tracking-widest text-white/40">Technical Specs</th>
              )}
              <th className="w-40 px-10 py-8 text-[10px] font-black uppercase tracking-widest text-white/40">Status</th>
              <th className="w-48 px-10 py-8 text-[10px] font-black uppercase tracking-widest text-white/40 text-right">Actions</th>
            </tr>
          </thead>
          <Reorder.Group axis="y" values={items} onReorder={handleReorder} as="tbody" className="divide-y divide-white/5">
            {filteredItems.map((item) => (
              <Reorder.Item 
                key={item.id} 
                value={item} 
                as="tr" 
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                whileDrag={{ 
                  scale: 1.01, 
                  backgroundColor: "rgba(30, 136, 229, 0.1)",
                  boxShadow: "0 20px 40px rgba(0,0,0,0.4)",
                  zIndex: 50,
                }}
                className="group cursor-grab active:cursor-grabbing relative"
              >
                <td className="px-10 py-8">
                  <input 
                    type="checkbox" 
                    checked={selectedIds.includes(item.id)}
                    onChange={() => toggleSelectItem(item.id)}
                    onClick={(e) => e.stopPropagation()}
                    className="w-5 h-5 rounded-lg border-2 border-white/20 bg-white/5 checked:bg-royal transition-all cursor-pointer accent-royal focus:ring-2 focus:ring-royal/40"
                  />
                </td>
                <td className="px-6 py-8">
                   <div className="text-white/20 group-hover:text-[#1E88E5] transition-colors">
                      <GripVertical size={20} />
                   </div>
                </td>
                <td className="px-10 py-8">
                  <div className="w-20 h-20 bg-white/5 rounded-3xl overflow-hidden shadow-inner border border-white/10 flex items-center justify-center">
                    {isCategory ? (
                      <div className="text-3xl">{item.icon || '📁'}</div>
                    ) : (
                      <img src={item.imageUrl || item.logoUrl || 'https://via.placeholder.com/150'} alt="item" className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity" />
                    )}
                  </div>
                </td>
                <td className="px-10 py-8">
                  <div className="flex items-center gap-3">
                    <div className="font-black text-white text-lg">{item.title || item.name}</div>
                    {type === 'projects' && (
                      <div className="px-2 py-0.5 bg-royal/10 border border-royal/20 rounded text-[9px] font-black text-royal uppercase tracking-tighter">
                        ID: {item.id.slice(0, 8)}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-4 mt-1">
                    <div className="text-[10px] text-white/20 font-bold uppercase tracking-widest">
                      {categories.find(c => c.id === item.category)?.title || categories.find(c => c.id === item.category)?.name || item.category || item.websiteUrl || (isCategory ? 'Category' : 'Global Resource')}
                    </div>
                    {item.status && (
                      <div className={`px-3 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest border ${
                        item.status === 'ongoing' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-white/5 text-white/40 border-white/10'
                      }`}>
                        {item.status}
                      </div>
                    )}
                  </div>
                </td>
                {type === 'services' && (
                  <td className="px-10 py-8">
                    <div className="space-y-2">
                       <div className="flex gap-1">
                          {[1,2,3,4,5].map(lvl => (
                            <div key={lvl} className={`h-1 w-3 rounded-full ${lvl <= (item.complexity || 3) ? 'bg-[#1E88E5]' : 'bg-white/5'}`} />
                          ))}
                       </div>
                       <div className="text-[8px] font-black text-white/40 uppercase tracking-widest">
                          Tier {item.industrialTier || 1} Infrastructure
                       </div>
                    </div>
                  </td>
                )}
                <td className="px-10 py-8">
                  <button 
                    onClick={() => toggleStatus(item)}
                    className={`flex items-center gap-3 px-5 py-2.5 rounded-2xl font-black text-[10px] tracking-widest uppercase transition-all ${
                      item.enabled ? 'bg-emerald-400/10 text-emerald-400 border border-emerald-400/20' : 'bg-white/5 text-white/20 border border-white/10'
                    }`}
                  >
                    {item.enabled ? <Eye size={12} /> : <EyeOff size={12} />}
                    {item.enabled ? 'VISIBLE' : 'HIDDEN'}
                  </button>
                </td>
                <td className="px-10 py-8 text-right">
                  <div className="flex gap-3 justify-end items-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => { setEditingItem(item); setFormData({ ...getDefaultFormData(), ...item }); setShowModal(true); }}
                      className="p-4 bg-white/5 text-[#1E88E5] rounded-2xl hover:bg-[#1E88E5] hover:text-white transition-all shadow-xl border border-white/5"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button 
                      onClick={() => handleDelete(item.id)}
                      className="p-4 bg-rose-500/10 text-rose-500 rounded-2xl hover:bg-rose-500 hover:text-white transition-all shadow-xl border border-rose-500/10"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </Reorder.Item>
            ))}
            {filteredItems.length === 0 && (
              <tr>
                <td colSpan={6} className="py-40 text-center">
                  <div className="flex flex-col items-center justify-center opacity-10">
                    {getTypeIcon(type)}
                    <p className="mt-6 font-black uppercase tracking-[0.5em] text-xs">No {type} found in database</p>
                  </div>
                </td>
              </tr>
            )}
          </Reorder.Group>
        </table>
      </div>

      {/* Visual Preview Section for specialized types */}
      {['sectors', 'coverageAreas', 'clients'].includes(type) && items.length > 0 && (
        <div className="mt-24 space-y-12 pb-20">
          <div className="flex items-center gap-4">
            <div className="h-px flex-grow bg-white/5"></div>
            <h3 className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em] flex items-center gap-3">
              <Eye size={12} className="text-[#1E88E5]" />
              Live Design Preview
            </h3>
            <div className="h-px flex-grow bg-white/5"></div>
          </div>

          <div className={`grid gap-8 ${
            type === 'sectors' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4' : 
            type === 'coverageAreas' ? 'grid-cols-1 md:grid-cols-3' : 
            'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
          }`}>
            {items.filter(i => i.enabled).map((item, i) => (
              <div key={item.id}>
                {type === 'sectors' && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.1 }}
                    className="glass-morphism p-10 rounded-[40px] border border-white/5 group relative overflow-hidden text-left"
                  >
                    <div className="absolute -right-8 -top-8 w-32 h-32 blur-3xl opacity-0 group-hover:opacity-20 transition-opacity" style={{ backgroundColor: item.color || '#1E88E5' }} />
                    <div className="text-5xl mb-8 group-hover:scale-110 transition-transform inline-block">{item.icon || '📁'}</div>
                    <h4 className="text-xl font-black text-white italic uppercase tracking-tighter">{item.title || item.name}</h4>
                  </motion.div>
                )}

                {type === 'coverageAreas' && (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="p-10 border-l border-white/10 space-y-6 text-left h-full bg-white/2"
                  >
                    <div className="text-[#10b981] font-black text-[10px] uppercase tracking-[0.4em]">{item.labs || '0 Nodes'}</div>
                    <h5 className="text-xl font-black text-white italic tracking-tighter uppercase">{item.title || item.name}</h5>
                    <p className="text-white/40 text-xs font-medium leading-relaxed">{item.focus || 'System node description pending...'}</p>
                  </motion.div>
                )}

                {type === 'clients' && (
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="group bg-white/5 border border-white/10 rounded-[40px] flex flex-col hover:border-[#1E88E5]/30 transition-all duration-700 relative overflow-hidden h-full"
                  >
                    <div className="w-full h-48 bg-white/5 p-8 flex items-center justify-center relative overflow-hidden border-b border-white/5 shadow-inner">
                      <div className="absolute inset-0 bg-[#1E88E5]/0 rounded-full blur-[40px] group-hover:bg-[#1E88E5]/10 transition-all duration-700" />
                      <img 
                        src={item.logoUrl || item.imageUrl || 'https://via.placeholder.com/150'} 
                        alt={item.name} 
                        className="relative z-10 w-full h-full object-contain opacity-80 group-hover:opacity-100 transition-all duration-1000 group-hover:scale-110"
                      />
                    </div>
                    <div className="p-8 text-center flex-grow flex flex-col justify-center">
                        <h3 className="text-lg font-black text-white mb-2 leading-tight group-hover:text-[#1E88E5] transition-colors uppercase italic">{item.title || item.name}</h3>
                        <p className="text-[#00b4d8] text-[9px] font-black uppercase tracking-[0.2em] opacity-60">
                            {item.category || item.description || 'Industrial Partner'}
                        </p>
                    </div>
                  </motion.div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 backdrop-blur-xl bg-black/60">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            data-lenis-prevent
            className="bg-[#0B1426] w-full max-w-5xl rounded-[56px] shadow-[0_0_100px_rgba(0,0,0,0.8)] p-12 overflow-y-auto max-h-[90vh] border border-white/10"
          >
            <div className="flex justify-between items-center mb-12">
               <div>
                  <h3 className="text-3xl font-black text-white italic uppercase tracking-tighter">
                    {editingItem ? 'Modify' : 'Initialize'} {typeLabel}
                  </h3>
                  <div className="w-12 h-1 bg-[#1E88E5] mt-2 rounded-full" />
               </div>
               <button onClick={() => setShowModal(false)} className="p-4 bg-white/5 hover:bg-white/10 text-white/40 hover:text-white rounded-full transition-all">
                 <X size={24} />
               </button>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-12 text-left">
              <div className="space-y-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-black tracking-widest text-[#1E88E5] uppercase">Matrix Node ID (System)</label>
                  <div className="w-full bg-[#1E88E5]/5 border border-[#1E88E5]/20 rounded-2xl p-6 text-sm font-mono text-[#1E88E5]">
                     {editingItem ? editingItem.id : 'Pending Initialization...'}
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black tracking-widest text-white/40 uppercase">Primary Identity (Name/Title)</label>
                  <input 
                    type="text"
                    required
                    value={['clients', 'sectors', 'coverageAreas'].includes(type) || isCategory ? formData.name || formData.title : formData.title || formData.name}
                    onChange={(e) => setFormData({...formData, [['clients', 'sectors', 'coverageAreas'].includes(type) || isCategory ? 'name' : 'title']: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-6 text-lg font-black text-white focus:border-[#1E88E5] outline-none transition-all"
                    placeholder={`Enter ${typeLabel} name...`}
                  />
                </div>

                {type === 'sectors' && (
                  <div className="space-y-3">
                    <label className="text-[10px] font-black tracking-widest text-white/40 uppercase">Sector Highlight Color</label>
                    <div className="flex gap-4">
                      <input 
                        type="color"
                        value={formData.color}
                        onChange={(e) => setFormData({...formData, color: e.target.value})}
                        className="w-20 h-16 bg-white/5 border border-white/10 rounded-2xl p-2 cursor-pointer"
                      />
                      <input 
                        type="text"
                        value={formData.color}
                        onChange={(e) => setFormData({...formData, color: e.target.value})}
                        className="flex-grow bg-white/5 border border-white/10 rounded-2xl p-6 text-white font-mono uppercase"
                      />
                    </div>
                  </div>
                )}

                {type === 'coverageAreas' && (
                  <>
                    <div className="space-y-3">
                      <label className="text-[10px] font-black tracking-widest text-white/40 uppercase">Nodes / Labs Count</label>
                      <input 
                        type="text"
                        value={formData.labs}
                        onChange={(e) => setFormData({...formData, labs: e.target.value})}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl p-6 text-white outline-none focus:border-[#1E88E5]"
                        placeholder="e.g. 03 Nodes"
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-black tracking-widest text-white/40 uppercase">Operational Focus</label>
                      <AutoExpandingTextarea 
                         label=""
                         value={formData.focus}
                         onChange={(v) => setFormData({...formData, focus: v})}
                         placeholder="Deep mission description..."
                      />
                    </div>
                  </>
                )}

                {categoryCollection && !isCategory && (
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] font-black tracking-widest text-white/40 uppercase">Assignment Category</label>
                      {type === 'projects' && (
                        <button 
                          type="button"
                          onClick={async () => {
                            if (!formData.title || !formData.description) {
                              notify('Title and Description required for AI insight', 'info');
                              return;
                            }
                            setGeneratingAI(true);
                            const cat = await suggestProjectCategory(formData.title, formData.description);
                            // Set if match found in categories
                            const match = categories.find(c => (c.title || c.name || '').toLowerCase() === cat.toLowerCase());
                            if (match) {
                               setFormData({...formData, category: match.id});
                               notify(`AI suggested: ${cat}`, 'success');
                            } else {
                               notify(`AI suggested "${cat}", but category not found in system.`, 'info');
                            }
                            setGeneratingAI(false);
                          }}
                          className={`flex items-center gap-2 px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                            generatingAI 
                              ? 'bg-white/5 text-white/20 cursor-not-allowed' 
                              : 'bg-matrix/10 text-matrix hover:bg-matrix hover:text-white border border-matrix/20'
                          }`}
                        >
                          <Sparkles size={12} className={generatingAI ? 'animate-pulse' : ''} />
                          AI SUGGEST
                        </button>
                      )}
                    </div>
                    <select 
                      value={formData.category}
                      onChange={(e) => setFormData({...formData, category: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl p-6 text-white focus:border-[#1E88E5] outline-none appearance-none cursor-pointer"
                    >
                      <option value="" className="bg-[#0B1426]">Select Category...</option>
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.id} className="bg-[#0B1426]">{cat.title || cat.name}</option>
                      ))}
                    </select>
                  </div>
                )}

                {type === 'projects' && (
                  <div className="space-y-3">
                    <label className="text-[10px] font-black tracking-widest text-white/40 uppercase">Operational Status</label>
                    <div className="flex gap-4 p-2 bg-white/5 rounded-2xl border border-white/10">
                      <button
                        type="button"
                        onClick={() => setFormData({...formData, status: 'ongoing'})}
                        className={`flex-1 py-4 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${formData.status === 'ongoing' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'text-white/40 hover:text-white'}`}
                      >
                        Ongoing Operation
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData({...formData, status: 'completed'})}
                        className={`flex-1 py-4 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${formData.status === 'completed' ? 'bg-[#1E88E5] text-white shadow-lg shadow-blue/20' : 'text-white/40 hover:text-white'}`}
                      >
                        Completed Asset
                      </button>
                    </div>
                  </div>
                )}

                {(type === 'services' || isCategory) && (
                  <div className="space-y-8">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <label className="text-[10px] font-black tracking-widest text-white/40 uppercase">Icon (Emoji/Lucide)</label>
                        <button 
                          type="button"
                          onClick={() => handleAIGenerate()}
                          disabled={generatingAI}
                          className={`flex items-center gap-2 px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                            generatingAI 
                              ? 'bg-white/5 text-white/20 cursor-not-allowed' 
                              : 'bg-[#1E88E5]/10 text-[#1E88E5] hover:bg-[#1E88E5] hover:text-white border border-[#1E88E5]/20'
                          }`}
                        >
                          <Sparkles size={12} className={generatingAI ? 'animate-pulse' : ''} />
                          {generatingAI ? 'SCANNING...' : 'AI SCAN NAME'}
                        </button>
                      </div>
                      <div className="flex gap-4">
                        <div className="w-16 h-[76px] bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center text-[#1E88E5]">
                          {(() => {
                            const iconMapPreview: any = {
                              '🔧': Tool, '⚡': Zap, '🤖': Bot, '📟': Cpu, '🏭': Factory, '📦': Package, '🛠️': LifeBuoy, '🏗️': Construction, '💨': Wind, '☀️': Sun, '📹': Camera,
                              'Settings': SettingsIcon, 'Activity': Activity, 'Shield': Shield, 'Zap': Zap, 'Cpu': Cpu, 'Boxes': Boxes, 'Wrench': Tool, 'Factory': Factory, 'Sun': Sun, 'Video': Video, 'Wind': Wind, 'Hammer': Hammer, 'HardHat': HardHat, 'UtilityPole': UtilityPole, 'Component': Component, 'Drill': Drill, 'Anvil': Anvil, 'Tool': Tool, 'PlugZap': PlugZap, 'Bolt': Bolt
                            };
                            const IconComp = iconMapPreview[formData.icon];
                            return IconComp ? <IconComp size={24} /> : <span className="text-xl">{formData.icon}</span>;
                          })()}
                        </div>
                        <input 
                          type="text"
                          value={formData.icon}
                          onChange={(e) => setFormData({...formData, icon: e.target.value})}
                          className="flex-grow bg-white/5 border border-white/10 rounded-2xl p-6 text-white focus:border-[#1E88E5] outline-none font-black uppercase text-xs tracking-widest"
                        />
                      </div>
                    </div>

                    {type === 'services' && (
                      <div className="grid grid-cols-2 gap-8 bg-[#1E88E5]/5 p-8 rounded-[40px] border border-[#1E88E5]/10">
                        <div className="space-y-4">
                          <label className="text-[10px] font-black tracking-widest text-[#1E88E5] uppercase">Technical Complexity</label>
                          <div className="flex gap-2">
                            {[1, 2, 3, 4, 5].map((level) => (
                              <button
                                key={level}
                                type="button"
                                onClick={() => setFormData({...formData, complexity: level})}
                                className={`h-3 flex-grow rounded-full transition-all ${
                                  level <= (formData.complexity || 3) ? 'bg-[#1E88E5]' : 'bg-white/5'
                                }`}
                              />
                            ))}
                          </div>
                          <div className="flex justify-between text-[8px] font-black text-white/20 uppercase tracking-widest">
                            <span>Basic</span>
                            <span>Advanced</span>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <label className="text-[10px] font-black tracking-widest text-[#1E88E5] uppercase">Industrial Tier</label>
                          <div className="flex gap-4">
                            {[1, 2, 3].map((tier) => (
                              <button
                                key={tier}
                                type="button"
                                onClick={() => setFormData({...formData, industrialTier: tier})}
                                className={`flex-1 py-3 rounded-xl font-black text-[10px] border transition-all ${
                                  (formData.industrialTier || 1) === tier 
                                    ? 'bg-[#1E88E5] text-white border-[#1E88E5]' 
                                    : 'bg-white/5 text-white/20 border-white/10'
                                }`}
                              >
                                TIER {tier}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {type === 'projects' && (
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <label className="text-[10px] font-black tracking-widest text-white/40 uppercase">Client Name</label>
                      <input 
                        type="text"
                        value={formData.client}
                        onChange={(e) => setFormData({...formData, client: e.target.value})}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl p-6 text-white focus:border-[#1E88E5] outline-none"
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-black tracking-widest text-white/40 uppercase">Completion Year</label>
                      <input 
                        type="text"
                        value={formData.year}
                        onChange={(e) => setFormData({...formData, year: e.target.value})}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl p-6 text-white focus:border-[#1E88E5] outline-none"
                      />
                    </div>
                    <div className="space-y-3 col-span-2">
                      <label className="text-[10px] font-black tracking-widest text-white/40 uppercase">Project Location</label>
                      <input 
                        type="text"
                        value={formData.location}
                        onChange={(e) => setFormData({...formData, location: e.target.value})}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl p-6 text-white focus:border-[#1E88E5] outline-none"
                      />
                    </div>
                  </div>
                )}

                {type !== 'clients' && !isCategory && (
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] font-black tracking-widest text-white/40 uppercase">Short Brief</label>
                      <button 
                        type="button"
                        onClick={() => handleAIGenerate()}
                        disabled={generatingAI}
                        className={`flex items-center gap-2 px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                          generatingAI 
                            ? 'bg-white/5 text-white/20 cursor-not-allowed' 
                            : 'bg-[#1E88E5]/10 text-[#1E88E5] hover:bg-[#1E88E5] hover:text-white border border-[#1E88E5]/20'
                        }`}
                      >
                        <Sparkles size={12} className={generatingAI ? 'animate-pulse' : ''} />
                        {generatingAI ? 'GENERATING...' : 'AI GENERATE'}
                      </button>
                    </div>
                    <textarea 
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      rows={3}
                      className="w-full bg-white/5 border border-white/10 rounded-3xl p-6 font-medium text-white/60 focus:border-[#1E88E5] outline-none transition-all"
                      placeholder="Explain the scope and impact..."
                    />
                  </div>
                )}

                {type === 'projects' && (
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] font-black tracking-widest text-white/40 uppercase">Full Case Study / Detailed Overview</label>
                      <button 
                        type="button"
                        onClick={() => handleAIGenerate('fullDescription')}
                        disabled={generatingAI}
                        className="text-[#1E88E5] text-[10px] font-black uppercase tracking-widest hover:text-white transition-all flex items-center gap-2"
                      >
                         <Sparkles size={14} className={generatingAI ? 'animate-pulse' : ''} /> Generate Full Matrix
                      </button>
                    </div>
                    <textarea 
                      value={formData.fullDescription}
                      onChange={(e) => setFormData({...formData, fullDescription: e.target.value})}
                      rows={10}
                      className="w-full bg-white/5 border border-white/10 rounded-3xl p-6 font-medium text-white/60 focus:border-[#1E88E5] outline-none transition-all"
                      placeholder="Dive deep into the project details, methodologies, and technical specs..."
                    />
                  </div>
                )}

                {type === 'projects' && (
                  <div className="grid grid-cols-1 gap-8">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <label className="text-[10px] font-black tracking-widest text-white/40 uppercase">Challenges Faced</label>
                        <button 
                          type="button"
                          onClick={() => handleAIGenerate('challenges')}
                          disabled={generatingAI}
                          className="text-[#1E88E5] text-[10px] font-black uppercase tracking-widest hover:text-white transition-all flex items-center gap-2"
                        >
                           <Sparkles size={14} className={generatingAI ? 'animate-pulse' : ''} /> Predict Challenges
                        </button>
                      </div>
                      <textarea 
                        value={formData.challenges}
                        onChange={(e) => setFormData({...formData, challenges: e.target.value})}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl p-6 text-white/60 outline-none focus:border-[#1E88E5]"
                        placeholder="What technical or environmental obstacles were encountered?"
                      />
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <label className="text-[10px] font-black tracking-widest text-white/40 uppercase">Engineered Solutions</label>
                        <button 
                          type="button"
                          onClick={() => handleAIGenerate('solutions')}
                          disabled={generatingAI}
                          className="text-[#1E88E5] text-[10px] font-black uppercase tracking-widest hover:text-white transition-all flex items-center gap-2"
                        >
                           <Sparkles size={14} className={generatingAI ? 'animate-pulse' : ''} /> Engineer Fixes
                        </button>
                      </div>
                      <textarea 
                        value={formData.solutions}
                        onChange={(e) => setFormData({...formData, solutions: e.target.value})}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl p-6 text-white/60 outline-none focus:border-[#1E88E5]"
                        placeholder="How were these challenges resolved via engineering?"
                      />
                    </div>
                  </div>
                )}

                {type === 'projects' && (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] font-black tracking-widest text-white/40 uppercase">Core Features & Deliverables</label>
                      <button 
                        type="button" 
                        onClick={() => setFormData({...formData, features: [...(formData.features || []), '']})}
                        className="text-[#1E88E5] text-[10px] font-black uppercase tracking-widest hover:text-white transition-all flex items-center gap-2"
                      >
                        <Plus size={14} /> Add Feature
                      </button>
                    </div>
                    {(formData.features || []).map((feat: string, fIdx: number) => (
                      <div key={fIdx} className="flex gap-4">
                        <input 
                          type="text"
                          value={feat}
                          onChange={(e) => {
                            const newFeats = [...formData.features];
                            newFeats[fIdx] = e.target.value;
                            setFormData({...formData, features: newFeats});
                          }}
                          className="flex-grow bg-white/5 border border-white/10 rounded-2xl p-5 text-sm text-white"
                          placeholder="Feature description..."
                        />
                        <button 
                          type="button"
                          onClick={() => {
                            const newFeats = formData.features.filter((_: any, i: number) => i !== fIdx);
                            setFormData({...formData, features: newFeats});
                          }}
                          className="p-5 bg-rose-500/10 text-rose-500 rounded-2xl hover:bg-rose-500 hover:text-white transition-all"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-6">
                    {type === 'clients' && (
                    <div className="space-y-3 col-span-2">
                        <label className="text-[10px] font-black tracking-widest text-white/40 uppercase">Corporate Website (URL)</label>
                        <input 
                        type="url"
                        value={formData.websiteUrl}
                        onChange={(e) => setFormData({...formData, websiteUrl: e.target.value})}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl p-6 font-bold text-white focus:border-[#1E88E5] outline-none"
                        placeholder="https://..."
                        />
                    </div>
                    )}
                </div>
              </div>

              <div className="space-y-8">
                {!isCategory && (
                  <ImageDropzone 
                    label={type === 'clients' ? "Client Logo" : "Hero Image"}
                    value={type === 'clients' ? formData.logoUrl : formData.imageUrl}
                    onChange={(val: string) => setFormData((prev: any) => ({...prev, [type === 'clients' ? 'logoUrl' : 'imageUrl']: val}))}
                  />
                )}

                {type === 'projects' && (
                   <GalleryManager 
                     images={formData.gallery} 
                     onChange={(imgs) => setFormData({...formData, gallery: imgs})}
                   />
                )}

                <div className="pt-12 flex gap-6">
                  <button 
                    type="button" 
                    onClick={() => setShowModal(false)}
                    className="flex-grow py-6 bg-white/5 hover:bg-white/10 text-white/40 hover:text-white rounded-[32px] font-black text-sm uppercase tracking-widest transition-all border border-white/5"
                  >
                    DISCARD
                  </button>
                  <button 
                    type="submit" 
                    className="flex-[2] py-6 bg-[#1E88E5] text-white rounded-[32px] font-black text-sm uppercase tracking-widest shadow-[0_20px_50px_rgba(30,136,229,0.3)] hover:scale-105 transition-all"
                  >
                    {editingItem ? 'COMMIT CHANGES' : 'CREATE RESOURCE'}
                  </button>
                </div>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}

// --- Nested Tab Manager (Services & Portfolio) ---
function NestedManager({ mainType, catType, ImageDropzone, logActivity, notify, askPermission }: { mainType: string, catType: string, ImageDropzone: any, logActivity: any, notify: any, askPermission: any }) {
  const [activeSubTab, setActiveSubTab] = useState<'items' | 'categories'>('items');

  return (
    <div className="space-y-8 text-left">
      <div className="flex bg-[#0B1426] p-2 rounded-[32px] w-fit border border-white/5 shadow-2xl">
        <button
          onClick={() => setActiveSubTab('items')}
          className={`px-10 py-4 rounded-3xl font-black text-[10px] uppercase tracking-widest transition-all ${
            activeSubTab === 'items' ? 'bg-[#1E88E5] text-white shadow-lg' : 'text-white/40 hover:text-white'
          }`}
        >
          {mainType === 'services' ? 'Services List' : 'Portfolio Grid'}
        </button>
        <button
          onClick={() => setActiveSubTab('categories')}
          className={`px-10 py-4 rounded-3xl font-black text-[10px] uppercase tracking-widest transition-all ${
            activeSubTab === 'categories' ? 'bg-[#1E88E5] text-white shadow-lg' : 'text-white/40 hover:text-white'
          }`}
        >
          Manage Categories
        </button>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeSubTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {activeSubTab === 'items' ? (
            <GenericManager 
              type={mainType} 
              categoryCollection={catType}
              ImageDropzone={ImageDropzone} 
              logActivity={logActivity} 
              notify={notify} 
              askPermission={askPermission}
            />
          ) : (
            <GenericManager 
              type={catType} 
              ImageDropzone={ImageDropzone} 
              logActivity={logActivity} 
              notify={notify} 
              askPermission={askPermission}
            />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// --- Reviews Manager ---
function ReviewsManager({ notify, logActivity, askPermission }: { notify: any, logActivity: any, askPermission: any }) {
  const [reviews, setReviews] = useState<any[]>([]);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved'>('all');

  useEffect(() => {
    const q = query(collection(db, 'reviews'), orderBy('timestamp', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      setReviews(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'reviews'));
    return () => unsub();
  }, []);

  const approveReview = async (id: string) => {
    try {
      notify('Approving review...', 'info');
      await updateDoc(doc(db, 'reviews', id), { approved: true });
      await logActivity('APPROVE_REVIEW', id);
      notify('Review approved and live!', 'success');
    } catch (e: any) {
      notify('Approval failed: ' + e.message, 'error');
    }
  };

  const deleteReview = async (id: string) => {
    askPermission(
      'Permanently eliminate this review from the public record? This action is final.',
      async () => {
        try {
          notify('Removing testimonial from grid...', 'info');
          await deleteDoc(doc(db, 'reviews', id));
          await logActivity('DELETE_REVIEW', id);
          notify('Review permanently removed', 'success');
        } catch (e: any) {
          notify('Removal failed: ' + e.message, 'error');
        }
      },
      "Data Purge"
    );
  };

  const filteredReviews = reviews.filter(r => {
    if (filter === 'pending') return r.approved === false;
    if (filter === 'approved') return r.approved === true;
    return true;
  });

  return (
    <div className="space-y-12 text-left">
      <div className="flex justify-between items-center bg-[#0B1426] p-8 rounded-[40px] border border-white/5 shadow-2xl">
        <div className="flex gap-4">
          {(['all', 'pending', 'approved'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${
                filter === f 
                  ? 'bg-[#1E88E5] text-white shadow-lg' 
                  : 'bg-white/5 text-white/40 hover:bg-white/10 hover:text-white'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 pb-20">
        {filteredReviews.map((review, i) => (
          <motion.div
            key={review.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className={`bg-[#0B1426] p-10 rounded-[48px] border border-white/5 relative overflow-hidden group ${!review.approved ? 'border-l-[16px] border-l-amber-500' : 'border-l-[16px] border-l-emerald-500'}`}
          >
            <div className="flex flex-col md:flex-row justify-between items-start gap-12">
              <div className="space-y-6 flex-grow">
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-[#1E88E5] to-[#00b4d8] rounded-3xl flex items-center justify-center font-black text-white text-2xl">
                    {review.author ? review.author[0] : 'U'}
                  </div>
                  <div>
                    <h4 className="text-2xl font-black text-white">{review.author}</h4>
                    <div className="flex text-amber-500 mt-1">
                      {Array.from({ length: review.rating || 5 }).map((_, s) => <Star key={s} size={14} fill="currentColor" />)}
                    </div>
                  </div>
                  {!review.approved && (
                    <span className="px-4 py-1 bg-amber-500 text-white text-[10px] font-black rounded-full uppercase tracking-widest">Pending</span>
                  )}
                  {review.approved && (
                    <span className="px-4 py-1 bg-emerald-500 text-white text-[10px] font-black rounded-full uppercase tracking-widest">Approved</span>
                  )}
                </div>
                <div className="bg-white/5 p-8 rounded-[32px] border border-white/5">
                  <p className="text-white/60 text-lg italic leading-relaxed">"{review.content}"</p>
                </div>
                <div className="text-[10px] font-black uppercase tracking-widest text-white/10 flex items-center gap-2">
                  <Calendar size={12} className="text-[#1E88E5]" />
                  Received: {review.timestamp}
                </div>
              </div>
              <div className="flex flex-col gap-3 w-full md:w-auto">
                {!review.approved && (
                  <button 
                    onClick={() => approveReview(review.id)}
                    className="px-10 py-5 bg-emerald-500 text-white rounded-[24px] font-black text-xs uppercase tracking-widest hover:scale-105 transition-all shadow-lg shadow-emerald-500/20"
                  >
                    Accept Review
                  </button>
                )}
                <button 
                  onClick={() => deleteReview(review.id)}
                  className="px-10 py-5 bg-rose-500/10 text-rose-500 rounded-[24px] font-black text-xs uppercase tracking-widest hover:bg-rose-500 hover:text-white transition-all border border-rose-500/10"
                >
                  Delete Permanently
                </button>
              </div>
            </div>
          </motion.div>
        ))}

        {filteredReviews.length === 0 && (
          <div className="text-center py-40 bg-white/5 rounded-[56px] border-2 border-white/5 border-dashed">
            <MessageSquare size={80} className="mx-auto text-white/5 mb-8" />
            <p className="text-white/20 font-black uppercase tracking-[0.5em] text-sm">No Reviews Found</p>
          </div>
        )}
      </div>
    </div>
  );
}

// --- Messages List ---
function MessagesList({ notify, logActivity, askPermission, limitTo, hideHeader }: { notify: any, logActivity: any, askPermission: any, limitTo?: number, hideHeader?: boolean }) {
  const [messages, setMessages] = useState<any[]>([]);
  const [filter, setFilter] = useState<'all' | 'new' | 'in_progress' | 'completed'>('all');

  useEffect(() => {
    const unsub = onSnapshot(query(collection(db, 'messages'), orderBy('createdAt', 'desc')), (snap) => {
      setMessages(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'messages'));
    return () => unsub();
  }, []);

  const deleteMsg = async (id: string) => {
    askPermission(
      'Permanently purge this project transmission? This action is irreversible and clears all associated data strands.',
      async () => {
        try {
          notify('Purging transmission data...', 'info');
          await deleteDoc(doc(db, 'messages', id));
          await logActivity('DELETE_MESSAGE', id);
          notify('Project record scrubbed', 'success');
        } catch (e: any) {
          notify('Scrub failed: ' + e.message, 'error');
        }
      },
      "Secure Transmission Purge"
    );
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      notify(`Migrating ticket to ${status.replace('_', ' ')} status...`, 'info');
      await updateDoc(doc(db, 'messages', id), { status, read: true });
      await logActivity(`UPDATE_MESSAGE_STATUS_${status.toUpperCase()}`, id);
      notify(`Ticket status updated: ${status.replace('_', ' ')}`, 'success');
    } catch (e: any) {
      notify('Update failed: ' + e.message, 'error');
    }
  };

  const filteredMessages = messages
    .filter(m => {
      if (filter === 'all') return true;
      return m.status === filter;
    })
    .slice(0, limitTo || messages.length);

  return (
    <div className="space-y-8 text-left pb-20">
      {!hideHeader && (
        <div className="flex justify-between items-center bg-[#0B1426] p-8 rounded-[40px] border border-white/5 shadow-2xl">
          <div className="flex flex-wrap gap-4">
            {(['all', 'new', 'in_progress', 'completed'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${
                  filter === f 
                    ? f === 'new' ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/20' :
                      f === 'in_progress' ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/20' :
                      f === 'completed' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' :
                      'bg-[#1E88E5] text-white shadow-lg' 
                    : 'bg-white/5 text-white/40 hover:bg-white/10 hover:text-white'
                }`}
              >
                {f.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>
      )}

      {filteredMessages.map((msg, i) => {
        const name = msg.customerName || msg.name || 'Anonymous';
        const email = msg.customerEmail || msg.email || 'No Email';
        const goal = msg.customerGoal || (msg.message ? msg.message.split('AI Analysis:')[0].replace('Requirement:', '').trim() : 'No Goal Description');
        
        return (
          <motion.div 
            key={msg.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className={`bg-[#0B1426] p-4 rounded-[48px] shadow-2xl border border-white/5 relative overflow-hidden group ${
              msg.status === 'completed' ? 'opacity-60' : 
              !msg.read ? 'border-l-[16px] border-l-[#1E88E5]' : 
              'border-l-[16px] border-l-white/10'
            }`}
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#1E88E5]/5 blur-[120px] rounded-full pointer-events-none" />
            
            <div className="flex flex-col relative z-10">
              {/* --- BLOCK 1: CLIENT IDENTITY --- */}
              <div className={`bg-white/5 p-10 border border-white/5 ${msg.isMatrixRequest ? 'rounded-t-[40px]' : 'rounded-[40px]'}`}>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-10">
                  <div className="flex items-center gap-8">
                    <div className="w-20 h-20 bg-white/5 rounded-[28px] border border-white/10 flex items-center justify-center font-black text-white text-3xl shadow-inner group-hover:bg-[#1E88E5] group-hover:border-[#1E88E5] transition-all duration-500">
                      {name[0]}
                    </div>
                    <div>
                      <h4 className="text-3xl font-black text-white tracking-tighter uppercase mb-1">{name}</h4>
                      <p className="text-sm text-white/40 font-black uppercase tracking-[0.2em]">{email}</p>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    {msg.isMatrixRequest && (
                      <div className="flex items-center gap-2">
                        <span className="px-6 py-2 bg-[#1E88E5]/20 text-[#1E88E5] text-[10px] font-black rounded-full uppercase tracking-widest border border-[#1E88E5]/30 flex items-center gap-2">
                          <Bot size={12} /> AI SOURCE
                        </span>
                        <div className="w-8 h-[2px] bg-[#1E88E5]/30"></div>
                        <span className="text-[10px] font-black text-[#1E88E5] uppercase tracking-widest">Unified Project</span>
                      </div>
                    )}
                    
                    {/* Status Badges */}
                    {msg.status === 'completed' && (
                      <span className="px-6 py-2 bg-emerald-500/20 text-emerald-400 text-[10px] font-black rounded-full uppercase tracking-widest border border-emerald-500/30 flex items-center gap-2">
                        <CheckCircle2 size={12} /> COMPLETED
                      </span>
                    )}
                    {msg.status === 'in_progress' && (
                      <span className="px-6 py-2 bg-amber-500/20 text-amber-400 text-[10px] font-black rounded-full uppercase tracking-widest border border-amber-500/30 flex items-center gap-2">
                        <Activity size={12} className="animate-pulse" /> IN PROGRESS
                      </span>
                    )}
                    {(msg.status === 'new' || !msg.status) && (
                      <span className="px-6 py-2 bg-rose-500/20 text-rose-400 text-[10px] font-black rounded-full uppercase tracking-widest border border-rose-500/30 flex items-center gap-2 animate-pulse">
                        <AlertCircle size={12} /> NEW REQUEST
                      </span>
                    )}
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="space-y-4">
                    <div className="text-[10px] font-black uppercase tracking-[0.4em] text-[#1E88E5] flex items-center gap-3">
                      <span className="w-8 h-[1px] bg-[#1E88E5]"></span> Subject: {msg.subject || 'Consultation Request'}
                    </div>
                    <div className="bg-white/5 p-6 rounded-3xl border border-white/5">
                      <div className="text-[10px] font-black uppercase tracking-widest text-white/20 mb-3 block">Customer Goal</div>
                      <p className="text-2xl text-white/90 leading-relaxed font-bold tracking-tight">
                        {goal}
                      </p>
                    </div>
                  </div>

                  {msg.message && msg.message !== goal && (
                    <div>
                      <div className="text-[10px] font-black uppercase tracking-widest text-white/20 mb-2 ml-1">Additional Context</div>
                      <p className="text-sm text-white/40 leading-relaxed font-medium bg-black/20 p-4 rounded-2xl border border-white/5">
                        {msg.message}
                      </p>
                    </div>
                  )}
                </div>

                <div className="mt-10 flex flex-wrap items-center gap-6 pt-10 border-t border-white/5">
                   <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/20">
                      <Calendar size={12} className="text-[#1E88E5]" />
                      {msg.timestamp || 'Just now'}
                   </div>
                   <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/20">
                      <Hash size={12} className="text-[#1E88E5]" />
                      REF: #{msg.id.slice(0, 8).toUpperCase()}
                   </div>
                </div>
              </div>

              {/* --- BLOCK 2: AI MATRIX ANALYSIS --- */}
              {msg.isMatrixRequest && msg.aiAnalysis && (
                <div className="bg-[#1E88E5]/5 p-10 border-x border-b border-[#1E88E5]/20 group/matrix hover:bg-[#1E88E5]/10 rounded-b-[40px] transition-all">
                  <div className="flex items-center gap-4 mb-10">
                    <div className="w-10 h-10 rounded-xl bg-[#1E88E5] flex items-center justify-center shadow-lg shadow-[#1E88E5]/20">
                      <Bot size={20} className="text-white" />
                    </div>
                    <div>
                      <h5 className="text-[10px] font-black uppercase tracking-[0.4em] text-[#1E88E5]">Linked AI Matrix Report</h5>
                      <p className="text-[10px] font-black text-white/20 uppercase tracking-widest">Strategic Engineering Plan</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    <div className="space-y-8">
                      <div className="bg-white/5 p-8 rounded-3xl border border-white/5">
                        <div className="flex items-center gap-3 mb-6">
                          <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center">
                            <CheckCircle2 size={12} className="text-emerald-500" />
                          </div>
                          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500">Diagnosis Output</span>
                        </div>
                        <p className="text-xl text-white/80 leading-relaxed font-bold tracking-tight italic">
                          "{msg.aiAnalysis.analysis}"
                        </p>
                        
                        <div className="flex flex-wrap gap-4 mt-8">
                          <div className={`px-6 py-2 rounded-full border flex items-center gap-4 ${
                            msg.aiAnalysis.urgency === 'High' ? 'bg-rose-500/10 border-rose-500/30 text-rose-500' : 'bg-amber-500/10 border-amber-500/30 text-amber-500'
                          }`}>
                             <div className={`w-2 h-2 rounded-full ${msg.aiAnalysis.urgency === 'High' ? 'bg-rose-500 animate-pulse' : 'bg-amber-500'}`} />
                             <span className="text-[10px] font-black uppercase tracking-widest">PRIORITY: {msg.aiAnalysis.urgency || 'MEDIUM'}</span>
                          </div>
                          {msg.aiAnalysis.recommendedService && (
                            <div className="bg-[#1E88E5]/10 px-6 py-2 rounded-full border border-[#1E88E5]/30 flex items-center gap-4">
                               <span className="text-[10px] font-black text-[#1E88E5] uppercase tracking-widest">{msg.aiAnalysis.recommendedService}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 border-b border-white/5 pb-2">STRATEGIC MATRIX STEPS</div>
                      <div className="space-y-4">
                        {(msg.aiAnalysis.steps || []).map((step: string, idx: number) => (
                          <div key={idx} className="bg-white/5 p-6 rounded-2xl border border-white/5 flex items-start gap-6 group/step hover:bg-white/10 transition-all">
                            <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center shrink-0 font-black text-[10px] text-white/40 border border-white/10 group-hover/step:bg-[#1E88E5] group-hover/step:text-white group-hover/step:border-[#1E88E5] transition-all">
                              {idx + 1}
                            </div>
                            <p className="text-sm text-white/70 font-bold leading-relaxed">{step}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* --- CRM CONTROLS --- */}
              <div className="flex flex-col md:flex-row justify-between items-center gap-4 p-8 mt-4 bg-white/5 rounded-[40px] border border-white/5">
                <div className="flex flex-wrap gap-3">
                  <a 
                    href={`mailto:${email}?subject=Response to your Nexon Engineering Request: #${msg.id.slice(0,8).toUpperCase()}`}
                    className="flex items-center gap-3 px-8 py-4 bg-royal hover:bg-[#00b4d8] text-white rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all shadow-lg shadow-royal/20"
                  >
                    <Mail size={16} /> Contact Customer
                  </a>
                </div>

                <div className="flex flex-wrap gap-3">
                  {msg.status !== 'in_progress' && (
                    <button 
                      onClick={() => updateStatus(msg.id, 'in_progress')}
                      className="px-8 py-4 bg-amber-500/10 text-amber-500 border border-amber-500/20 hover:bg-amber-500 hover:text-white rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all"
                    >
                      Mark in Progress
                    </button>
                  )}
                  {msg.status !== 'completed' && (
                    <button 
                      onClick={() => updateStatus(msg.id, 'completed')}
                      className="px-8 py-4 bg-emerald-500/10 text-emerald-500 border border-emerald-400/20 hover:bg-emerald-500 hover:text-white rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all"
                    >
                      Mark Completed
                    </button>
                  )}
                  <button 
                    onClick={() => deleteMsg(msg.id)}
                    className="px-8 py-4 bg-rose-500/10 text-rose-500 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-rose-500 hover:text-white transition-all border border-rose-500/20"
                  >
                    Delete Record
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        );
      })}

      {filteredMessages.length === 0 && (
        <div className="text-center py-40 bg-white/5 rounded-[56px] border-2 border-white/5 border-dashed">
          <Mail size={80} className="mx-auto text-white/5 mb-8" />
          <p className="text-white/20 font-black uppercase tracking-[0.5em] text-sm">No transmissions in queue</p>
        </div>
      )}
    </div>
  );
}

// --- Admin Security & Session Management ---
function AdminSecurity({ notify, askPermission }: { notify: any, askPermission: any }) {
  const [sessions, setSessions] = useState<any[]>([]);
  const [failedLogins, setFailedLogins] = useState<any[]>([]);
  const [activeSubTab, setActiveSubTab] = useState<'sessions' | 'identity' | 'failed'>('sessions');

  // 2FA for Revocation
  const [verificationRevokeStep, setVerificationRevokeStep] = useState<'idle' | 'code_sent'>('idle');
  const [revokeCodeInput, setRevokeCodeInput] = useState('');
  const [activeRevokeCodeId, setActiveRevokeCodeId] = useState<string | null>(null);
  const [pendingRevokeId, setPendingRevokeId] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const targetSecEmail = 'nexonengineering.service@gmail.com';

  useEffect(() => {
    const unsubSessions = onSnapshot(collection(db, 'sessions'), (snap) => {
      setSessions(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'sessions'));
    const unsubFailed = onSnapshot(query(collection(db, 'failed_logins'), orderBy('timestamp', 'desc')), (snap) => {
      setFailedLogins(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'failed_logins'));
    return () => {
      unsubSessions();
      unsubFailed();
    };
  }, []);

  const generateAuthCode = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = 'NX-';
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 4; j++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        if (i < 2) code += '-';
    }
    return code;
  };

  const startRevokeVerification = async (sessionId: string) => {
    setIsVerifying(true);
    setPendingRevokeId(sessionId);
    try {
      notify('Initializing secure session termination protocol...', 'info');
      
      const code = generateAuthCode();
      const docRef = await addDoc(collection(db, 'verification_codes'), {
        adminEmail: auth.currentUser?.email,
        code: code,
        expiresAt: Date.now() + 10 * 60 * 1000, // 10 mins
        used: false,
        purpose: 'SESSION_REVOCATION',
        targetSessionId: sessionId,
        timestamp: new Date().toISOString()
      });

      setActiveRevokeCodeId(docRef.id);

      // EmailJS Dispatch
      emailjs.init('KQeP-JWgK9MRvedfv');
      const templateParams = {
        passcode: code,
        time: new Date(Date.now() + 10 * 60 * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }),
        email: targetSecEmail,
        action_name: 'Emergency Session Revocation',
        from_name: 'NEXON Security Monitoring',
        company_name: 'NEXON Engineering Services',
        website_link: 'https://nexon.services',
        reply_to: 'noreply@nexon.services'
      };

      const result = await emailjs.send(
        'service_8vt7bep', 
        'template_b73a4if', 
        templateParams,
        'KQeP-JWgK9MRvedfv'
      );

      if (result.status === 200) {
        notify(`Secure transmission code dispatched to ${targetSecEmail}.`, 'success');
        setVerificationRevokeStep('code_sent');
      } else {
        notify('Transmission error: Check security logs.', 'warning');
      }
    } catch (err: any) {
      notify('Verification request failed: ' + err.message, 'error');
    } finally {
      setIsVerifying(false);
    }
  };

  const confirmRevokeWithCode = async () => {
    if (!activeRevokeCodeId || !pendingRevokeId) return;
    setIsVerifying(true);
    try {
      const codeDoc = await getDoc(doc(db, 'verification_codes', activeRevokeCodeId));
      if (!codeDoc.exists()) {
        notify('Verification token invalid or expired.', 'error');
        return;
      }

      const data = codeDoc.data();
      if (data.used || data.expiresAt < Date.now()) {
        notify('Security token expired. Please re-initiate.', 'error');
        return;
      }

      if (data.code === revokeCodeInput.toUpperCase().trim()) {
        await updateDoc(doc(db, 'verification_codes', activeRevokeCodeId), { used: true });
        await deleteDoc(doc(db, 'sessions', pendingRevokeId));
        notify('Session terminated successfully.', 'success');
        setVerificationRevokeStep('idle');
        setRevokeCodeInput('');
        setPendingRevokeId(null);
      } else {
        notify('Invalid secure key. Access Denied.', 'error');
      }
    } catch (err: any) {
      notify('Code validation failed: ' + err.message, 'error');
    } finally {
      setIsVerifying(false);
    }
  };

  const revokeSession = async (id: string) => {
    if (id === sessionStorage.getItem('nexon_session_id')) {
      return notify('Cannot terminate active terminal session.', 'error');
    }
    
    askPermission(
      'Initialize Emergency Session Revocation? A secure authorization code will be dispatched to your linked communication channel.',
      () => startRevokeVerification(id),
      "Emergency Protocol Initiation",
      true,
      "Send Code"
    );
  };

  const clearFailLog = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'failed_logins', id));
      notify('Security log entry purged', 'success');
    } catch (err: any) {
      notify('Purge sequence failed: ' + err.message, 'error');
    }
  };

  const clearAllFailLogs = async () => {
    askPermission(
      'Execute total wipe of security audit trail? This action is irreversible and clears all failed login strands.',
      async () => {
        try {
          const q = query(collection(db, 'failed_logins'));
          const snap = await getDocs(q);
          const batch = writeBatch(db);
          snap.docs.forEach(doc => batch.delete(doc.ref));
          await batch.commit();
          notify('Full security audit trail wiped', 'success');
        } catch (err: any) {
          notify('Wipe sequence failed: ' + err.message, 'error');
        }
      },
      "Total Audit Wipe"
    );
  };

  return (
    <div className="space-y-12 text-left">
      <div className="flex gap-4 mb-8 h-16">
        {[
          { id: 'sessions', icon: Users, label: 'Live Sessions' },
          { id: 'failed', icon: Shield, label: 'Failed Attempts' },
          { id: 'identity', icon: Lock, label: 'Identity Config' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveSubTab(tab.id as any)}
            className={`flex-1 flex items-center justify-center gap-3 rounded-2xl font-black text-[10px] uppercase tracking-widest border transition-all ${
              activeSubTab === tab.id 
                ? 'bg-[#1E88E5] text-white border-transparent' 
                : 'bg-[#0B1426] text-white/40 border-white/5 hover:bg-white/5'
            }`}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      {activeSubTab === 'sessions' && (
        <div className="bg-[#0B1426] rounded-[48px] border border-white/5 overflow-hidden shadow-2xl p-10 relative">
          {verificationRevokeStep === 'code_sent' && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 z-20 bg-[#0B1426]/95 backdrop-blur-md flex items-center justify-center p-8 text-center"
            >
              <div className="max-w-sm space-y-8">
                <div className="w-20 h-20 bg-[#1E88E5]/10 rounded-full flex items-center justify-center mx-auto border border-[#1E88E5]/20 text-[#1E88E5]">
                  <ShieldCheck size={40} className="animate-pulse" />
                </div>
                <div>
                  <h5 className="text-xl font-black text-white italic uppercase tracking-tighter mb-2">Authorize Revocation</h5>
                  <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest leading-relaxed">
                    Verify secure transmission code sent to<br/>
                    <span className="text-[#1E88E5]">{targetSecEmail}</span>
                  </p>
                </div>
                <input 
                  type="text"
                  value={revokeCodeInput}
                  onChange={(e) => setRevokeCodeInput(e.target.value)}
                  placeholder="NX-XXXX-XXXX-XXXX"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-center font-mono text-white text-lg tracking-widest uppercase outline-none focus:border-[#1E88E5]"
                />
                <div className="flex gap-4">
                  <button 
                    onClick={() => { setVerificationRevokeStep('idle'); setRevokeCodeInput(''); }}
                    className="flex-1 py-4 bg-white/5 text-white/40 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-white/10 hover:text-white"
                  >
                    Abort
                  </button>
                  <button 
                    onClick={confirmRevokeWithCode}
                    disabled={isVerifying || !revokeCodeInput}
                    className="flex-[2] py-4 bg-[#1E88E5] text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-lg shadow-[#1E88E5]/20 disabled:opacity-50"
                  >
                    {isVerifying ? 'VERIFYING...' : 'CONFIRM LOGOFF'}
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          <h4 className="text-xl font-black text-white mb-8 italic uppercase tracking-tighter">Active Management Sessions</h4>
          <div className="space-y-4">
            {sessions.map(session => (
              <div key={session.id} className="bg-white/5 p-8 rounded-[32px] border border-white/5 flex justify-between items-center group">
                <div className="flex items-center gap-6">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${session.id === sessionStorage.getItem('nexon_session_id') ? 'bg-[#1E88E5]/20 text-[#1E88E5]' : 'bg-white/5 text-white/20'}`}>
                    {session.id === sessionStorage.getItem('nexon_session_id') ? <CheckCircle2 size={24} /> : <ImageIcon size={24} />}
                  </div>
                  <div>
                    <div className="font-black text-white text-sm">
                      {session.deviceId} 
                      {session.id === sessionStorage.getItem('nexon_session_id') && <span className="ml-3 text-[10px] px-2 py-0.5 bg-[#1E88E5] rounded-full uppercase tracking-widest leading-none">Your Terminal</span>}
                    </div>
                    <div className="text-[10px] text-white/20 font-bold uppercase tracking-widest mt-1">
                      {session.email} • {session.lastActive ? `Active ${new Date(session.lastActive).toLocaleTimeString()}` : 'Connected'}
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => revokeSession(session.id)}
                  className="px-6 py-3 bg-rose-500/10 text-rose-500 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-rose-500 hover:text-white transition-all opacity-0 group-hover:opacity-100"
                >
                  Force Logoff
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeSubTab === 'failed' && (
        <div className="bg-[#0B1426] rounded-[48px] border border-white/5 overflow-hidden shadow-2xl p-10">
          <div className="flex justify-between items-center mb-8">
            <h4 className="text-xl font-black text-white italic uppercase tracking-tighter text-rose-500 flex items-center gap-3">
              <ShieldAlert size={20} />
              Security Breach Audit
            </h4>
            {failedLogins.length > 0 && (
              <button 
                onClick={clearAllFailLogs}
                className="px-6 py-3 bg-rose-500/10 text-rose-500 border border-rose-500/20 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-500 hover:text-white transition-all flex items-center gap-2 group"
              >
                <Trash2 size={12} className="group-hover:scale-110 transition-transform" />
                Purge All Records
              </button>
            )}
          </div>
          <div className="space-y-4">
            {failedLogins.map(fail => (
              <div key={fail.id} className="bg-rose-500/5 p-8 rounded-[32px] border border-rose-500/10 flex justify-between items-center group">
                <div className="flex-1">
                  <div className="font-black text-white text-sm flex items-center gap-3">
                    <X className="text-rose-500" size={16} /> 
                    {fail.email}
                    <span className="text-[8px] px-2 py-0.5 bg-rose-500 text-white rounded-full uppercase tracking-tighter">Auth Failure</span>
                  </div>
                  <div className="bg-black/20 p-4 rounded-xl mt-4 font-mono text-[10px] text-rose-400/80 border border-white/5 max-w-md overflow-x-auto">
                    Detected Payload: {fail.password}
                  </div>
                  <div className="text-[10px] text-white/20 font-bold uppercase tracking-widest mt-4 flex items-center gap-4">
                    <span>Captured: {new Date(fail.timestamp).toLocaleString()}</span>
                    <span>•</span>
                    <span className="truncate max-w-[200px]">Origin: {fail.userAgent}</span>
                  </div>
                </div>
                <button 
                  onClick={() => clearFailLog(fail.id)}
                  className="p-4 bg-white/5 text-white/20 rounded-2xl hover:text-rose-500 hover:bg-rose-500/10 transition-all opacity-0 group-hover:opacity-100 border border-white/5"
                  title="Purge Entry"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
            {failedLogins.length === 0 && (
              <div className="text-center py-20 text-white/20 uppercase font-black tracking-widest text-xs">
                No security protocol breaches detected.
              </div>
            )}
          </div>
        </div>
      )}

      {activeSubTab === 'identity' && <AccountSettings notify={notify} />}
    </div>
  );
}

// --- Account Settings Component ---
function AccountSettings({ notify }: { notify: any }) {
  const [currentEmail, setCurrentEmail] = useState(auth.currentUser?.email || '');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  
  // 2FA State
  const [verificationStep, setVerificationStep] = useState<'idle' | 'auth_verified' | 'code_sent' | 'code_verified'>('idle');
  const [verificationCode, setVerificationCode] = useState('');
  const [activeCodeId, setActiveCodeId] = useState<string | null>(null);
  const [timer, setTimer] = useState(0);

  const targetSecEmail = 'nexonengineering.service@gmail.com';

  useEffect(() => {
    let interval: any;
    if (timer > 0) {
      interval = setInterval(() => setTimer(t => t - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const generateCode = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = 'NX-';
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 4; j++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        if (i < 2) code += '-';
    }
    return code;
  };

  const requestVerification = async () => {
    if (!currentPassword) {
      notify('Current password required to initiate verification sequence', 'error');
      return;
    }

    setIsUpdating(true);
    try {
      // 1. Verify Current Password First
      const credential = EmailAuthProvider.credential(auth.currentUser?.email || '', currentPassword);
      await reauthenticateWithCredential(auth.currentUser!, credential);
      
      setVerificationStep('auth_verified');
      notify('Identity verified. Generating secure transmission code...', 'info');

      // 2. Generate and Store Code
      const code = generateCode();
      const docRef = await addDoc(collection(db, 'verification_codes'), {
        adminEmail: auth.currentUser?.email,
        code: code,
        expiresAt: Date.now() + 15 * 60 * 1000, // Matching 15 mins in template
        used: false,
        purpose: 'IDENTITY_CHANGE',
        timestamp: new Date().toISOString()
      });

      setActiveCodeId(docRef.id);
      
      // 3. Send Real Email via EmailJS
      try {
        const expiryDate = new Date(Date.now() + 15 * 60 * 1000);
        const expiryTimeLong = expiryDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
        
        console.log('--- NEXON SECURITY TRANSMISSION INITIALIZED ---');
        emailjs.init('KQeP-JWgK9MRvedfv');
        
        const templateParams = {
          passcode: code,
          time: expiryTimeLong,
          email: targetSecEmail, // Changed from to_email to email to match your template screenshot
          from_name: 'NEXON Security',
          company_name: 'NEXON Engineering Services',
          website_link: 'https://nexon.services',
          reply_to: 'noreply@nexon.services'
        };

        console.log('--- NEXON SECURITY DEBUG ---');
        console.log('Verification Code:', code);
        console.log('Destination:', targetSecEmail);
        console.log('--- END DEBUG ---');
        
        const result = await emailjs.send(
          'service_8vt7bep', 
          'template_b73a4if', 
          templateParams,
          'KQeP-JWgK9MRvedfv'
        );
        
        console.log('EmailJS API Result:', result.status, result.text);
        
        if (result.status === 200) {
            notify(`Secure authorization link dispatched to ${targetSecEmail}.`, 'success');
            setVerificationStep('code_sent');
            setTimer(900); // 15 minutes
        } else {
            notify(`Transmission returned status ${result.status}. Check EmailJS logs.`, 'warning');
        }
      } catch (emailError: any) {
        console.error('--- TRANSMISSION CRITICAL FAILURE ---');
        console.error('Error Object:', emailError);
        const errorMsg = emailError?.text || emailError?.message || 'Check browser security console (Network tab)';
        notify(`Email Dispatch Error: ${errorMsg}`, 'error');
      }

    } catch (error: any) {
      notify('Authentication failed: ' + error.message, 'error');
    } finally {
      setIsUpdating(false);
    }
  };

  const verifyCodeInput = async () => {
    if (!activeCodeId) return;
    setIsUpdating(true);
    try {
      const codeDoc = await getDoc(doc(db, 'verification_codes', activeCodeId));
      if (!codeDoc.exists()) {
        notify('Verification record not found', 'error');
        return;
      }

      const data = codeDoc.data();
      if (data.used) {
        notify('Verification code has already been used', 'error');
        return;
      }
      if (data.expiresAt < Date.now()) {
        notify('Verification code has expired', 'error');
        return;
      }

      if (data.code === verificationCode.toUpperCase().trim()) {
        await updateDoc(doc(db, 'verification_codes', activeCodeId), { used: true });
        setVerificationStep('code_verified');
        notify('MFA Verification Successful. Authorization Granted.', 'success');
      } else {
        notify('Invalid secure code. Access Denied.', 'error');
      }
    } catch (error: any) {
      notify('Verification sequence error: ' + error.message, 'error');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleUpdateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (verificationStep !== 'code_verified') {
        notify('MFA verification required to commit identity changes', 'error');
        return;
    }
    if (!newEmail && !newPassword) return;
    
    setIsUpdating(true);
    try {
      if (newEmail) {
        notify('Transmitting email update...', 'info');
        await Promise.all([
          updateEmail(auth.currentUser!, newEmail),
          updateDoc(doc(db, 'settings', 'global'), { adminEmail: newEmail })
        ]);
        notify('Email sequence updated successfully', 'success');
        setCurrentEmail(newEmail);
        setNewEmail('');
      }

      if (newPassword) {
        notify('Updating security protocols (Password)...', 'info');
        await updatePassword(auth.currentUser!, newPassword);
        notify('System key updated successfully', 'success');
        setNewPassword('');
      }
      
      setCurrentPassword('');
      setVerificationStep('idle');
      setVerificationCode('');
    } catch (error: any) {
      notify('Security transmission error: ' + error.message, 'error');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto py-10">
      <div className="bg-[#0B1426] p-12 rounded-[56px] border border-white/5 shadow-2xl space-y-10 relative overflow-hidden">
        {/* Progress Background Overlay */}
        <div className="absolute top-0 left-0 w-full h-1 bg-white/5">
            <div 
                className="h-full bg-[#1E88E5] shadow-[0_0_20px_rgba(30,136,229,0.5)] transition-all duration-500"
                style={{ width: verificationStep === 'idle' ? '25%' : verificationStep === 'auth_verified' ? '50%' : verificationStep === 'code_sent' ? '75%' : '100%' }}
            />
        </div>

        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-white/5 text-[#1E88E5] rounded-2xl flex items-center justify-center border border-white/10">
            <Lock size={24} />
          </div>
          <div>
            <h4 className="text-2xl font-black text-white uppercase tracking-tighter italic">Identity Management</h4>
            <p className="text-[10px] font-black uppercase tracking-widest text-[#1E88E5] opacity-50">Secure Access Control Matrix</p>
          </div>
        </div>

        <div className="space-y-8">
          <div className="space-y-6">
             <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-white/20">Current Terminal Email</label>
                <div className="relative">
                  <UserIcon className="absolute left-6 top-1/2 -translate-y-1/2 text-white/10" size={18} />
                  <input 
                    type="email"
                    value={currentEmail}
                    readOnly
                    className="w-full bg-white/5 border border-white/10 rounded-3xl p-6 pl-16 text-sm font-black text-white/40 outline-none cursor-not-allowed italic"
                  />
                </div>
             </div>

             <div className="space-y-4 pt-4 border-t border-white/5">
                <label className="text-[10px] font-black uppercase tracking-widest text-[#1E88E5]">Step 1: Authenticate Current Access</label>
                <div className="relative">
                  <Fingerprint className="absolute left-6 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                  <input 
                    type="password"
                    placeholder="ENTER CURRENT PASSWORD"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    disabled={verificationStep !== 'idle'}
                    className="w-full bg-white/5 border border-white/10 rounded-3xl p-6 pl-16 text-sm font-black text-white outline-none focus:border-[#1E88E5] transition-all"
                  />
                </div>
                {verificationStep === 'idle' && (
                    <button 
                        onClick={requestVerification}
                        disabled={isUpdating || !currentPassword}
                        className="w-full py-6 bg-white/5 hover:bg-white/10 text-white rounded-3xl font-black text-xs uppercase tracking-widest transition-all border border-white/5 flex items-center justify-center gap-3"
                    >
                        {isUpdating ? <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : <ShieldAlert size={16} />}
                        Initalize Identity Verification
                    </button>
                )}
             </div>

             {verificationStep === 'code_sent' && (
                <div 
                    className="space-y-4 pt-4 border-t border-white/5 animate-in fade-in slide-in-from-top-4 duration-300"
                >
                    <div className="flex justify-between items-center">
                        <label className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Step 2: Gmail Verification Code</label>
                        <span className="text-[10px] font-mono text-white/40">{Math.floor(timer / 60)}:{(timer % 60).toString().padStart(2, '0')}</span>
                    </div>
                    <p className="text-[9px] text-white/30 font-bold uppercase tracking-widest">A unique security key has been dispatched to {targetSecEmail}.</p>
                    <div className="relative">
                        <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                        <input 
                            type="text"
                            placeholder="NX-XXXX-XXXX"
                            value={verificationCode}
                            onChange={(e) => setVerificationCode(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-3xl p-6 pl-16 text-sm font-black text-white outline-none focus:border-emerald-400 transition-all font-mono tracking-widest"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <button 
                            onClick={requestVerification}
                            disabled={isUpdating || timer > 540}
                            className="py-4 bg-white/5 hover:bg-white/10 text-white/40 hover:text-white rounded-3xl font-black text-[9px] uppercase tracking-widest transition-all border border-white/5"
                        >
                            {timer > 540 ? `Wait ${timer - 540}s` : 'Resend Code'}
                        </button>
                        <button 
                            onClick={verifyCodeInput}
                            disabled={isUpdating || !verificationCode}
                            className="py-6 bg-emerald-500 text-white rounded-3xl font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-3"
                        >
                            {isUpdating ? <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : <Lock size={16} />}
                            Authorize
                        </button>
                    </div>
                </div>
             )}

             {verificationStep === 'code_verified' && (
                <div 
                    className="space-y-6 pt-4 border-t border-white/5 animate-in fade-in slide-in-from-top-4 duration-300"
                >
                    <div className="flex items-center gap-2 text-emerald-400 mb-6 bg-emerald-400/5 p-4 rounded-2xl border border-emerald-400/10">
                        <CheckCircle2 size={16} />
                        <span className="text-[10px] font-black uppercase tracking-widest">Multi-Factor Authentication Verified</span>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-[#1E88E5]">New Identity Email (Optional)</label>
                        <div className="relative">
                            <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                            <input 
                                type="email"
                                placeholder="new-admin@nexon.services"
                                value={newEmail}
                                onChange={(e) => setNewEmail(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-3xl p-6 pl-16 text-sm font-black text-white outline-none focus:border-[#1E88E5] transition-all"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-[#1E88E5]">New Security Key (Optional)</label>
                        <div className="relative">
                            <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                            <input 
                                type="password"
                                placeholder="NEW PASSWORD"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-3xl p-6 pl-16 text-sm font-black text-white outline-none focus:border-[#1E88E5] transition-all"
                            />
                        </div>
                    </div>

                    <button 
                        onClick={handleUpdateAccount}
                        disabled={isUpdating || (!newEmail && !newPassword)}
                        className="w-full py-6 bg-[#1E88E5] text-white rounded-3xl font-black text-xs uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-[#1E88E5]/20 flex items-center justify-center gap-3"
                    >
                        {isUpdating ? <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : <Save size={16} />}
                        Commit Identity Changes
                    </button>
                </div>
             )}
          </div>
        </div>
        
        <button 
            onClick={() => {
                setVerificationStep('idle');
                setVerificationCode('');
                setCurrentPassword('');
            }}
            className="w-full py-4 text-white/20 hover:text-white/40 text-[9px] font-black uppercase tracking-widest transition-all"
        >
            Reset Verification Sequence
        </button>
      </div>
    </div>
  );
}
