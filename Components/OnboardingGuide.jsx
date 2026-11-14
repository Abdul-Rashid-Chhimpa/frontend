import { useState, useEffect } from "react";
import { X, ChevronRight, Sparkles, ShoppingBag, Filter, Search, Package } from "lucide-react";

const STEEL = "#2B4A5E";
const AMBER = "#F0A420";
const AMBER_DARK = "#C97F0F";

const STEPS = [
  {
    id: 1,
    title: "Welcome to Pedwal Tools!",
    description:
      "This short guide will help you understand how to explore products, use filters, and buy tools easily.",
    icon: <Sparkles size={28} />,
  },
  {
    id: 2,
    title: "Featured Product Showcase",
    description:
      "Here you can see our highlighted tools. Click the 'Buy Now' button to open that particular product’s details page and purchase it.",
    icon: <ShoppingBag size={28} />,
  },
  {
    id: 3,
    title: "Smart Filters",
    description:
      "Use the Filters panel to select categories, set maximum price, show only discounted products or new arrivals. On mobile, tap the Filters button.",
    icon: <Filter size={28} />,
  },
  {
    id: 4,
    title: "Search & Sort",
    description:
      "Quickly find any product by name, brand or material using the search bar. You can also sort by price or name.",
    icon: <Search size={28} />,
  },
  {
    id: 5,
    title: "Product Cards",
    description:
      "Click anywhere on a product card to open its full details page. From there you can buy it instantly. Use 'Add to cart' if you want to buy multiple items later.",
    icon: <Package size={28} />,
  },
];

const OnboardingGuide = () => {
  const [visible, setVisible] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const hasSeen = localStorage.getItem("pedwal_guide_seen");
    if (!hasSeen) {
      // small delay so page loads first
      const timer = setTimeout(() => setVisible(true), 800);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleSkip = () => {
    localStorage.setItem("pedwal_guide_seen", "true");
    setVisible(false);
  };

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      // last step → finish
      localStorage.setItem("pedwal_guide_seen", "true");
      setVisible(false);
    }
  };

  if (!visible) return null;

  const step = STEPS[currentStep];
  const isLast = currentStep === STEPS.length - 1;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/55 backdrop-blur-[2px]" />

      {/* Guide Card */}
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden animate-guide-in">
        {/* Top accent bar */}
        <div
          className="h-1.5 w-full"
          style={{ background: `linear-gradient(90deg, ${AMBER}, ${AMBER_DARK})` }}
        />

        <div className="p-6 sm:p-7">
          {/* Header */}
          <div className="flex items-start justify-between mb-5">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center text-white"
              style={{ background: STEEL }}
            >
              {step.icon}
            </div>

            <button
              onClick={handleSkip}
              className="p-1.5 rounded-full hover:bg-gray-100 transition"
              aria-label="Close guide"
            >
              <X size={18} className="text-gray-400" />
            </button>
          </div>

          {/* Content */}
          <h3 className="text-xl font-extrabold text-gray-900 mb-2">
            {step.title}
          </h3>
          <p className="text-sm text-gray-600 leading-relaxed mb-6">
            {step.description}
          </p>

          {/* Progress dots */}
          <div className="flex items-center gap-1.5 mb-6">
            {STEPS.map((_, idx) => (
              <div
                key={idx}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  idx === currentStep ? "w-6" : "w-1.5 bg-gray-200"
                }`}
                style={idx === currentStep ? { background: AMBER } : {}}
              />
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleSkip}
              className="flex-1 py-3 rounded-xl text-sm font-semibold border border-gray-200 text-gray-600 hover:bg-gray-50 transition"
            >
              Skip Guide
            </button>

            <button
              onClick={handleNext}
              className="flex-1 py-3 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-1.5 transition hover:opacity-95 active:scale-[0.98]"
              style={{
                background: `linear-gradient(135deg, ${AMBER}, ${AMBER_DARK})`,
              }}
            >
              {isLast ? "Finish" : "Next"}
              {!isLast && <ChevronRight size={16} />}
            </button>
          </div>
        </div>

        {/* Step counter */}
        <div className="px-6 pb-5 text-center">
          <p className="text-xs text-gray-400">
            Step {currentStep + 1} of {STEPS.length}
          </p>
        </div>
      </div>

      <style>{`
        @keyframes guideIn {
          from {
            opacity: 0;
            transform: scale(0.92) translateY(16px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        .animate-guide-in {
          animation: guideIn 0.4s cubic-bezier(0.22, 1, 0.36, 1);
        }
      `}</style>
    </div>
  );
};

export default OnboardingGuide;
