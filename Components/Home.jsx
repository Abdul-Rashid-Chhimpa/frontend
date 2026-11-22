import React, { useEffect, useState } from "react";
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
  Building2,
  CheckCircle2,
  X,
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

const companyHighlights = [
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
  const [companyModalOpen, setCompanyModalOpen] = useState(false);

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
    }, 4800);
    return () => clearInterval(timer);
  }, [slideData.length, paused]);

  useEffect(() => {
    if (!companyModalOpen) return;
    const onKeyDown = (e) => {
      if (e.key === "Escape") {
        setCompanyModalOpen(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [companyModalOpen]);

  const goPrev = () => {
    setActive((prev) => (prev - 1 + slideData.length) % slideData.length);
  };

  const goNext = () => {
    setActive((prev) => (prev + 1) % slideData.length);
  };

  const current = slideData[active] || slideData[0];

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

  return (
    <div className="min-h-screen bg-[#FAFAFC] text-[#15181C] font-sans overflow-x-hidden">
      {/* ========== FIRST TIME USER GUIDE ========== */}
      <OnboardingGuide />

      {/* ========== FIXED NAVBAR ========== */}
      <header className="fixed top-0 inset-x-0 z-50 bg-white/95 backdrop-blur-md border-b border-[#E6E8EB] shadow-sm">
        <Nav />
      </header>

      {/* ========== SCROLLABLE CONTENT BELOW FIXED NAVBAR ========== */}
      <div className="pt-16 sm:pt-20">
        <RandomImg />

        {/* ========== RUNNING MARQUEE ========== */}
        <div
          className="w-full overflow-hidden py-3.5 sm:py-4 border-y shadow-inner relative z-10"
          style={{
            background: COLOR.STEEL_DARK,
            borderColor: "rgba(255,255,255,0.1)",
          }}
        >
          <div className="flex w-max animate-ticker">
            {[1, 2].map((groupKey) => (
              <div
                key={groupKey}
                className="flex items-center whitespace-nowrap gap-6 sm:gap-10 px-4"
              >
                <span className="flex items-center gap-3 text-sm sm:text-base md:text-lg font-bold uppercase tracking-wider text-white">
                  <Sparkles size={18} style={{ color: COLOR.AMBER }} />
                  Welcome to{" "}
                  <span style={{ color: COLOR.AMBER }}>Pedwal Life Creation</span>
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

        {/* ========== HERO SHOWCASE ========== */}
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
                  <span
                    className="w-2 h-2 rounded-full animate-pulse"
                    style={{ background: COLOR.AMBER }}
                  />
                  <span
                    className="text-xs font-semibold tracking-wide"
                    style={{ color: COLOR.STEEL }}
                  >
                    {current?.tagline || "Premium Series"}
                  </span>
                </div>

                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-[1.15] mb-4">
                  {current?.title || "Featured Tool"}
                </h1>

                <p
                  className="text-sm sm:text-base max-w-md mb-6"
                  style={{ color: COLOR.MUTED }}
                >
                  {current?.specs ||
                    "High quality industrial tools built for professionals"}
                </p>

                {/* Feature pills */}
                <div className="flex flex-wrap gap-2.5 mb-8">
                  <div
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border text-xs font-medium"
                    style={{ borderColor: COLOR.BORDER, color: COLOR.STEEL }}
                  >
                    <Wrench size={13} />
                    Drop Forged
                  </div>
                  <div
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border text-xs font-medium"
                    style={{ borderColor: COLOR.BORDER, color: COLOR.STEEL }}
                  >
                    <Zap size={13} />
                    Hardened Edge
                  </div>
                  <div
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border text-xs font-medium"
                    style={{ borderColor: COLOR.BORDER, color: COLOR.STEEL }}
                  >
                    <ShieldCheck size={13} />
                    Quality Assured
                  </div>
                </div>

                {/* ACTION BUTTONS (Buy Now + Explore Product + Company Details Popup) */}
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    onClick={handleBuyNow}
                    className="group px-7 py-3.5 rounded-2xl font-bold text-sm text-white shadow-lg flex items-center gap-2.5 transition-all duration-300 hover:-translate-y-1 active:scale-[0.98] cursor-pointer"
                    style={{
                      background: `linear-gradient(135deg, ${COLOR.AMBER} 0%, ${COLOR.AMBER_DARK} 100%)`,
                    }}
                  >
                    <ShoppingBag
                      size={18}
                      className="group-hover:scale-110 transition-transform"
                    />
                    <span>Buy Now</span>
                    <ArrowRight
                      size={16}
                      className="group-hover:translate-x-1 transition-transform"
                    />
                  </button>

                  <button
                    onClick={() => navigate("/product-3d-showcase")}
                    className="px-5 py-3.5 rounded-2xl font-bold text-sm border bg-white flex items-center gap-2 transition-all duration-300 hover:-translate-y-1 shadow-sm cursor-pointer"
                    style={{ borderColor: COLOR.BORDER, color: COLOR.STEEL }}
                  >
                    <Rotate3d size={17} style={{ color: COLOR.AMBER }} />
                    <span>Explore Product</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setCompanyModalOpen(true)}
                    className="px-5 py-3.5 rounded-2xl font-bold text-sm border bg-white flex items-center gap-2 transition-all duration-300 hover:-translate-y-1 shadow-sm cursor-pointer"
                    style={{ borderColor: COLOR.BORDER, color: COLOR.STEEL }}
                  >
                    <Building2 size={17} style={{ color: COLOR.STEEL }} />
                    <span>Company Details</span>
                  </button>
                </div>

                {/* Thumbnail strip */}
                <div
                  className="mt-10 pt-6 border-t flex flex-wrap items-center gap-2.5"
                  style={{ borderColor: COLOR.BORDER }}
                >
                  {slideData.map((item, idx) => (
                    <button
                      key={item._id || item.id || idx}
                      onClick={() => setActive(idx)}
                      aria-label={`Show slide ${idx + 1}`}
                      className={`relative rounded-xl overflow-hidden transition-all duration-300 border-2 shrink-0 bg-white ${
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

              {/* ===== RIGHT PRODUCT DISPLAY ===== */}
              <div className="lg:col-span-7 order-1 lg:order-2 flex justify-center">
                <div
                  onMouseEnter={() => setPaused(true)}
                  onMouseLeave={() => setPaused(false)}
                  className="relative w-full max-w-[360px] sm:max-w-[420px] md:max-w-[480px]"
                >
                  <div
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[85%] h-[85%] rounded-full blur-[60px] opacity-40 pointer-events-none"
                    style={{ background: "rgba(240, 164, 32, 0.35)" }}
                  />

                  <div
                    className="relative aspect-[4/3.3] rounded-[2rem] bg-white border shadow-2xl overflow-hidden flex items-center justify-center p-5 sm:p-7"
                    style={{ borderColor: COLOR.BORDER }}
                  >
                    <div
                      className="absolute inset-0 pointer-events-none"
                      style={{
                        background:
                          "radial-gradient(circle at 45% 35%, rgba(240,164,32,0.12), transparent 65%)",
                      }}
                    />

                    <img
                      key={current?._id || current?.id || active}
                      src={getImageUrl(current?.image)}
                      alt={current?.title}
                      onError={handleImgError}
                      className="relative z-10 w-full h-full object-contain rounded-2xl animate-hero-fade"
                    />

                    <button
                      onClick={goPrev}
                      aria-label="Previous"
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center shadow-lg backdrop-blur-md z-20 transition-all hover:scale-110 active:scale-95"
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
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center shadow-lg backdrop-blur-md z-20 transition-all hover:scale-110 active:scale-95"
                      style={{
                        background: "rgba(255,255,255,0.92)",
                        border: `1px solid ${COLOR.BORDER}`,
                        color: COLOR.INK,
                      }}
                    >
                      <ChevronRight size={20} />
                    </button>
                  </div>

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
                {
                  icon: Wrench,
                  title: "Drop Forged Steel",
                  note: "Maximum strength structure",
                },
                {
                  icon: Zap,
                  title: "Induction Hardened",
                  note: "Precision cutting edges",
                },
                {
                  icon: Award,
                  title: "Ergonomic Grip",
                  note: "Slip-resistant comfort",
                },
                {
                  icon: ShieldCheck,
                  title: "Quality Guaranteed",
                  note: "Built for long life",
                },
              ].map(({ icon: Icon, title, note }) => (
                <div
                  key={title}
                  className="flex flex-col md:flex-row items-center gap-3"
                >
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
        <main
          id="products-section"
          className="scroll-mt-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10"
        >
          <ProductCard />
        </main>

        <Footer />
      </div>

      {/* ========== COMPANY DETAILS POPUP MODAL ========== */}
      {companyModalOpen && (
        <div
          className="fixed inset-0 z-[9999] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setCompanyModalOpen(false)}
        >
          <div
            className="relative w-full max-w-2xl rounded-3xl bg-white text-[#15181C] border border-[#E6E8EB] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div
              className="px-6 py-5 text-white flex items-center justify-between"
              style={{ background: COLOR.STEEL_DARK }}
            >
              <div className="flex items-center gap-2.5">
                <span
                  className="p-2 rounded-xl text-slate-950"
                  style={{ background: COLOR.AMBER }}
                >
                  <Building2 size={18} />
                </span>
                <div>
                  <h3 className="text-lg font-extrabold leading-tight">
                    Pedwal Life Creation
                  </h3>
                  <p className="text-xs text-slate-300">
                    Company Overview & Manufacturing Standards
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setCompanyModalOpen(false)}
                aria-label="Close Company Details"
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-5">
              <p className="text-sm text-[#6B7280] leading-relaxed">
                From precision drop-forged pliers to high-torque industrial
                wrenches, Pedwal Life Creation delivers certified hand tools
                designed for workshops, technicians, and builders across India.
              </p>

              <div className="grid grid-cols-3 gap-3">
                <div className="p-3.5 rounded-2xl bg-[#F8FAFC] border border-[#E6E8EB] text-center">
                  <p
                    className="text-xl sm:text-2xl font-black"
                    style={{ color: COLOR.AMBER_DARK }}
                  >
                    100%
                  </p>
                  <p className="text-xs text-[#6B7280] mt-0.5">
                    Drop Forged Steel
                  </p>
                </div>
                <div className="p-3.5 rounded-2xl bg-[#F8FAFC] border border-[#E6E8EB] text-center">
                  <p
                    className="text-xl sm:text-2xl font-black"
                    style={{ color: COLOR.AMBER_DARK }}
                  >
                    DIN
                  </p>
                  <p className="text-xs text-[#6B7280] mt-0.5">
                    Torque Certified
                  </p>
                </div>
                <div className="p-3.5 rounded-2xl bg-[#F8FAFC] border border-[#E6E8EB] text-center">
                  <p
                    className="text-xl sm:text-2xl font-black"
                    style={{ color: COLOR.AMBER_DARK }}
                  >
                    PAN
                  </p>
                  <p className="text-xs text-[#6B7280] mt-0.5">
                    India Dispatch
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {companyHighlights.map((box, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl bg-[#F8FAFC] border border-[#E6E8EB]"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <CheckCircle2
                        size={16}
                        style={{ color: COLOR.AMBER_DARK }}
                      />
                      <h4 className="font-bold text-sm text-[#15181C]">
                        {box.title}
                      </h4>
                    </div>
                    <p className="text-xs text-[#6B7280] leading-relaxed">
                      {box.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-[#F8FAFC] border-t border-[#E6E8EB] flex justify-end">
              <button
                type="button"
                onClick={() => setCompanyModalOpen(false)}
                className="px-5 py-2.5 rounded-xl font-bold text-sm text-white transition cursor-pointer"
                style={{ background: COLOR.STEEL }}
              >
                Close
              </button>
            </div>
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
          0% { opacity: 0; transform: scale(0.94) translateY(10px); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }
        .animate-hero-fade {
          animation: heroFade 0.55s cubic-bezier(0.22, 1, 0.36, 1);
        }
      `}</style>
    </div>
  );
};

export default Home;
