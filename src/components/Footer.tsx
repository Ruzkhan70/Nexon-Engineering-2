import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Facebook, Linkedin, Instagram, Youtube, MapPin, Mail, Phone, ChevronRight } from 'lucide-react';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import logoAsset from '../assets/images/regenerated_image_1778416445692.png';

export default function Footer({ settings }: { settings: any }) {
  const location = useLocation();

  const siteSettings = settings || {
    footerAddress: 'WVP9+FGX, Colombo 01000, Colombo 10, Sri Lanka',
    footerPhone: '+94 77 375 3621',
    footerEmail: 'nexonengineering.service@gmail.com',
    showFacebook: true,
    showGoogleMaps: true
  };

  if (location.pathname === '/admin') return null;

  return (
    <footer className="bg-[#0A2463] text-[#F8F9FA] py-20 border-t border-white/10">
      <div className="max-w-7xl mx-auto px-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
        
        {/* Company Info */}
        <div className="space-y-6">
          <img 
            src={logoAsset} 
            alt="Nexon Logo" 
            referrerPolicy="no-referrer"
            className="h-20 w-auto"
          />
          <p className="text-[#E1F5FE]/70 leading-relaxed max-w-sm text-sm md:text-base">
            Nexon Engineering provides industrial repair, maintenance and automation
            solutions across residential, commercial and industrial projects.
            We deliver safe, dependable engineering services with an emphasis on
            reliability and efficiency.
          </p>
          <div className="flex gap-4 flex-wrap">
            {siteSettings?.showFacebook && (
              <a href={siteSettings.facebookUrl || "#"} target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-white/5 hover:bg-[#1E88E5] rounded-full flex items-center justify-center transition-all hover:scale-110">
                <Facebook size={20} />
              </a>
            )}
            {siteSettings?.showLinkedIn && (
              <a href={siteSettings.linkedinUrl || "#"} target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-white/5 hover:bg-[#1E88E5] rounded-full flex items-center justify-center transition-all hover:scale-110">
                <Linkedin size={20} />
              </a>
            )}
            {siteSettings?.showInstagram && (
              <a href={siteSettings.instagramUrl || "#"} target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-white/5 hover:bg-[#1E88E5] rounded-full flex items-center justify-center transition-all hover:scale-110">
                <Instagram size={20} />
              </a>
            )}
            {siteSettings?.showTwitter && (
              <a href={siteSettings.twitterUrl || "#"} target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-white/5 hover:bg-[#1E88E5] rounded-full flex items-center justify-center transition-all hover:scale-110">
                <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current" xmlns="http://www.w3.org/2000/svg"><path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932 6.064-6.932zm-1.292 19.49h2.039L6.486 3.24H4.298l13.311 17.403z"/></svg>
              </a>
            )}
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="text-xl font-bold mb-8 border-b-2 border-[#1E88E5] inline-block pb-1 uppercase tracking-wider">Quick Links</h3>
          <ul className="space-y-4">
            {['About', 'Services', 'Projects', 'Clients', 'Contact'].map((link) => (
              <li key={link}>
                <Link to={`/${link.toLowerCase()}`} className="text-[#E1F5FE]/70 hover:text-[#1E88E5] transition-colors flex items-center gap-2 group">
                  <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  {link === 'Clients' ? 'Our Clients' : link}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact Info */}
        <div>
          <h3 className="text-xl font-bold mb-8 border-b-2 border-[#1E88E5] inline-block pb-1 uppercase tracking-wider">Contact Us</h3>
          <div className="space-y-6 text-[#E1F5FE]/70">
            {siteSettings?.showGoogleMaps && (
              <div className="flex items-start gap-4">
                <MapPin className="text-[#1E88E5] shrink-0 mt-1" size={20} />
                <span className="text-sm">{siteSettings.footerAddress}</span>
              </div>
            )}
            <div className="flex items-center gap-4">
              <Mail className="text-[#1E88E5] shrink-0" size={20} />
              <a href={`mailto:${siteSettings.footerEmail}`} className="hover:text-[#1E88E5] break-all truncate text-sm">
                {siteSettings.footerEmail}
              </a>
            </div>
            <div className="flex items-center gap-4">
              <Phone className="text-[#1E88E5] shrink-0" size={20} />
              <a href={`tel:${siteSettings.footerPhone}`} className="hover:text-[#1E88E5] text-sm font-medium">
                {siteSettings.footerPhone}
              </a>
            </div>
          </div>
        </div>

        {/* Facebook Embedded Page */}
        <div className="hidden lg:block">
          {siteSettings?.showFacebook && (
            <>
              <h3 className="text-xl font-bold mb-8 border-b-2 border-[#1E88E5] inline-block pb-1 uppercase tracking-wider">Facebook</h3>
              <div className="rounded-xl overflow-hidden shadow-2xl h-[300px]">
                <iframe
                  src={`https://www.facebook.com/plugins/page.php?href=${encodeURIComponent(siteSettings.facebookUrl || "https://web.facebook.com/profile.php?id=61584696382140")}&tabs=timeline&width=340&height=500&small_header=false&adapt_container_width=true&hide_cover=false&show_facepile=true`}
                  width="100%"
                  height="100%"
                  style={{ border: 'none', overflow: 'hidden' }}
                  scrolling="no"
                  frameBorder="0"
                  allowFullScreen={true}
                  allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
                />
              </div>
            </>
          )}
        </div>

      </div>

      <div className="max-w-7xl mx-auto px-8 mt-20 pt-8 border-t border-white/10 text-center text-[#E1F5FE]/40 text-sm">
        <p>© {new Date().getFullYear()} NEXON Engineering Services (Pvt) Ltd. All rights reserved.</p>
      </div>
    </footer>
  );
}
