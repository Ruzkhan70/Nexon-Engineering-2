import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import Lenis from 'lenis';

export default function SmoothScroll() {
  const { pathname } = useLocation();
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    // Initialize Lenis once
    const lenis = new Lenis({
      duration: 1.5,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1.1,
      touchMultiplier: 1.5,
      infinite: false,
    });

    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }

    lenisRef.current = lenis;

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    // Global scroll to top on path change
    const handleScrollToTop = () => {
      window.scrollTo(0, 0);
      lenis.scrollTo(0, { immediate: true });
    };

    window.scrollToTop = handleScrollToTop;

    // Handle internal anchor links
    const handleAnchorClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const anchor = target.closest('a');
      if (anchor && anchor.hash && anchor.origin === window.location.origin && anchor.pathname === window.location.pathname) {
        e.preventDefault();
        const element = document.querySelector(anchor.hash) as HTMLElement;
        if (element) {
          lenis.scrollTo(element);
        }
      }
    };

    document.addEventListener('click', handleAnchorClick);

    return () => {
      document.removeEventListener('click', handleAnchorClick);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  // Handle route changes
  useEffect(() => {
    if (lenisRef.current) {
      window.scrollTo(0, 0);
      lenisRef.current.scrollTo(0, { immediate: true });
      
      // Small backup to ensure it sticks after React renders new route content
      const timeoutId = setTimeout(() => {
        window.scrollTo(0, 0);
        lenisRef.current?.scrollTo(0, { immediate: true });
      }, 100);

      return () => clearTimeout(timeoutId);
    }
  }, [pathname]);

  return null;
}

// Add type for window
declare global {
  interface Window {
    scrollToTop: () => void;
  }
}
