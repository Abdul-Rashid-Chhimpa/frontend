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

// Brand Palette
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

// Fallback slides
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

const getImageUrl = (img) => {
  if (!img) return "";
  if (img.startsWith("http") || img.startsWith("data:")) return img;
  if (img.startsWith("/uploads/")) return `${API_BASE}${img}`;
  return img;
};

const handleImgError = (e) => {
  e.currentTarget.onerror = null;
  e.currentTarget.src = "https://placehold.co/600x450?text=Image+Not+Found";
};

const Home = () => {
  const [slideData, setSlideData] = useState(defaultSlideData);
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const { data } = await axios.get(`${API_BASE}/api/banners`, {
          timeout: 60000,
        });

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

  const current = slideData[active] || slideData[0];

  return (
    <div className="min-h-screen bg-[#FAFAFC] text-[#15181C] font-sans overflow-x-hidden">
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
                Premium Industrial Grade Tools
              </span>
              <span className="text-white/30">•</span>
            </div>
          ))}
        </div>
      </div>

      {/* ========== HERO SHOWCASE (Modern + Mobile friendly) ========== */}
      <section className="relative w-full py-8 sm:py-14 md:py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Soft ambient glow */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[280px] sm:w-[480px] lg:w-[640px] h-[280px] sm:h-[480px] rounded-full blur-[120px] pointer-events-none opacity-25"
          style={{ background: COLOR.AMBER }}
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-center relative z-10">
          {/* ===== LEFT: Text content ===== */}
          <div className="lg:col-span-5 flex flex-col justify-center order-2 lg:order-1">
            {/* Tagline badge */}
            <div
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-xs font-semibold w-fit mx-auto lg:mx-0 shadow-sm"
              style={{
                background: COLOR.SURFACE,
                borderColor: COLOR.BORDER,
                color: COLOR.STEEL,
              }}
            >
              <ShieldCheck size={14} style={{ color: COLOR.AMBER_DARK }} />
              {current?.tagline || "Premium Tools"}
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight mt-4 leading-[1.15] text-center lg:text-left">
              {current?.title || "Featured Tool"}
            </h1>

            <p
              className="text-sm sm:text-base mt-3 font-medium text-center lg:text-left max-w-md mx-auto lg:mx-0"
              style={{ color: COLOR.MUTED }}
            >
              {current?.specs || "High quality industrial tools"}
            </p>

            {/* CTA */}
            <div className="mt-6 sm:mt-8 flex justify-center lg:justify-start">
              <button
                className="px-6 py-3.5 rounded-2xl font-bold text-sm text-white shadow-lg transition-all transform hover:-translate-y-0.5 active:translate-y-0 flex items-center gap-2"
                style={{
                  background: `linear-gradient(135deg, ${COLOR.AMBER}, ${COLOR.AMBER_DARK})`,
                }}
              >
                <span>Explore Specification</span>
                <ArrowRight size={16} />
              </button>
            </div>

            {/* Thumbnail strip */}
            <div
              className="flex flex-wrap items-center justify-center lg:justify-start gap-2.5 mt-8 pt-6 border-t"
              style={{ borderColor: COLOR.BORDER }}
            >
              {slideData.map((item, idx) => (
                <button
                  key={item._id || item.id || idx}
                  onClick={() => setActive(idx)}
                  aria-label={`Show slide ${idx + 1}`}
                  className={`relative rounded-xl overflow-hidden transition-all duration-300 border-2 shrink-0 bg-white ${
                    active === idx
                      ? "shadow-md -translate-y-0.5 scale-105"
                      : "opacity-60 hover:opacity-100 hover:-translate-y-0.5"
                  }`}
                  style={{
                    borderColor: active === idx ? COLOR.AMBER : COLOR.BORDER,
                    width: "52px",
                    height: "52px",
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

          {/* ===== RIGHT: Product image card ===== */}
          <div className="lg:col-span-7 relative flex justify-center items-center order-1 lg:order-2">
            <div
              onMouseEnter={() => setPaused(true)}
              onMouseLeave={() => setPaused(false)}
              className="relative w-full max-w-[340px] sm:max-w-md md:max-w-lg aspect-[4/3.2] rounded-3xl p-3 sm:p-5 shadow-2xl border bg-white flex items-center justify-center overflow-hidden"
              style={{ borderColor: COLOR.BORDER }}
            >
              {/* Soft inner glow */}
              <div
                className="absolute inset-0 opacity-40 pointer-events-none"
                style={{
                  background:
                    "radial-gradient(circle at 30% 20%, rgba(240,164,32,0.12), transparent 55%)",
                }}
              />

              <img
                key={current?._id || current?.id || active}
                src={getImageUrl(current?.image)}
                alt={current?.title}
                onError={handleImgError}
                className="relative z-10 w-full h-full object-contain rounded-2xl animate-slide-fade transition-transform duration-700 hover:scale-[1.03]"
              />

              {/* Navigation arrows */}
              <button
                onClick={goPrev}
                aria-label="Previous slide"
                className="absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center shadow-lg transition-all hover:scale-110 backdrop-blur-md z-20"
                style={{
                  background: "rgba(255,255,255,0.9)",
                  border: `1px solid ${COLOR.BORDER}`,
                  color: COLOR.INK,
                }}
              >
                <ChevronLeft size={18} />
              </button>

              <button
                onClick={goNext}
                aria-label="Next slide"
                className="absolute right-2.5 sm:right-3 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center shadow-lg transition-all hover:scale-110 backdrop-blur-md z-20"
                style={{
                  background: "rgba(255,255,255,0.9)",
                  border: `1px solid ${COLOR.BORDER}`,
                  color: COLOR.INK,
                }}
              >
                <ChevronRight size={18} />
              </button>
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
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <ProductCard />
      </main>

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

        @keyframes slideFade {
          from { opacity: 0; transform: scale(0.96); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-slide-fade {
          animation: slideFade 0.55s ease;
        }
      `}</style>
    </div>
  );
};

export default Home;
