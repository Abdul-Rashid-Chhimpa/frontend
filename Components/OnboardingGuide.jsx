import { useState, useEffect, useRef } from "react";
import { X, ChevronRight, ChevronLeft, Sparkles } from "lucide-react";

const AMBER = "#F0A420";
const AMBER_DARK = "#C97F0F";
const STEEL = "#2B4A5E";

const STEPS = [
  {
    id: "welcome",
    title: "Welcome to Pedwal Tools!",
    description: "Let’s quickly show you how to explore and buy tools easily. This will only take a few seconds.",
    target: null, // centered
    placement: "center",
  },
  {
    id: "buy-now",
    title: "Buy Featured Product",
    description: "Click this button to open the current featured product’s details page and buy it directly.",
    target: "#tour-buy-btn",
    placement: "bottom",
  },
  {
    id: "filters",
    title: "Smart Filters",
    description: "Filter products by category, price, offers and new arrivals. On mobile, tap the Filters button.",
    target: "#filters-trigger",
    placement: "right",
  },
  {
    id: "search",
    title: "Search Products",
    description: "Type product name, brand or material here to quickly find what you need.",
    target: "#product-search",
    placement: "bottom",
  },
  {
    id: "product-card",
    title: "Product Cards",
    description: "Click anywhere on a product card to open its full details. You can also Add to Cart or Buy Now from here.",
    target: ".product-card-item",
    placement: "top",
  },
];

const OnboardingGuide = () => {
  const [visible, setVisible] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [spotlight, setSpotlight] = useState(null); // { top, left, width, height }
  const tooltipRef = useRef(null);

  const step = STEPS[currentStep];

  // Show only first time
  useEffect(() => {
    const seen = localStorage.getItem("pedwal_guide_seen");
    if (!seen) {
      const timer = setTimeout(() => setVisible(true), 900);
      return () => clearTimeout(timer);
    }
  }, []);

  // Calculate spotlight position
  useEffect(() => {
    if (!visible) return;

    const updateSpotlight = () => {
      if (!step.target) {
        setSpotlight(null);
        return;
      }

      const el = document.querySelector(step.target);
      if (!el) {
        setSpotlight(null);
        return;
      }

      const rect = el.getBoundingClientRect();
      const padding = 10;

      setSpotlight({
        top: rect.top - padding + window.scrollY,
        left: rect.left - padding,
        width: rect.width + padding * 2,
        height: rect.height + padding * 2,
      });

      // Scroll element into view smoothly
      el.scrollIntoView({ behavior: "smooth", block: "center", inline: "nearest" });
    };

    updateSpotlight();
    window.addEventListener("resize", updateSpotlight);
    return () => window.removeEventListener("resize", updateSpotlight);
  }, [visible, currentStep, step.target]);

  const finishGuide = () => {
    localStorage.setItem("pedwal_guide_seen", "true");
    setVisible(false);
  };

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep((p) => p + 1);
    } else {
      finishGuide();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) setCurrentStep((p) => p - 1);
  };

  if (!visible) return null;

  const isFirst = currentStep === 0;
  const isLast = currentStep === STEPS.length - 1;

  // Tooltip position helper
  const getTooltipStyle = () => {
    if (!spotlight || step.placement === "center") {
      return {
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
      };
    }

    const gap = 18;

    if (step.placement === "bottom") {
      return {
        top: spotlight.top + spotlight.height + gap,
        left: Math.min(
          Math.max(spotlight.left + spotlight.width / 2 - 160, 16),
          window.innerWidth - 336
        ),
      };
    }

    if (step.placement === "top") {
      return {
        top: spotlight.top - gap - 160,
        left: Math.min(
          Math.max(spotlight.left + spotlight.width / 2 - 160, 16),
          window.innerWidth - 336
        ),
      };
    }

    if (step.placement === "right") {
      return {
        top: spotlight.top + spotlight.height / 2 - 80,
        left: spotlight.left + spotlight.width + gap,
      };
    }

    // default bottom
    return {
      top: spotlight.top + spotlight.height + gap,
      left: spotlight.left,
    };
  };

  return (
    <div className="fixed inset-0 z-[9999]">
      {/* Dark blurred overlay */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-[3px]" />

      {/* Spotlight hole */}
      {spotlight && (
        <div
          className="absolute rounded-2xl pointer-events-none transition-all duration-500 ease-out"
          style={{
            top: spotlight.top,
            left: spotlight.left,
            width: spotlight.width,
            height: spotlight.height,
            boxShadow: "0 0 0 9999px rgba(0,0,0,0.65)",
            border: `2px solid ${AMBER}`,
            zIndex: 10,
          }}
        />
      )}

      {/* Tooltip / Popup */}
      <div
        ref={tooltipRef}
        className="absolute z-20 w-[min(320px,calc(100vw-32px))] bg-white rounded-2xl shadow-2xl overflow-hidden animate-tooltip"
        style={getTooltipStyle()}
      >
        {/* Top accent */}
        <div
          className="h-1 w-full"
          style={{ background: `linear-gradient(90deg, ${AMBER}, ${AMBER_DARK})` }}
        />

        <div className="p-5">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex items-center gap-2">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center text-white shrink-0"
                style={{ background: STEEL }}
              >
                <Sparkles size={18} />
              </div>
              <h3 className="font-bold text-gray-900 text-[15px] leading-tight">
                {step.title}
              </h3>
            </div>

            <button
              onClick={finishGuide}
              className="p-1 rounded-full hover:bg-gray-100 transition shrink-0"
            >
              <X size={16} className="text-gray-400" />
            </button>
          </div>

          <p className="text-sm text-gray-600 leading-relaxed mb-5">
            {step.description}
          </p>

          {/* Progress */}
          <div className="flex items-center gap-1.5 mb-5">
            {STEPS.map((_, idx) => (
              <div
                key={idx}
                className={`h-1 rounded-full transition-all duration-300 ${
                  idx === currentStep ? "w-5" : "w-1.5 bg-gray-200"
                }`}
                style={idx === currentStep ? { background: AMBER } : {}}
              />
            ))}
          </div>

          {/* Buttons */}
          <div className="flex items-center gap-2">
            {!isFirst && (
              <button
                onClick={handlePrev}
                className="flex items-center gap-1 px-3 py-2.5 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition"
              >
                <ChevronLeft size={16} />
                Back
              </button>
            )}

            <button
              onClick={finishGuide}
              className="ml-auto px-4 py-2.5 rounded-xl text-sm font-semibold text-gray-500 hover:bg-gray-50 transition"
            >
              Skip
            </button>

            <button
              onClick={handleNext}
              className="px-5 py-2.5 rounded-xl text-sm font-bold text-white flex items-center gap-1.5 transition active:scale-95"
              style={{
                background: `linear-gradient(135deg, ${AMBER}, ${AMBER_DARK})`,
              }}
            >
              {isLast ? "Finish" : "Next"}
              {!isLast && <ChevronRight size={16} />}
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes tooltipIn {
          from {
            opacity: 0;
            transform: translateY(12px) scale(0.96);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        .animate-tooltip {
          animation: tooltipIn 0.35s cubic-bezier(0.22, 1, 0.36, 1);
        }
      `}</style>
    </div>
  );
};

export default OnboardingGuide;
