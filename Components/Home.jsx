import ProductCard from './Card';
import Nav from './Nav';
import RandomImg from './RandomImg';

const Home = () => {
    
    return (
        <>
        <Nav/>
        <RandomImg />
            <div className="overflow-hidden">
  <div className="coverflow">
            <div className="flex items-center justify-center gap-4 py-10 overflow-hidden">
  <img
    src="01.jpeg"
    className="w-20 sm:w-24 opacity-50 scale-75 transition-all duration-500"
  />

  <img
    src="02.jpeg"
    className="w-28 sm:w-36 opacity-80 scale-90 transition-all duration-500"
  />

  <img
    src="03.jpg"
    className="w-40 sm:w-52 md:w-60 scale-110 drop-shadow-2xl transition-all duration-500 z-10"
  />

  <img
    src="04.jpg"
    className="w-28 sm:w-36 opacity-80 scale-90 transition-all duration-500"
  />

  <img
    src="05.jpg"
    className="w-20 sm:w-24 opacity-50 scale-75 transition-all duration-500"
  />
</div>
      </div>
                </div>
        <ProductCard/>
        </>
    );
};

export default Home;
