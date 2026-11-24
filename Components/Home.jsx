import React, {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import ProductCard from "./Card";
import Nav from "./Nav";
import RandomImg from "./RandomImg";
import Footer from "./Footer";
import OnboardingGuide from "./OnboardingGuide";
import { requireLogin } from "../Components/auth";
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

gsap.registerPlugin(ScrollTrigger);

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

const SLIDE_DURATION = 4.8; // seconds

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

const craftIcons = [Zap, ShieldCheck, Award, Wrench];

// ======================================================
// HELPERS
// ======================================================
const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  Boolean(window.matchMedia?.("(prefers-reduced-motion: reduce)").matches);

const canHover = () =>
  typeof window !== "undefined" &&
  Boolean(window.matchMedia?.("(hover: hover) and (pointer: fine)").matches);

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

// Word-by-word mask reveal (animated by GSAP via ".split-word")
const SplitWords = ({ text }) => (
  <>
    {String(text || "")
      .split(" ")
      .map((word, i) => (
        <span
          key={`${word}-${i}`}
          className="inline-block overflow-hidden align-bottom pb-[0.1em] mr-[0.25em]"
        >
          <span className="split-word inline-block will-change-transform">
            {word}
          </span>
        </span>
      ))}
  </>
);

// ======================================================
// SCROLL REVEAL (GSAP)
// ======================================================
const ScrollReveal = ({ children, className = "", delay = 0 }) => {
  const ref = useRef(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        el,
        { autoAlpha: 0, y: 44 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.9,
          delay: delay / 1000,
          ease: "power3.out",
          clearProps: "transform",
          scrollTrigger: { trigger: el, start: "top 90%", once: true },
        }
      );
    }, el);

    return () => ctx.revert();
  }, [delay]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
};

