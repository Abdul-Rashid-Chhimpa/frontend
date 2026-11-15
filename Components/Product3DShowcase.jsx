import React, { useState, useRef, useEffect } from "react";
import {
  Rotate3d,
  Maximize2,
  X,
  ZoomIn,
  ZoomOut,
  Play,
  Pause,
  ShieldCheck,
  Award,
  Wrench,
  Factory,
  ShoppingCart,
  Zap,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const AMBER = "#F0A420";
const STEEL = "#2B4A5E";

const Product3DShowcase = ({ product, onAddToCart, onBuyNow }) => {
  // Fallback demo data if testing standalone
  const item = product || {
    name: "Pedwal Pro-Torque Heavy Duty Wrench Set",
    tagline: "Forged Chrome-Vanadium Steel • Anti-Slip Grip",
    description:
      "Engineered for extreme industrial torque and precision workshop tasks. Heat-treated alloy body with mirror-chrome corrosion resistance.",
    price: 2499,
    discountPrice: 1899,
    material: "CR-V Forged Alloy Steel",
    warranty: "Lifetime Manufacturing Warranty",
    images: [
      "https://images.unsplash.com/photo-1581235720704-06d3acfcb36f?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1530124566582-a618bc2615dc?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=900&q=80",
    ],
    frames360: [], // Admin can upload 8-24 angles here
    specs: [
      { label: "Hardness Rating", value: "58–62 HRC" },
      { label: "Finish", value: "Satin Mirror Chrome" },
      { label: "Standard", value: "DIN 3113 / ISO 9001" },
      { label: "Weight", value: "1.45 kg" },
    ],
  };

  const allFrames =
    item.frames360 && item.frames360.length > 0 ? item.frames360 : item.images;

  const [selectedIdx, setSelectedIdx] = useState(0);
  const [tilt, setTilt] = useState({ rotateX: 0, rotateY: 0 });
  const [is360Mode, setIs360Mode] = useState(false);
  const [rotationAngle, setRotationAngle] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [autoSpin, setAutoSpin] = useState(false);
  const [fullScreenOpen, setFullScreenOpen] = useState(false);
  const [zoom, setZoom] = useState(1);

  const cardRef = useRef(null);

  // Auto-rotate 360 effect
  useEffect(() => {
    if (!autoSpin) return;
    const interval = setInterval(() => {
      setRotationAngle((prev) => (prev + 4) % 360);
      if (allFrames.length > 1) {
        setSelectedIdx((prev) => (prev + 1) % allFrames.length);
      }
    }, 80);
    return () => clearInterval(interval);
  }, [autoSpin, allFrames.length]);

  // 3D Mouse Tilt Handler
  const handleMouseMove = (e) => {
    if (is360Mode || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({
      rotateX: -y * 22,
      rotateY: x * 22,
    });
  };

  const handleMouseLeave = () => {
    setTilt({ rotateX: 0, rotateY: 0 });
    setIsDragging(false);
  };

  // 360 Drag Rotation Handlers
  const handleDragStart = (clientX) => {
    setIsDragging(true);
    setAutoSpin(false);
    setStartX(clientX);
  };

  const handleDragMove = (clientX) => {
    if (!isDragging) return;
    const delta = clientX - startX;
    setStartX(clientX);

    const newAngle = (rotationAngle + delta * 0.8 + 360) % 360;
    setRotationAngle(newAngle);

    if (allFrames.length > 1 && Math.abs(delta) > 6) {
      const step = delta > 0 ? 1 : -1;
      setSelectedIdx(
        (prev) => (prev + step + allFrames.length) % allFrames.length
      );
    }
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 overflow-x-hidden">
      {/* ================= HERO PRODUCT 3D & 360 SECTION ================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* LEFT: 3D & 360 Interactive Stage */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            <div
              ref={cardRef}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              onMouseDown={(e) => is360Mode && handleDragStart(e.clientX)}
              onMouseMoveCapture={(e) => is360Mode && handleDragMove(e.clientX)}
              onMouseUp={handleDragEnd}
              onTouchStart={(e) =>
                is360Mode && handleDragStart(e.touches[0].clientX)
              }
              onTouchMove={(e) =>
                is360Mode && handleDragMove(e.touches[0].clientX)
              }
              onTouchEnd={handleDragEnd}
              className="relative h-[420px] sm:h-[500px] rounded-3xl bg-gradient-to-br from-slate-900 via-[#1e3544] to-slate-900 shadow-2xl overflow-hidden flex items-center justify-center select-none border border-slate-700/60 group"
              style={{ perspective: "1200px" }}
            >
              {/* Animated Radial Glow */}
              <div
                className="absolute w-80 h-80 rounded-full blur-3xl opacity-30 pointer-events-none transition-transform duration-500 group-hover:scale-125"
                style={{ background: AMBER }}
              />

              {/* Top Badges */}
              <div className="absolute top-4 left-4 z-20 flex items-center gap-2">
                <span
                  className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-slate-950 shadow"
                  style={{ background: AMBER }}
                >
                  {is360Mode ? "360° Interactive Spin" : "3D Hover View"}
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-white/10 text-white backdrop-blur-md border border-white/15">
                  {Math.round(rotationAngle)}°
                </span>
              </div>

              {/* Action Controls Top-Right */}
              <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
                <button
                  onClick={() => {
                    setIs360Mode(!is360Mode);
                    setTilt({ rotateX: 0, rotateY: 0 });
                  }}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer shadow-lg ${
                    is360Mode
                      ? "bg-amber-400 text-slate-950"
                      : "bg-white/15 text-white hover:bg-white/25 backdrop-blur-md"
                  }`}
                >
                  <Rotate3d size={16} />
                  {is360Mode ? "Exit 360°" : "360° View"}
                </button>

                <button
                  onClick={() => {
                    setFullScreenOpen(true);
                    setZoom(1);
                  }}
                  title="Full Screen 360° View"
                  className="p-2.5 rounded-xl bg-white/15 hover:bg-white/25 text-white backdrop-blur-md transition cursor-pointer"
                >
                  <Maximize2 size={16} />
                </button>
              </div>

              {/* 3D Transforming Product Image */}
              <div
                onClick={() => !is360Mode && setFullScreenOpen(true)}
                className={`relative z-10 w-[78%] h-[78%] flex items-center justify-center transition-transform ${
                  isDragging ? "duration-0 cursor-grabbing" : "duration-200 ease-out cursor-zoom-in"
                }`}
                style={{
                  transform: is360Mode
                    ? `rotateY(${rotationAngle}deg) scale(1.04)`
                    : `rotateX(${tilt.rotateX}deg) rotateY(${tilt.rotateY}deg) scale(1.03)`,
                  transformStyle: "preserve-3d",
                }}
              >
                <img
                  src={allFrames[selectedIdx]}
                  alt={item.name}
                  draggable={false}
                  className="max-h-full max-w-full object-contain rounded-2xl drop-shadow-[0_25px_35px_rgba(0,0,0,0.65)]"
                />
              </div>

              {/* Bottom 360° Instruction / Auto-Spin Bar */}
              <div className="absolute bottom-4 inset-x-4 z-20 flex items-center justify-between bg-black/45 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/10 text-white text-xs">
                <span className="text-slate-300">
                  {is360Mode
                    ? "↔ Drag left or right to rotate 360°"
                    : "✨ Move cursor for 3D tilt • Click image for Full 360°"}
                </span>

                <button
                  onClick={() => {
                    setIs360Mode(true);
                    setAutoSpin(!autoSpin);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/15 hover:bg-white/25 font-semibold transition cursor-pointer"
                >
                  {autoSpin ? <Pause size={14} /> : <Play size={14} />}
                  {autoSpin ? "Pause" : "Auto Spin"}
                </button>
              </div>
            </div>

            {/* Thumbnail Strip */}
            <div className="flex items-center gap-3 overflow-x-auto pb-1">
              {allFrames.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setSelectedIdx(idx);
                    setAutoSpin(false);
                  }}
                  className={`relative w-20 h-20 rounded-2xl overflow-hidden border-2 shrink-0 transition-all cursor-pointer ${
                    selectedIdx === idx
                      ? "border-amber-500 scale-105 shadow-md"
                      : "border-transparent opacity-70 hover:opacity-100"
                  }`}
                >
                  <img
                    src={img}
                    alt={`Angle ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* RIGHT: Product Details & Purchase Box */}
          <div className="lg:col-span-5 space-y-6">
            <div>
              <span
                className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-3"
                style={{ background: "#FEF3C7", color: "#B45309" }}
              >
                {item.tagline}
              </span>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 leading-tight">
                {item.name}
              </h1>
            </div>

            {/* Price Block */}
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-black text-slate-900">
                ₹{item.discountPrice || item.price}
              </span>
              {item.discountPrice && (
                <>
                  <span className="text-lg text-slate-400 line-through">
                    ₹{item.price}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-lg text-xs font-bold bg-emerald-100 text-emerald-700">
                    SAVE ₹{item.price - item.discountPrice}
                  </span>
                </>
              )}
            </div>

            <p className="text-slate-600 leading-relaxed text-sm sm:text-base">
              {item.description}
            </p>

            {/* Technical Specs Grid */}
            <div className="grid grid-cols-2 gap-3">
              {item.specs?.map((spec, i) => (
                <div
                  key={i}
                  className="p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-sm"
                >
                  <p className="text-xs text-slate-400 font-medium">
                    {spec.label}
                  </p>
                  <p className="text-sm font-bold text-slate-800 mt-0.5">
                    {spec.value}
                  </p>
                </div>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={() => onAddToCart && onAddToCart(item)}
                className="flex-1 py-3.5 px-6 rounded-2xl font-bold text-white flex items-center justify-center gap-2 shadow-lg hover:opacity-95 active:scale-98 transition cursor-pointer"
                style={{ background: STEEL }}
              >
                <ShoppingCart size={18} />
                Add to Cart
              </button>
              <button
                onClick={() => onBuyNow && onBuyNow(item)}
                className="flex-1 py-3.5 px-6 rounded-2xl font-bold text-slate-950 flex items-center justify-center gap-2 shadow-lg hover:brightness-105 active:scale-98 transition cursor-pointer"
                style={{ background: AMBER }}
              >
                <Zap size={18} />
                Buy Now
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ================= ANIMATED COMPANY OVERVIEW SECTION ================= */}
      <section className="bg-slate-900 text-white py-16 mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Company Story & Animated Visual */}
            <div className="lg:col-span-6 space-y-5">
              <span
                className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest text-slate-950"
                style={{ background: AMBER }}
              >
                About Pedwal Tools
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold leading-tight">
                Precision Forged for Professionals & Builders
              </h2>
              <p className="text-slate-300 leading-relaxed text-sm sm:text-base">
                Pedwal Hand Tools combines high-grade metallurgy with ergonomic
                engineering. Every wrench, plier, and socket undergoes multi-stage
                heat treatment and torque testing to withstand India’s toughest
                industrial and workshop conditions.
              </p>

              {/* Animated Metrics */}
              <div className="grid grid-cols-3 gap-4 pt-3">
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-amber-400/50 transition">
                  <p className="text-2xl sm:text-3xl font-black text-amber-400">
                    100%
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    Drop-Forged Alloy
                  </p>
                </div>
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-amber-400/50 transition">
                  <p className="text-2xl sm:text-3xl font-black text-amber-400">
                    50K+
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    Tools Delivered
                  </p>
                </div>
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-amber-400/50 transition">
                  <p className="text-2xl sm:text-3xl font-black text-amber-400">
                    ISO
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    Certified Quality
                  </p>
                </div>
              </div>
            </div>

            {/* Company Feature Cards */}
            <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                {
                  icon: <Factory size={22} />,
                  title: "In-House Forging",
                  desc: "Precision CNC machining and drop-forged steel for zero-slip grip.",
                },
                {
                  icon: <ShieldCheck size={22} />,
                  title: "Rust-Proof Coating",
                  desc: "Triple-layer nickel-chrome plating protects against humidity and oil.",
                },
                {
                  icon: <Wrench size={22} />,
                  title: "High-Torque Tested",
                  desc: "Batch-tested above 1.5x international DIN torque standards.",
                },
                {
                  icon: <Award size={22} />,
                  title: "Direct Warranty",
                  desc: "Hassle-free replacement support across India for every tool.",
                },
              ].map((feat, idx) => (
                <div
                  key={idx}
                  className="p-6 rounded-3xl bg-white/5 border border-white/10 hover:-translate-y-1.5 hover:bg-white/10 transition-all duration-300"
                >
                  <div
                    className="w-11 h-11 rounded-2xl flex items-center justify-center text-slate-950 mb-4 shadow-lg"
                    style={{ background: AMBER }}
                  >
                    {feat.icon}
                  </div>
                  <h3 className="font-bold text-lg text-white mb-1">
                    {feat.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    {feat.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ================= FULL-SCREEN 360° MODAL ================= */}
      {fullScreenOpen && (
        <div
          className="fixed inset-0 z-[9999] bg-black/95 backdrop-blur-xl flex flex-col items-center justify-center p-4 select-none"
          onMouseDown={(e) => handleDragStart(e.clientX)}
          onMouseMove={(e) => handleDragMove(e.clientX)}
          onMouseUp={handleDragEnd}
          onTouchStart={(e) => handleDragStart(e.touches[0].clientX)}
          onTouchMove={(e) => handleDragMove(e.touches[0].clientX)}
          onTouchEnd={handleDragEnd}
        >
          {/* Top Modal Bar */}
          <div className="absolute top-5 inset-x-6 flex items-center justify-between text-white z-20">
            <div className="flex items-center gap-3">
              <Rotate3d className="text-amber-400" size={24} />
              <div>
                <h4 className="font-bold text-sm sm:text-base">{item.name}</h4>
                <p className="text-xs text-slate-400">
                  Drag horizontally for 360° rotation • Use controls to zoom
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setZoom((z) => Math.max(0.7, z - 0.25))}
                className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 transition cursor-pointer"
              >
                <ZoomOut size={18} />
              </button>
              <button
                onClick={() => setZoom((z) => Math.min(2.2, z + 0.25))}
                className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 transition cursor-pointer"
              >
                <ZoomIn size={18} />
              </button>
              <button
                onClick={() => setAutoSpin(!autoSpin)}
                className="px-3.5 py-2 rounded-xl bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
              >
                {autoSpin ? <Pause size={15} /> : <Play size={15} />}
                {autoSpin ? "Stop Spin" : "360° Auto"}
              </button>
              <button
                onClick={() => {
                  setFullScreenOpen(false);
                  setAutoSpin(false);
                }}
                className="p-2.5 rounded-xl bg-red-500/80 hover:bg-red-500 text-white transition cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Center 360 Rotating Stage */}
          <div className="relative w-full max-w-4xl h-[70vh] flex items-center justify-center">
            <img
              src={allFrames[selectedIdx]}
              alt="360 Full View"
              draggable={false}
              className="max-h-full max-w-full object-contain transition-transform duration-150 cursor-grab active:cursor-grabbing"
              style={{
                transform: `scale(${zoom}) rotateY(${rotationAngle}deg)`,
              }}
            />
          </div>

          {/* Bottom Frame Slider */}
          <div className="flex items-center gap-4 text-white text-xs bg-white/10 px-5 py-2.5 rounded-full">
            <button
              onClick={() =>
                setSelectedIdx(
                  (prev) => (prev - 1 + allFrames.length) % allFrames.length
                )
              }
              className="hover:text-amber-400 cursor-pointer"
            >
              <ChevronLeft size={18} />
            </button>
            <span>
              Angle {selectedIdx + 1} / {allFrames.length} ({Math.round(rotationAngle)}°)
            </span>
            <button
              onClick={() =>
                setSelectedIdx((prev) => (prev + 1) % allFrames.length)
              }
              className="hover:text-amber-400 cursor-pointer"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Product3DShowcase;
