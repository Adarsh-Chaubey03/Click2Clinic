import { Link } from "react-router-dom";
import { specialityData } from "../assets/assets";
import { motion } from "framer-motion";

const SpecialityMenu = () => {
  return (
    <section className="py-16 sm:py-20">
      <div className="section-wrap">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-10 text-center"
        >
          <span className="eyebrow mb-4">Find Your Specialist</span>
          <h2 className="text-3xl font-extrabold text-[#10233f] sm:text-5xl">
            Browse by <span className="gradient-text">Specialty</span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-[#687b90]">
            Connect with certified healthcare professionals across all medical specialties
          </p>
        </motion.div>

        {/* Speciality Grid */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
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
                className="group relative flex min-h-[292px] flex-col items-center rounded-[22px] border border-[#e3eeee] bg-white p-4 shadow-[0_8px_30px_rgba(15,80,90,0.04)] transition-all duration-300 hover:-translate-y-1 hover:border-[#9edfd8] hover:shadow-[0_18px_36px_rgba(15,150,140,0.13)] sm:min-h-[292px] sm:p-6"
              >
                {/* Gradient Background on Hover */}
                <div className="absolute inset-0 rounded-[22px] bg-gradient-to-br from-teal-50/70 to-cyan-50/30 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                {/* Icon Container */}
                <div className="relative mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-[#e2f8f5] transition-transform duration-300 group-hover:scale-105 sm:h-24 sm:w-24">
                  <img
                    src={item.image}
                    alt={item.speciality}
                    className="h-14 w-14 object-contain"
                  />
                </div>

                {/* Label */}
                <span className="relative flex min-h-[48px] items-center justify-center break-words text-center text-sm font-bold leading-6 text-[#20334a] transition-colors duration-300 group-hover:text-[#008f88] sm:text-base">
                  {item.speciality}
                </span>

                {/* Arrow Indicator */}
                <div className="mt-4 flex h-9 w-9 items-center justify-center rounded-full bg-[#dff8f2] text-[#008f88] transition-all duration-300 group-hover:bg-[#08ac9f] group-hover:text-white">
                  <svg className="w-3 h-3 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
        <div className="mt-8 text-center">
          <button
            type="button"
            onClick={() => {
              navigate("/doctors");
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className="primary-button"
          >
            See All Doctors <span aria-hidden="true">→</span>
          </button>
        </div>
      </div>
    </section>
  );
};

export default SpecialityMenu;
