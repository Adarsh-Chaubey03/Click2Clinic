import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const HireDoctorBanner = () => {
  return (
    <section className="py-8 sm:py-12 px-4 sm:px-6 mb-8">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-700"
        >
          {/* Decorative Elements */}
          <div className="absolute top-0 left-1/4 w-72 h-72 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl" />

          {/* Pattern */}
          <div className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 1px)',
              backgroundSize: '32px 32px'
            }} />

          <div className="relative flex flex-col items-center justify-between gap-8 p-4 sm:p-12 md:flex-row lg:p-16">
            {/* Left Content */}
            <div className="flex-1 text-center md:text-left">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
              >
                <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/20 backdrop-blur-sm text-white/90 rounded-full text-sm font-medium mb-6">
                  👨‍⚕️ Join Our Network
                </span>

                <h2 className="mb-4 text-2xl font-bold leading-tight text-white sm:text-4xl lg:text-5xl">
                  Are You a Doctor?<br />
                  <span className="text-violet-200">Join Click2Clinic Today</span>
                </h2>

                <p className="mb-8 max-w-lg text-base text-violet-100 sm:text-lg">
                  Expand your practice, reach more patients, and become part of our trusted healthcare network. Get verified and start consulting online.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Link
                      to="/hire-doctor"
                      onClick={() => window.scrollTo(0, 0)}
                      className="inline-flex items-center gap-2 px-8 py-4 bg-white text-violet-700 font-bold rounded-2xl 
                               shadow-xl hover:shadow-2xl transition-all duration-300"
                    >
                      Apply Now
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </Link>
                  </motion.div>
                </div>
              </motion.div>
            </div>

            {/* Right - Benefits */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              className="flex w-full flex-col gap-4 md:w-auto"
            >
              {[
                { icon: "💰", text: "Earn from online consultations" },
                { icon: "📅", text: "Flexible scheduling" },
                { icon: "🌍", text: "Reach patients nationwide" },
                { icon: "✅", text: "Get verified badge" },
              ].map((benefit, i) => (
                <div key={i} className="flex min-w-0 items-center gap-3 rounded-xl bg-white/10 px-4 py-3 backdrop-blur-sm sm:px-5">
                  <span className="text-xl">{benefit.icon}</span>
                  <span className="text-white font-medium">{benefit.text}</span>
                </div>
              ))}
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default HireDoctorBanner;
