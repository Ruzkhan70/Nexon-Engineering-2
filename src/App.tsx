import { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import { db } from './lib/firebase';
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
            <Footer settings={settings} />
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

  const loadingRef = useRef(true);

  useEffect(() => {
    // High-level settings sync
    const unsub = onSnapshot(doc(db, 'settings', 'global'), (doc) => {
      if (doc.exists()) {
        setSettings(doc.data());
      }
      setLoading(false);
      loadingRef.current = false;
    }, (error) => {
      console.warn("Initial settings sync restricted, initializing system shell.");
      setLoading(false);
      loadingRef.current = false;
    });

    // Safety timeout: Ensure loading finishes after 4s no matter what
    const safetyTimeout = setTimeout(() => {
      if (loadingRef.current) {
        console.log("Safety synchronization engaged.");
        setLoading(false);
        loadingRef.current = false;
      }
    }, 4000);
    
    // Hard failure timeout: Only show error if we are STILL loading after 15s
    const failureTimeout = setTimeout(() => {
      if (loadingRef.current) {
        setTimedOut(true);
      }
    }, 15000);

    return () => {
      unsub();
      clearTimeout(safetyTimeout);
      clearTimeout(failureTimeout);
    };
  }, []);

  if (timedOut) {
    console.warn("Nexon Matrix connection timed out. Bootstrapping local standby mode.");
  }

  return (
    <Router>
      <AppContent settings={settings} loading={loading && !timedOut} />
    </Router>
  );
}
