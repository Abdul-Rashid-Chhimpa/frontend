import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import ProductCard from "./Card";
import Nav from "./Nav";
import RandomImg from "./RandomImg";
import Footer from "./Footer";
import OnboardingGuide from "./OnboardingGuide";
import {
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Zap,
  Award,
  Wrench,
  ArrowRight,
  Sparkles,
  ShoppingBag,
  Rotate3d,
  Maximize2,
  X,
  ZoomIn,
  ZoomOut,
  Play,
  Pause,
  Factory,
  CheckCircle2,
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

const defaultSlideData = [
  {
    _id: "1",
    image: "01.jpeg",
    tagline: "Heavy-Duty Series",
    title: "Special Combination Plier",
    specs: "8″ 205mm · Drop Forged · Induction Hardened",
    frames360: ["01.jpeg", "02.jpeg", "03.jpg", "04.jpg"],
  },
  {
    _id: "2",
    image: "02.jpeg",
    tagline: "Ergonomic Comfort Grip",
    title: "Precision Edge Cutters",
    specs: "High-Leverage Design · Matt Polished",
    frames360: ["02.jpeg", "03.jpg", "04.jpg", "05.jpg"],
  },
  {
    _id: "3",
    image: "03.jpg",
    tagline: "Industrial Grade Tools",
    title: "Professional Utility Sets",
    specs: "Special Grade Steel · Long Service Life",
    frames360: ["03.jpg", "04.jpg", "05.jpg", "01.jpeg"],
  },
  {
    _id: "4",
    image: "04.jpg",
    tagline: "Built For Craftsmen",
    title: "Multi-Purpose Hand Tools",
    specs: "Tempered Steel · Maximum Control",
    frames360: ["04.jpg", "05.jpg", "01.jpeg", "02.jpeg"],
  },
  {
    _id: "5",
    image: "05.jpg",
    tagline: "Next-Gen Performance",
    title: "Pedwal Master Collection",
    specs: "Tested & Certified · Premium Finish",
    frames360: ["05.jpg", "01.jpeg", "02.jpeg", "03.jpg"],
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
  const navigate = useNavigate();
  const [slideData, setSlideData] = useState(defaultSlideData);
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  // ========== 3D & 360° INTERACTIVE STATES ==========
  const [tilt, setTilt] = useState({ rotateX: 0, rotateY: 0 });
  const [is360Mode, setIs360Mode] = useState(false);
  const [rotationAngle, setRotationAngle] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [autoSpin, setAutoSpin] = useState(false);
  const [frameIndex, setFrameIndex] = useState(0);

  // Full-Screen 360 Studio Modal States
  const [fullViewOpen, setFullViewOpen] = useState(false);
  const [zoom, setZoom] = useState(1);

  const stageRef = useRef(null);

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

  // Reset 360 frame when active banner changes
  useEffect(() => {
    setFrameIndex(0);
    setRotationAngle(0);
  }, [active]);

  // Auto-slide banners when not paused & not in 360 mode
  useEffect(() => {
    if (slideData.length <= 1 || paused || is360Mode || fullViewOpen) return;
    const timer = setInterval(() => {
      setActive((prev) => (prev + 1) % slideData.length);
    }, 4800);
    return () => clearInterval(timer);
  }, [slideData.length, paused, is360Mode, fullViewOpen]);

  const current = slideData[active] || slideData[0];

  // Build available 360 frames (uses frames360 if uploaded by admin, otherwise main image + gallery)
  const activeFrames =
    Array.isArray(current?.frames360) && current.frames360.length > 0
      ? current.frames360
      : [current?.image].filter(Boolean);

  // Auto-spin 360° effect
  useEffect(() => {
    if (!autoSpin) return;
    const spinTimer = setInterval(() => {
      setRotationAngle((prev) => (prev + 5) % 360);
      if (activeFrames.length > 1) {
        setFrameIndex((prev) => (prev + 1) % activeFrames.length);
      }
    }, 85);
    return () => clearInterval(spinTimer);
  }, [autoSpin, activeFrames.length]);

  const goPrev = () => {
    setActive((prev) => (prev - 1 + slideData.length) % slideData.length);
  };

  const goNext = () => {
    setActive((prev) => (prev + 1) % slideData.length);
  };

  // 3D Mouse Tilt Handler
  const handleMouseMove = (e) => {
    if (is360Mode || !stageRef.current) return;
    const rect = stageRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({
      rotateX: -y * 20,
      rotateY: x * 20,
    });
  };

  const handleMouseLeave = () => {
    setPaused(false);
    setTilt({ rotateX: 0, rotateY: 0 });
    setIsDragging(false);
  };

  // 360° Drag Handlers (Mouse & Touch)
  const handleDragStart = (clientX) => {
    setIsDragging(true);
    setAutoSpin(false);
    setStartX(clientX);
  };

  const handleDragMove = (clientX) => {
    if (!isDragging) return;
    const delta = clientX - startX;
    setStartX(clientX);

    setRotationAngle((prev) => (prev + delta * 0.9 + 360) % 360);

    if (activeFrames.length > 1 && Math.abs(delta) > 8) {
      const step = delta > 0 ? 1 : -1;
      setFrameIndex(
        (prev) => (prev + step + activeFrames.length) % activeFrames.length
      );
    }
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  const handleBuyNow = () => {
    if (current?.productId) {
      navigate(`/product/${current.productId}`);
    } else if (current?._id && current._id.length > 10) {
      navigate(`/product/${current._id}`);
    } else {
      const el = document.getElementById("products-section");
      if (el) el.scrollIntoView({ behavior: "smooth" });
    }
  };

  const displayedImage =
    is360Mode || fullViewOpen
      ? activeFrames[frameIndex] || current?.image
      : current?.image;

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

      {/* ========== HERO 3D & 360° SHOWCASE ========== */}
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

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 lg:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            {/* ===== LEFT CONTENT ===== */}
            <div className="lg:col-span-5 order-2 lg:order-1">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border shadow-sm mb-5">
                <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: COLOR.AMBER }} />
                <span className="text-xs font-semibold tracking-wide" style={{ color: COLOR.STEEL }}>
                  {current?.tagline || "Premium Series"}
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-[1.15] mb-4">
                {current?.title || "Featured Tool"}
              </h1>

              <p className="text-sm sm:text-base max-w-md mb-6" style={{ color: COLOR.MUTED }}>
                {current?.specs || "High quality industrial tools built for professionals"}
              </p>

              {/* Feature pills */}
              <div className="flex flex-wrap gap-2.5 mb-8">
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border text-xs font-medium" style={{ borderColor: COLOR.BORDER, color: COLOR.STEEL }}>
                  <Wrench size={13} />
                  Drop Forged
                </div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border text-xs font-medium" style={{ borderColor: COLOR.BORDER, color: COLOR.STEEL }}>
                  <Zap size={13} />
                  Hardened Edge
                </div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border text-xs font-medium" style={{ borderColor: COLOR.BORDER, color: COLOR.STEEL }}>
                  <ShieldCheck size={13} />
                  Quality Assured
                </div>
              </div>

              {/* Action Buttons: Buy Now + Toggle 360° */}
              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={handleBuyNow}
                  className="group px-7 py-3.5 rounded-2xl font-bold text-sm text-white shadow-lg flex items-center gap-2.5 transition-all duration-300 hover:-translate-y-1 active:scale-[0.98] cursor-pointer"
                  style={{
                    background: `linear-gradient(135deg, ${COLOR.AMBER} 0%, ${COLOR.AMBER_DARK} 100%)`,
                  }}
                >
                  <ShoppingBag size={18} className="group-hover:scale-110 transition-transform" />
                  <span>Buy Now</span>
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </button>

                <button
                  onClick={() => {
                    setIs360Mode(!is360Mode);
                    setTilt({ rotateX: 0, rotateY: 0 });
                    setAutoSpin(false);
                  }}
                  className="px-5 py-3.5 rounded-2xl font-bold text-sm border flex items-center gap-2 transition-all duration-300 hover:-translate-y-1 cursor-pointer shadow-sm"
                  style={{
                    background: is360Mode ? COLOR.STEEL_DARK : COLOR.SURFACE,
                    color: is360Mode ? "#FFFFFF" : COLOR.STEEL_DARK,
                    borderColor: is360Mode ? COLOR.STEEL_DARK : COLOR.BORDER,
                  }}
                >
                  <Rotate3d size={18} className={is360Mode ? "text-amber-400 animate-spin-slow" : ""} />
                  <span>{is360Mode ? "Exit 360°" : "360° Spin"}</span>
                </button>
              </div>

              {/* Thumbnail strip */}
              <div className="mt-10 pt-6 border-t flex flex-wrap items-center gap-2.5" style={{ borderColor: COLOR.BORDER }}>
                {slideData.map((item, idx) => (
                  <button
                    key={item._id || item.id || idx}
                    onClick={() => {
                      setActive(idx);
                      setIs360Mode(false);
                      setAutoSpin(false);
                    }}
                    aria-label={`Show slide ${idx + 1}`}
                    className={`relative rounded-xl overflow-hidden transition-all duration-300 border-2 shrink-0 bg-white cursor-pointer ${
                      active === idx
                        ? "shadow-md scale-105 -translate-y-0.5"
                        : "opacity-55 hover:opacity-100 hover:-translate-y-0.5"
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

            {/* ===== RIGHT 3D & 360° INTERACTIVE PRODUCT DISPLAY ===== */}
            <div className="lg:col-span-7 order-1 lg:order-2 flex justify-center">
              <div
                ref={stageRef}
                onMouseEnter={() => setPaused(true)}
                onMouseLeave={handleMouseLeave}
                onMouseMove={(e) => {
                  handleMouseMove(e);
                  if (is360Mode) handleDragMove(e.clientX);
                }}
                onMouseDown={(e) => is360Mode && handleDragStart(e.clientX)}
                onMouseUp={handleDragEnd}
                onTouchStart={(e) => is360Mode && handleDragStart(e.touches[0].clientX)}
                onTouchMove={(e) => is360Mode && handleDragMove(e.touches[0].clientX)}
                onTouchEnd={handleDragEnd}
                className="relative w-full max-w-[380px] sm:max-w-[450px] md:max-w-[520px] select-none"
                style={{ perspective: "1200px" }}
              >
                {/* Soft glow behind product */}
                <div
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[85%] h-[85%] rounded-full blur-[60px] opacity-40 pointer-events-none"
                  style={{ background: "rgba(240, 164, 32, 0.35)" }}
                />

                {/* 3D Product Card */}
                <div
                  className="relative aspect-[4/3.4] rounded-[2rem] bg-white border shadow-2xl overflow-hidden flex items-center justify-center p-5 sm:p-7"
                  style={{ borderColor: COLOR.BORDER }}
                >
                  {/* Inner soft light */}
                  <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                      background:
                        "radial-gradient(circle at 45% 35%, rgba(240,164,32,0.14), transparent 65%)",
                    }}
                  />

                  {/* Top Left Mode Indicator */}
                  <div className="absolute top-3.5 left-3.5 z-20 flex items-center gap-1.5">
                    <span
                      className="px-2.5 py-1 rounded-full text-[11px] font-bold shadow-sm flex items-center gap-1"
                      style={{
                        background: is360Mode ? COLOR.STEEL_DARK : "rgba(255,255,255,0.92)",
                        color: is360Mode ? "#FFFFFF" : COLOR.STEEL_DARK,
                        border: `1px solid ${COLOR.BORDER}`,
                      }}
                    >
                      <Rotate3d size={13} style={{ color: COLOR.AMBER }} />
                      {is360Mode ? `360° (${Math.round(rotationAngle)}°)` : "3D Interactive"}
                    </span>
                  </div>

                  {/* Top Right Full-Screen Expand Button */}
                  <button
                    onClick={() => {
                      setFullViewOpen(true);
                      setZoom(1);
                    }}
                    title="Click for Full-Screen 360° View"
                    className="absolute top-3.5 right-3.5 z-20 p-2 rounded-full shadow-md backdrop-blur-md transition hover:scale-110 cursor-pointer"
                    style={{
                      background: "rgba(255,255,255,0.92)",
                      border: `1px solid ${COLOR.BORDER}`,
                      color: COLOR.INK,
                    }}
                  >
                    <Maximize2 size={16} />
                  </button>

                  {/* 3D Transforming Image (Click to open Full-Screen 360°) */}
                  <div
                    onClick={() => {
                      if (!isDragging) {
                        setFullViewOpen(true);
                        setZoom(1);
                      }
                    }}
                    className={`relative z-10 w-full h-full flex items-center justify-center transition-transform ${
                      isDragging
                        ? "duration-0 cursor-grabbing"
                        : "duration-200 ease-out cursor-zoom-in"
                    }`}
                    style={{
                      transform: is360Mode
                        ? `rotateY(${rotationAngle}deg) scale(1.03)`
                        : `rotateX(${tilt.rotateX}deg) rotateY(${tilt.rotateY}deg) scale(1.02)`,
                      transformStyle: "preserve-3d",
                    }}
                  >
                    <img
                      key={current?._id || current?.id || active}
                      src={getImageUrl(displayedImage)}
                      alt={current?.title}
                      draggable={false}
                      onError={handleImgError}
                      className="w-full h-full object-contain rounded-2xl drop-shadow-[0_18px_25px_rgba(0,0,0,0.16)] animate-hero-fade"
                    />
                  </div>

                  {/* Navigation Arrows (Hidden during active 360 drag) */}
                  {!is360Mode && (
                    <>
                      <button
                        onClick={goPrev}
                        aria-label="Previous"
                        className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center shadow-lg backdrop-blur-md z-20 transition-all hover:scale-110 active:scale-95 cursor-pointer"
                        style={{
                          background: "rgba(255,255,255,0.92)",
                          border: `1px solid ${COLOR.BORDER}`,
                          color: COLOR.INK,
                        }}
                      >
                        <ChevronLeft size={20} />
                      </button>

                      <button
                        onClick={goNext}
                        aria-label="Next"
                        className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center shadow-lg backdrop-blur-md z-20 transition-all hover:scale-110 active:scale-95 cursor-pointer"
                        style={{
                          background: "rgba(255,255,255,0.92)",
                          border: `1px solid ${COLOR.BORDER}`,
                          color: COLOR.INK,
                        }}
                      >
                        <ChevronRight size={20} />
                      </button>
                    </>
                  )}

                  {/* Bottom Hint / Auto-Spin Pill */}
                  <div
                    className="absolute bottom-3 inset-x-4 z-20 flex items-center justify-between px-3.5 py-1.5 rounded-xl backdrop-blur-md text-[11px] font-medium shadow-sm"
                    style={{
                      background: "rgba(23, 48, 62, 0.88)",
                      color: "#FFFFFF",
                    }}
                  >
                    <span>
                      {is360Mode
                        ? "↔ Drag left/right to rotate 360°"
                        : "Click image for Full-Screen 360° View"}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setIs360Mode(true);
                        setAutoSpin(!autoSpin);
                      }}
                      className="flex items-center gap-1 px-2.5 py-0.5 rounded-md font-bold text-slate-950 cursor-pointer"
                      style={{ background: COLOR.AMBER }}
                    >
                      {autoSpin ? <Pause size={11} /> : <Play size={11} />}
                      {autoSpin ? "Pause" : "Auto 360°"}
                    </button>
                  </div>
                </div>

                {/* Mobile dots */}
                <div className="flex justify-center gap-2 mt-5 lg:hidden">
                  {slideData.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActive(idx)}
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        active === idx ? "w-6" : "w-1.5 bg-gray-300"
                      }`}
                      style={active === idx ? { background: COLOR.AMBER } : {}}
                    />
                  ))}
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

      {/* ========== FULL-SCREEN 360° STUDIO MODAL (ON IMAGE CLICK) ========== */}
      {fullViewOpen && (
        <div
          className="fixed inset-0 z-[9999] bg-black/95 backdrop-blur-xl flex flex-col items-center justify-center p-4 select-none"
          onMouseDown={(e) => handleDragStart(e.clientX)}
          onMouseMove={(e) => handleDragMove(e.clientX)}
          onMouseUp={handleDragEnd}
          onTouchStart={(e) => handleDragStart(e.touches[0].clientX)}
          onTouchMove={(e) => handleDragMove(e.touches[0].clientX)}
          onTouchEnd={handleDragEnd}
        >
          {/* Modal Top Bar */}
          <div className="absolute top-5 inset-x-5 sm:inset-x-8 flex items-center justify-between text-white z-20">
            <div className="flex items-center gap-3">
              <Rotate3d style={{ color: COLOR.AMBER }} size={24} />
              <div>
                <h4 className="font-bold text-sm sm:text-base">{current?.title}</h4>
                <p className="text-xs text-slate-400">
                  Drag left or right to rotate 360° • Zoom & inspect details
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setZoom((z) => Math.max(0.75, z - 0.25))}
                className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 transition cursor-pointer"
                title="Zoom Out"
              >
                <ZoomOut size={18} />
              </button>
              <button
                onClick={() => setZoom((z) => Math.min(2.25, z + 0.25))}
                className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 transition cursor-pointer"
                title="Zoom In"
              >
                <ZoomIn size={18} />
              </button>
              <button
                onClick={() => setAutoSpin(!autoSpin)}
                className="px-3.5 py-2 rounded-xl font-bold text-xs text-slate-950 flex items-center gap-1.5 cursor-pointer"
                style={{ background: COLOR.AMBER }}
              >
                {autoSpin ? <Pause size={15} /> : <Play size={15} />}
                {autoSpin ? "Pause" : "360° Spin"}
              </button>
              <button
                onClick={() => {
                  setFullViewOpen(false);
                  setAutoSpin(false);
                }}
                className="p-2.5 rounded-xl bg-red-500/85 hover:bg-red-500 text-white transition cursor-pointer"
                title="Close"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* 360 Rotating Center Image */}
          <div className="w-full max-w-4xl h-[70vh] flex items-center justify-center">
            <img
              src={getImageUrl(displayedImage)}
              alt={current?.title}
              draggable={false}
              onError={handleImgError}
              className="max-h-full max-w-full object-contain transition-transform duration-150 cursor-grab active:cursor-grabbing rounded-2xl"
              style={{
                transform: `scale(${zoom}) rotateY(${rotationAngle}deg)`,
              }}
            />
          </div>

          {/* Bottom Controls */}
          <div className="flex items-center gap-4 text-white text-xs bg-white/10 px-5 py-2.5 rounded-full">
            <span>Rotation: {Math.round(rotationAngle)}°</span>
            <span>•</span>
            <span>Zoom: {Math.round(zoom * 100)}%</span>
          </div>
        </div>
      )}

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

        @keyframes heroFade {
          0% {
            opacity: 0;
            transform: scale(0.94) translateY(10px);
          }
          100% {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        .animate-hero-fade {
          animation: heroFade 0.55s cubic-bezier(0.22, 1, 0.36, 1);
        }
      `}</style>
    </div>
  );
};

export default Home;
