import {
  Package,
  Truck,
  Headphones,
  Target,
  User,
  Code2,
  Phone,
  ExternalLink,
} from "lucide-react";

const About = () => {
  const features = [
    {
      title: "Quality Products",
      desc: "Carefully selected products that meet high quality standards.",
      icon: <Package size={24} />,
      color: "from-blue-500 to-indigo-600",
      bg: "bg-blue-50",
      text: "text-blue-600",
    },
    {
      title: "Fast Delivery",
      desc: "Reliable and timely delivery to your doorstep.",
      icon: <Truck size={24} />,
      color: "from-emerald-500 to-green-600",
      bg: "bg-emerald-50",
      text: "text-emerald-600",
    },
    {
      title: "24/7 Support",
      desc: "Dedicated support team ready to help anytime.",
      icon: <Headphones size={24} />,
      color: "from-orange-500 to-amber-600",
      bg: "bg-orange-50",
      text: "text-orange-600",
    },
  ];

  const stats = [
    { value: "1000+", label: "Products", color: "text-blue-600" },
    { value: "500+", label: "Happy Customers", color: "text-emerald-600" },
    { value: "50+", label: "Brands", color: "text-orange-600" },
    { value: "24/7", label: "Support", color: "text-purple-600" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-50 py-8 sm:py-12 px-3 sm:px-6">
      <div className="max-w-6xl mx-auto">
        {/* Hero */}
        <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 text-white p-8 sm:p-12 md:p-16 text-center shadow-xl mb-8">
          <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/10" />
          <div className="absolute -bottom-8 -left-8 w-28 h-28 rounded-full bg-white/10" />
          <h1 className="relative text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight">
            PEDWAL
          </h1>
          <p className="relative mt-3 sm:mt-4 text-base sm:text-xl text-white/90">
            Your Trusted E-Commerce Destination
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
          {/* Owner Section */}
          <div className="flex flex-col md:flex-row items-center gap-6 sm:gap-8 p-6 sm:p-10 md:p-12">
            <div className="w-36 h-36 sm:w-44 sm:h-44 overflow-hidden rounded-full border-4 border-indigo-500 shadow-lg flex-shrink-0 bg-gray-50">
              <img
                src="/logowithqoute.png"
                alt="Founder"
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src =
                    "https://via.placeholder.com/200?text=Founder";
                }}
              />
            </div>
            <div className="flex-1 text-center md:text-left">
              <div className="inline-flex items-center gap-2 text-indigo-600 text-sm font-medium mb-1">
                <User size={16} />
                Founder & CEO
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
                Mohammed Aarif Ansari
              </h2>
              <p className="text-indigo-600 font-semibold mt-1">
                Founder & CEO, Pedwal
              </p>
              <p className="text-gray-600 mt-4 leading-relaxed text-sm sm:text-base">
                Pedwal was founded with a vision to provide customers with
                high-quality products, affordable prices, and a seamless
                shopping experience. We believe in customer satisfaction,
                innovation, and long-term trust.
              </p>
            </div>
          </div>

          {/* About Company */}
          <div className="px-6 sm:px-10 md:px-12 pb-10 sm:pb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-center text-gray-900 mb-4 sm:mb-6">
              About Our Company
            </h2>
            <p className="text-gray-600 text-sm sm:text-lg leading-relaxed text-center max-w-3xl mx-auto">
              Welcome to Pedwal, your trusted destination for quality products
              and hassle-free online shopping. Our mission is to bring premium
              products at competitive prices while maintaining excellent
              customer service and satisfaction.
            </p>

            {/* Features */}
            <div className="grid sm:grid-cols-3 gap-4 sm:gap-6 mt-10">
              {features.map((f) => (
                <div
                  key={f.title}
                  className={`${f.bg} p-5 sm:p-6 rounded-2xl text-center hover:shadow-lg hover:-translate-y-1 transition-all duration-300`}
                >
                  <div
                    className={`w-12 h-12 mx-auto rounded-xl bg-gradient-to-br ${f.color} text-white flex items-center justify-center mb-4 shadow-md`}
                  >
                    {f.icon}
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    {f.title}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {f.desc}
                  </p>
                </div>
              ))}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mt-10 sm:mt-12">
              {stats.map((s) => (
                <div
                  key={s.label}
                  className="text-center p-4 rounded-2xl bg-gray-50 border border-gray-100"
                >
                  <h3 className={`text-2xl sm:text-3xl font-extrabold ${s.color}`}>
                    {s.value}
                  </h3>
                  <p className="text-gray-500 text-xs sm:text-sm mt-1">
                    {s.label}
                  </p>
                </div>
              ))}
            </div>

            {/* Mission */}
            <div className="mt-10 sm:mt-12 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-6 sm:p-8 text-center border border-indigo-100">
              <div className="inline-flex items-center gap-2 text-indigo-600 mb-3">
                <Target size={20} />
                <span className="font-semibold text-sm uppercase tracking-wide">
                  Our Mission
                </span>
              </div>
              <p className="text-gray-700 text-sm sm:text-lg leading-relaxed max-w-3xl mx-auto">
                To become one of the most trusted e-commerce platforms by
                delivering quality products, transparent pricing, fast shipping,
                and exceptional customer experiences.
              </p>
            </div>
          </div>
        </div>

        {/* ========== WEBSITE DESIGNER CREDIT ========== */}
        <div className="mt-8 bg-white rounded-2xl sm:rounded-3xl shadow-xl border border-gray-100 p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row items-center gap-5 sm:gap-6">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 text-white flex items-center justify-center flex-shrink-0 shadow-lg">
              <Code2 size={32} />
            </div>

            <div className="flex-1 text-center sm:text-left">
              <p className="text-xs sm:text-sm text-indigo-600 font-semibold uppercase tracking-wide mb-1">
                Website Designed & Developed By
              </p>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900">
                Abdul Rashid Chhimpa
              </h3>
              <p className="text-gray-500 text-sm sm:text-base mt-0.5">
                Software Engineer
              </p>
              <p className="text-gray-600 text-sm mt-2 max-w-lg">
                Looking for a unique website design? Get in touch for custom
                web development, e-commerce stores, and modern UI/UX solutions.
              </p>
            </div>

            <a
              href="tel:+918094344243"
              className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-5 py-3 rounded-xl font-semibold text-sm shadow-md transition flex-shrink-0"
            >
              <Phone size={16} />
              8094344243
              <ExternalLink size={14} className="opacity-70" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
