import React, { useEffect, useRef, useState } from "react";
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
  Building2,
  CheckCircle2,
  X,
  Home as HomeIcon,
  Search,
  ShoppingCart,
  ClipboardList,
  UserRound,
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

const getCartCountFromStorage = () => {
  try {
    const directCount = localStorage.getItem("cartCount");
    if (directCount !== null && !Number.isNaN(Number(directCount))) {
      return Math.max(0, Number(directCount));
    }

    const rawCart =
      localStorage.getItem("cart") ||
      localStorage.getItem("cartItems") ||
      "[]";
    const parsed = JSON.parse(rawCart);

    if (Array.isArray(parsed)) {
      return parsed.reduce((sum, item) => {
        const qty = Number(item?.quantity ?? item?.qty ?? 1);
        return sum + (Number.isNaN(qty) ? 1 : Math.max(1, qty));
      }, 0);
    }

    if (parsed && Array.isArray(parsed.items)) {
      return parsed.items.reduce((sum, item) => {
        const qty = Number(item?.quantity ?? item?.qty ?? 1);
        return sum + (Number.isNaN(qty) ? 1 : Math.max(1, qty));
      }, 0);
    }
  } catch {
    return 0;
  }
  return 0;
};

const getLatestCartImageFromStorage = () => {
  try {
    const lastImg = localStorage.getItem("lastAddedCartImage");
    if (lastImg) return lastImg;

    const rawCart =
      localStorage.getItem("cart") ||
      localStorage.getItem("cartItems") ||
      "[]";
    const parsed = JSON.parse(rawCart);
    const items = Array.isArray(parsed)
      ? parsed
      : Array.isArray(parsed?.items)
      ? parsed.items
      : [];
    const lastItem = items[items.length - 1];
    return (
      lastItem?.image ||
      lastItem?.img ||
      lastItem?.thumbnail ||
      defaultSlideData[0].image
    );
  } catch {
    return defaultSlideData[0].image;
  }
};

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

const ScrollReveal = ({ children, className = "", delay = 0 }) => {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`transition-all duration-700 ease-out transform ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      } ${className}`}
    >
      {children}
    </div>
  );
};

