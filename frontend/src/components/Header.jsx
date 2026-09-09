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
    <div className="relative mx-0 mt-2 min-h-[540px] overflow-hidden rounded-none sm:mx-4 sm:rounded-2xl md:min-h-[600px]">
      {/* Background Video */}
      <video
        className="absolute inset-0 w-full h-full object-cover"
        autoPlay
        loop
        muted
        playsInline
      >
        <source src={assets.video} type="video/mp4" />
      </video>

      {/* Gradient Overlays */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

      {/* Floating Decorative Elements */}
      <div className="absolute top-20 right-6 h-40 w-40 rounded-full bg-teal-500/20 blur-3xl sm:right-20 sm:h-64 sm:w-64" />
      <div className="absolute bottom-20 left-6 h-36 w-36 rounded-full bg-cyan-400/20 blur-3xl sm:left-20 sm:h-48 sm:w-48" />

      {/* Content */}
      <div className="relative z-10 h-full flex items-center">
        <div className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-8 md:py-24 lg:px-12">
          <div className="max-w-2xl">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 
                       px-4 py-2 rounded-full mb-6"
            >
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-white/90 text-sm font-medium">Trusted by 50,000+ Patients</span>
            </motion.div>

            {/* Main Heading */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mb-6 text-3xl font-bold leading-tight text-white sm:text-5xl lg:text-6xl"
            >
              Your Health,{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 via-cyan-400 to-emerald-400">
                Our Priority
              </span>
            </motion.h1>

            {/* Subheading */}
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mb-8 text-base leading-relaxed text-white/80 sm:text-xl"
            >
              Book appointments with trusted doctors in minutes.
              Quality healthcare at your fingertips, anytime, anywhere.
            </motion.p>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mb-10 flex flex-wrap gap-4 sm:gap-6"
            >
              {[
                { value: "500+", label: "Expert Doctors" },
                { value: "50K+", label: "Happy Patients" },
                { value: "24/7", label: "Support" },
              ].map((stat, i) => (
                <div key={i} className="text-center">
                  <p className="text-2xl sm:text-3xl font-bold text-white">{stat.value}</p>
                  <p className="text-white/60 text-sm">{stat.label}</p>
                </div>
              ))}
            </motion.div>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <button
                onClick={handleBookingClick}
                className="group flex items-center justify-center gap-3 bg-gradient-to-r from-teal-500 to-cyan-500 
                         px-6 py-4 rounded-2xl text-white font-semibold text-base sm:text-lg shadow-xl shadow-teal-500/30
                         hover:shadow-2xl hover:shadow-teal-500/40 hover:scale-105 transition-all duration-300"
              >
                <span>Book Appointment</span>
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </button>

              <button
                onClick={() => navigate("/store")}
                className="flex items-center justify-center gap-3 bg-white/10 backdrop-blur-md border border-white/30
                         px-6 py-4 rounded-2xl text-white font-semibold text-base sm:text-lg
                         hover:bg-white/20 hover:scale-105 transition-all duration-300"
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
              className="mt-12 flex flex-wrap items-center gap-4"
            >
              <img
                className="w-24 h-auto opacity-90"
                src={assets.group_profiles}
                alt="Trusted doctors"
              />
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg key={star} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
                <span className="text-white/80 text-sm ml-2">4.9/5 Rating</span>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Bottom Wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 120" fill="none" className="w-full">
          <path
            d="M0 120L48 110C96 100 192 80 288 70C384 60 480 60 576 65C672 70 768 80 864 85C960 90 1056 90 1152 85C1248 80 1344 70 1392 65L1440 60V120H1392C1344 120 1248 120 1152 120C1056 120 960 120 864 120C768 120 672 120 576 120C480 120 384 120 288 120C192 120 96 120 48 120H0Z"
            fill="white"
          />
        </svg>
      </div>
    </div>
  );
};

export default Header;
