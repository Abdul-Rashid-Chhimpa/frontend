const About = () => {
  return (
    <div className="bg-gray-100 min-h-screen py-12 px-4">
      <div className="max-w-7xl mx-auto bg-white rounded-3xl shadow-xl overflow-hidden">

        {/* Hero Section */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-10 md:p-16 text-center">
          <h1 className="text-4xl md:text-6xl font-bold">
            PEDWAL 
          </h1>
          <p className="mt-4 text-lg md:text-xl opacity-90">
            Your Trusted E-Commerce Destination
          </p>
        </div>

        {/* Owner Section */}
        <div className="flex flex-col md:flex-row items-center gap-8 p-8 md:p-12">
          <div className="w-48 h-48 overflow-hidden rounded-full border-4 border-blue-500 shadow-lg">
            <img
              src="/logowithqoute.png
              alt="Owner img"
              className="w-full h-full object-cover"
            />
          </div>

          <div className="flex-1 text-center md:text-left">
            <h2 className="text-3xl font-bold text-gray-800">
              Mohammed Aarif Ansari
            </h2>

            <p className="text-blue-600 font-semibold mt-2">
              Founder & CEO, Pedwal
            </p>

            <p className="text-gray-600 mt-4 leading-7">
              Pedwal was founded with a vision to provide customers
              with high-quality products, affordable prices, and a
              seamless shopping experience. We believe in customer
              satisfaction, innovation, and long-term trust.
            </p>
          </div>
        </div>

        {/* About Company */}
        <div className="px-8 md:px-12 pb-12">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">
            About Our Company
          </h2>

          <p className="text-gray-600 text-lg leading-8 text-center max-w-4xl mx-auto">
            Welcome to Pedwal, your trusted destination for quality
            products and hassle-free online shopping. Our mission is
            to bring premium products at competitive prices while
            maintaining excellent customer service and satisfaction.
          </p>

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-6 mt-12">
            <div className="bg-blue-50 p-6 rounded-2xl text-center hover:shadow-lg transition">
              <h3 className="text-xl font-bold text-gray-800 mb-3">
                Quality Products
              </h3>
              <p className="text-gray-600">
                Carefully selected products that meet high quality
                standards.
              </p>
            </div>

            <div className="bg-green-50 p-6 rounded-2xl text-center hover:shadow-lg transition">
              <h3 className="text-xl font-bold text-gray-800 mb-3">
                Fast Delivery
              </h3>
              <p className="text-gray-600">
                Reliable and timely delivery to your doorstep.
              </p>
            </div>

            <div className="bg-orange-50 p-6 rounded-2xl text-center hover:shadow-lg transition">
              <h3 className="text-xl font-bold text-gray-800 mb-3">
                24/7 Support
              </h3>
              <p className="text-gray-600">
                Dedicated support team ready to help anytime.
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12">
            <div className="text-center">
              <h3 className="text-3xl font-bold text-blue-600">1000+</h3>
              <p className="text-gray-600">Products</p>
            </div>

            <div className="text-center">
              <h3 className="text-3xl font-bold text-green-600">500+</h3>
              <p className="text-gray-600">Happy Customers</p>
            </div>

            <div className="text-center">
              <h3 className="text-3xl font-bold text-orange-600">50+</h3>
              <p className="text-gray-600">Brands</p>
            </div>

            <div className="text-center">
              <h3 className="text-3xl font-bold text-purple-600">24/7</h3>
              <p className="text-gray-600">Support</p>
            </div>
          </div>

          {/* Mission */}
          <div className="mt-14 bg-gray-50 rounded-2xl p-8 text-center">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              Our Mission
            </h2>

            <p className="text-gray-600 text-lg leading-8">
              To become one of the most trusted e-commerce platforms by
              delivering quality products, transparent pricing, fast
              shipping, and exceptional customer experiences.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
