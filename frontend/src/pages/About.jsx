import { assets } from "../assets/assets";
import { FaBolt, FaMapMarkerAlt, FaUserCheck } from "react-icons/fa";

const About = () => {
  return (
    <div className="min-h-screen py-10 px-4 md:px-12 lg:px-20" style={{ background: "linear-gradient(110deg,#effcfb 0%,#f7fcfc 48%,#e9f8f8 100%)" }}>
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl border border-[#dceeed] p-8 md:p-12">
        <div className="text-center text-3xl font-extrabold mb-2 text-[#10233f] tracking-tight">
          ABOUT <span className="text-[#009f9a]">US</span>
        </div>
        <div className="w-16 h-1 bg-[#c9efeb] rounded mx-auto mb-8" />
        <div className="flex flex-col md:flex-row gap-12 items-center mb-12">
          <img
            src={assets.about_image}
            alt="About Us"
            className="w-full md:max-w-xs rounded-xl shadow-lg border-4 border-[#ddf8f2]"
          />
          <div className="flex flex-col justify-center gap-6 text-[#5f7185] text-base md:w-2/3">
            <p>
              Welcome to <span className="font-bold text-[#009f9a]">Click2Clinic</span>, your trusted partner in managing your
              healthcare needs conveniently and efficiently. At <span className="font-bold text-[#009f9a]">Click2Clinic</span>, we
              understand the challenges individuals face when it comes to scheduling
              doctor appointments and managing their health records.
            </p>
            <p>
              Click2Clinic is committed to excellence in healthcare technology. We
              continuously strive to enhance our platform, integrating the latest
              advancements to improve user experience and deliver superior service.
              Whether booking your first appointment or managing ongoing care, Click2Clinic is here to support you every step of the way.
            </p>
            <div>
              <p className="text-lg font-bold text-[#009f9a] mb-1">Our Vision</p>
              <p>
                Our vision at Click2Clinic is to create a seamless healthcare experience
                for every user. We aim to bridge the gap between patients and
                healthcare providers, making it easier for you to access the care you
                need, when you need it.
              </p>
            </div>
          </div>
        </div>
        <div className="w-full border-t border-[#dceeed] my-10" />
        <div className="text-2xl font-bold text-center text-[#10233f] mb-8 tracking-tight">
          WHY <span className="text-[#009f9a]">CHOOSE US</span>
        </div>
        <div className="grid md:grid-cols-3 gap-8 mb-4">
          <div className="flex flex-col items-center bg-[#effcfb] rounded-xl p-8 shadow hover:shadow-lg transition-all duration-300 text-[#10233f] border border-[#dceeed]">
            <FaBolt className="text-3xl text-[#009f9a] mb-3" />
            <p className="font-bold mb-2">Efficiency</p>
            <p className="text-sm text-[#5f7185] text-center">Streamlined appointment scheduling that fits into your busy lifestyle.</p>
          </div>
          <div className="flex flex-col items-center bg-[#effcfb] rounded-xl p-8 shadow hover:shadow-lg transition-all duration-300 text-[#10233f] border border-[#dceeed]">
            <FaMapMarkerAlt className="text-3xl text-[#009f9a] mb-3" />
            <p className="font-bold mb-2">Convenience</p>
            <p className="text-sm text-[#5f7185] text-center">Access to a network of trusted healthcare professionals in your area.</p>
          </div>
          <div className="flex flex-col items-center bg-[#effcfb] rounded-xl p-8 shadow hover:shadow-lg transition-all duration-300 text-[#10233f] border border-[#dceeed]">
            <FaUserCheck className="text-3xl text-[#009f9a] mb-3" />
            <p className="font-bold mb-2">Personalization</p>
            <p className="text-sm text-[#5f7185] text-center">Tailored recommendations and reminders to help you stay on top of your health.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
