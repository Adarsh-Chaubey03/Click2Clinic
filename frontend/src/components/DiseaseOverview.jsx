import { useNavigate } from "react-router-dom";
import { diseases } from "../assets/assets.js";
import { motion } from "framer-motion";

const DiseaseOverview = () => {
  const navigate = useNavigate();

  const categoryColors = {
    Chronic: { bg: "bg-purple-100", text: "text-purple-700", border: "border-purple-200" },
    Viral: { bg: "bg-red-100", text: "text-red-700", border: "border-red-200" },
    Bacterial: { bg: "bg-orange-100", text: "text-orange-700", border: "border-orange-200" },
    default: { bg: "bg-teal-100", text: "text-teal-700", border: "border-teal-200" },
  };

  return (
    <section className="py-16 sm:py-20 px-4 sm:px-6 bg-white">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-rose-100 text-rose-700 rounded-full text-sm font-medium mb-4">
            📚 Health Library
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Learn About <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-500 to-orange-500">Health Conditions</span>
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Understand symptoms, treatments, and prevention strategies for common conditions
          </p>
        </motion.div>

        {/* Conditions Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {diseases.slice(0, 6).map((disease, index) => {
            const colors = categoryColors[disease.category] || categoryColors.default;

            return (
              <motion.div
                key={disease.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                onClick={() => {
                  navigate(`/awareness/${disease.name}`);
                  window.scrollTo(0, 0);
                }}
                className="group cursor-pointer bg-white rounded-2xl overflow-hidden border border-gray-100 
                         hover:border-rose-200 hover:shadow-xl hover:shadow-rose-500/10 transition-all duration-300"
              >
                {/* Disease Image */}
                <div className="relative h-44 bg-gradient-to-br from-rose-50 to-orange-50 overflow-hidden">
                  <img
                    src={disease.image}
                    alt={disease.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => {
                      e.target.src = "https://via.placeholder.com/400x200?text=Health+Condition";
                    }}
                  />
                  {/* Category Badge */}
                  <div className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-semibold ${colors.bg} ${colors.text}`}>
                    {disease.category}
                  </div>
                </div>

                {/* Disease Info */}
                <div className="p-5">
                  <h3 className="font-bold text-lg text-gray-900 group-hover:text-rose-600 transition-colors mb-2">
                    {disease.name}
                  </h3>
                  <p className="text-gray-500 text-sm mb-4 line-clamp-2">{disease.description}</p>

                  <div className="flex items-center justify-between">
                    <span className="text-gray-400 text-sm">
                      Affects: {disease.affectedPeople}
                    </span>
                    <span className="flex items-center gap-1 text-rose-600 text-sm font-medium group-hover:gap-2 transition-all">
                      Learn more
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* View All Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <button
            onClick={() => {
              navigate("/awareness");
              window.scrollTo(0, 0);
            }}
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-rose-500 to-orange-500 
                     text-white font-semibold rounded-2xl shadow-lg shadow-rose-500/30 
                     hover:shadow-xl hover:shadow-rose-500/40 hover:scale-105 transition-all duration-300"
          >
            Explore Health Library
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </button>
        </motion.div>
      </div>
    </section>
  );
};

export default DiseaseOverview;
