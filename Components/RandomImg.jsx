import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect } from "react";



const images = [
  "02.jpeg",
  "03.jpg",
  "04.jpg",
  "05.jpg",
];

const RandomImg = () => {
  const [current, setCurrent] = useState(
    Math.floor(Math.random() * images.length)
  );

  const nextImage = () => {
    setCurrent((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrent((prev) => (prev - 1 + images.length) % images.length);
  };
  useEffect(() => {
  const interval = setInterval(() => {
    nextImage();
  }, 4000);

  return () => clearInterval(interval);
}, []);

  return (
    <div className="relative w-full max-w-5xl mx-auto mt-20">
      {/* Image */}
      <div className="  overflow-hidden rounded-2xl">
        <img
          key={current}
          src={images[current]}
          alt="Random"
          className="w-full h-64 sm:h-80 md:h-[450px] object-contain animate-fade"
        />
      </div>

      {/* Left Arrow */}
      <button
        onClick={prevImage}
        className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 bg-black/50 text-white p-3 rounded-full hover:bg-black/80 transition"
      >
        <ChevronLeft size={24} />
      </button>

      {/* Right Arrow */}
      <button
        onClick={nextImage}
        className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 bg-black/50 text-white p-3 rounded-full hover:bg-black/80 transition"
      >
        <ChevronRight size={24} />
      </button>

      {/* Dots */}
      <div className="flex justify-center gap-2 mt-4">
        {images.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrent(index)}
            className={`h-3 w-3 rounded-full transition ${
              current === index ? "bg-green-600" : "bg-gray-400"
            }`}
          />
        ))}
      </div>

      <style>
        {`
          @keyframes fade {
            from {
              opacity: 0;
              transform: scale(1.05);
            }
            to {
              opacity: 1;
              transform: scale(1);
            }
          }

          .animate-fade {
            animation: fade 0.5s ease-in-out;
          }
        `}
      </style>
    </div>
  );
};

export default RandomImg;