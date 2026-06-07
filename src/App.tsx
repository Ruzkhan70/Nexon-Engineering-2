import { useState, useEffect, useRef, useCallback } from 'react';
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

function AppContent({
  settings,
  loading,
  onAnimationComplete,
}: {
  settings: any;
  loading: boolean;
  onAnimationComplete: () => void;
}) {
  const location = useLocation();

  return (
    <>
      <SmoothScroll />
      <AnimatePresence mode="wait">
        {loading && <LoadingScreen key="loader" onComplete={onAnimationComplete} />}
      </AnimatePresence>

      <div className="min-h-screen flex flex-col bg-[#020917] text-[#F8F9FA] font-sans selection:bg-[#1E88E5] selection:text-white overflow-x-hidden w-full max-w-[100vw]">
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
  const [settings, setSettings]       = useState<any>(null);
  const [loading, setLoading]         = useState(true);
  const [timedOut, setTimedOut]       = useState(false);

  // Two independent gates — site only shows when BOTH are true
  const dataReadyRef      = useRef(false);
  const animationDoneRef  = useRef(false);

  /** Try to dismiss loading — only succeeds when both gates are open */
  const tryDismiss = useCallback(() => {
    if (dataReadyRef.current && animationDoneRef.current) {
      setLoading(false);
    }
  }, []);

  /** Called by LoadingScreen when progress bar hits 100% */
  const handleAnimationComplete = useCallback(() => {
    animationDoneRef.current = true;
    tryDismiss();
  }, [tryDismiss]);

  useEffect(() => {
    // High-level settings sync
    const unsub = onSnapshot(doc(db, 'settings', 'global'), (snap) => {
      if (snap.exists()) {
        setSettings(snap.data());
      }
      dataReadyRef.current = true;
      tryDismiss();
    }, (error) => {
      console.warn("Initial settings sync restricted, initializing system shell.");
      dataReadyRef.current = true;
      tryDismiss();
    });

    // Safety timeout: If Firebase never responds, open the data gate after 10s
    // (animation gate still controls minimum duration)
    const safetyTimeout = setTimeout(() => {
      if (!dataReadyRef.current) {
        console.log("Safety synchronization engaged.");
        dataReadyRef.current = true;
        tryDismiss();
      }
    }, 10000);

    // Hard failure timeout: Only show error if STILL loading after 15s
    const failureTimeout = setTimeout(() => {
      if (loading) {
        setTimedOut(true);
      }
    }, 15000);

    return () => {
      unsub();
      clearTimeout(safetyTimeout);
      clearTimeout(failureTimeout);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (timedOut) {
    console.warn("Nexon Matrix connection timed out. Bootstrapping local standby mode.");
  }

  return (
    <Router>
      <AppContent
        settings={settings}
        loading={loading && !timedOut}
        onAnimationComplete={handleAnimationComplete}
      />
    </Router>
  );
}
