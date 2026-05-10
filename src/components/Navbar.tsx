import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import logoAsset from '../assets/images/regenerated_image_1778416445055.png';

export default function Navbar({ settings }: { settings: any }) {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  if (location.pathname === '/admin') return null;

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', path: '/', enabled: true },
    { name: 'About', path: '/about', enabled: true },
    { name: 'Services', path: '/services', enabled: settings ? settings.featureServices : false },
    { name: 'Projects', path: '/projects', enabled: settings ? settings.featureProjects : false },
    { name: 'Clients', path: '/clients', enabled: settings ? settings.featureClients : false },
    { name: 'Contact', path: '/contact', enabled: true },
  ].filter(link => link.enabled);

  return (
    <nav 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-700 ${
        scrolled ? 'bg-black/20 backdrop-blur-md py-3 shadow-2xl' : 'bg-transparent py-4'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 group relative">
          <div className="absolute -inset-2 bg-[#1E88E5]/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
          <img 
            src={logoAsset} 
            alt="NEXON" 
            className="h-12 w-auto transition-all duration-500 group-hover:scale-110"
          />
          <span className="text-xl font-black text-white tracking-tighter hidden sm:block">
            NEXON <span className="text-[#00b4d8]">ENGINEERING</span>
          </span>
        </Link>

        {/* Desktop Nav - Oval Glass Shape */}
        <div className="hidden lg:flex items-center gap-1 bg-white/5 backdrop-blur-2xl px-2 py-1.5 rounded-full border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] ring-1 ring-white/5 min-w-[200px] min-h-[44px] justify-center">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              className={`px-6 py-2.5 rounded-full text-[13px] font-black uppercase tracking-widest transition-all relative group ${
                location.pathname === link.path ? 'text-white' : 'text-white/40 hover:text-white'
              }`}
            >
              <span className="relative z-10">{link.name}</span>
              {location.pathname === link.path && (
                <motion.div 
                  layoutId="nav-pill"
                  className="absolute inset-0 bg-[#1E88E5]/40 rounded-full border border-white/10"
                  transition={{ type: "spring", bounce: 0.25, duration: 0.5 }}
                />
              )}
            </Link>
          ))}
        </div>

        {/* CTA */}
        <Link 
          to="/contact" 
          className="hidden md:inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#1E88E5] to-[#00b4d8] text-white text-sm font-semibold rounded-full transition-all hover:scale-105 hover:shadow-[0_4px_15px_rgba(30,136,229,0.4)]"
        >
          Get Quote
        </Link>

        {/* Mobile Toggle */}
        <button 
          className="lg:hidden text-white p-2.5 bg-white/5 backdrop-blur-xl rounded-full border border-white/10"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="lg:hidden absolute top-full left-6 right-6 mt-4 bg-black/80 backdrop-blur-3xl rounded-[32px] border border-white/10 overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
          >
            <div className="px-6 py-8 flex flex-col gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                  className={`text-sm font-black uppercase tracking-[0.2em] py-4 px-6 rounded-2xl flex items-center justify-between transition-all ${
                    location.pathname === link.path ? 'bg-[#1E88E5] text-white' : 'text-white/60 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  {link.name}
                  <ChevronRight size={18} className={location.pathname === link.path ? 'opacity-100' : 'opacity-20'} />
                </Link>
              ))}
              <Link 
                to="/contact"
                onClick={() => setIsOpen(false)}
                className="mt-4 w-full py-5 bg-gradient-to-r from-[#1E88E5] to-[#00b4d8] text-white font-black uppercase tracking-[0.2em] rounded-2xl text-center shadow-lg shadow-[#1E88E5]/20"
              >
                Get Quote
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
