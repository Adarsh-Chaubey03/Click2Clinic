import { Link } from "react-router-dom";
import { specialityData } from "../assets/assets";
import { motion } from "framer-motion";

const SpecialityMenu = () => {
  return (
    <section className="py-16 sm:py-20 px-4 sm:px-6 bg-gradient-to-b from-white via-teal-50/30 to-white">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-teal-100 text-teal-700 rounded-full text-sm font-medium mb-4">
            <span className="w-2 h-2 bg-teal-500 rounded-full animate-pulse" />
            Find Your Specialist
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Browse by <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-emerald-600">Speciality</span>
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Connect with certified healthcare professionals across all medical specialties
          </p>
        </motion.div>

        {/* Speciality Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6">
          {specialityData.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
            >
              <Link
                to={`/doctors/${item.speciality}`}
                onClick={() => scrollTo({ top: 0, behavior: "smooth" })}
                className="group relative flex flex-col items-center rounded-2xl border border-gray-100 bg-white p-4 
                         sm:p-6
                         hover:border-teal-200 hover:shadow-xl hover:shadow-teal-500/10 transition-all duration-300"
              >
                {/* Gradient Background on Hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-teal-50 to-emerald-50 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                {/* Icon Container */}
                <div className="relative w-16 h-16 sm:w-20 sm:h-20 mb-4 rounded-2xl bg-gradient-to-br from-teal-50 to-emerald-50 
                             flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <img
                    src={item.image}
                    alt={item.speciality}
                    className="w-10 h-10 sm:w-12 sm:h-12 object-contain"
                  />
                </div>

                {/* Label */}
                <span className="relative break-words text-center text-sm font-semibold text-gray-700 sm:text-base 
                              group-hover:text-teal-700 transition-colors duration-300">
                  {item.speciality}
                </span>

                {/* Arrow Indicator */}
                <div className="absolute bottom-2 right-2 w-6 h-6 rounded-full bg-teal-100 flex items-center justify-center 
                             opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                  <svg className="w-3 h-3 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SpecialityMenu;
