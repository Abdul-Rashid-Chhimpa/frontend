import {
  MapPin,
  Phone,
  Info,
  CreditCard,
  ExternalLink,
} from "lucide-react";
import {
  FaWhatsapp,
  FaCcVisa,
  FaCcMastercard,
  FaGooglePay,
} from "react-icons/fa";
import {
  SiPaytm,
  SiPhonepe,
  SiRazorpay,
} from "react-icons/si";

const Footer = () => {
  // Google Maps link for Nagaur, Rajasthan
  const mapsUrl =
    "https://www.google.com/maps/search/?api=1&query=Nagaur,+Rajasthan,+India";

  return (
    <footer className="bg-gradient-to-b from-gray-950 via-gray-900 to-black text-white mt-16 sm:mt-20">
      {/* Top Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <h2 className="text-2xl sm:text-3xl font-extrabold mb-3 bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">
              Pedwal Life Creation
            </h2>
            <p className="text-gray-400 leading-relaxed text-sm sm:text-base">
              Premium quality products with trusted service and secure shopping
              experience.
            </p>
          </div>

          {/* About / Quick Links */}
          <div>
            <h3 className="text-base sm:text-lg font-bold mb-4 flex items-center gap-2 text-white">
              <Info size={18} className="text-indigo-400" />
              Quick Links
            </h3>
            <ul className="space-y-2.5">
              {[
                { href: "/", label: "Home" },
                { href: "/", label: "Products" },
                { href: "/orders", label: "My Orders" },
                { href: "/contact", label: "Contact Us" },
              ].map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-gray-400 hover:text-indigo-400 transition text-sm sm:text-base inline-flex items-center gap-1 group"
                  >
                    <span className="w-0 group-hover:w-2 h-0.5 bg-indigo-400 transition-all duration-300 rounded-full" />
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-base sm:text-lg font-bold mb-4 text-white">
              Contact
            </h3>
            <div className="space-y-4">
              {/* WhatsApp */}
              <a
                href="https://wa.me/919887663598"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-3 text-gray-300 hover:text-green-400 transition group"
              >
                <span className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center group-hover:bg-green-500/20 transition">
                  <FaWhatsapp size={22} className="text-green-500" />
                </span>
                <span className="text-sm sm:text-base">+91 9887663598</span>
              </a>

              {/* Phone */}
              <a
                href="tel:+919887663598"
                className="flex items-center gap-3 text-gray-300 hover:text-blue-400 transition group"
              >
                <span className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center group-hover:bg-blue-500/20 transition">
                  <Phone size={18} className="text-blue-400" />
                </span>
                <span className="text-sm sm:text-base">+91 9887663598</span>
              </a>

              {/* Location → Opens Google Maps */}
              <a
                href={mapsUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-start gap-3 text-gray-300 hover:text-red-400 transition group"
              >
                <span className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center group-hover:bg-red-500/20 transition flex-shrink-0">
                  <MapPin size={18} className="text-red-500" />
                </span>
                <span className="text-sm sm:text-base pt-2 flex items-center gap-1">
                  Nagaur, Rajasthan, India
                  <ExternalLink
                    size={12}
                    className="opacity-0 group-hover:opacity-100 transition"
                  />
                </span>
              </a>
            </div>
          </div>

          {/* Payments */}
          <div>
            <h3 className="text-base sm:text-lg font-bold mb-4 flex items-center gap-2 text-white">
              <CreditCard size={18} className="text-indigo-400" />
              Payment Methods
            </h3>
            <div className="grid grid-cols-3 gap-3 sm:gap-4">
              {[
                { Icon: FaCcVisa, color: "text-blue-500", label: "Visa" },
                { Icon: FaCcMastercard, color: "text-orange-500", label: "Mastercard" },
                { Icon: FaGooglePay, color: "text-green-500", label: "GPay" },
                { Icon: SiPhonepe, color: "text-purple-500", label: "PhonePe" },
                { Icon: SiPaytm, color: "text-sky-400", label: "Paytm" },
                { Icon: SiRazorpay, color: "text-blue-400", label: "Razorpay" },
              ].map(({ Icon, color, label }) => (
                <div
                  key={label}
                  className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 hover:scale-105 transition"
                  title={label}
                >
                  <Icon className={`text-2xl sm:text-3xl ${color}`} />
                </div>
              ))}
            </div>
            <p className="text-gray-500 mt-4 text-xs sm:text-sm flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              100% Secure Payments
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-5 flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
          <p className="text-gray-500 text-xs sm:text-sm">
            © {new Date().getFullYear()}{" "}
            <span className="font-semibold bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">
              Pedwal Life Creation
            </span>
            . All Rights Reserved.
          </p>
          <p className="text-gray-600 text-[11px] sm:text-xs">
            Made with care in Rajasthan
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
