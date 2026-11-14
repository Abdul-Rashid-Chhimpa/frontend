import React, { useEffect, useState } from "react";
import axios from "axios";
import ProductCard from "./Card";
import Nav from "./Nav";
import RandomImg from "./RandomImg";
import Footer from "./Footer";
import {
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Zap,
  Award,
  Wrench,
  ArrowRight,
  Sparkles,
} from "lucide-react";

const API_BASE = "https://backend-3-axez.onrender.com";

// Brand Palette Setup
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

// Fallback slides (jab tak database mein banners add na hon)
const defaultSlideData = [
  {
    _id: "1",
    image: "01.jpeg",
    tagline: "Heavy-Duty Series",
    title: "Special Combination Plier",
    specs: "8″ 205mm · Drop Forged · Induction Hardened",
  },
  {
    _id: "2",
    image: "02.jpeg",
    tagline: "Ergonomic Comfort Grip",
    title: "Precision Edge Cutters",
    specs: "High-Leverage Design · Matt Polished",
  },
  {
    _id: "3",
    image: "03.jpg",
    tagline: "Industrial Grade Tools",
    title: "Professional Utility Sets",
    specs: "Special Grade Steel · Long Service Life",
  },
  {
    _id: "4",
    image: "04.jpg",
    tagline: "Built For Craftsmen",
    title: "Multi-Purpose Hand Tools",
    specs: "Tempered Steel · Maximum Control",
  },
  {
    _id: "5",
    image: "05.jpg",
    tagline: "Next-Gen Performance",
    title: "Pedwal Master Collection",
    specs: "Tested & Certified · Premium Finish",
  },
];

// Admin se upload hui image (/uploads/..) ko full backend URL banata hai.
// Default images (01.jpeg) aur http/data links jaise hain waise hi rehte hain.
const getImageUrl = (img) => {
  if (!img) return "";
  if (img.startsWith("http") || img.startsWith("data:")) return img;
  if (img.startsWith("/uploads/")) return `${API_BASE}${img}`;
  return img;
};

const handleImgError = (e) => {
  e.currentTarget.onerror = null; // infinite loop se bachne ke liye
  e.currentTarget.src = "https://placehold.co/600x450?text=Image+Not+Found";
};

