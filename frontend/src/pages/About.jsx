import { assets } from "../assets/assets";
import { FaBolt, FaMapMarkerAlt, FaUserCheck } from "react-icons/fa";

const About = () => {
  return (
    <div className="bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 min-h-screen py-10 px-4 md:px-12 lg:px-20">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-2xl p-8 md:p-12">
        <div className="text-center text-3xl font-extrabold mb-2 text-gray-700 tracking-tight">
          ABOUT <span className="text-blue-600">US</span>
        </div>
        <div className="w-16 h-1 bg-blue-200 rounded mx-auto mb-8" />
        <div className="flex flex-col md:flex-row gap-12 items-center mb-12">
          <img
            src={assets.about_image}
            alt="About Us"
            className="w-full md:max-w-xs rounded-xl shadow-lg border-4 border-blue-100"
          />
          <div className="flex flex-col justify-center gap-6 text-gray-600 text-base md:w-2/3">
            <p>
              Welcome to <span className="font-bold text-blue-700">VaidyaTek</span>, your trusted partner in managing your
              healthcare needs conveniently and efficiently. At <span className="font-bold text-blue-700">VaidyaTek</span>, we
              understand the challenges individuals face when it comes to scheduling
              doctor appointments and managing their health records.
            </p>
            <p>
              VaidyaTek is committed to excellence in healthcare technology. We
              continuously strive to enhance our platform, integrating the latest
              advancements to improve user experience and deliver superior service.
              Whether booking your first appointment or managing ongoing care, VaidyaTek is here to support you every step of the way.
            </p>
            <div>
              <p className="text-lg font-bold text-blue-700 mb-1">Our Vision</p>
              <p>
                Our vision at VaidyaTek is to create a seamless healthcare experience
                for every user. We aim to bridge the gap between patients and
                healthcare providers, making it easier for you to access the care you
                need, when you need it.
              </p>
            </div>
          </div>
        </div>
        <div className="w-full border-t border-gray-200 my-10" />
        <div className="text-2xl font-bold text-center text-gray-700 mb-8 tracking-tight">
          WHY <span className="text-blue-600">CHOOSE US</span>
        </div>
        <div className="grid md:grid-cols-3 gap-8 mb-4">
          <div className="flex flex-col items-center bg-blue-50 rounded-xl p-8 shadow hover:shadow-lg transition-all duration-300 text-gray-700">
            <FaBolt className="text-3xl text-blue-500 mb-3" />
            <p className="font-bold mb-2">Efficiency</p>
            <p className="text-sm text-gray-600 text-center">Streamlined appointment scheduling that fits into your busy lifestyle.</p>
          </div>
          <div className="flex flex-col items-center bg-blue-50 rounded-xl p-8 shadow hover:shadow-lg transition-all duration-300 text-gray-700">
            <FaMapMarkerAlt className="text-3xl text-blue-500 mb-3" />
            <p className="font-bold mb-2">Convenience</p>
            <p className="text-sm text-gray-600 text-center">Access to a network of trusted healthcare professionals in your area.</p>
          </div>
          <div className="flex flex-col items-center bg-blue-50 rounded-xl p-8 shadow hover:shadow-lg transition-all duration-300 text-gray-700">
            <FaUserCheck className="text-3xl text-blue-500 mb-3" />
            <p className="font-bold mb-2">Personalization</p>
            <p className="text-sm text-gray-600 text-center">Tailored recommendations and reminders to help you stay on top of your health.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
