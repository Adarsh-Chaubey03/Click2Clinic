import { assets } from "../assets/assets";
import { FaShieldAlt, FaLock, FaUserShield } from "react-icons/fa";

const Privacy = () => {
  return (
    <div className="min-h-screen py-10 px-4 md:px-12 lg:px-20" style={{ background: "linear-gradient(110deg,#effcfb 0%,#f7fcfc 48%,#e9f8f8 100%)" }}>
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl border border-[#dceeed] p-8 md:p-12">
        <div className="text-center text-3xl font-extrabold mb-2 text-[#10233f] tracking-tight">
          PRIVACY <span className="text-[#009f9a]">POLICY</span>
        </div>
        <div className="w-16 h-1 bg-[#c9efeb] rounded mx-auto mb-8" />
        <div className="flex flex-col md:flex-row gap-12 items-center mb-12">
          <img
            src={assets.privacy_icon}
            alt="Privacy"
            className="w-full md:max-w-xs rounded-xl shadow-lg border-4 border-[#ddf8f2]"
          />
          <div className="flex flex-col justify-center gap-6 text-[#5f7185] text-base md:w-2/3">
            <p>
              At <span className="font-bold text-[#009f9a]">Click2Clinic</span>, we prioritize your privacy and security.
              This Privacy Policy outlines how we collect, use, and protect your personal data while ensuring transparency in our practices.
            </p>
            <div>
              <p className="text-lg font-bold text-[#009f9a] mb-1">Information We Collect</p>
              <p>
                We collect essential data such as your name, contact details, medical history, and payment information to provide a seamless healthcare experience.
              </p>
            </div>
            <div>
              <p className="text-lg font-bold text-[#009f9a] mb-1">How We Use Your Information</p>
              <p>
                Your data is used to facilitate appointment bookings, securely store medical records, and enhance our platform based on your feedback.
              </p>
            </div>
            <div>
              <p className="text-lg font-bold text-[#009f9a] mb-1">Your Rights</p>
              <p>
                You have full control over your personal data, including the right to access, update, or request deletion of your information.
              </p>
            </div>
          </div>
        </div>
        <div className="w-full border-t border-[#dceeed] my-10" />
        <div className="text-2xl font-bold text-center text-[#10233f] mb-8 tracking-tight">
          DATA <span className="text-[#009f9a]">SECURITY</span>
        </div>
        <div className="grid md:grid-cols-3 gap-8 mb-4">
          <div className="flex flex-col items-center bg-[#effcfb] rounded-xl p-8 shadow hover:shadow-lg transition-all duration-300 text-[#10233f] border border-[#dceeed]">
            <FaShieldAlt className="text-3xl text-[#009f9a] mb-3" />
            <p className="font-bold mb-2">Strict Security Measures</p>
            <p className="text-sm text-[#5f7185] text-center">We implement industry-standard security protocols to safeguard your data from unauthorized access.</p>
          </div>
          <div className="flex flex-col items-center bg-[#effcfb] rounded-xl p-8 shadow hover:shadow-lg transition-all duration-300 text-[#10233f] border border-[#dceeed]">
            <FaLock className="text-3xl text-[#009f9a] mb-3" />
            <p className="font-bold mb-2">Encrypted Transactions</p>
            <p className="text-sm text-[#5f7185] text-center">Payment details are securely encrypted to ensure safe transactions.</p>
          </div>
          <div className="flex flex-col items-center bg-[#effcfb] rounded-xl p-8 shadow hover:shadow-lg transition-all duration-300 text-[#10233f] border border-[#dceeed]">
            <FaUserShield className="text-3xl text-[#009f9a] mb-3" />
            <p className="font-bold mb-2">User Control</p>
            <p className="text-sm text-[#5f7185] text-center">You have the ability to manage your data and privacy settings at any time.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Privacy;
