import { useState, useEffect } from "react";

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

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % images.length);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full mt-10">

      {/* Banner */}

      <div className="w-full overflow-hidden rounded-xl">

        <img
          key={current}
          src={images[current]}
          alt="Banner"
          className="w-full h-[220px] sm:h-[320px] md:h-[450px] lg:h-[550px] object-cover animate-fade"
        />

      </div>

      {/* Dots */}

      <div className="flex justify-center gap-2 mt-5">

        {images.map((_, index) => (

          <button
            key={index}
            onClick={() => setCurrent(index)}
            className={`transition-all duration-300 rounded-full
              ${
                current === index
                  ? "w-8 h-3 bg-green-600"
                  : "w-3 h-3 bg-gray-400"
              }`}
          />

        ))}

      </div>

      <style>
        {`
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
            animation: fade .7s ease-in-out;
          }
        `}
      </style>

    </div>
  );
};

export default RandomImg;