const Home = () => {
  const [slideData, setSlideData] = useState(defaultSlideData);
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  // Backend se dynamic banners fetch karein
  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const { data } = await axios.get(`${API_BASE}/api/banners`, {
          timeout: 60000, // Render free plan jaagne me 30-50 sec leta hai
        });

        // Dono format support: [ ... ] ya { success, banners: [ ... ] }
        const list = Array.isArray(data) ? data : data?.banners;

        if (Array.isArray(list) && list.length > 0) {
          setSlideData(list);
          setActive(0);
        }
      } catch (error) {
        console.log("Using default showcase banners:", error.message);
      }
    };
    fetchBanners();
  }, []);

  // Auto-slide timer (hover par ruk jata hai)
  useEffect(() => {
    if (slideData.length <= 1 || paused) return;
    const timer = setInterval(() => {
      setActive((prev) => (prev + 1) % slideData.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [slideData.length, paused]);

  const goPrev = () => {
    setActive((prev) => (prev - 1 + slideData.length) % slideData.length);
  };

  const goNext = () => {
    setActive((prev) => (prev + 1) % slideData.length);
  };

  // Safe current slide (index out of range ho to pehli slide)
  const current = slideData[active] || slideData[0];

  return (
    <div className="min-h-screen bg-[#FAFAFC] text-[#15181C] font-sans overflow-x-hidden">
      <Nav />
      <RandomImg />

      {/* ========== INFINITE RUNNING MARQUEE BANNER ========== */}
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
                Premium Industrial Grade Tools
              </span>
              <span className="text-white/30">•</span>
            </div>
          ))}
        </div>
      </div>

      {/* ========== HERO SHOWCASE CAROUSEL SECTION ========== */}
      <section className="relative w-full py-10 sm:py-16 md:py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Soft Ambient Background Lighting */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] sm:w-[500px] lg:w-[700px] h-[300px] sm:h-[500px] rounded-full blur-[140px] pointer-events-none opacity-20"
          style={{ background: COLOR.AMBER }}
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center relative z-10">
          {/* Left Column: Featured Text Info */}
          <div className="lg:col-span-5 flex flex-col justify-center text-center lg:text-left order-2 lg:order-1">
            <div
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-xs font-semibold w-fit mx-auto lg:mx-0 shadow-sm"
              style={{ background: COLOR.SURFACE, borderColor: COLOR.BORDER, color: COLOR.STEEL }}
            >
              <ShieldCheck size={14} style={{ color: COLOR.AMBER_DARK }} />
              {current?.tagline}
            </div>

            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight mt-4 leading-tight">
              {current?.title}
            </h1>

            <p className="text-sm sm:text-base mt-3 font-medium" style={{ color: COLOR.MUTED }}>
              {current?.specs}
            </p>

            <div className="mt-6 sm:mt-8 flex flex-wrap items-center justify-center lg:justify-start gap-4">
              <button
                className="px-6 py-3 rounded-xl font-bold text-sm text-white shadow-lg transition-all transform hover:-translate-y-0.5 active:translate-y-0 flex items-center gap-2"
                style={{ background: `linear-gradient(135deg, ${COLOR.AMBER}, ${COLOR.AMBER_DARK})` }}
              >
                <span>Explore Specification</span>
                <ArrowRight size={16} />
              </button>
            </div>

            {/* Thumbnail Navigation Indicators (bina scrollbar ke) */}
            <div
              className="flex flex-wrap items-center justify-center lg:justify-start gap-3 mt-8 pt-6 border-t"
              style={{ borderColor: COLOR.BORDER }}
            >
              {slideData.map((item, idx) => (
                <button
                  key={item._id || item.id}
                  onClick={() => setActive(idx)}
                  aria-label={`Show slide ${idx + 1}`}
                  className={`relative rounded-xl overflow-hidden transition-all duration-300 border-2 shrink-0 bg-white ${
                    active === idx
                      ? "shadow-lg -translate-y-0.5"
                      : "opacity-50 hover:opacity-100 hover:-translate-y-0.5"
                  }`}
                  style={{
                    borderColor: active === idx ? COLOR.AMBER : COLOR.BORDER,
                    width: "56px",
                    height: "56px",
                  }}
                >
                  <img
                    src={getImageUrl(item.image)}
                    alt={item.title}
                    onError={handleImgError}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Right Column: Hero Graphic Display */}
          <div className="lg:col-span-7 relative flex justify-center items-center order-1 lg:order-2">
            <div
              onMouseEnter={() => setPaused(true)}
              onMouseLeave={() => setPaused(false)}
              className="relative w-full max-w-md sm:max-w-lg aspect-[4/3] rounded-3xl p-4 sm:p-6 shadow-2xl border bg-white flex items-center justify-center overflow-hidden transition-all duration-500"
              style={{ borderColor: COLOR.BORDER }}
            >
              {/* Product Card Image (key badalne par fade animation chalti hai) */}
              <img
                key={current?._id || current?.id}
                src={getImageUrl(current?.image)}
                alt={current?.title}
                onError={handleImgError}
                className="w-full h-full object-contain rounded-2xl animate-slide-fade transition-transform duration-700 transform hover:scale-105"
              />

              {/* Navigation Arrows on Card */}
              <button
                onClick={goPrev}
                aria-label="Previous slide"
                className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-all hover:scale-110 backdrop-blur-md cursor-pointer"
                style={{ background: "rgba(255,255,255,0.85)", border: `1px solid ${COLOR.BORDER}`, color: COLOR.INK }}
              >
                <ChevronLeft size={20} />
              </button>

              <button
                onClick={goNext}
                aria-label="Next slide"
                className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-all hover:scale-110 backdrop-blur-md cursor-pointer"
                style={{ background: "rgba(255,255,255,0.85)", border: `1px solid ${COLOR.BORDER}`, color: COLOR.INK }}
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ========== INDUSTRIAL HIGHLIGHT FEATURES ========== */}
      <section className="w-full py-8 border-y" style={{ background: COLOR.BG_LIGHT, borderColor: COLOR.BORDER }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center md:text-left">
            <div className="flex flex-col md:flex-row items-center gap-3">
              <div className="p-3 rounded-xl shadow-sm text-white" style={{ background: COLOR.STEEL }}>
                <Wrench size={22} />
              </div>
              <div>
                <h4 className="text-sm font-bold">Drop Forged Steel</h4>
                <p className="text-xs text-gray-500">Maximum strength structure</p>
              </div>
            </div>

            <div className="flex flex-col md:flex-row items-center gap-3">
              <div className="p-3 rounded-xl shadow-sm text-white" style={{ background: COLOR.STEEL }}>
                <Zap size={22} />
              </div>
              <div>
                <h4 className="text-sm font-bold">Induction Hardened</h4>
                <p className="text-xs text-gray-500">Precision cutting edges</p>
              </div>
            </div>

            <div className="flex flex-col md:flex-row items-center gap-3">
              <div className="p-3 rounded-xl shadow-sm text-white" style={{ background: COLOR.STEEL }}>
                <Award size={22} />
              </div>
              <div>
                <h4 className="text-sm font-bold">Ergonomic Grip</h4>
                <p className="text-xs text-gray-500">Slip-resistant comfort</p>
              </div>
            </div>

            <div className="flex flex-col md:flex-row items-center gap-3">
              <div className="p-3 rounded-xl shadow-sm text-white" style={{ background: COLOR.STEEL }}>
                <ShieldCheck size={22} />
              </div>
              <div>
                <h4 className="text-sm font-bold">Quality Guaranteed</h4>
                <p className="text-xs text-gray-500">Built for long life</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========== PRODUCTS & FOOTER SECTION ========== */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <ProductCard />
      </main>

      <Footer />

      {/* Animation Keyframes */}
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

        @keyframes slideFade {
          from { opacity: 0; transform: scale(0.96); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-slide-fade {
          animation: slideFade 0.7s ease;
        }
      `}</style>
    </div>
  );
};

export default Home;
