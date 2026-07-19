import {
  MapPin,
  Phone,
  Info,
  CreditCard,
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
  return (
    <footer className="bg-gray-950 text-white mt-20">

      {/* Top */}
      <div className="max-w-7xl mx-auto px-6 py-12 grid md:grid-cols-4 gap-10">

        {/* Brand */}
        <div>
          <h2
            className="text-3xl font-extrabold mb-4"
            style={{
              background:
                "linear-gradient(90deg,#ff6a88,#ff99ac,#a18cd1,#6a11cb)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Pedwal Life Creation
          </h2>

          <p className="text-gray-300 leading-7">
            Premium quality products with trusted
            service and secure shopping experience.
          </p>
        </div>

        {/* About */}
        <div>
          <h3 className="text-xl font-bold mb-5 flex items-center gap-2">
            <Info size={20} />
            About
          </h3>

          <ul className="space-y-3 flex flex-col text-gray-300">
            <a href="/" className="hover:text-green-400 duration-300">
              Home
            </a>
            <a href="/" className="hover:text-green-400 duration-300">
              Products
            </a>
            <a href="/orders" className="hover:text-green-400 duration-300">
              My Orders
            </a>
            <a href="/contact" className="hover:text-green-400 duration-300">
              Contact Us
            </a>
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h3 className="text-xl font-bold mb-5">
            Contact
          </h3>

          <div className="space-y-4">

            <a
              href="https://wa.me/919887663598"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-3 hover:text-green-400 duration-300"
            >
              <FaWhatsapp
                size={28}
                className="text-green-500"
              />

              +91 9887663598
            </a>

            <div className="flex gap-3">
              <Phone className="text-blue-400" />
              <span>+91 9887663598</span>
            </div>

            <div className="flex gap-3">
              <MapPin className="text-red-500" />

              <span>
                Nagaur, Rajasthan,
                India
              </span>
            </div>

          </div>
        </div>

        {/* Payments */}
        <div>
          <h3 className="text-xl font-bold mb-5 flex gap-2 items-center">
            <CreditCard size={20} />
            Payment Methods
          </h3>

          <div className="grid grid-cols-3 gap-5 text-4xl">

            <FaCcVisa className="text-blue-500" />

            <FaCcMastercard className="text-orange-500" />

            <FaGooglePay className="text-green-500" />

            <SiPhonepe className="text-purple-500" />

            <SiPaytm className="text-sky-400" />

            <SiRazorpay className="text-blue-400" />

          </div>

          <p className="text-gray-400 mt-5 text-sm">
            100% Secure Payments
          </p>

        </div>

      </div>

      {/* Bottom */}
      <div className="border-t border-gray-800 py-5 text-center px-4">

        <p className="text-gray-400 text-sm">

          © {new Date().getFullYear()}{" "}

          <span
            className="font-bold"
            style={{
              background:
                "linear-gradient(90deg,#ff6a88,#ff99ac,#a18cd1,#6a11cb)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Pedwal Life Creation
          </span>

          {" "}All Rights Reserved.

        </p>

      </div>

    </footer>
  );
};

export default Footer;