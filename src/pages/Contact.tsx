import { motion, AnimatePresence } from 'motion/react';
import { Mail, Phone, MapPin, Send, Facebook, Linkedin, Instagram, Youtube, Sparkles, CheckCircle2, Zap, ArrowRight, Loader2, Cpu } from 'lucide-react';
import { useState, FormEvent, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import emailjs from '@emailjs/browser';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, addDoc, doc, onSnapshot } from 'firebase/firestore';

export default function Contact() {
  const location = useLocation();
  const [siteSettings, setSiteSettings] = useState<any>(null);
  const [aiDiagnosis, setAiDiagnosis] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: 'Industrial Automation',
    message: ''
  });

  useEffect(() => {
    if (location.state?.subject) {
      setFormData(prev => ({ ...prev, subject: location.state.subject }));
    }
    if (location.state?.requirement) {
      setFormData(prev => ({ ...prev, message: `[AI Matrix Inquiry]\n\nRequirement: ${location.state.requirement}\n\nPlease proceed with technical consultation regarding this requirement.` }));
    }
    if (location.state?.diagnosis) {
      setAiDiagnosis(location.state.diagnosis);
      setFormData(prev => ({ ...prev, subject: `MATRIX Request: ${location.state.diagnosis.recommendedService}` }));
    }
  }, [location.state]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionProgress, setSubmissionProgress] = useState(0);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    emailjs.init('KQeP-JWgK9MRvedfv');
    onSnapshot(doc(db, 'settings', 'global'), (docSnap) => {
      if (docSnap.exists()) {
        setSiteSettings(docSnap.data());
      }
    }, (error) => handleFirestoreError(error, OperationType.GET, 'settings/global'));

    return () => {};
  }, []);

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      subject: location.state?.subject || 'Industrial Automation',
      message: ''
    });
    setSubmitted(false);
    setSubmissionProgress(0);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmissionProgress(20);
    
      try {
        const aiAnalysisData = location.state?.diagnosis || null;

        setSubmissionProgress(40);
        const docRef = await addDoc(collection(db, 'messages'), {
          name: formData.name, 
          email: formData.email, 
          message: formData.message, 
          customerName: formData.name,
          customerEmail: formData.email,
          customerGoal: location.state?.requirement || formData.message,
          subject: formData.subject,
          aiAnalysis: aiAnalysisData,
          isMatrixRequest: !!aiAnalysisData,
          timestamp: new Date().toLocaleString(),
          createdAt: new Date().toISOString(),
          status: 'new',
          read: false
        });
        
        setSubmissionProgress(70);
        
        // Dispatch to Admin Gmail via EmailJS
        try {
          const emailParams = {
            subject: formData.subject,
            from_name: formData.name,
            customer_name: formData.name,
            customer_email: formData.email,
            message: formData.message,
            ai_analysis: aiAnalysisData ? JSON.stringify(aiAnalysisData, null, 2) : 'No AI Analysis performed',
            goal: location.state?.requirement || 'Standard Inquiry',
            reply_to: formData.email,
            action_name: 'New Industrial Inquiry',
            website_link: window.location.origin
          };

          await emailjs.send(
            'service_8vt7bep',
            'template_b73a4if', // Using the security template as fallback, or assuming it handles generic fields if configured
            emailParams
          );
        } catch (emailError) {
          console.error("EmailJS transmission failed:", emailError);
        }
        
        try {
          await addDoc(collection(db, 'notifications'), {
            type: 'autoresponder',
            targetEmail: formData.email,
            sourceMessageId: docRef.id,
            status: 'queued',
            timestamp: new Date().toLocaleString()
          });
        } catch (notifError) {
          console.error("Notification creation failed:", notifError);
          handleFirestoreError(notifError, OperationType.WRITE, 'notifications');
        }

        setSubmissionProgress(100);
        setTimeout(() => {
          setIsSubmitting(false);
          setSubmitted(true);
        }, 500);
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, 'messages');
        setIsSubmitting(false);
        setSubmissionProgress(0);
      }
  };

  return (
    <div className="pt-32 pb-40 bg-navy relative overflow-hidden min-h-screen">
      {/* Background Grids */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '100px 100px' }} />
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-royal/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-24 items-start">
          
          {/* Contact Info */}
          <div className="space-y-16">
            <div className="space-y-8">
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-3 mb-6"
              >
                <div className="w-10 h-1 bg-royal rounded-full" />
                <span className="text-royal font-black uppercase tracking-[0.4em] text-[10px]">Open Protocols</span>
              </motion.div>
              
              <h1 className="text-5xl md:text-8xl font-black text-white leading-[0.85] tracking-tighter">INITIATE <br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-royal to-matrix">CONTACT</span></h1>
              
              <p className="text-white/40 text-xl leading-relaxed max-w-md font-medium">
                {siteSettings?.contactSubtitle || 'Bridging the gap between theory and industrial reality through precise engineering communication.'}
              </p>
            </div>

            {/* AI Diagnosis Handoff Display */}
            <AnimatePresence>
              {aiDiagnosis && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  className="glass-morphism rounded-[32px] p-8 border border-matrix/30 shadow-[0_20px_50px_rgba(16,185,129,0.1)] relative overflow-hidden group"
                >
                  <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Sparkles size={80} className="text-matrix" />
                  </div>
                  
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-8 h-8 rounded-lg bg-matrix/20 flex items-center justify-center text-matrix">
                      <Cpu size={16} />
                    </div>
                    <span className="text-matrix font-black text-[10px] uppercase tracking-widest">Active Matrix Diagnosis</span>
                  </div>

                  <h3 className="text-xl font-black text-white mb-4 tracking-tight">Technical Handoff Protocol</h3>
                  <div className="space-y-4 font-mono">
                    <div className="flex justify-between text-[10px]">
                      <span className="text-white/20 uppercase tracking-widest">Service Path</span>
                      <span className="text-matrix font-bold">{aiDiagnosis.recommendedService}</span>
                    </div>
                    <div className="flex justify-between text-[10px]">
                      <span className="text-white/20 uppercase tracking-widest">Urgency Index</span>
                      <span className={`font-bold ${aiDiagnosis.urgency === 'High' ? 'text-rose-500' : 'text-amber-500'}`}>{aiDiagnosis.urgency}</span>
                    </div>
                  </div>

                  <div className="mt-8 pt-6 border-t border-white/5 space-y-3">
                    <span className="text-[9px] font-black uppercase text-white/20 tracking-widest block mb-2">Analysis Snapshot</span>
                    <p className="text-xs text-white/60 leading-relaxed italic">"{aiDiagnosis.analysis}"</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-10">
              <ContactMethod 
                icon={MapPin} 
                title="Logistics Base" 
                value={siteSettings?.footerAddress || 'WVP9+FGX, Colombo 01000, Sri Lanka'} 
              />
              <ContactMethod 
                icon={Mail} 
                title="Data Exchange" 
                value={siteSettings?.footerEmail || 'nexonengineering.service@gmail.com'} 
                href={`mailto:${siteSettings?.footerEmail}`}
              />
              <ContactMethod 
                icon={Phone} 
                title="Voice Protocol" 
                value={siteSettings?.footerPhone || '+94 77 375 3621'} 
                href={`tel:${siteSettings?.footerPhone}`}
              />
            </div>

            <SocialLinks siteSettings={siteSettings} />
          </div>

          {/* Contact Form */}
          <div className="relative">
             <div className="absolute -inset-10 bg-royal/5 blur-[100px] rounded-full" />
             
             <AnimatePresence mode="wait">
               {submitted ? (
                 <motion.div 
                   key="success"
                   initial={{ opacity: 0, y: 20, scale: 0.95 }}
                   animate={{ opacity: 1, y: 0, scale: 1 }}
                   className="relative z-10 glass-morphism p-8 md:p-16 rounded-[40px] md:rounded-[60px] text-center flex flex-col items-center justify-center min-h-[500px] md:min-h-[600px] border-matrix/30"
                 >
                   <div className="w-24 h-24 bg-matrix rounded-[32px] flex items-center justify-center text-white mb-8 shadow-[0_20px_40px_rgba(16,185,129,0.3)] animate-bounce-slow">
                     <CheckCircle2 size={40} />
                   </div>
                   <h2 className="text-4xl font-black text-white mb-4 font-display">Protocol Engaged</h2>
                   <p className="text-white/40 text-lg mb-10 font-medium">Message received. Processing technical response...</p>
                   <button 
                     onClick={resetForm}
                     className="px-10 py-4 bg-white text-navy rounded-2xl font-black text-sm uppercase tracking-widest hover:scale-105 transition-all shadow-xl active:scale-95"
                   >
                     Send New Protocol
                   </button>
                 </motion.div>
               ) : (
                 <motion.form 
                   key="form"
                   initial={{ opacity: 0, y: 20 }}
                   animate={{ opacity: 1, y: 0 }}
                   onSubmit={handleSubmit}
                   className="relative z-10 glass-morphism p-8 md:p-16 rounded-[40px] md:rounded-[60px] space-y-8 shadow-2xl overflow-hidden"
                 >
                  {isSubmitting && (
                    <div className="absolute top-0 left-0 w-full h-1.5 bg-white/5">
                       <motion.div 
                         initial={{ width: 0 }}
                         animate={{ width: `${submissionProgress}%` }}
                         className="h-full bg-royal shadow-[0_0_15px_rgba(30,136,229,0.5)]"
                       />
                    </div>
                  )}

                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-2 h-2 rounded-full bg-royal animate-pulse" />
                    <span className="text-[10px] font-black uppercase text-white/40 tracking-[0.4em]">Signal Acquisition</span>
                  </div>

                  <div className="grid md:grid-cols-2 gap-8">
                     <div className="space-y-3">
                        <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-1">Identity</label>
                        <input 
                           type="text" 
                           required
                           value={formData.name}
                           onChange={(e) => setFormData({...formData, name: e.target.value})}
                           className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:outline-none focus:border-royal transition-all font-medium" 
                           placeholder="John Doe"
                        />
                     </div>
                     <div className="space-y-3">
                        <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-1">Frequency (Email)</label>
                        <input 
                           type="email" 
                           required
                           value={formData.email}
                           onChange={(e) => setFormData({...formData, email: e.target.value})}
                           className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:outline-none focus:border-royal transition-all font-medium" 
                           placeholder="john@engineering.com"
                        />
                     </div>
                  </div>

                  <div className="space-y-3">
                     <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-1">Directive Branch</label>
                     <input 
                        type="text" 
                        value={formData.subject}
                        onChange={(e) => setFormData({...formData, subject: e.target.value})}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:outline-none focus:border-royal transition-all font-medium"
                        placeholder="e.g. Industrial Automation"
                     />
                  </div>

                  <div className="space-y-3">
                     <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-1">Transmission Data</label>
                     <textarea 
                        required
                        value={formData.message}
                        onChange={(e) => setFormData({...formData, message: e.target.value})}
                        className="w-full bg-white/5 border border-white/10 rounded-[32px] p-6 text-white focus:outline-none focus:border-royal transition-all h-48 resize-none font-medium leading-relaxed" 
                        placeholder="Detail your industrial requirement here..."
                     />
                  </div>

                  {/* Note: Technical attachments section removed as it is currently a decorative placeholder. 
                      You can re-enable it when the secure schematic upload protocols are implemented. */}

                  <button 
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-6 bg-royal text-white rounded-2xl font-black text-xs uppercase tracking-[0.3em] hover:bg-matrix transition-all flex items-center justify-center gap-4 disabled:opacity-50 group hover:shadow-[0_15px_40px_rgba(30,136,229,0.3)] shadow-xl"
                  >
                    {isSubmitting ? <Loader2 className="animate-spin" /> : (
                      <>RELEASE SIGNAL <Send size={18} className="group-hover:translate-x-2 group-hover:-translate-y-1 transition-transform" /></>
                    )}
                  </button>
               </motion.form>
             )}
            </AnimatePresence>
          </div>
        </div>
        
        {/* Map Section */}
        {siteSettings?.showGoogleMaps && (
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="mt-32 md:mt-60 h-[400px] md:h-[600px] glass-morphism rounded-[40px] md:rounded-[60px] overflow-hidden border border-white/10 relative group"
          >
             <iframe
               src={siteSettings.googleMapsEmbedUrl || "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15843.4687595!2d79.85!3d6.9!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNsKwNTQnMDAuMCJOIDc5wrA1MScwMC4wIkU!5e0!3m2!1sen!2slk!4v1"}
               width="100%"
               height="100%"
               style={{ border: 0, filter: 'grayscale(1) invert(0.9) contrast(1.2) brightness(0.9)' }}
               allowFullScreen={true}
               loading="lazy"
               referrerPolicy="no-referrer-when-downgrade"
             />
          </motion.div>
        )}

      </div>
    </div>
  );
}

