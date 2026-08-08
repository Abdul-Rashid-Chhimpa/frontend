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
      <div className="w-full max-w-7xl mx-auto px-3 sm:px-4">
        <div className="relative w-full overflow-hidden rounded-xl sm:rounded-2xl bg-gray-100 aspect-[16/7] sm:aspect-[16/6] md:aspect-[21/8] lg:aspect-[21/7]">
          <img
            key={current}
            src={images[current]}
            alt="Banner"
            className="absolute inset-0 w-full h-full object-cover animate-fade"
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
            transform: scale(1.04);
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

export default RandomImg;
