import { useNavigate } from "react-router-dom";
import { diseases } from "../assets/assets.js";

const DiseaseOverview = () => {
  const navigate = useNavigate();
  return (
    <section className="py-12 sm:py-16">
      <div className="section-wrap">
        <div className="mb-8 flex flex-col items-center justify-between text-center sm:flex-row sm:text-left">
          <div>
            <span className="eyebrow mb-4 !bg-[#fff4dc] !text-[#a86a00]">Health Library</span>
            <h2 className="text-3xl font-extrabold text-[#10233f] sm:text-4xl">
              Quick <span className="gradient-text">Health Tips</span>
            </h2>
            <p className="mt-3 text-[#687b90]">Simple tips for a healthier, happier you</p>
          </div>
          <button onClick={() => navigate("/awareness")} className="secondary-button mt-5 sm:mt-0">
            View All Tips <span>→</span>
          </button>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {diseases.slice(0, 6).map((disease) => (
            <button
              key={disease.name}
              onClick={() => { navigate(`/awareness/${disease.name}`); window.scrollTo(0, 0); }}
              className="group overflow-hidden rounded-2xl border border-[#e3eeee] bg-white text-left transition-all hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="h-24 overflow-hidden bg-[#eefafa] sm:h-28">
                <img src={disease.image} alt={disease.name} className="h-full w-full object-cover transition-transform group-hover:scale-105" />
              </div>
              <div className="p-3 text-center sm:p-4">
                <h3 className="text-sm font-bold text-[#20334a] group-hover:text-[#009f9a] sm:text-base">{disease.name}</h3>
                <p className="mt-1 line-clamp-1 text-xs text-[#718398]">{disease.description}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};

export default DiseaseOverview;
