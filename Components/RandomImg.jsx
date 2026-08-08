import { useState, useEffect } from "react";

const images = ["02.jpeg", "03.jpg", "04.jpg", "05.jpg"];

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

  return (
    <div className="w-full mt-6 sm:mt-8 md:mt-10">
      {/* Banner */}
      <div className="w-full max-w-6xl mx-auto px-3 sm:px-4">
        <div className="w-full bg-gray-100 rounded-xl sm:rounded-2xl overflow-hidden flex items-center justify-center
                        h-[200px] sm:h-[280px] md:h-[360px] lg:h-[420px] xl:h-[480px]">
          <img
            key={current}
            src={images[current]}
            alt="Banner"
            className="max-w-full max-h-full w-auto h-auto object-contain animate-fade"
          />
        </div>
      </div>

      {/* Dots */}
      <div className="flex justify-center gap-2 mt-4 sm:mt-5">
        {images.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrent(index)}
            className={`transition-all duration-300 rounded-full
              ${
                current === index
                  ? "w-8 h-3 bg-green-600"
                  : "w-3 h-3 bg-gray-400 hover:bg-gray-500"
              }`}
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
