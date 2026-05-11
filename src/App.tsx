import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import { AlertTriangle } from 'lucide-react';
import { db, handleFirestoreError, OperationType } from './lib/firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import About from './pages/About';
import Services from './pages/Services';
import Projects from './pages/Projects';
import ProjectDetail from './pages/ProjectDetail';
import Clients from './pages/Clients';
import Contact from './pages/Contact';
import Admin from './pages/Admin';
import SmoothScroll from './components/SmoothScroll';
import LoadingScreen from './components/LoadingScreen';
import './index.css';

function AppContent({ settings, loading }: { settings: any, loading: boolean }) {
  const location = useLocation();

  return (
    <>
      <SmoothScroll />
      <AnimatePresence mode="wait">
        {loading && <LoadingScreen key="loader" />}
      </AnimatePresence>
      
      <div className="min-h-screen flex flex-col bg-[#020917] text-[#F8F9FA] font-sans selection:bg-[#1E88E5] selection:text-white">
        {!loading && (
          <div className="flex flex-col min-h-screen">
            <Navbar settings={settings} />
            <main className="flex-grow min-h-screen relative">
              <AnimatePresence mode="wait">
                <motion.div
                  key={location.pathname}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.4, ease: "easeInOut" }}
                >
                  <Routes location={location}>
                    <Route path="/" element={<Home />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/services" element={<Services />} />
                    <Route path="/projects" element={<Projects />} />
                    <Route path="/projects/:id" element={<ProjectDetail />} />
                    <Route path="/clients" element={<Clients />} />
                    <Route path="/contact" element={<Contact />} />
                    <Route path="/admin" element={<Admin />} />
                  </Routes>
                </motion.div>
              </AnimatePresence>
            </main>
            <Footer />
          </div>
        )}
      </div>
    </>
  );
}

export default function App() {
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [timedOut, setTimedOut] = useState(false);

  useEffect(() => {
    // High-level settings sync to prevent flashing
    const unsub = onSnapshot(doc(db, 'settings', 'global'), (doc) => {
      if (doc.exists()) {
        setSettings(doc.data());
      }
      setLoading(false);
    }, (error) => {
      console.warn("Initial settings sync restricted, initializing system shell.");
      setLoading(false);
    });

    // Safety timeout: Ensure loading finishes even if Firebase hangs indefinitely
    const safetyTimeout = setTimeout(() => {
      setLoading(false);
    }, 5000);
    
    // Hard failure timeout: Show error UI if nothing works after 10s
    const failureTimeout = setTimeout(() => {
      if (loading) setTimedOut(true);
    }, 10000);

    return () => {
      unsub();
      clearTimeout(safetyTimeout);
      clearTimeout(failureTimeout);
    };
  }, []);

  if (timedOut) {
    return (
      <div className="min-h-screen bg-[#020917] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 bg-rose-500/20 rounded-full flex items-center justify-center text-rose-500 mb-6">
          <AlertTriangle size={40} />
        </div>
        <h1 className="text-4xl font-black text-white mb-4 italic uppercase">System Offline</h1>
        <p className="text-white/40 max-w-md mb-8 italic">The Nexon Matrix could not be established. Please check your network connection or contact system administration.</p>
        <button onClick={() => window.location.reload()} className="px-8 py-4 bg-royal text-white rounded-full font-black uppercase tracking-widest text-sm">Synchronize</button>
      </div>
    );
  }

  return (
    <Router>
      <AppContent settings={settings} loading={loading} />
    </Router>
  );
}
