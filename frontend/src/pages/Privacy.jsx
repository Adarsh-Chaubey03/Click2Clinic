import { assets } from "../assets/assets";
import { FaShieldAlt, FaLock, FaUserShield } from "react-icons/fa";

const Privacy = () => {
  return (
    <div className="bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 min-h-screen py-10 px-4 md:px-12 lg:px-20">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-2xl p-8 md:p-12">
        <div className="text-center text-3xl font-extrabold mb-2 text-gray-700 tracking-tight">
          PRIVACY <span className="text-blue-600">POLICY</span>
        </div>
        <div className="w-16 h-1 bg-blue-200 rounded mx-auto mb-8" />
        <div className="flex flex-col md:flex-row gap-12 items-center mb-12">
          <img
            src={assets.privacy_icon}
            alt="Privacy"
            className="w-full md:max-w-xs rounded-xl shadow-lg border-4 border-blue-100"
          />
          <div className="flex flex-col justify-center gap-6 text-gray-600 text-base md:w-2/3">
            <p>
              At <span className="font-bold text-blue-700">Click2Clinic</span>, we prioritize your privacy and security.
              This Privacy Policy outlines how we collect, use, and protect your personal data while ensuring transparency in our practices.
            </p>
            <div>
              <p className="text-lg font-bold text-blue-700 mb-1">Information We Collect</p>
              <p>
                We collect essential data such as your name, contact details, medical history, and payment information to provide a seamless healthcare experience.
              </p>
            </div>
            <div>
              <p className="text-lg font-bold text-blue-700 mb-1">How We Use Your Information</p>
              <p>
                Your data is used to facilitate appointment bookings, securely store medical records, and enhance our platform based on your feedback.
              </p>
            </div>
            <div>
              <p className="text-lg font-bold text-blue-700 mb-1">Your Rights</p>
              <p>
                You have full control over your personal data, including the right to access, update, or request deletion of your information.
              </p>
            </div>
          </div>
        </div>
        <div className="w-full border-t border-gray-200 my-10" />
        <div className="text-2xl font-bold text-center text-gray-700 mb-8 tracking-tight">
          DATA <span className="text-blue-600">SECURITY</span>
        </div>
        <div className="grid md:grid-cols-3 gap-8 mb-4">
          <div className="flex flex-col items-center bg-blue-50 rounded-xl p-8 shadow hover:shadow-lg transition-all duration-300 text-gray-700">
            <FaShieldAlt className="text-3xl text-blue-500 mb-3" />
            <p className="font-bold mb-2">Strict Security Measures</p>
            <p className="text-sm text-gray-600 text-center">We implement industry-standard security protocols to safeguard your data from unauthorized access.</p>
          </div>
          <div className="flex flex-col items-center bg-blue-50 rounded-xl p-8 shadow hover:shadow-lg transition-all duration-300 text-gray-700">
            <FaLock className="text-3xl text-blue-500 mb-3" />
            <p className="font-bold mb-2">Encrypted Transactions</p>
            <p className="text-sm text-gray-600 text-center">Payment details are securely encrypted to ensure safe transactions.</p>
          </div>
          <div className="flex flex-col items-center bg-blue-50 rounded-xl p-8 shadow hover:shadow-lg transition-all duration-300 text-gray-700">
            <FaUserShield className="text-3xl text-blue-500 mb-3" />
            <p className="font-bold mb-2">User Control</p>
            <p className="text-sm text-gray-600 text-center">You have the ability to manage your data and privacy settings at any time.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Privacy;