// ======================================================
// CRAFTSMANSHIP SECTION (new)
// ======================================================
const Craftsmanship = () => {
  const ref = useRef(null);

  useLayoutEffect(() => {
    if (prefersReducedMotion()) return;

    const ctx = gsap.context(() => {
      const trigger = { trigger: ".craft-title", start: "top 88%", once: true };

      gsap.fromTo(
        ".craft-title .split-word",
        { yPercent: 110 },
        {
          yPercent: 0,
          duration: 0.8,
          stagger: 0.06,
          ease: "power3.out",
          scrollTrigger: trigger,
        }
      );
      gsap.fromTo(
        ".craft-line",
        { scaleX: 0 },
        {
          scaleX: 1,
          transformOrigin: "left center",
          duration: 0.9,
          ease: "power3.out",
          scrollTrigger: trigger,
        }
      );
      gsap.fromTo(
        ".craft-sub",
        { autoAlpha: 0, y: 16 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.7,
          delay: 0.25,
          scrollTrigger: trigger,
        }
      );
      gsap.fromTo(
        ".craft-card",
        { autoAlpha: 0, y: 56 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.85,
          stagger: 0.12,
          ease: "power3.out",
          clearProps: "transform",
          scrollTrigger: { trigger: ".craft-grid", start: "top 88%", once: true },
        }
      );
    }, ref);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={ref}
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 sm:pt-16"
    >
      <h2
        className="craft-title text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight"
        style={{ color: COLOR.INK }}
        aria-label="Craftsmanship you can feel"
      >
        <SplitWords text="Craftsmanship you can feel" />
      </h2>
      <div
        className="craft-line w-12 h-1 rounded-full mt-3 mb-3"
        style={{ background: COLOR.AMBER }}
      />
      <p
        className="craft-sub text-sm sm:text-base max-w-xl"
        style={{ color: COLOR.MUTED }}
      >
        Every Pedwal tool is built to take daily workshop pressure and keep
        performing.
      </p>

      <div className="craft-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
        {companyHighlights.map((item, idx) => {
          const Icon = craftIcons[idx % craftIcons.length];
          return (
            <div
              key={item.title}
              className="craft-card group relative rounded-2xl bg-white border p-5 overflow-hidden transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl"
              style={{ borderColor: COLOR.BORDER }}
            >
              <span
                className="absolute -top-2 right-3 text-6xl font-black select-none pointer-events-none"
                style={{ color: "rgba(43,74,94,0.07)" }}
              >
                {String(idx + 1).padStart(2, "0")}
              </span>

              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center text-white mb-4 transition-transform duration-300 group-hover:rotate-6 group-hover:scale-110"
                style={{ background: COLOR.STEEL }}
              >
                <Icon size={20} />
              </div>

              <h3
                className="font-bold text-sm sm:text-base"
                style={{ color: COLOR.INK }}
              >
                {item.title}
              </h3>
              <p
                className="text-xs sm:text-sm mt-1.5 leading-relaxed"
                style={{ color: COLOR.MUTED }}
              >
                {item.desc}
              </p>

              <span
                className="absolute left-0 bottom-0 h-1 w-full origin-left scale-x-0 transition-transform duration-500 group-hover:scale-x-100"
                style={{ background: COLOR.AMBER }}
              />
            </div>
          );
        })}
      </div>
    </section>
  );
};

// ======================================================
// HOME
// ======================================================
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

  // GSAP refs
  const rootRef = useRef(null);
  const heroRef = useRef(null);
  const progressRef = useRef(null);
  const progressTweenRef = useRef(null);
  const pausedRef = useRef(false);
  const firstSlideRef = useRef(true);
  const marqueeRef = useRef(null);
  const marqueeTweenRef = useRef(null);
  const modalOverlayRef = useRef(null);
  const modalCardRef = useRef(null);

  pausedRef.current = paused;

  // ------------------------------------------------------
  // CART FLY ANIMATION (unchanged)
  // ------------------------------------------------------
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

  // ------------------------------------------------------
  // FETCH BANNERS
  // ------------------------------------------------------
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

  // ------------------------------------------------------
  // GSAP: HERO INTRO TIMELINE + PARALLAX + FLOATING ORBS
  // ------------------------------------------------------
  useLayoutEffect(() => {
    if (prefersReducedMotion()) return;

    const isDesktop = window.innerWidth >= 1024;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      tl.fromTo(
        ".hero-img-panel",
        { clipPath: isDesktop ? "inset(0 0 0 100%)" : "inset(0 0 100% 0)" },
        {
          clipPath: "inset(0 0 0% 0%)",
          duration: 1.2,
          ease: "power4.inOut",
        },
        0
      )
        .fromTo(
          ".hero-img-inner",
          { scale: 1.18 },
          { scale: 1, duration: 1.6 },
          0
        )
        .fromTo(
          ".hero-pill",
          { y: 22, autoAlpha: 0 },
          { y: 0, autoAlpha: 1, duration: 0.6 },
          0.25
        )
        .fromTo(
          ".hero-title .split-word",
          { yPercent: 110 },
          { yPercent: 0, duration: 0.85, stagger: 0.07 },
          0.35
        )
        .fromTo(
          ".hero-specs",
          { y: 18, autoAlpha: 0 },
          { y: 0, autoAlpha: 1, duration: 0.6 },
          0.6
        )
        .fromTo(
          ".hero-chip",
          { y: 18, autoAlpha: 0, scale: 0.9 },
          { y: 0, autoAlpha: 1, scale: 1, duration: 0.5, stagger: 0.08 },
          0.7
        )
        .fromTo(
          ".hero-btn",
          { y: 24, autoAlpha: 0 },
          { y: 0, autoAlpha: 1, duration: 0.6, stagger: 0.1 },
          0.85
        )
        .fromTo(
          ".hero-thumbs",
          { y: 24, autoAlpha: 0 },
          { y: 0, autoAlpha: 1, duration: 0.6 },
          1.0
        );

      // Floating glow orbs behind text
      gsap.to(".hero-orb-a", {
        x: 50,
        y: -34,
        duration: 6,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });
      gsap.to(".hero-orb-b", {
        x: -40,
        y: 30,
        duration: 7.5,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });

      // Parallax on image while scrolling past hero
      gsap.fromTo(
        ".hero-img-parallax",
        { yPercent: -4 },
        {
          yPercent: 4,
          ease: "none",
          scrollTrigger: {
            trigger: heroRef.current,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
          },
        }
      );
    }, heroRef);

    // Layout can shift after fonts/images/API load
    const refreshTimer = setTimeout(() => ScrollTrigger.refresh(), 1500);

    return () => {
      clearTimeout(refreshTimer);
      ctx.revert();
    };
  }, []);

  // ------------------------------------------------------
  // GSAP: SLIDE CHANGE (image + text)
  // ------------------------------------------------------
  useEffect(() => {
    if (firstSlideRef.current) {
      firstSlideRef.current = false;
      return;
    }
    if (prefersReducedMotion()) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".hero-main-img",
        { autoAlpha: 0, scale: 1.07, filter: "blur(10px)" },
        {
          autoAlpha: 1,
          scale: 1,
          filter: "blur(0px)",
          duration: 0.9,
          ease: "power3.out",
          clearProps: "filter",
        }
      );
      gsap.fromTo(
        ".hero-tagline",
        { y: 12, autoAlpha: 0 },
        { y: 0, autoAlpha: 1, duration: 0.5, ease: "power2.out" }
      );
      gsap.fromTo(
        ".hero-title .split-word",
        { yPercent: 110 },
        { yPercent: 0, duration: 0.75, stagger: 0.06, ease: "power3.out" }
      );
      gsap.fromTo(
        ".hero-specs",
        { y: 14, autoAlpha: 0 },
        { y: 0, autoAlpha: 1, duration: 0.55, delay: 0.15, ease: "power2.out" }
      );
    }, heroRef);

    return () => ctx.revert();
  }, [active]);

  // ------------------------------------------------------
  // GSAP: AUTOPLAY WITH PROGRESS BAR (replaces setInterval)
  // ------------------------------------------------------
  useEffect(() => {
    const bar = progressRef.current;
    if (!bar || slideData.length <= 1) return;

    const tween = gsap.fromTo(
      bar,
      { scaleX: 0 },
      {
        scaleX: 1,
        duration: SLIDE_DURATION,
        ease: "none",
        transformOrigin: "left center",
        onComplete: () => setActive((prev) => (prev + 1) % slideData.length),
      }
    );

    progressTweenRef.current = tween;
    if (pausedRef.current) tween.pause();

    return () => {
      tween.kill();
    };
  }, [active, slideData.length]);

  useEffect(() => {
    progressTweenRef.current?.paused(paused);
  }, [paused]);

  // ------------------------------------------------------
  // GSAP: MARQUEE (smooth slow-down on hover)
  // ------------------------------------------------------
  useEffect(() => {
    const el = marqueeRef.current;
    if (!el || prefersReducedMotion()) return;

    const tween = gsap.to(el, {
      xPercent: -50,
      duration: 25,
      ease: "none",
      repeat: -1,
    });
    marqueeTweenRef.current = tween;

    return () => {
      tween.kill();
      gsap.set(el, { clearProps: "transform" });
    };
  }, []);

  const slowMarquee = () =>
    marqueeTweenRef.current &&
    gsap.to(marqueeTweenRef.current, { timeScale: 0.15, duration: 0.5 });
  const resumeMarquee = () =>
    marqueeTweenRef.current &&
    gsap.to(marqueeTweenRef.current, { timeScale: 1, duration: 0.5 });

  // ------------------------------------------------------
  // GSAP: MOBILE BOTTOM NAV ENTRANCE
  // ------------------------------------------------------
  useLayoutEffect(() => {
    if (prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".bottom-nav",
        { yPercent: 100 },
        {
          yPercent: 0,
          duration: 0.8,
          delay: 0.8,
          ease: "power3.out",
          clearProps: "transform",
        }
      );
    }, rootRef);
    return () => ctx.revert();
  }, []);

  // ------------------------------------------------------
  // GSAP: COMPANY MODAL OPEN ANIMATION
  // ------------------------------------------------------
  useEffect(() => {
    if (!companyModalOpen) return;

    const onKeyDown = (e) => {
      if (e.key === "Escape") setCompanyModalOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);

    let ctx;
    if (!prefersReducedMotion() && modalOverlayRef.current) {
      ctx = gsap.context(() => {
        gsap.fromTo(
          modalOverlayRef.current,
          { autoAlpha: 0 },
          { autoAlpha: 1, duration: 0.25 }
        );
        gsap.fromTo(
          modalCardRef.current,
          { y: 50, scale: 0.94, autoAlpha: 0 },
          {
            y: 0,
            scale: 1,
            autoAlpha: 1,
            duration: 0.55,
            ease: "back.out(1.4)",
          }
        );
        gsap.fromTo(
          ".modal-stat",
          { y: 18, autoAlpha: 0 },
          {
            y: 0,
            autoAlpha: 1,
            duration: 0.45,
            stagger: 0.08,
            delay: 0.3,
            ease: "power2.out",
          }
        );
        gsap.fromTo(
          ".modal-item",
          { y: 18, autoAlpha: 0 },
          {
            y: 0,
            autoAlpha: 1,
            duration: 0.45,
            stagger: 0.07,
            delay: 0.45,
            ease: "power2.out",
          }
        );
      }, modalOverlayRef);
    }

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      ctx?.revert();
    };
  }, [companyModalOpen]);

  // ------------------------------------------------------
  // MAGNETIC HOVER FOR PRIMARY BUTTON
  // ------------------------------------------------------
  const handleMagnetMove = (e) => {
    if (!canHover() || prefersReducedMotion()) return;
    const btn = e.currentTarget;
    const rect = btn.getBoundingClientRect();
    const dx = e.clientX - (rect.left + rect.width / 2);
    const dy = e.clientY - (rect.top + rect.height / 2);
    gsap.to(btn, {
      x: dx * 0.22,
      y: dy * 0.32,
      duration: 0.3,
      ease: "power2.out",
    });
  };
  const handleMagnetLeave = (e) => {
    gsap.to(e.currentTarget, {
      x: 0,
      y: 0,
      duration: 0.7,
      ease: "elastic.out(1, 0.4)",
    });
  };

  // ------------------------------------------------------
  // ACTIONS (guest browsing allowed, login only on action)
  // ------------------------------------------------------
  const current = slideData[active] || slideData[0];
  const currentImageUrl = getImageUrl(current?.image);

  const handleBuyNow = () => {
    if (!requireLogin(navigate, "Please login to buy this product")) return;

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

  const goToCart = () => {
    if (!requireLogin(navigate, "Please login to view your cart")) return;
    navigate("/cart");
  };

  const goToOrders = () => {
    if (!requireLogin(navigate, "Please login to view your orders")) return;
    setActiveBottomTab("orders");
    navigate("/orders");
  };

  const goToProfile = () => {
    if (!requireLogin(navigate, "Please login to view your profile")) return;
    setActiveBottomTab("profile");
    navigate("/profile");
  };

  return (
    <div
      ref={rootRef}
      className="min-h-screen bg-[#FAFAFC] text-[#15181C] font-sans overflow-x-hidden"
    >
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
          onMouseEnter={slowMarquee}
          onMouseLeave={resumeMarquee}
        >
          <div ref={marqueeRef} className="flex w-max">
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
        <section
          ref={heroRef}
          className="relative w-full overflow-hidden"
          style={{ background: COLOR.HERO_BG }}
        >
          <div className="flex flex-col lg:flex-row lg:min-h-[560px]">
            {/* ===== IMAGE PANEL: full width + full height, image never cropped ===== */}
            <div
              className="hero-img-panel order-1 lg:order-2 lg:w-[56%] flex flex-col"
              onMouseEnter={() => setPaused(true)}
              onMouseLeave={() => setPaused(false)}
            >
              <div
                className="hero-img-inner relative w-full aspect-[4/3] sm:aspect-[16/10] lg:aspect-auto lg:flex-1 lg:min-h-[420px] overflow-hidden"
                style={{ background: COLOR.HERO_PANEL }}
              >
                {/* Parallax layer (slightly taller than the panel) */}
                <div className="hero-img-parallax absolute inset-x-0 -top-[6%] -bottom-[6%]">
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
                    className="hero-main-img absolute inset-0 w-full h-full object-contain p-3 sm:p-5"
                  />
                </div>
              </div>

              {/* Autoplay progress bar */}
              <div className="relative h-[3px] w-full bg-white/10">
                <div
                  ref={progressRef}
                  className="absolute inset-0 origin-left"
                  style={{ background: COLOR.AMBER, transform: "scaleX(0)" }}
                />
              </div>

              {/* Thumbnail bar */}
              <div
                className="hero-thumbs flex items-center gap-2.5 px-4 sm:px-6 py-3 overflow-x-auto"
                style={{ background: COLOR.HERO_PANEL }}
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
                        : "opacity-60 hover:opacity-100 hover:-translate-y-0.5"
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
            <div className="order-2 lg:order-1 lg:w-[44%] relative overflow-hidden flex">
              {/* Floating glow orbs */}
              <div
                className="hero-orb-a absolute -top-10 -left-10 w-64 h-64 rounded-full blur-[100px] opacity-25 pointer-events-none"
                style={{ background: COLOR.AMBER }}
              />
              <div
                className="hero-orb-b absolute bottom-0 right-0 w-56 h-56 rounded-full blur-[100px] opacity-30 pointer-events-none"
                style={{ background: COLOR.STEEL }}
              />

              <div className="relative z-10 w-full flex flex-col justify-center items-start gap-4 px-5 sm:px-10 lg:pl-16 xl:pl-28 lg:pr-10 py-8 sm:py-10 lg:py-14">
                <div className="hero-pill hero-tagline inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-white/70">
                  <span
                    className="w-2 h-2 rounded-full animate-pulse"
                    style={{ background: COLOR.AMBER }}
                  />
                  <span className="text-xs font-semibold tracking-wide text-white">
                    {current?.tagline || "Premium Series"}
                  </span>
                </div>

                <h1
                  key={current?.title}
                  className="hero-title text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-[1.1] text-white"
                  aria-label={current?.title || "Featured Tool"}
                >
                  <SplitWords text={current?.title || "Featured Tool"} />
                </h1>

                <p
                  className="hero-specs text-sm sm:text-base max-w-md"
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
                      className="hero-chip inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold text-white"
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
                  <div className="hero-btn">
                    <button
                      type="button"
                      onClick={handleBuyNow}
                      onMouseMove={handleMagnetMove}
                      onMouseLeave={handleMagnetLeave}
                      className="group w-full px-7 py-3.5 rounded-2xl font-bold text-sm shadow-lg flex items-center justify-center gap-2.5 transition-shadow duration-300 hover:shadow-[0_12px_30px_rgba(240,164,32,0.45)] active:scale-[0.98] cursor-pointer"
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
                  </div>

                  <div className="hero-btn">
                    <button
                      type="button"
                      onClick={handleExplore3DProduct}
                      className="w-full px-5 py-3.5 rounded-2xl font-bold text-sm border flex items-center justify-center gap-2 transition-all duration-300 hover:-translate-y-1 hover:bg-white/10 cursor-pointer text-white"
                      style={{ borderColor: "rgba(255,255,255,0.45)" }}
                    >
                      <Rotate3d size={17} style={{ color: COLOR.AMBER }} />
                      <span>Explore Product</span>
                    </button>
                  </div>

                  <div className="hero-btn">
                    <button
                      type="button"
                      onClick={() => setCompanyModalOpen(true)}
                      className="w-full px-5 py-3.5 rounded-2xl font-bold text-sm border flex items-center justify-center gap-2 transition-all duration-300 hover:-translate-y-1 hover:bg-white/10 cursor-pointer text-white"
                      style={{ borderColor: "rgba(255,255,255,0.45)" }}
                    >
                      <Building2 size={17} style={{ color: COLOR.AMBER }} />
                      <span>Company Details</span>
                    </button>
                  </div>
                </div>
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

        {/* ========== CRAFTSMANSHIP (NEW) ========== */}
        <Craftsmanship />

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
        className="bottom-nav md:hidden fixed bottom-0 inset-x-0 z-[100] rounded-t-[26px] bg-white border-t-2 border-[#F0A420]/60 shadow-[0_-8px_24px_rgba(15,23,42,0.09)]"
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
            onClick={goToCart}
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
            onClick={goToOrders}
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
            onClick={goToProfile}
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
          ref={modalOverlayRef}
          className="fixed inset-0 z-[9999] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setCompanyModalOpen(false)}
        >
          <div
            ref={modalCardRef}
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
                {[
                  { big: "100%", small: "Drop Forged Steel" },
                  { big: "DIN", small: "Torque Certified" },
                  { big: "PAN", small: "India Dispatch" },
                ].map((s) => (
                  <div
                    key={s.big}
                    className="modal-stat p-3.5 rounded-2xl bg-[#F8FAFC] border border-[#E6E8EB] text-center"
                  >
                    <p
                      className="text-xl sm:text-2xl font-black"
                      style={{ color: COLOR.AMBER_DARK }}
                    >
                      {s.big}
                    </p>
                    <p className="text-xs text-[#6B7280] mt-0.5">{s.small}</p>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {companyHighlights.map((box, idx) => (
                  <div
                    key={idx}
                    className="modal-item p-4 rounded-2xl bg-[#F8FAFC] border border-[#E6E8EB]"
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

        @media (prefers-reduced-motion: reduce) {
          .cart-orbit-ring { animation: none; }
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
