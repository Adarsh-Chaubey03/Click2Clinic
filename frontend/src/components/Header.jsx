import { useNavigate } from "react-router-dom";
import { assets } from "../assets/assets";
import { motion } from "framer-motion";

const Header = () => {
  const navigate = useNavigate();
  const isAuthenticated = !!localStorage.getItem("token");

  const handleBookingClick = () => {
    if (isAuthenticated) {
      navigate("/doctors");
    } else {
      navigate("/login");
    }
  };

  return (
    <section className="relative overflow-hidden border-b border-[#e1f1f1] bg-[linear-gradient(110deg,#effcfb_0%,#f7fcfc_48%,#e9f8f8_100%)]">
      <div className="section-wrap relative grid min-h-[620px] items-center gap-8 py-14 lg:grid-cols-[0.9fr_1.1fr] lg:py-20">
          <div className="relative z-10 max-w-xl">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="eyebrow mb-6"
            >
              <span>Trusted by 50,000+ Patients</span>
            </motion.div>

            {/* Main Heading */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mb-6 text-4xl font-extrabold leading-[1.08] text-[#10233f] sm:text-6xl"
            >
              Your Health,{" "}
              <span className="gradient-text">
                Our Priority
              </span>
            </motion.h1>

            {/* Subheading */}
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mb-8 max-w-lg text-base leading-7 text-[#5f7185] sm:text-lg"
            >
              Book appointments with trusted doctors, order medicines, schedule lab tests and get expert health tips - all in one place.
            </motion.p>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mb-10 grid max-w-lg grid-cols-3 gap-3"
            >
              {[
                { value: "500+", label: "Expert Doctors" },
                { value: "50K+", label: "Happy Patients" },
                { value: "24/7", label: "Support" },
              ].map((stat, i) => (
                <div key={i} className="border-r border-[#dbeceb] text-left last:border-0">
                  <p className="text-2xl font-extrabold text-[#10233f] sm:text-3xl">{stat.value}</p>
                  <p className="text-xs text-[#718398] sm:text-sm">{stat.label}</p>
                </div>
              ))}
            </motion.div>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex flex-col gap-3 sm:flex-row"
            >
              <button
                onClick={handleBookingClick}
                className="primary-button"
              >
                <span>Book Appointment</span>
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </button>

              <button
                onClick={() => navigate("/store")}
                className="secondary-button"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                <span>Order Medicines</span>
              </button>
            </motion.div>

            {/* Trust Indicators */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="mt-8 flex flex-wrap items-center gap-3"
            >
              <img
                className="h-10 w-auto opacity-80"
                src={assets.group_profiles}
                alt="Trusted doctors"
              />
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg key={star} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
                <span className="ml-2 text-sm text-[#64758a]">4.9/5 Rating</span>
              </div>
            </motion.div>
          </div>
          <div className="relative min-h-[360px] lg:min-h-[540px]">
            <div className="absolute inset-8 rounded-full bg-[#c9efeb] blur-3xl" />
            <img src="/Hero.png" alt="Doctor ready to help patients" className="relative z-10 h-full w-full object-contain object-bottom drop-shadow-2xl" />
            <div className="absolute right-0 top-20 z-20 rounded-2xl border border-white/80 bg-white/90 px-4 py-3 shadow-xl backdrop-blur">
              <strong className="block text-sm text-[#10233f]">Verified Doctors</strong>
              <span className="text-xs text-[#718398]">Trusted care, anywhere</span>
            </div>
            <div className="absolute bottom-10 left-2 z-20 rounded-2xl border border-white/80 bg-white/90 px-4 py-3 shadow-xl backdrop-blur">
              <strong className="block text-sm text-[#10233f]">24/7 Support</strong>
              <span className="text-xs text-[#718398]">We are here for you</span>
            </div>
          </div>
      </div>
    </section>
  );
};

export default Header;