const Home = () => {
  const navigate = useNavigate();
  const [slideData, setSlideData] = useState(defaultSlideData);
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [companyModalOpen, setCompanyModalOpen] = useState(false);
  const [cartCount, setCartCount] = useState(() => getCartCountFromStorage());
  const prevCartCountRef = useRef(cartCount);
  const [flippingProduct, setFlippingProduct] = useState(null);
  const [cartHit, setCartHit] = useState(false);

  useEffect(() => {
    const triggerFlipToCart = (customImage) => {
      const imgSrc = getImageUrl(customImage || getLatestCartImageFromStorage());
      const id = Date.now();
      setFlippingProduct({ id, image: imgSrc });
      setCartHit(true);

      setTimeout(() => {
        setCartHit(false);
      }, 650);

      setTimeout(() => {
        setFlippingProduct((curr) => (curr?.id === id ? null : curr));
      }, 820);
    };

    const syncCartCount = (event) => {
      const nextCount = getCartCountFromStorage();
      const eventImage = event?.detail?.image;
      if (nextCount > prevCartCountRef.current || event?.type === "productAddedToCart" || eventImage) {
        triggerFlipToCart(eventImage);
      }
      prevCartCountRef.current = nextCount;
      setCartCount(nextCount);
    };

    window.addEventListener("storage", syncCartCount);
    window.addEventListener("cartUpdated", syncCartCount);
    window.addEventListener("productAddedToCart", syncCartCount);

    return () => {
      window.removeEventListener("storage", syncCartCount);
      window.removeEventListener("cartUpdated", syncCartCount);
      window.removeEventListener("productAddedToCart", syncCartCount);
    };
  }, []);

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

  const handleExplore3DProduct = () => {
    if (current?.productId) {
      navigate(`/product-3d-showcase/${current.productId}`);
    } else {
      navigate("/product-3d-showcase");
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFC] text-[#15181C] font-sans overflow-x-hidden">
      {/* ========== FIRST TIME USER GUIDE ========== */}
      <OnboardingGuide />

      {/* ========== FIXED NAVBAR ========== */}
      <header className="fixed top-0 inset-x-0 z-50 bg-white/95 backdrop-blur-md border-b border-[#E6E8EB] shadow-sm hide-mobile-nav-cart">
        <Nav />
      </header>

      {/* ========== SCROLLABLE CONTENT BELOW FIXED NAVBAR ========== */}
      <div className="pt-16 sm:pt-20 pb-[72px] md:pb-0">
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

                {/* ACTION BUTTONS */}
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
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
                    type="button"
                    onClick={handleExplore3DProduct}
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
                      type="button"
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

              {/* ===== RIGHT PRODUCT DISPLAY (FULL WIDTH & HEIGHT, NO ARROWS) ===== */}
              <div className="lg:col-span-7 order-1 lg:order-2 flex justify-center">
                <div
                  onMouseEnter={() => setPaused(true)}
                  onMouseLeave={() => setPaused(false)}
                  className="relative w-full max-w-[380px] sm:max-w-[440px] md:max-w-[500px]"
                >
                  <div
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[85%] h-[85%] rounded-full blur-[60px] opacity-40 pointer-events-none"
                    style={{ background: "rgba(240, 164, 32, 0.35)" }}
                  />

                  <div
                    className="relative w-full aspect-[4/3.3] rounded-[2rem] bg-white border shadow-2xl overflow-hidden"
                    style={{ borderColor: COLOR.BORDER }}
                  >
                    <img
                      key={current?._id || current?.id || active}
                      src={getImageUrl(current?.image)}
                      alt={current?.title}
                      onError={handleImgError}
                      className="w-full h-full object-cover animate-hero-fade"
                    />
                  </div>

                  <div className="flex justify-center gap-2 mt-5 lg:hidden">
                    {slideData.map((_, idx) => (
                      <button
                        key={idx}
                        type="button"
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
        <ScrollReveal>
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
                ].map(({ icon: Icon, title, note }, idx) => (
                  <ScrollReveal key={title} delay={idx * 90}>
                    <div className="flex flex-col md:flex-row items-center gap-3">
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
                  </ScrollReveal>
                ))}
              </div>
            </div>
          </section>
        </ScrollReveal>

        {/* ========== PRODUCTS ========== */}
        <ScrollReveal delay={80}>
          <main
            id="products-section"
            className="scroll-mt-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10"
          >
            <ProductCard />
          </main>
        </ScrollReveal>

        <ScrollReveal delay={100}>
          <Footer />
        </ScrollReveal>
      </div>

      {/* ========== PRODUCT FLIP-TO-CART ANIMATION ========== */}
      {flippingProduct && (
        <div
          key={flippingProduct.id}
          aria-hidden="true"
          className="md:hidden fixed z-[110] pointer-events-none cart-product-flip"
        >
          <div className="w-14 h-14 rounded-2xl overflow-hidden bg-white border-2 border-[#F0A420] shadow-2xl">
            <img
              src={flippingProduct.image}
              alt=""
              onError={handleImgError}
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      )}

      {/* ========== MOBILE BOTTOM NAVIGATION ========== */}
      <nav
        aria-label="Mobile navigation"
        className="md:hidden fixed bottom-0 inset-x-0 z-[100] rounded-t-3xl mobile-nav-top-anim bg-white/95 backdrop-blur-xl shadow-[0_-8px_25px_rgba(15,23,42,0.08)]"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <div className="max-w-xl mx-auto h-[68px] px-2 grid grid-cols-5 items-center">
          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="flex flex-col items-center justify-center gap-1 h-full text-[#2B4A5E] active:scale-95 transition"
            aria-label="Home"
          >
            <HomeIcon size={20} strokeWidth={2.2} />
            <span className="text-[10px] font-semibold">Home</span>
          </button>

          <button
            type="button"
            onClick={() =>
              document
                .getElementById("products-section")
                ?.scrollIntoView({ behavior: "smooth" })
            }
            className="flex flex-col items-center justify-center gap-1 h-full text-[#6B7280] active:scale-95 transition"
            aria-label="Explore products"
          >
            <Search size={20} strokeWidth={2} />
            <span className="text-[10px] font-medium">Explore</span>
          </button>

          <button
            type="button"
            onClick={() => navigate("/cart")}
            className="flex flex-col items-center justify-center h-full active:scale-95 transition"
            aria-label={`Open shopping cart (${cartCount} items)`}
          >
            <span
              className={`-mt-3 w-[56px] h-[56px] rounded-full flex items-center justify-center relative cart-orbit-wrap ${
                cartHit ? "cart-button-hit" : ""
              }`}
            >
              <span className="cart-orbit-ring" aria-hidden="true" />
              <span className="w-[48px] h-[48px] rounded-full flex items-center justify-center bg-[#F0A420] text-[#15181C] relative z-10 shadow-md">
                <ShoppingCart size={21} strokeWidth={2.3} />
              </span>
              {cartCount > 0 && (
                <span
                  key={cartCount}
                  className="cart-count-pop absolute -top-1 -right-1 min-w-[20px] h-[20px] px-1 rounded-full bg-[#17303E] text-white text-[10px] font-extrabold flex items-center justify-center border-2 border-white shadow z-20"
                >
                  {cartCount > 99 ? "99+" : cartCount}
                </span>
              )}
            </span>
          </button>

          <button
            type="button"
            onClick={() => navigate("/orders")}
            className="flex flex-col items-center justify-center gap-1 h-full text-[#6B7280] active:scale-95 transition"
            aria-label="My orders"
          >
            <ClipboardList size={20} strokeWidth={2} />
            <span className="text-[10px] font-medium">Orders</span>
          </button>

          <button
            type="button"
            onClick={() => navigate("/profile")}
            className="flex flex-col items-center justify-center gap-1 h-full text-[#6B7280] active:scale-95 transition"
            aria-label="Profile"
          >
            <UserRound size={20} strokeWidth={2} />
            <span className="text-[10px] font-medium">Profile</span>
          </button>
        </div>
      </nav>

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
          0% { opacity: 0; transform: scale(0.96); }
          100% { opacity: 1; transform: scale(1); }
        }
        .animate-hero-fade {
          animation: heroFade 0.45s cubic-bezier(0.22, 1, 0.36, 1);
        }

        @keyframes topBorderPulse {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .mobile-nav-top-anim {
          border-top: 2px solid transparent;
          background-image:
            linear-gradient(rgba(255, 255, 255, 0.96), rgba(255, 255, 255, 0.96)),
            linear-gradient(90deg, #F0A420, #3B82F6, #10B981, #F0A420);
          background-origin: padding-box, border-box;
          background-clip: padding-box, border-box;
          background-size: 100% 100%, 240% 100%;
          animation: topBorderPulse 3.2s linear infinite;
        }

        @keyframes cartOrbitSpin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .cart-orbit-wrap {
          background: #FFFFFF;
        }
        .cart-orbit-ring {
          position: absolute;
          inset: -2px;
          border-radius: 9999px;
          padding: 2.5px;
          background: conic-gradient(
            from 0deg,
            transparent 0deg,
            transparent 210deg,
            rgba(59, 130, 246, 0.35) 250deg,
            #3B82F6 295deg,
            #F0A420 335deg,
            transparent 360deg
          );
          -webkit-mask:
            linear-gradient(#fff 0 0) content-box,
            linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          animation: cartOrbitSpin 2.2s linear infinite;
          pointer-events: none;
        }

        @keyframes cartButtonHit {
          0% { transform: translateY(-12px) scale(1); }
          40% { transform: translateY(-16px) scale(1.12); }
          100% { transform: translateY(-12px) scale(1); }
        }
        .cart-button-hit {
          animation: cartButtonHit 0.55s cubic-bezier(0.22, 1, 0.36, 1);
        }

        @keyframes productFlipToCart {
          0% {
            left: 50%;
            top: 52%;
            opacity: 1;
            transform: translate(-50%, -50%) scale(1) rotateY(0deg) rotateZ(0deg);
          }
          50% {
            left: 52%;
            top: 74%;
            opacity: 1;
            transform: translate(-50%, -50%) scale(0.85) rotateY(180deg) rotateZ(-12deg);
          }
          100% {
            left: 50%;
            top: calc(100% - 44px);
            opacity: 0;
            transform: translate(-50%, -50%) scale(0.35) rotateY(360deg) rotateZ(12deg);
          }
        }
        .cart-product-flip {
          perspective: 700px;
          animation: productFlipToCart 0.78s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }

        @keyframes cartBadgePop {
          0% { transform: scale(0.6); }
          70% { transform: scale(1.18); }
          100% { transform: scale(1); }
        }
        .cart-count-pop {
          animation: cartBadgePop 0.3s ease-out;
        }

        @media (max-width: 767px) {
          .hide-mobile-nav-cart a[href*="cart"],
          .hide-mobile-nav-cart button[aria-label*="cart" i],
          .hide-mobile-nav-cart button[aria-label*="bag" i],
          .hide-mobile-nav-cart [data-testid*="cart" i] {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
};

export default Home;
