import { useEffect, useState } from "react";
import ProductCard from "./Card";
import Nav from "./Nav";
import RandomImg from "./RandomImg";
import Footer from "./Footer";
import { ChevronLeft, ChevronRight } from "lucide-react";

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
      <div className="w-full overflow-hidden mt-6 sm:mt-8 md:mt-10 lg:mt-12 py-3 sm:py-4 md:py-5 bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 border-y border-indigo-100/60">
        <div className="inline-block whitespace-nowrap animate-marquee">
          <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-extrabold tracking-tight px-4">
            <span className="text-gray-800">Welcome To </span>
            <span className="bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-600 bg-clip-text text-transparent">
              Pedwal Life Creation
            </span>
            <span className="text-gray-400 mx-4 sm:mx-6 md:mx-8 lg:mx-10">•</span>
            <span className="text-gray-800">Welcome To </span>
            <span className="bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-600 bg-clip-text text-transparent">
              Pedwal Life Creation
            </span>
            <span className="text-gray-400 mx-4 sm:mx-6 md:mx-8 lg:mx-10">•</span>
            <span className="text-gray-800">Welcome To </span>
            <span className="bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-600 bg-clip-text text-transparent">
              Pedwal Life Creation
            </span>
          </h2>
        </div>
      </div>

      {/* ========== 3D STYLE IMAGE CAROUSEL ========== */}
      <section className="w-full py-8 sm:py-12 md:py-14 lg:py-16 overflow-hidden bg-white relative">
        {/* Soft background glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200px] sm:w-[320px] md:w-[420px] lg:w-[500px] h-[200px] sm:h-[320px] md:h-[420px] lg:h-[500px] rounded-full bg-indigo-100/40 blur-3xl" />
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
                  "translate-x-0 scale-105 sm:scale-110 md:scale-120 lg:scale-125 z-30 shadow-2xl",
                "1":
                  "translate-x-[3.2rem] sm:translate-x-24 md:translate-x-32 lg:translate-x-36 scale-[0.8] sm:scale-[0.85] md:scale-90 opacity-55 sm:opacity-70 z-10",
                "2":
                  "translate-x-[5.5rem] sm:translate-x-40 md:translate-x-56 lg:translate-x-64 xl:translate-x-72 scale-[0.6] sm:scale-[0.7] md:scale-75 opacity-20 sm:opacity-30 blur-[1px] sm:blur-[2px] z-0",
              };

              return (
                <img
                  key={index}
                  src={img}
                  alt={`Slide ${index + 1}`}
                  onClick={() => setActive(index)}
                  className={`absolute w-24 sm:w-36 md:w-44 lg:w-52 xl:w-60 h-36 sm:h-48 md:h-56 lg:h-64 xl:h-72 rounded-xl sm:rounded-2xl object-cover transition-all duration-700 ease-in-out cursor-pointer ring-2 ring-white/80 ${
                    styles[String(diff)] || "hidden"
                  }`}
                />
              );
            })}
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-3 sm:gap-4 mt-3 sm:mt-5 md:mt-6">
          <button
            onClick={goPrev}
            className="w-9 h-9 sm:w-10 sm:h-10 md:w-11 md:h-11 rounded-full bg-white border border-gray-200 shadow-md flex items-center justify-center text-gray-700 hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-600 transition"
          >
            <ChevronLeft size={18} className="sm:w-5 sm:h-5" />
          </button>

          {/* Dots */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={() => setActive(index)}
                className={`rounded-full transition-all duration-300 ${
                  active === index
                    ? "w-5 sm:w-6 h-2 sm:h-2.5 bg-indigo-600"
                    : "w-2 sm:w-2.5 h-2 sm:h-2.5 bg-gray-300 hover:bg-gray-400"
                }`}
              />
            ))}
          </div>

          <button
            onClick={goNext}
            className="w-9 h-9 sm:w-10 sm:h-10 md:w-11 md:h-11 rounded-full bg-white border border-gray-200 shadow-md flex items-center justify-center text-gray-700 hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-600 transition"
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
