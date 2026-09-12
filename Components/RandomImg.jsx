import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const images = ["02.jpeg", "03.jpg", "04.jpg", "05.jpg"];

// Shared with the rest of the store's UI
const BORDER = "#E6E8EB";
const SURFACE_MUTED = "#F1F2EF";
const AMBER = "#F0A420";
const INK = "#15181C";

const RandomImg = () => {
  const [current, setCurrent] = useState(
    Math.floor(Math.random() * images.length)
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % images.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const goTo = (index) => setCurrent(((index % images.length) + images.length) % images.length);

  return (
    <div className="w-full mt-6 sm:mt-8 md:mt-10">
      {/* Banner */}
      <div className="w-full max-w-6xl mx-auto px-3 sm:px-4">
        <div
          className="group relative w-full rounded-xl sm:rounded-2xl overflow-hidden flex items-center justify-center
                      h-[200px] sm:h-[280px] md:h-[360px] lg:h-[420px] xl:h-[480px]"
          style={{ background: SURFACE_MUTED, border: `1px solid ${BORDER}` }}
        >
          <img
            key={current}
            src={images[current]}
            alt="Banner"
            className="max-w-full max-h-full w-auto h-auto object-contain animate-fade"
          />

          {/* Prev / Next — visible on hover (desktop), always visible on touch devices */}
          <button
            onClick={() => goTo(current - 1)}
            aria-label="Previous image"
            className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-9 sm:h-9 rounded-full
                       flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            style={{ background: "rgba(255,255,255,0.9)", color: INK, border: `1px solid ${BORDER}` }}
          >
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={() => goTo(current + 1)}
            aria-label="Next image"
            className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-9 sm:h-9 rounded-full
                       flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            style={{ background: "rgba(255,255,255,0.9)", color: INK, border: `1px solid ${BORDER}` }}
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* Progress ticks */}
      <div className="flex justify-center gap-2 mt-4 sm:mt-5">
        {images.map((_, index) => (
          <button
            key={index}
            onClick={() => goTo(index)}
            aria-label={`Go to slide ${index + 1}`}
            className="h-1.5 rounded-full transition-all duration-300"
            style={{
              width: current === index ? "28px" : "10px",
              background: current === index ? AMBER : "#D8DBD6",
            }}
          />
        ))}
      </div>

      <style>{`
        @keyframes fade {
          from {
            opacity: 0;
            transform: scale(1.03);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-fade {
          animation: fade 0.7s ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default RandomImg;
