import { useState } from "react";
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  Send,
  CheckCircle,
  ExternalLink,
} from "lucide-react";

const Contact = () => {
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  };

  const mapsUrl =
    "https://www.google.com/maps/search/?api=1&query=Nagaur,+Rajasthan,+341001,+India";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-50 py-8 sm:py-12 px-3 sm:px-6">
      <div className="max-w-6xl mx-auto">
        {/* Heading */}
        <div className="text-center mb-10 sm:mb-12">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold bg-gradient-to-r from-indigo-700 via-purple-600 to-blue-600 bg-clip-text text-transparent">
            Contact Pedwal
          </h1>
          <p className="mt-3 text-gray-500 text-sm sm:text-lg max-w-xl mx-auto">
            We'd love to hear from you. Get in touch with our team.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6 sm:gap-8">
          {/* ========== CONTACT INFO ========== */}
          <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl border border-gray-100 p-5 sm:p-8">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6 sm:mb-8">
              Get In Touch
            </h2>

            <div className="space-y-5">
              {/* Phone */}
              <a
                href="tel:+919251113598"
                className="flex items-start gap-4 p-3 sm:p-4 rounded-2xl hover:bg-blue-50 transition group"
              >
                <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-200 transition">
                  <Phone className="text-blue-600" size={20} />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-sm sm:text-base">
                    Phone
                  </h3>
                  <p className="text-gray-600 text-sm sm:text-base mt-0.5">
                    +91 9876543210
                  </p>
                </div>
              </a>

              {/* Email */}
              <a
                href="mailto:support@pedwal.com"
                className="flex items-start gap-4 p-3 sm:p-4 rounded-2xl hover:bg-emerald-50 transition group"
              >
                <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-emerald-100 flex items-center justify-center flex-shrink-0 group-hover:bg-emerald-200 transition">
                  <Mail className="text-emerald-600" size={20} />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-sm sm:text-base">
                    Email
                  </h3>
                  <p className="text-gray-600 text-sm sm:text-base mt-0.5">
                    support@pedwal.com
                  </p>
                </div>
              </a>

              {/* Address → Google Maps */}
              <a
                href={mapsUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-start gap-4 p-3 sm:p-4 rounded-2xl hover:bg-orange-50 transition group"
              >
                <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-orange-100 flex items-center justify-center flex-shrink-0 group-hover:bg-orange-200 transition">
                  <MapPin className="text-orange-600" size={20} />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-sm sm:text-base flex items-center gap-1">
                    Office Address
                    <ExternalLink
                      size={12}
                      className="opacity-0 group-hover:opacity-100 transition text-orange-500"
                    />
                  </h3>
                  <p className="text-gray-600 text-sm sm:text-base mt-0.5 leading-relaxed">
                    Pedwal E-Commerce
                    <br />
                    Main Market Road
                    <br />
                    Nagaur, Rajasthan - 341001
                    <br />
                    India
                  </p>
                </div>
              </a>
            </div>

            {/* Working Hours */}
            <div className="mt-8 p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100">
              <div className="flex items-center gap-2.5 mb-2">
                <Clock className="text-indigo-600" size={18} />
                <h3 className="font-semibold text-gray-900 text-sm sm:text-base">
                  Working Hours
                </h3>
              </div>
              <p className="text-gray-600 text-sm">Monday - Saturday</p>
              <p className="text-gray-800 font-medium text-sm sm:text-base">
                9:00 AM - 7:00 PM
              </p>
            </div>
          </div>

          {/* ========== CONTACT FORM ========== */}
          <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl border border-gray-100 p-5 sm:p-8">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6 sm:mb-8">
              Send Message
            </h2>

            {success && (
              <div className="mb-5 flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-xl text-sm font-medium">
                <CheckCircle size={18} />
                Message sent successfully!
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block mb-1.5 text-sm font-medium text-gray-700">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="Enter your name"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition"
                />
              </div>

              <div>
                <label className="block mb-1.5 text-sm font-medium text-gray-700">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  placeholder="Enter your email"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition"
                />
              </div>

              <div>
                <label className="block mb-1.5 text-sm font-medium text-gray-700">
                  Subject
                </label>
                <input
                  type="text"
                  required
                  placeholder="Message Subject"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition"
                />
              </div>

              <div>
                <label className="block mb-1.5 text-sm font-medium text-gray-700">
                  Message
                </label>
                <textarea
                  rows="5"
                  required
                  placeholder="Write your message..."
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 hover:from-indigo-700 hover:via-purple-700 hover:to-blue-700 text-white py-3.5 rounded-xl font-semibold shadow-lg transition text-sm sm:text-base"
              >
                <Send size={18} />
                Send Message
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
