import { useEffect, useState } from "react";
import ProductCard from "./Card";
import Nav from "./Nav";
import RandomImg from "./RandomImg";
import Footer from "./Footer";
import { ChevronLeft, ChevronRight } from "lucide-react";

// Shared with the rest of the store's UI
const INK = "#15181C";
const MUTED = "#6B7280";
const BORDER = "#E6E8EB";
const SURFACE = "#FFFFFF";
const AMBER = "#F0A420";
const AMBER_DARK = "#C97F0F";
const STEEL = "#2B4A5E";
const STEEL_DARK = "#17303E";

const Home = () => {
  const images = ["01.jpeg", "02.jpeg", "03.jpg", "04.jpg", "05.jpg"];
  const [active, setActive] = useState(2);

  useEffect(() => {
    const timer = setInterval(() => {
      setActive((prev) => (prev + 1) % images.length);
    }, 2800);
    return () => clearInterval(timer);
  }, [images.length]);

  const goPrev = () => {
    setActive((prev) => (prev - 1 + images.length) % images.length);
  };

  const goNext = () => {
    setActive((prev) => (prev + 1) % images.length);
  };

  return (
    <>
      <Nav />
      <RandomImg />

      {/* ========== MARQUEE BANNER ========== */}
      <div
        className="w-full overflow-hidden mt-6 sm:mt-8 md:mt-10 lg:mt-12 py-3 sm:py-4 md:py-5"
        style={{ background: STEEL_DARK, borderTop: `1px solid ${BORDER}`, borderBottom: `1px solid ${BORDER}` }}
      >
        <div className="inline-block whitespace-nowrap animate-marquee">
          <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-extrabold tracking-tight px-4">
            <span className="text-white">Welcome to </span>
            <span style={{ color: AMBER }}>Pedwal Life Creation</span>
            <span className="mx-4 sm:mx-6 md:mx-8 lg:mx-10" style={{ color: "rgba(255,255,255,0.3)" }}>•</span>
            <span className="text-white">Welcome to </span>
            <span style={{ color: AMBER }}>Pedwal Life Creation</span>
            <span className="mx-4 sm:mx-6 md:mx-8 lg:mx-10" style={{ color: "rgba(255,255,255,0.3)" }}>•</span>
            <span className="text-white">Welcome to </span>
            <span style={{ color: AMBER }}>Pedwal Life Creation</span>
          </h2>
        </div>
      </div>

      {/* ========== 3D STYLE IMAGE CAROUSEL ========== */}
      <section className="w-full py-8 sm:py-12 md:py-14 lg:py-16 overflow-hidden relative" style={{ background: SURFACE }}>
        {/* Soft background glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200px] sm:w-[320px] md:w-[420px] lg:w-[500px] h-[200px] sm:h-[320px] md:h-[420px] lg:h-[500px] rounded-full blur-3xl"
            style={{ background: "rgba(240,164,32,0.10)" }}
          />
        </div>

        {/* Carousel container - constrained width on large screens */}
        <div className="relative max-w-5xl mx-auto px-2 sm:px-4">
          <div className="relative flex justify-center items-center h-[220px] sm:h-[280px] md:h-[340px] lg:h-[400px] xl:h-[440px]">
            {images.map((img, index) => {
              let diff = index - active;
              if (diff > 2) diff -= images.length;
              if (diff < -2) diff += images.length;

              const styles = {
                "-2":
                  "-translate-x-[5.5rem] sm:-translate-x-40 md:-translate-x-56 lg:-translate-x-64 xl:-translate-x-72 scale-[0.6] sm:scale-[0.7] md:scale-75 opacity-20 sm:opacity-30 blur-[1px] sm:blur-[2px] z-0",
                "-1":
                  "-translate-x-[3.2rem] sm:-translate-x-24 md:-translate-x-32 lg:-translate-x-36 scale-[0.8] sm:scale-[0.85] md:scale-90 opacity-55 sm:opacity-70 z-10",
                "0":
                  "translate-x-0 scale-105 sm:scale-110 md:scale-120 lg:scale-125 z-30",
                "1":
                  "translate-x-[3.2rem] sm:translate-x-24 md:translate-x-32 lg:translate-x-36 scale-[0.8] sm:scale-[0.85] md:scale-90 opacity-55 sm:opacity-70 z-10",
                "2":
                  "translate-x-[5.5rem] sm:translate-x-40 md:translate-x-56 lg:translate-x-64 xl:translate-x-72 scale-[0.6] sm:scale-[0.7] md:scale-75 opacity-20 sm:opacity-30 blur-[1px] sm:blur-[2px] z-0",
              };

              const isActive = diff === 0;

              return (
                <img
                  key={index}
                  src={img}
                  alt={`Slide ${index + 1}`}
                  onClick={() => setActive(index)}
                  className={`absolute w-24 sm:w-36 md:w-44 lg:w-52 xl:w-60 h-36 sm:h-48 md:h-56 lg:h-64 xl:h-72 rounded-xl sm:rounded-2xl object-cover transition-all duration-700 ease-in-out cursor-pointer ${
                    styles[String(diff)] || "hidden"
                  }`}
                  style={{
                    boxShadow: isActive
                      ? `0 0 0 3px ${AMBER}, 0 20px 40px -12px rgba(21,24,28,0.35)`
                      : `0 0 0 2px ${SURFACE}`,
                  }}
                />
              );
            })}
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-3 sm:gap-4 mt-3 sm:mt-5 md:mt-6">
          <button
            onClick={goPrev}
            aria-label="Previous slide"
            className="w-9 h-9 sm:w-10 sm:h-10 md:w-11 md:h-11 rounded-full flex items-center justify-center transition"
            style={{ background: SURFACE, border: `1px solid ${BORDER}`, color: INK }}
          >
            <ChevronLeft size={18} className="sm:w-5 sm:h-5" />
          </button>

          {/* Dots */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={() => setActive(index)}
                aria-label={`Go to slide ${index + 1}`}
                className="rounded-full transition-all duration-300"
                style={{
                  width: active === index ? "22px" : "8px",
                  height: "8px",
                  background: active === index ? AMBER_DARK : "#D8DBD6",
                }}
              />
            ))}
          </div>

          <button
            onClick={goNext}
            aria-label="Next slide"
            className="w-9 h-9 sm:w-10 sm:h-10 md:w-11 md:h-11 rounded-full flex items-center justify-center transition"
            style={{ background: SURFACE, border: `1px solid ${BORDER}`, color: INK }}
          >
            <ChevronRight size={18} className="sm:w-5 sm:h-5" />
          </button>
        </div>
      </section>

      {/* ========== PRODUCTS ========== */}
      <ProductCard />
      <Footer />

      {/* Marquee CSS */}
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 20s linear infinite;
        }
        .animate-marquee:hover {
          animation-play-state: paused;
        }
      `}</style>
    </>
  );
};

export default Home;
