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
  // Hero (dark) colors
  HERO_BG: "#15181C",
  HERO_PANEL: "#1B2026",
  HERO_LINE: "#2E363D",
  HERO_TEXT_SOFT: "#AEBBC4",
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

const getCartSnapshotFromStorage = () => {
  try {
    let count = 0;
    const directCount = localStorage.getItem("cartCount");

    const rawCart =
      localStorage.getItem("cart") ||
      localStorage.getItem("cartItems") ||
      "[]";
    const parsed = JSON.parse(rawCart);

    if (Array.isArray(parsed)) {
      count = parsed.reduce((sum, item) => {
        const qty = Number(item?.quantity ?? item?.qty ?? 1);
        return sum + (Number.isNaN(qty) ? 1 : Math.max(1, qty));
      }, 0);
    } else if (parsed && Array.isArray(parsed.items)) {
      count = parsed.items.reduce((sum, item) => {
        const qty = Number(item?.quantity ?? item?.qty ?? 1);
        return sum + (Number.isNaN(qty) ? 1 : Math.max(1, qty));
      }, 0);
    } else if (directCount !== null && !Number.isNaN(Number(directCount))) {
      count = Math.max(0, Number(directCount));
    }

    const lastImg = localStorage.getItem("lastAddedCartImage");
    const itemsList = Array.isArray(parsed)
      ? parsed
      : Array.isArray(parsed?.items)
      ? parsed.items
      : [];
    const lastItem = itemsList[itemsList.length - 1];
    const image =
      lastImg ||
      lastItem?.image ||
      lastItem?.img ||
      lastItem?.thumbnail ||
      defaultSlideData[0].image;

    return { count, image };
  } catch {
    return { count: 0, image: defaultSlideData[0].image };
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

const findClickedProductCard = (target) => {
  let node = target;
  while (node && node !== document.body) {
    if (node.querySelector && node.querySelector("img")) {
      const rect = node.getBoundingClientRect();
      if (rect.width >= 110 && rect.height >= 120 && rect.width <= 520) {
        return node;
      }
    }
    node = node.parentElement;
  }
  return null;
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
  const [activeBottomTab, setActiveBottomTab] = useState("home");

  const initialSnapshot = getCartSnapshotFromStorage();
  const [cartCount, setCartCount] = useState(initialSnapshot.count);
  const prevCartCountRef = useRef(initialSnapshot.count);
  const lastClickedCardRef = useRef(null);
  const cartBtnRef = useRef(null);
  const lastAnimTimestampRef = useRef(0);
  const [cartHit, setCartHit] = useState(false);

  const launchProductFlipAnimation = (customImage, sourceEl) => {
    const now = performance.now();
    if (now - lastAnimTimestampRef.current < 260) return;
    lastAnimTimestampRef.current = now;

    const targetEl = cartBtnRef.current;
    if (!targetEl) return;

    const targetRect = targetEl.getBoundingClientRect();
    if (!targetRect.width || !targetRect.height) return;

    const cardEl = sourceEl || lastClickedCardRef.current;
    const cardImg = cardEl?.querySelector?.("img");
    const startRect = (cardImg || cardEl)?.getBoundingClientRect?.();

    const imgSrc =
      cardImg?.currentSrc ||
      cardImg?.src ||
      getImageUrl(customImage || getCartSnapshotFromStorage().image);

    if (!imgSrc) return;

    const startW = startRect?.width
      ? Math.min(Math.max(startRect.width * 0.52, 68), 108)
      : 82;
    const startH = startRect?.height
      ? Math.min(Math.max(startRect.height * 0.52, 68), 108)
      : 82;

    const startX = startRect
      ? startRect.left + startRect.width / 2 - startW / 2
      : window.innerWidth / 2 - startW / 2;
    const startY = startRect
      ? startRect.top + startRect.height / 2 - startH / 2
      : window.innerHeight * 0.45 - startH / 2;

    const endX = targetRect.left + targetRect.width / 2 - startW / 2;
    const endY = targetRect.top + targetRect.height / 2 - startH / 2;

    const deltaX = endX - startX;
    const deltaY = endY - startY;

    const flyer = document.createElement("div");
    flyer.style.cssText = `
      position: fixed;
      left: ${startX}px;
      top: ${startY}px;
      width: ${startW}px;
      height: ${startH}px;
      border-radius: 20px;
      overflow: hidden;
      background: #FFFFFF;
      border: 3px solid #F0A420;
      box-shadow: 0 18px 36px rgba(15, 23, 42, 0.32);
      pointer-events: none;
      z-index: 99999;
      will-change: transform, opacity;
      transform-origin: center center;
    `;

    const img = document.createElement("img");
    img.src = imgSrc;
    img.alt = "Adding product to cart";
    img.style.cssText = "width:100%;height:100%;object-fit:cover;display:block;";
    flyer.appendChild(img);
    document.body.appendChild(flyer);

    const anim = flyer.animate(
      [
        {
          transform: "perspective(800px) translate3d(0px, 0px, 0px) rotateY(0deg) scale(1.06)",
          opacity: 1,
        },
        {
          transform: `perspective(800px) translate3d(${deltaX * 0.25}px, ${
            deltaY * 0.18 - 28
          }px, 0px) rotateY(95deg) scale(1)`,
          opacity: 1,
          offset: 0.28,
        },
        {
          transform: `perspective(800px) translate3d(${deltaX * 0.62}px, ${
            deltaY * 0.56 - 44
          }px, 0px) rotateY(210deg) scale(0.84)`,
          opacity: 1,
          offset: 0.64,
        },
        {
          transform: `perspective(800px) translate3d(${deltaX}px, ${deltaY}px, 0px) rotateY(360deg) scale(0.32)`,
          opacity: 0.2,
        },
      ],
      {
        duration: 1150,
        easing: "cubic-bezier(0.22, 1, 0.36, 1)",
        fill: "forwards",
      }
    );

    anim.onfinish = () => {
      flyer.remove();
      setCartHit(true);
      setTimeout(() => setCartHit(false), 500);
    };
  };

  useEffect(() => {
    const syncCartCount = (event) => {
      const snap = getCartSnapshotFromStorage();
      const eventImage = event?.detail?.image;
      const increased = snap.count > prevCartCountRef.current;

      if (
        increased ||
        event?.type === "productAddedToCart" ||
        Boolean(eventImage)
      ) {
        launchProductFlipAnimation(eventImage, lastClickedCardRef.current);
      }

      prevCartCountRef.current = snap.count;
      setCartCount(snap.count);
    };

    const handleCaptureClick = (e) => {
      const btn = e.target?.closest?.("button, a, [role='button']");
      if (!btn) return;
      const label = (
        btn.innerText ||
        btn.getAttribute("aria-label") ||
        ""
      ).toLowerCase();

      if (
        label.includes("cart") ||
        label.includes("add") ||
        label.includes("bag")
      ) {
        const card = findClickedProductCard(btn);
        if (card) {
          lastClickedCardRef.current = card;
        }
      }
    };

    syncCartCount();
    window.addEventListener("storage", syncCartCount);
    window.addEventListener("cartUpdated", syncCartCount);
    window.addEventListener("productAddedToCart", syncCartCount);
    document.addEventListener("click", handleCaptureClick, true);

    const pollInterval = setInterval(syncCartCount, 120);

    return () => {
      window.removeEventListener("storage", syncCartCount);
      window.removeEventListener("cartUpdated", syncCartCount);
      window.removeEventListener("productAddedToCart", syncCartCount);
      document.removeEventListener("click", handleCaptureClick, true);
      clearInterval(pollInterval);
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
  const currentImageUrl = getImageUrl(current?.image);

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
      <div className="pt-16 sm:pt-20 pb-[76px] md:pb-0">
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

        {/* ========== HERO SHOWCASE (RESPONSIVE, FULL-SIZE IMAGE PANEL) ========== */}
        <section
          className="relative w-full overflow-hidden"
          style={{ background: COLOR.HERO_BG }}
        >
          <div className="flex flex-col lg:flex-row lg:min-h-[560px]">
            {/* ===== IMAGE PANEL: full width + full height, image never cropped ===== */}
            <div
              className="order-1 lg:order-2 lg:w-[56%] flex flex-col"
              onMouseEnter={() => setPaused(true)}
              onMouseLeave={() => setPaused(false)}
            >
              <div
                className="relative w-full aspect-[4/3] sm:aspect-[16/10] lg:aspect-auto lg:flex-1 lg:min-h-[420px] overflow-hidden"
                style={{ background: COLOR.HERO_PANEL }}
              >
                {/* Blurred copy fills empty space so the card always looks full */}
                <img
                  key={`bg-${current?._id || current?.id || active}`}
                  src={currentImageUrl}
                  alt=""
                  aria-hidden="true"
                  onError={handleImgError}
                  className="absolute inset-0 w-full h-full object-cover blur-2xl scale-110 opacity-50"
                />

                {/* Main image: object-contain = complete image visible, nothing cut */}
                <img
                  key={current?._id || current?.id || active}
                  src={currentImageUrl}
                  alt={current?.title}
                  onError={handleImgError}
                  className="absolute inset-0 w-full h-full object-contain p-3 sm:p-5 animate-hero-fade"
                />
              </div>

              {/* Thumbnail bar */}
              <div
                className="flex items-center gap-2.5 px-4 sm:px-6 py-3 overflow-x-auto border-t"
                style={{
                  background: COLOR.HERO_PANEL,
                  borderColor: COLOR.HERO_LINE,
                }}
              >
                {slideData.map((item, idx) => (
                  <button
                    key={item._id || item.id || idx}
                    type="button"
                    onClick={() => setActive(idx)}
                    aria-label={`Show slide ${idx + 1}`}
                    className={`relative rounded-xl overflow-hidden transition-all duration-300 border-2 shrink-0 bg-white ${
                      active === idx
                        ? "shadow-md scale-105"
                        : "opacity-60 hover:opacity-100"
                    }`}
                    style={{
                      borderColor:
                        active === idx ? COLOR.AMBER : "rgba(255,255,255,0.3)",
                      width: "52px",
                      height: "52px",
                    }}
                  >
                    <img
                      src={getImageUrl(item.image)}
                      alt={item.title}
                      onError={handleImgError}
                      className="w-full h-full object-contain"
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* ===== TEXT CONTENT ===== */}
            <div className="order-2 lg:order-1 lg:w-[44%] flex flex-col justify-center items-start gap-4 px-5 sm:px-10 lg:pl-16 xl:pl-28 lg:pr-10 py-8 sm:py-10 lg:py-14">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-white/70">
                <span
                  className="w-2 h-2 rounded-full animate-pulse"
                  style={{ background: COLOR.AMBER }}
                />
                <span className="text-xs font-semibold tracking-wide text-white">
                  {current?.tagline || "Premium Series"}
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-[1.1] text-white">
                {current?.title || "Featured Tool"}
              </h1>

              <p
                className="text-sm sm:text-base max-w-md"
                style={{ color: COLOR.HERO_TEXT_SOFT }}
              >
                {current?.specs ||
                  "High quality industrial tools built for professionals"}
              </p>

              {/* Feature pills */}
              <div className="flex flex-wrap gap-2.5">
                {[
                  { icon: Wrench, label: "Drop Forged" },
                  { icon: Zap, label: "Hardened Edge" },
                  { icon: ShieldCheck, label: "Quality Assured" },
                ].map(({ icon: Icon, label }) => (
                  <div
                    key={label}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold text-white"
                    style={{
                      background: "rgba(255,255,255,0.1)",
                      borderColor: "rgba(255,255,255,0.25)",
                    }}
                  >
                    <Icon size={13} style={{ color: COLOR.AMBER }} />
                    {label}
                  </div>
                ))}
              </div>

              {/* ACTION BUTTONS */}
              <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-3 w-full sm:w-auto mt-2">
                <button
                  type="button"
                  onClick={handleBuyNow}
                  className="group px-7 py-3.5 rounded-2xl font-bold text-sm shadow-lg flex items-center justify-center gap-2.5 transition-all duration-300 hover:-translate-y-1 active:scale-[0.98] cursor-pointer"
                  style={{
                    background: `linear-gradient(135deg, ${COLOR.AMBER} 0%, #E08E10 100%)`,
                    color: "#1A1200",
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
                  className="px-5 py-3.5 rounded-2xl font-bold text-sm border flex items-center justify-center gap-2 transition-all duration-300 hover:-translate-y-1 hover:bg-white/10 cursor-pointer text-white"
                  style={{ borderColor: "rgba(255,255,255,0.45)" }}
                >
                  <Rotate3d size={17} style={{ color: COLOR.AMBER }} />
                  <span>Explore Product</span>
                </button>

                <button
                  type="button"
                  onClick={() => setCompanyModalOpen(true)}
                  className="px-5 py-3.5 rounded-2xl font-bold text-sm border flex items-center justify-center gap-2 transition-all duration-300 hover:-translate-y-1 hover:bg-white/10 cursor-pointer text-white"
                  style={{ borderColor: "rgba(255,255,255,0.45)" }}
                >
                  <Building2 size={17} style={{ color: COLOR.AMBER }} />
                  <span>Company Details</span>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* ========== FEATURE HIGHLIGHTS ========== */}
        <ScrollReveal>
          <section
            className="w-full py-6 sm:py-7 border-b"
            style={{
              background: COLOR.HERO_PANEL,
              borderColor: COLOR.HERO_LINE,
            }}
          >
            <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-5 sm:gap-6">
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
                    <div
                      className="pl-3 border-l-[3px]"
                      style={{ borderColor: COLOR.AMBER }}
                    >
                      <div className="flex items-center gap-1.5">
                        <Icon
                          size={14}
                          style={{ color: COLOR.AMBER }}
                          className="shrink-0"
                        />
                        <h4 className="text-sm font-semibold text-white">
                          {title}
                        </h4>
                      </div>
                      <p
                        className="text-xs mt-0.5"
                        style={{ color: COLOR.HERO_TEXT_SOFT }}
                      >
                        {note}
                      </p>
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

      {/* ========== MOBILE BOTTOM NAVIGATION ========== */}
      <nav
        aria-label="Mobile navigation"
        className="md:hidden fixed bottom-0 inset-x-0 z-[100] rounded-t-[26px] bg-white border-t-2 border-[#F0A420]/60 shadow-[0_-8px_24px_rgba(15,23,42,0.09)]"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <div className="max-w-xl mx-auto h-[68px] px-2 grid grid-cols-5 items-center">
          {/* Home */}
          <button
            type="button"
            onClick={() => {
              setActiveBottomTab("home");
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className={`flex flex-col items-center justify-center gap-1 h-full active:scale-95 transition ${
              activeBottomTab === "home"
                ? "text-[#15181C] font-bold"
                : "text-[#6B7280] font-medium"
            }`}
            aria-label="Home"
          >
            <span
              className={`px-4 py-1 rounded-full flex items-center justify-center transition-colors ${
                activeBottomTab === "home"
                  ? "bg-[#F0A420]/20 text-[#15181C]"
                  : "bg-transparent"
              }`}
            >
              <HomeIcon
                size={20}
                strokeWidth={activeBottomTab === "home" ? 2.4 : 2}
              />
            </span>
            <span className="text-[11px] leading-none">Home</span>
          </button>

          {/* Explore */}
          <button
            type="button"
            onClick={() => {
              setActiveBottomTab("explore");
              document
                .getElementById("products-section")
                ?.scrollIntoView({ behavior: "smooth" });
            }}
            className={`flex flex-col items-center justify-center gap-1 h-full active:scale-95 transition ${
              activeBottomTab === "explore"
                ? "text-[#15181C] font-bold"
                : "text-[#6B7280] font-medium"
            }`}
            aria-label="Explore products"
          >
            <span
              className={`px-4 py-1 rounded-full flex items-center justify-center transition-colors ${
                activeBottomTab === "explore"
                  ? "bg-[#F0A420]/20 text-[#15181C]"
                  : "bg-transparent"
              }`}
            >
              <Search
                size={20}
                strokeWidth={activeBottomTab === "explore" ? 2.4 : 2}
              />
            </span>
            <span className="text-[11px] leading-none">Explore</span>
          </button>

          {/* Center Raised Rounded Cart Button */}
          <button
            type="button"
            onClick={() => navigate("/cart")}
            className="flex items-center justify-center h-full active:scale-95 transition"
            aria-label={`Open shopping cart (${cartCount} items)`}
          >
            <span
              ref={cartBtnRef}
              className={`-mt-8 mb-0.5 w-[60px] h-[60px] rounded-full flex items-center justify-center relative cart-orbit-wrap shadow-[0_8px_22px_rgba(240,164,32,0.42)] ${
                cartHit ? "cart-button-hit" : ""
              }`}
            >
              <span className="cart-orbit-ring" aria-hidden="true" />
              <span className="w-[52px] h-[52px] rounded-full flex items-center justify-center bg-[#F0A420] text-[#15181C] relative z-10">
                <ShoppingCart size={22} strokeWidth={2.3} />
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

          {/* Orders */}
          <button
            type="button"
            onClick={() => {
              setActiveBottomTab("orders");
              navigate("/orders");
            }}
            className={`flex flex-col items-center justify-center gap-1 h-full active:scale-95 transition ${
              activeBottomTab === "orders"
                ? "text-[#15181C] font-bold"
                : "text-[#6B7280] font-medium"
            }`}
            aria-label="My orders"
          >
            <span
              className={`px-4 py-1 rounded-full flex items-center justify-center transition-colors ${
                activeBottomTab === "orders"
                  ? "bg-[#F0A420]/20 text-[#15181C]"
                  : "bg-transparent"
              }`}
            >
              <ClipboardList
                size={20}
                strokeWidth={activeBottomTab === "orders" ? 2.4 : 2}
              />
            </span>
            <span className="text-[11px] leading-none">Orders</span>
          </button>

          {/* Profile */}
          <button
            type="button"
            onClick={() => {
              setActiveBottomTab("profile");
              navigate("/profile");
            }}
            className={`flex flex-col items-center justify-center gap-1 h-full active:scale-95 transition ${
              activeBottomTab === "profile"
                ? "text-[#15181C] font-bold"
                : "text-[#6B7280] font-medium"
            }`}
            aria-label="Profile"
          >
            <span
              className={`px-4 py-1 rounded-full flex items-center justify-center transition-colors ${
                activeBottomTab === "profile"
                  ? "bg-[#F0A420]/20 text-[#15181C]"
                  : "bg-transparent"
              }`}
            >
              <UserRound
                size={20}
                strokeWidth={activeBottomTab === "profile" ? 2.4 : 2}
              />
            </span>
            <span className="text-[11px] leading-none">Profile</span>
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
          0% { opacity: 0; transform: scale(0.97); }
          100% { opacity: 1; transform: scale(1); }
        }
        .animate-hero-fade {
          animation: heroFade 0.45s cubic-bezier(0.22, 1, 0.36, 1);
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
          0% { transform: scale(1); }
          40% { transform: scale(1.13); }
          100% { transform: scale(1); }
        }
        .cart-button-hit {
          animation: cartButtonHit 0.45s cubic-bezier(0.22, 1, 0.36, 1);
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
