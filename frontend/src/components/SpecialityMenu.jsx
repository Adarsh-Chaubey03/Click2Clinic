import { Link, useNavigate } from "react-router-dom";
import { specialityData } from "../assets/assets";

const SpecialityMenu = () => {
  const navigate = useNavigate();

  return (
    <section className="py-16 sm:py-20">
      <div className="section-wrap">

        {/* Header */}
        <div className="mb-12">
          <span className="eyebrow mb-4">Find Your Specialist</span>
          <h2 className="mt-4 text-4xl font-extrabold text-[#10233f] sm:text-5xl">
            Browse by <span className="gradient-text">Specialty</span>
          </h2>
          <p className="mt-4 max-w-2xl text-base text-[#687b90]">
            Connect with certified healthcare professionals across all medical specialties
          </p>
        </div>

        {/* Speciality Cards */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {specialityData.map((item, index) => (
            <Link
              key={index}
              to={`/doctors/${item.speciality}`}
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="group flex flex-col items-center rounded-2xl border border-[#e8f0ef] bg-white px-3 pb-5 pt-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-[#009f9a] hover:shadow-[0_8px_24px_rgba(0,159,154,0.10)]"
            >
              <div className="mb-4 h-24 w-24 flex-shrink-0 overflow-hidden">
                <img
                  src={item.image}
                  alt={item.speciality}
                  className="h-full w-full object-contain"
                />
              </div>

              <span className="mb-4 text-center text-[13px] font-semibold leading-snug text-[#10233f] transition-colors duration-200 group-hover:text-[#009f9a]">
                {item.speciality}
              </span>

              <div className="flex h-8 w-8 items-center justify-center rounded-full border border-[#dceeed] bg-[#f5fdfc] text-[#009f9a] transition-colors duration-200 group-hover:bg-[#009f9a] group-hover:text-white group-hover:border-[#009f9a]">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>
          ))}
        </div>

        {/* See All Doctors button */}
        <div className="mt-10 text-center">
          <button
            type="button"
            onClick={() => {
              navigate("/doctors");
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className="primary-button mx-auto"
          >
            <span>See All Doctors</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </button>
        </div>

      </div>
    </section>
  );
};

export default SpecialityMenu;
