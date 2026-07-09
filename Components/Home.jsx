import ProductCard from './Card';
import Nav from './Nav';
import RandomImg from './RandomImg';

const Home = () => {
    const images = [
  "/images/img1.png",
  "/images/img2.png",
  "/images/img3.png",
  "/images/img4.png",
  "/images/img5.png",
];
    return (
        <>
        <Nav/>
        <RandomImg />
            <div className="w-full overflow-hidden bg-white py-6">
      <div className="flex w-max animate-marquee gap-8">
        {[...images, ...images].map((img, index) => (
          <img
            key={index}
            src={img}
            alt=""
            className="h-16 w-auto sm:h-20 md:h-24 lg:h-28 flex-shrink-0"
          />
        ))}
      </div>
    </div>
        <ProductCard/>
        </>
    );
};

export default Home;
