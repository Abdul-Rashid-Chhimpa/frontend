import { useEffect, useState } from "react";
import ProductCard from './Card';
import Nav from './Nav';
import RandomImg from './RandomImg';

const Home = () => {
    const images = [
  "01.jpeg",
  "02.jpeg",
  "03.jpg",
  "04.jpg",
  "05.jpg",
];

    const [active, setActive] = useState(2);

  useEffect(() => {
    const timer = setInterval(() => {
      setActive((prev) => (prev + 1) % images.length);
    }, 2500);

    return () => clearInterval(timer);
  }, []);
    return (
        <>
        <Nav/>
        <RandomImg />

<div className="w-full mt-20 mb-20 px-4">
  <div className="max-w-7xl mx-auto text-center">

    <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold">

      <span className="text-gray-800">
        Welcome To{" "}
      </span>

      <span
        style={{
          background:
            "linear-gradient(90deg,#ff6a88,#ff99ac,#a18cd1,#6a11cb)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
          color: "transparent",
        }}
      >
        Pedwal Life Creation
      </span>

    </h2>

  </div>
</div>

            
            <section className="w-full py-16 overflow-hidden bg-white">
      <div className="relative flex justify-center items-center h-[340px]">

        {images.map((img, index) => {
          let diff = index - active;

          if (diff > 2) diff -= images.length;
          if (diff < -2) diff += images.length;

          const styles = {
            "-2":
              "-translate-x-72 scale-75 opacity-30 blur-[2px] z-0",
            "-1":
              "-translate-x-36 scale-90 opacity-70 z-10",
            "0":
              "translate-x-0 scale-125 z-30 shadow-2xl",
            "1":
              "translate-x-36 scale-90 opacity-70 z-10",
            "2":
              "translate-x-72 scale-75 opacity-30 blur-[2px] z-0",
          };

          return (
            <img
              key={index}
              src={img}
              alt=""
              className={`absolute w-36 sm:w-44 md:w-56 lg:w-64 rounded-2xl object-cover transition-all duration-700 ease-in-out ${
                styles[diff] || "hidden"
              }`}
            />
          );
        })}
      </div>
    </section>
        <ProductCard/>
        </>
    );
};

export default Home;
