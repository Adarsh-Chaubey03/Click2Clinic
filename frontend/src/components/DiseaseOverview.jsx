import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import qh1 from "../assets/qh1.png";
import qh2 from "../assets/qh2.png";
import qh3 from "../assets/qh3.png";
import qh4 from "../assets/qh4.png";
import qh5 from "../assets/qh5.png";
import qh6 from "../assets/qh6.png";

const tips = [
  { name: "Diabetes",      image: qh1, tip: "Tips to keep your blood sugar in control.",       slug: "Diabetes" },
  { name: "Hypertension",  image: qh2, tip: "Simple ways to maintain healthy blood pressure.", slug: "Hypertension" },
  { name: "Dengue",        image: qh3, tip: "Prevent mosquito bites and stay safe.",            slug: "Dengue" },
  { name: "Asthma",        image: qh4, tip: "Manage triggers for easier breathing.",            slug: "Asthma" },
  { name: "Tuberculosis",  image: qh5, tip: "Know the symptoms and take early action.",         slug: "Tuberculosis" },
  { name: "Malaria",       image: qh6, tip: "Take simple steps to prevent malaria.",            slug: "Malaria" },
];

const DiseaseOverview = () => {
  const navigate = useNavigate();

  return (
    <section className="py-12 sm:py-16">
      <div className="section-wrap">

        {/* Header row */}
        <div className="mb-8 flex flex-col items-start justify-between sm:flex-row sm:items-center">
          <div>
            <span className="eyebrow mb-3 inline-flex !bg-[#fff4dc] !text-[#a86a00]">Health Library</span>
            <h2 className="text-3xl font-extrabold text-[#10233f] sm:text-4xl">
              Quick <span className="gradient-text">Health Tips</span>
            </h2>
            <p className="mt-2 text-sm text-[#687b90]">Simple tips for a healthier, happier you.</p>
          </div>
          <button
            onClick={() => navigate("/awareness")}
            className="secondary-button mt-5 sm:mt-0 whitespace-nowrap"
          >
            View All Tips <span>→</span>
          </button>
        </div>

        {/* Cards grid */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {tips.map((item, index) => (
            <motion.button
              key={item.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.06 }}
              onClick={() => { navigate("/awareness", { state: { disease: item.slug } }); window.scrollTo(0, 0); }}
              className="group flex flex-col items-center justify-between rounded-2xl border border-[#e3eeee] bg-white px-4 pb-5 pt-7 text-left shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#009f9a] hover:shadow-[0_12px_32px_rgba(0,159,154,0.12)]"
            >
              {/* Image circle — full bleed, zoomed */}
              <div className={`mb-4 h-20 w-20 flex-shrink-0 overflow-hidden rounded-full transition-transform duration-300 group-hover:scale-105 ${index === 1 ? "border-4 border-white shadow-md" : "border-2 border-[#e8f9f6]"}`}>
                <img
                  src={item.image}
                  alt={item.name}
                  className={`h-full w-full object-cover ${index === 1 ? "scale-125" : ""}`}
                />
              </div>

              {/* Name */}
              <p className="mb-2 text-center text-sm font-bold text-[#10233f] transition-colors duration-300 group-hover:text-[#009f9a]">
                {item.name}
              </p>

              {/* Tip text */}
              <p className="mb-4 text-center text-xs leading-relaxed text-[#718398]">
                {item.tip}
              </p>

              {/* Arrow button */}
              <div className="flex h-8 w-8 items-center justify-center rounded-full border border-[#dceeed] bg-[#f5fdfc] text-[#009f9a] transition-all duration-300 group-hover:bg-[#009f9a] group-hover:text-white group-hover:border-[#009f9a]">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </motion.button>
          ))}
        </div>

      </div>
    </section>
  );
};

export default DiseaseOverview;
