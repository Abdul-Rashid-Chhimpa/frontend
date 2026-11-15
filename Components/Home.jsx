import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import ProductCard from "./Card";
import Nav from "./Nav";
import RandomImg from "./RandomImg";
import Footer from "./Footer";
import OnboardingGuide from "./OnboardingGuide";
import {
  ShieldCheck,
  Zap,
  Award,
  Wrench,
  ArrowRight,
  Sparkles,
  ShoppingBag,
  Rotate3d,
  Factory,
  CheckCircle2,
  Boxes,
  Sparkle,
} from "lucide-react";

const API_BASE = "https://backend-3-axez.onrender.com";

const COLOR = {
  INK: "#15181C",
  MUTED: "#6B7280",
  BORDER: "#E6E8EB",
  SURFACE: "#FFFFFF",
  BG_LIGHT: "#F8FAFC",
  AMBER: "#F0A420",
  AMBER_DARK: "#C97F0F",
  STEEL: "#2B4A5E",
  STEEL_DARK: "#17303E",
};

const Home = () => {
  const navigate = useNavigate();
  const [featuredTool, setFeaturedTool] = useState({
    tagline: "For professional use",
    title: "PEDWAL PLC978",
    specs: "Drop forged high-grade alloy steel · Industrial grade precision",
    image: "https://images.unsplash.com/photo-1581235720704-06d3acfcb36f?auto=format&fit=crop&w=900&q=80",
  });

  const handleBuyNow = () => {
    const el = document.getElementById("products-section");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-[#FAFAFC] text-[#15181C] font-sans overflow-x-hidden">
      {/* ========== FIRST TIME USER GUIDE ========== */}
      <OnboardingGuide />
      <Nav />
      <RandomImg />

      {/* ========== RUNNING MARQUEE ========== */}
      <div
        className="w-full overflow-hidden py-3.5 sm:py-4 border-y shadow-inner relative z-10"
        style={{ background: COLOR.STEEL_DARK, borderColor: "rgba(255,255,255,0.1)" }}
      >
        <div className="flex w-max animate-ticker">
          {[1, 2].map((groupKey) => (
            <div key={groupKey} className="flex items-center whitespace-nowrap gap-6 sm:gap-10 px-4">
              <span className="flex items-center gap-3 text-sm sm:text-base md:text-lg font-bold uppercase tracking-wider text-white">
                <Sparkles size={18} style={{ color: COLOR.AMBER }} />
                Welcome to <span style={{ color: COLOR.AMBER }}>Pedwal Life Creation</span>
              </span>
              <span className="text-white/30">•</span>
              <span className="text-sm sm:text-base md:text-lg font-bold uppercase tracking-wider text-white">
                Engineered for Excellence
              </span>
              <span className="text-white/30">•</span>
              <span className="text-sm sm:text-base md:text-lg font-bold uppercase tracking-wider text-white">
                Interactive 3D & 360° Tool Showcase
              </span>
              <span className="text-white/30">•</span>
            </div>
          ))}
        </div>
      </div>

      {/* ========== HERO SECTION WITH MODERN 3D STUDIO BUTTON ========== */}
      <section className="relative w-full overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#FFF9F0] via-[#F8FAFC] to-[#F0F4F8] pointer-events-none" />

        <div
          className="absolute top-16 right-8 w-80 h-80 rounded-full blur-[110px] opacity-25 pointer-events-none"
          style={{ background: COLOR.AMBER }}
        />
        <div
          className="absolute bottom-20 left-6 w-64 h-64 rounded-full blur-[100px] opacity-15 pointer-events-none"
          style={{ background: COLOR.STEEL }}
        />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            
            {/* ===== LEFT CONTENT ===== */}
            <div className="lg:col-span-6 space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border shadow-sm">
                <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: COLOR.AMBER }} />
                <span className="text-xs font-semibold tracking-wide" style={{ color: COLOR.STEEL }}>
                  {featuredTool.tagline}
                </span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.15]">
                {featuredTool.title}
              </h1>

              <p className="text-base sm:text-lg max-w-lg" style={{ color: COLOR.MUTED }}>
                {featuredTool.specs}
              </p>

              {/* Feature pills */}
              <div className="flex flex-wrap gap-3 pt-2">
                <div className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-white border text-xs font-semibold shadow-sm" style={{ borderColor: COLOR.BORDER, color: COLOR.STEEL }}>
                  <Wrench size={14} /> Drop Forged
                </div>
                <div className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-white border text-xs font-semibold shadow-sm" style={{ borderColor: COLOR.BORDER, color: COLOR.STEEL }}>
                  <Zap size={14} /> Hardened Edge
                </div>
                <div className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-white border text-xs font-semibold shadow-sm" style={{ borderColor: COLOR.BORDER, color: COLOR.STEEL }}>
                  <ShieldCheck size={14} /> Quality Assured
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-4 pt-4">
                <button
                  onClick={handleBuyNow}
                  className="group px-7 py-4 rounded-2xl font-bold text-sm text-white shadow-xl flex items-center gap-2.5 transition-all duration-300 hover:-translate-y-1 active:scale-[0.98] cursor-pointer"
                  style={{
                    background: `linear-gradient(135deg, ${COLOR.AMBER} 0%, ${COLOR.AMBER_DARK} 100%)`,
                  }}
                >
                  <ShoppingBag size={18} className="group-hover:scale-110 transition-transform" />
                  <span>Explore Catalog</span>
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>

            {/* ===== RIGHT: MODERN ANIMATED 3D & 360° STUDIO BANNER CARD ===== */}
            <div className="lg:col-span-6 flex justify-center">
              <div className="relative w-full max-w-lg rounded-[2.5p_2.5rem] bg-gradient-to-br from-slate-900 via-[#1b3242] to-slate-950 p-8 sm:p-10 text-white shadow-2xl border border-slate-700/80 overflow-hidden group">
                
                {/* Glowing Background Orb */}
                <div 
                  className="absolute -right-16 -top-16 w-56 h-56 rounded-full blur-3xl opacity-40 group-hover:scale-125 transition-transform duration-700 pointer-events-none"
                  style={{ background: COLOR.AMBER }}
                />

                <div className="relative z-10 space-y-6">
                  <div className="flex items-center justify-between">
                    <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-400/10 text-amber-400 border border-amber-400/20 flex items-center gap-1.5">
                      <Sparkle size={13} /> Next-Gen Technology
                    </span>
                    <div className="w-12 h-12 rounded-2xl bg-amber-400/15 border border-amber-400/30 flex items-center justify-center text-amber-400 shadow-inner animate-pulse">
                      <Rotate3d size={24} />
                    </div>
                  </div>

                  <div>
                    <h3 className="text-2xl sm:text-3xl font-black tracking-tight mb-2">
                      Interactive 3D & 360° Product Studio
                    </h3>
                    <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
                      Step inside our immersive studio experience. Rotate tools 360 degrees, inspect high-resolution multi-angle frames, and examine forged material details in real-time.
                    </p>
                  </div>

                  {/* Feature Bullets */}
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div className="flex items-center gap-2 text-xs text-slate-200">
                      <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                      360° Turntable Spin
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-200">
                      <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                      Real-time 3D Tilt
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-200">
                      <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                      HD Cloudinary Zoom
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-200">
                      <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                      Studio Lightbox View
                    </div>
                  </div>

                  {/* Animated Button to Navigate to New Page */}
                  <div className="pt-4">
                    <button
                      onClick={() => navigate("/admin/3d-products")}
                      className="w-full py-4 px-6 rounded-2xl font-extrabold text-slate-950 shadow-xl flex items-center justify-center gap-3 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                      style={{ background: COLOR.AMBER }}
                    >
                      <Rotate3d size={20} className="animate-spin-slow" />
                      <span>Launch 3D & 360° Studio</span>
                      <ArrowRight size={18} />
                    </button>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ========== FEATURE HIGHLIGHTS ========== */}
      <section
        className="w-full py-8 border-y"
        style={{ background: COLOR.BG_LIGHT, borderColor: COLOR.BORDER }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5 sm:gap-6 text-center md:text-left">
            {[
              { icon: Wrench, title: "Drop Forged Steel", note: "Maximum strength structure" },
              { icon: Zap, title: "Induction Hardened", note: "Precision cutting edges" },
              { icon: Award, title: "Ergonomic Grip", note: "Slip-resistant comfort" },
              { icon: ShieldCheck, title: "Quality Guaranteed", note: "Built for long life" },
            ].map(({ icon: Icon, title, note }) => (
              <div key={title} className="flex flex-col md:flex-row items-center gap-3">
                <div
                  className="p-3 rounded-xl shadow-sm text-white shrink-0"
                  style={{ background: COLOR.STEEL }}
                >
                  <Icon size={20} />
                </div>
                <div>
                  <h4 className="text-sm font-bold">{title}</h4>
                  <p className="text-xs text-gray-500">{note}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== PRODUCTS ========== */}
      <main id="products-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <ProductCard />
      </main>

      {/* ========== ANIMATED COMPANY OVERVIEW SECTION ========== */}
      <section
        className="w-full py-16 text-white relative overflow-hidden"
        style={{ background: COLOR.STEEL_DARK }}
      >
        <div
          className="absolute -top-24 -right-24 w-96 h-96 rounded-full blur-[120px] opacity-20 pointer-events-none"
          style={{ background: COLOR.AMBER }}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-6 space-y-5">
              <span
                className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-slate-950"
                style={{ background: COLOR.AMBER }}
              >
                <Factory size={14} /> Company Overview
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold leading-tight">
                Pedwal Life Creation — Engineered for Heavy-Duty Reliability
              </h2>
              <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                From precision drop-forged pliers to high-torque industrial wrenches,
                Pedwal Life Creation delivers certified hand tools designed for
                workshops, technicians, and builders across India.
              </p>

              <div className="grid grid-cols-3 gap-3 sm:gap-4 pt-2">
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-amber-400/50 transition">
                  <p className="text-2xl sm:text-3xl font-black" style={{ color: COLOR.AMBER }}>
                    100%
                  </p>
                  <p className="text-xs text-slate-300 mt-1">Drop Forged Steel</p>
                </div>
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-amber-400/50 transition">
                  <p className="text-2xl sm:text-3xl font-black" style={{ color: COLOR.AMBER }}>
                    DIN
                  </p>
                  <p className="text-xs text-slate-300 mt-1">Torque Certified</p>
                </div>
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-amber-400/50 transition">
                  <p className="text-2xl sm:text-3xl font-black" style={{ color: COLOR.AMBER }}>
                    PAN
                  </p>
                  <p className="text-xs text-slate-300 mt-1">India Dispatch</p>
                </div>
              </div>
            </div>

            <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                {
                  title: "Induction Hardened Edges",
                  desc: "Precision heat-treated cutting jaws for effortless wire & bolt cutting.",
                },
                {
                  title: "Anti-Rust Finish",
                  desc: "Satin & mirror-chrome coating built to resist workshop oil and corrosion.",
                },
                {
                  title: "Ergonomic Sleeve Grip",
                  desc: "Shock-absorbing insulated handles reduce hand fatigue during long shifts.",
                },
                {
                  title: "Strict Quality Testing",
                  desc: "Every batch undergoes hardness and load testing before dispatch.",
                },
              ].map((box, idx) => (
                <div
                  key={idx}
                  className="p-5 rounded-2xl bg-white/5 border border-white/10 hover:-translate-y-1 hover:bg-white/10 transition-all duration-300"
                >
                  <CheckCircle2 size={22} style={{ color: COLOR.AMBER }} className="mb-3" />
                  <h3 className="font-bold text-base text-white mb-1">{box.title}</h3>
                  <p className="text-xs text-slate-300 leading-relaxed">{box.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <Footer />

      <style>{`
        @keyframes ticker {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-ticker {
          animation: ticker 25s linear infinite;
        }
        .animate-ticker:hover {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
};

export default Home;