function ContactMethod({ icon: Icon, title, value, href }: { icon: any, title: string, value: string, href?: string }) {
  return (
    <div className="flex gap-8 group">
      <div className="w-16 h-16 glass-morphism rounded-3xl flex items-center justify-center text-royal group-hover:bg-royal group-hover:text-white transition-all duration-500 border border-white/5 group-hover:border-royal/50 shadow-xl group-hover:shadow-[0_10px_30px_rgba(30,136,229,0.2)]">
        <Icon size={28} />
      </div>
      <div>
        <h4 className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em] mb-2">{title}</h4>
        {href ? (
          <a href={href} className="text-xl font-bold text-white group-hover:text-royal transition-colors font-display tracking-tight border-b-2 border-transparent group-hover:border-royal/30">
            {value}
          </a>
        ) : (
          <p className="text-xl font-bold text-white font-display tracking-tight">{value}</p>
        )}
      </div>
    </div>
  );
}

function SocialLinks({ siteSettings }: { siteSettings: any }) {
  if (!siteSettings) return null;
  
  const platforms = [
    { key: 'showFacebook', icon: Facebook, url: 'facebookUrl' },
    { key: 'showLinkedIn', icon: Linkedin, url: 'linkedinUrl' },
    { key: 'showInstagram', icon: Instagram, url: 'instagramUrl' },
    { key: 'showYoutube', icon: Youtube, url: 'youtubeUrl' },
  ];

  return (
    <div className="pt-10 border-t border-white/5 flex flex-wrap gap-6">
      {platforms.map(platform => siteSettings[platform.key] && (
        <a 
          key={platform.key}
          href={siteSettings[platform.url] || "#"} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="w-14 h-14 glass-morphism rounded-2xl flex items-center justify-center text-white/40 hover:text-white hover:bg-royal transition-all hover:scale-110 border border-white/5 hover:border-royal/50"
        >
          <platform.icon size={24} />
        </a>
      ))}
    </div>
  );
}
