import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, query, where, onSnapshot, doc } from 'firebase/firestore';
import { ExternalLink, Users, ArrowRight, Loader2 } from 'lucide-react';

export default function Clients() {
  const [clients, setClients] = useState<any[]>([]);
  const [siteSettings, setSiteSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  
  useEffect(() => {
    onSnapshot(doc(db, 'settings', 'global'), (snap) => {
      if (snap.exists()) setSiteSettings(snap.data());
    }, (error) => handleFirestoreError(error, OperationType.GET, 'settings/global'));

    const unsubClients = onSnapshot(collection(db, 'clients'), (snap) => {
      const data = snap.docs
        .map(doc => ({ id: doc.id, ...doc.data() } as any))
        .filter(c => c.enabled !== false);
      setClients(data);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'clients');
      setLoading(false);
    });

    return () => {
      unsubClients();
    };
  }, []);

  return (
    <div className="pt-32 pb-40 bg-[#020917] min-h-screen">
      {/* Dynamic Background Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 -right-1/4 w-[800px] h-[800px] bg-[#1E88E5]/5 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-1/4 -left-1/4 w-[600px] h-[600px] bg-[#00b4d8]/5 rounded-full blur-[100px] animate-pulse delay-1000" />
      </div>

      <div className="max-w-7xl mx-auto px-8 relative z-10">
        {/* Header */}
        <div className="text-center mb-32">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-3 px-6 py-2 bg-white/5 border border-white/10 rounded-full mb-8"
          >
            <Users className="text-[#1E88E5]" size={16} />
            <span className="text-white/60 font-black tracking-[0.3em] uppercase text-[10px]">Global Ecosystem</span>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-6xl md:text-[8rem] font-black text-white tracking-tighter leading-[0.85] mb-12 uppercase italic"
          >
            OUR <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#1E88E5] to-[#00b4d8] pr-8">CLIENTS</span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-[#E1F5FE]/40 text-xl md:text-2xl max-w-3xl mx-auto font-medium leading-relaxed"
          >
            {siteSettings?.clientsSubtitle || 'Providing dependable engineering solutions with precision and passion for industry leaders across Sri Lanka.'}
          </motion.p>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="text-royal animate-spin" size={40} />
            <span className="text-white/20 font-black uppercase tracking-widest text-[10px]">Assembling Client Database...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12 mb-32">
            {clients.map((client, idx) => (
              <motion.div
                key={client.id || idx}
                onClick={() => {
                  if (client.websiteUrl) {
                    const url = client.websiteUrl.startsWith('http') ? client.websiteUrl : `https://${client.websiteUrl}`;
                    window.open(url, '_blank', 'noopener,noreferrer');
                  }
                }}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.05 }}
                whileHover={client.websiteUrl ? { y: -10, scale: 1.02 } : {}}
                className={`group bg-white/5 border border-white/10 rounded-[32px] md:rounded-[50px] shadow-2xl flex flex-col hover:bg-white/[0.07] hover:border-[#1E88E5]/40 transition-all duration-700 relative overflow-hidden h-full ${client.websiteUrl ? 'cursor-pointer' : 'cursor-default'}`}
              >
                {/* Image Container - Curve down the edge */}
                <div className="w-full h-48 md:h-64 bg-white/5 p-8 md:p-12 flex items-center justify-center relative overflow-hidden border-b border-white/5 shadow-inner">
                  {/* Glow Ring */}
                  <div className="absolute inset-0 bg-[#1E88E5]/0 rounded-full blur-[60px] group-hover:bg-[#1E88E5]/20 transition-all duration-1000" />
                  
                  <img 
                    src={client.logoUrl || client.image} 
                    alt={client.name} 
                    loading="lazy"
                    decoding="async"
                    draggable="false"
                    referrerPolicy="no-referrer"
                    className="relative z-10 w-full h-full object-contain opacity-70 group-hover:opacity-100 transition-all duration-1000 group-hover:scale-110 select-none"
                  />
                  
                  {client.websiteUrl && (
                    <div className="absolute top-8 right-8 text-[#1E88E5] opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0 duration-500">
                      <ExternalLink size={20} />
                    </div>
                  )}
                </div>
                
                <div className="p-8 md:p-10 text-center flex-grow flex flex-col justify-center">
                    <h3 className="text-xl md:text-2xl font-black text-white mb-2 md:mb-3 leading-tight group-hover:text-[#1E88E5] transition-colors uppercase italic">{client.name}</h3>
                    <p className="text-[#00b4d8] text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] opacity-50 group-hover:opacity-100 transition-opacity">
                        {client.category || client.description || 'Industrial Partner'}
                    </p>
                </div>

                 {/* Progress bar visual - Centered and reduced width */}
                 <div className="absolute bottom-6 left-1/4 right-1/4 h-[3px] bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-[#1E88E5] w-0 group-hover:w-full transition-all duration-1000 ease-in-out" />
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Scrolling Marquee */}
        <div className="mt-20 py-10 border-t border-white/5 overflow-hidden">
            <div className="flex gap-20 animate-marquee whitespace-nowrap">
            <div className="flex gap-20 items-center">
                {clients.concat(clients).slice(0, 16).map((c, i) => (
                <span key={`marquee-${c.id || i}-${i}`} className="text-white/5 font-black text-6xl italic uppercase tracking-tighter hover:text-[#1E88E5]/20 transition-colors cursor-default select-none pr-4">
                    {c.name}
                </span>
                ))}
            </div>
            </div>
        </div>

        {/* Collaboration Banner */}
        <motion.section 
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="mt-32 md:mt-60 bg-gradient-to-br from-[#1E88E5] to-[#00b4d8] p-10 md:p-24 lg:p-32 rounded-[40px] md:rounded-[80px] relative overflow-hidden shadow-[0_50px_100px_rgba(30,136,229,0.3)]"
        >
             <div className="absolute top-0 left-0 w-full h-full opacity-10" style={{ backgroundImage: `radial-gradient(white 1.5px, transparent 1.5px)`, backgroundSize: '40px 40px' }} />
             <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
             
             <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-16 text-left">
                <div className="max-w-2xl text-center md:text-left">
                    <h2 className="text-5xl md:text-8xl font-black text-white mb-8 leading-[0.9] tracking-tighter italic uppercase pr-4 md:pr-8">Join Our <br />Network</h2>
                    <p className="text-white/90 text-xl font-medium leading-relaxed">Partner with Sri Lanka's leading engineering services provider to optimize your facility's potential.</p>
                </div>
                <button 
                  onClick={() => navigate('/contact')}
                  className="group relative px-16 py-8 bg-[#020917] text-white rounded-full font-black text-xl hover:scale-110 transition-all shadow-2xl flex items-center gap-4 active:scale-95"
                >
                    Contact Sales
                    <ArrowRight className="group-hover:translate-x-3 transition-transform" />
                </button>
             </div>
        </motion.section>
      </div>
    </div>
  );
}
