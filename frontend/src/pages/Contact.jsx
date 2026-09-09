import { assets } from "../assets/assets";
import { FaMapMarkerAlt, FaPhoneAlt, FaEnvelope, FaBriefcase } from "react-icons/fa";

const Contact = () => {
  return (
    <div className="w-full bg-gray-50 mb-16 md:mb-24">
      {/* Main Content Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16">
        <div className="grid lg:grid-cols-5 gap-12">
          {/* Left Column: Banner and Form Cards */}
          <div className="lg:col-span-3 order-2 lg:order-1 flex flex-col space-y-6">
            {/* Banner Card */}
            <div className="rounded-2xl bg-gray-500 p-6 text-left shadow-lg sm:p-10">
              <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">Connect With Us</h1>
              <p className="mt-3 text-base text-gray-200 max-w-2xl">
                Have a question or want to collaborate? Reach out, and let's make something amazing happen!
              </p>
            </div>

            {/* Form Card */}
            <form
              onSubmit={(e) => e.preventDefault()}
              className="flex flex-1 flex-col space-y-6 rounded-2xl bg-white p-6 shadow-lg sm:p-10"
            >
              <h2 className="text-2xl font-bold text-gray-900">Send Us a Message</h2>
              <div className="grid sm:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name
                  </label>
                  <input
                    id="name"
                    type="text"
                    placeholder="Your name"
                    required
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm transition"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                    <input
                      id="email"
                      type="email"
                      placeholder="Your email"
                      required
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm transition"
                    />
                </div>
              </div>

              <div className="flex-1">
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                  Message
                </label>
                <textarea
                  id="message"
                  rows="6"
                  placeholder="Tell us how we can help..."
                  required
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm resize-none transition h-full"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-indigo-600 text-white py-3 rounded-full font-semibold hover:bg-indigo-700 transition duration-300 text-sm"
              >
                Submit Message
              </button>
            </form>
          </div>

          {/* Right Column: Contact Info Card */}
          <div className="lg:col-span-2 order-1 lg:order-2">
            <div className="sticky top-8 flex h-full flex-col space-y-8 rounded-2xl bg-white p-6 shadow-lg sm:p-8">
              <div className="flex items-start space-x-4">
                <FaMapMarkerAlt className="text-indigo-600 text-xl mt-1" />
                <div className="min-w-0">
                  <h3 className="text-lg font-semibold text-gray-900">Our Office</h3>
                  <p className="text-gray-600 text-sm">
                    54709 Willms Station, Suite 350<br />Washington, USA
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <FaPhoneAlt className="text-indigo-600 text-xl mt-1" />
                <div className="min-w-0">
                  <h3 className="text-lg font-semibold text-gray-900">Contact Us</h3>
                  <p className="text-gray-600 text-sm">
                    <a href="tel:+14155550132" className="text-blue-500 hover:underline">
                      (415) 555-0132
                    </a>
                    <br />
                    <a href="mailto:doctorAppointment@gmail.com" className="break-all text-indigo-600 hover:underline">
                      doctorAppointment@gmail.com
                    </a>
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <FaBriefcase className="text-indigo-600 text-xl mt-1" />
                <div className="min-w-0">
                  <h3 className="text-lg font-semibold text-gray-900">Careers</h3>
                  <p className="text-gray-600 text-sm">
                    Passionate about healthcare? Join our innovative team.
                  </p>
                  <a
                    href="/careers"
                    className="inline-block mt-3 bg-indigo-600 text-white px-5 py-2 rounded-full text-sm font-medium hover:bg-indigo-700 transition"
                  >
                    View Open Roles
                  </a>
                </div>
              </div>

              <img
                src={assets.contact_image}
                alt="Healthcare professional"
                className="w-full rounded-lg shadow-md mt-auto"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
