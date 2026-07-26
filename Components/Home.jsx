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
      <div className="w-full overflow-hidden mt-8 sm:mt-12 py-3 sm:py-5 bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 border-y border-indigo-100/60">
        <div className="inline-block whitespace-nowrap animate-marquee">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight">
            <span className="text-gray-800">Welcome To </span>
            <span className="bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-600 bg-clip-text text-transparent">
              Pedwal Life Creation
            </span>
            <span className="text-gray-400 mx-6 sm:mx-10">•</span>
            <span className="text-gray-800">Welcome To </span>
            <span className="bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-600 bg-clip-text text-transparent">
              Pedwal Life Creation
            </span>
          </h2>
        </div>
      </div>

      {/* ========== 3D STYLE IMAGE CAROUSEL ========== */}
      <section className="w-full py-10 sm:py-14 md:py-16 overflow-hidden bg-white relative">
        {/* Soft background glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[280px] sm:w-[420px] h-[280px] sm:h-[420px] rounded-full bg-indigo-100/40 blur-3xl" />
        </div>

        <div className="relative flex justify-center items-center h-[260px] sm:h-[320px] md:h-[380px]">
          {images.map((img, index) => {
            let diff = index - active;
            if (diff > 2) diff -= images.length;
            if (diff < -2) diff += images.length;

            const styles = {
              "-2":
                "-translate-x-[7.5rem] sm:-translate-x-64 md:-translate-x-72 scale-[0.65] sm:scale-75 opacity-25 sm:opacity-30 blur-[1px] sm:blur-[2px] z-0",
              "-1":
                "-translate-x-[4rem] sm:-translate-x-32 md:-translate-x-36 scale-[0.85] sm:scale-90 opacity-60 sm:opacity-70 z-10",
              "0":
                "translate-x-0 scale-110 sm:scale-125 z-30 shadow-2xl",
              "1":
                "translate-x-[4rem] sm:translate-x-32 md:translate-x-36 scale-[0.85] sm:scale-90 opacity-60 sm:opacity-70 z-10",
              "2":
                "translate-x-[7.5rem] sm:translate-x-64 md:translate-x-72 scale-[0.65] sm:scale-75 opacity-25 sm:opacity-30 blur-[1px] sm:blur-[2px] z-0",
            };

            return (
              <img
                key={index}
                src={img}
                alt={`Slide ${index + 1}`}
                onClick={() => setActive(index)}
                className={`absolute w-28 sm:w-40 md:w-52 lg:w-60 h-40 sm:h-52 md:h-64 lg:h-72 rounded-xl sm:rounded-2xl object-cover transition-all duration-700 ease-in-out cursor-pointer ring-2 ring-white/80 ${
                  styles[String(diff)] || "hidden"
                }`}
              />
            );
          })}
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-4 mt-4 sm:mt-6">
          <button
            onClick={goPrev}
            className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white border border-gray-200 shadow-md flex items-center justify-center text-gray-700 hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-600 transition"
          >
            <ChevronLeft size={20} />
          </button>

          {/* Dots */}
          <div className="flex items-center gap-2">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={() => setActive(index)}
                className={`rounded-full transition-all duration-300 ${
                  active === index
                    ? "w-6 h-2.5 bg-indigo-600"
                    : "w-2.5 h-2.5 bg-gray-300 hover:bg-gray-400"
                }`}
              />
            ))}
          </div>

          <button
            onClick={goNext}
            className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white border border-gray-200 shadow-md flex items-center justify-center text-gray-700 hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-600 transition"
          >
            <ChevronRight size={20} />
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
          animation: marquee 18s linear infinite;
        }
        .animate-marquee:hover {
          animation-play-state: paused;
        }
      `}</style>
    </>
  );
};

export default Home;
