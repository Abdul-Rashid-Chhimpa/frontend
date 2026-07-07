import { useState } from "react";
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  Send,
} from "lucide-react";

const Contact = () => {
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();

    setSuccess(true);

    setTimeout(() => {
      setSuccess(false);
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-7xl mx-auto">

        {/* Heading */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800">
            Contact Pedwal
          </h1>

          <p className="mt-4 text-gray-600 text-lg">
            We'd love to hear from you. Get in touch with our team.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-10">

          {/* Contact Information */}
          <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-xl p-8">

            <h2 className="text-3xl font-bold mb-8 text-gray-800">
              Get In Touch
            </h2>

            <div className="space-y-6">

              {/* Phone */}
              <div className="flex items-start gap-4">
                <div className="bg-blue-100 p-3 rounded-full">
                  <Phone className="text-blue-600" size={22} />
                </div>

                <div>
                  <h3 className="font-semibold text-lg">
                    Phone
                  </h3>

                  <p className="text-gray-600">
                    +91 9876543210
                  </p>
                </div>
              </div>

              {/* Email */}
              <div className="flex items-start gap-4">
                <div className="bg-green-100 p-3 rounded-full">
                  <Mail className="text-green-600" size={22} />
                </div>

                <div>
                  <h3 className="font-semibold text-lg">
                    Email
                  </h3>

                  <p className="text-gray-600">
                    support@pedwal.com
                  </p>
                </div>
              </div>

              {/* Address */}
              <div className="flex items-start gap-4">
                <div className="bg-orange-100 p-3 rounded-full">
                  <MapPin
                    className="text-orange-600"
                    size={22}
                  />
                </div>

                <div>
                  <h3 className="font-semibold text-lg">
                    Office Address
                  </h3>

                  <p className="text-gray-600 leading-7">
                    Pedwal E-Commerce
                    <br />
                    Main Market Road
                    <br />
                    Nagaur, Rajasthan - 341001
                    <br />
                    India
                  </p>
                </div>
              </div>

            </div>

            {/* Working Hours */}
            <div className="mt-10 bg-slate-50 p-5 rounded-2xl border">

              <div className="flex items-center gap-3 mb-3">
                <Clock className="text-indigo-600" />
                <h3 className="font-semibold text-lg">
                  Working Hours
                </h3>
              </div>

              <p className="text-gray-600">
                Monday - Saturday
              </p>

              <p className="text-gray-600">
                9:00 AM - 7:00 PM
              </p>
            </div>

          </div>

          {/* Contact Form */}
          <div className="bg-white rounded-3xl shadow-xl p-8">

            <h2 className="text-3xl font-bold mb-8 text-gray-800">
              Send Message
            </h2>

            {success && (
              <div className="mb-6 bg-green-100 border border-green-500 text-green-700 px-4 py-3 rounded-xl">
                ✅ Message sent successfully!
              </div>
            )}

            <form
              onSubmit={handleSubmit}
              className="space-y-6"
            >

              <div>
                <label className="block mb-2 font-medium">
                  Full Name
                </label>

                <input
                  type="text"
                  required
                  placeholder="Enter your name"
                  className="w-full border rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block mb-2 font-medium">
                  Email Address
                </label>

                <input
                  type="email"
                  required
                  placeholder="Enter your email"
                  className="w-full border rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block mb-2 font-medium">
                  Subject
                </label>

                <input
                  type="text"
                  required
                  placeholder="Message Subject"
                  className="w-full border rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block mb-2 font-medium">
                  Message
                </label>

                <textarea
                  rows="5"
                  required
                  placeholder="Write your message..."
                  className="w-full border rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-xl font-semibold hover:opacity-90 transition"
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