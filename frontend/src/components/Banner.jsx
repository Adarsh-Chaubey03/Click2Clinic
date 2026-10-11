import { useNavigate } from 'react-router-dom';

const Banner = () => {
  const navigate = useNavigate();
  const isAuthenticated = !!localStorage.getItem("token");

  return (
    <section className="py-8 sm:py-12 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-teal-600 via-teal-700 to-emerald-700">

          {/* Decorative circles */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />

          {/* Dot pattern */}
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 1px)',
              backgroundSize: '24px 24px',
            }}
          />

          <div className="relative flex flex-col items-center justify-between p-4 sm:p-12 md:flex-row lg:p-16">

            {/* Left Content */}
            <div className="flex-1 text-center md:text-left mb-8 md:mb-0">
              <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/20 text-white/90 rounded-full text-sm font-medium mb-6">
                <span className="w-2 h-2 bg-green-400 rounded-full" />
                100+ Doctors Online
              </span>

              <h2 className="mb-4 text-2xl font-bold leading-tight text-white sm:text-4xl lg:text-5xl">
                Book Your Appointment<br />
                <span className="text-teal-200">In Just 2 Minutes</span>
              </h2>

              <p className="mb-8 max-w-lg text-base text-teal-100 sm:text-lg">
                Skip the waiting room. Get instant access to top healthcare professionals from the comfort of your home.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                <button
                  onClick={() => { navigate(isAuthenticated ? "/doctors" : "/login"); window.scrollTo(0, 0); }}
                  className="px-8 py-4 bg-white text-teal-700 font-bold rounded-2xl shadow-xl hover:shadow-2xl transition-shadow duration-200"
                >
                  {isAuthenticated ? "Find a Doctor" : "Create Account"}
                </button>

                <button
                  onClick={() => { navigate("/store"); window.scrollTo(0, 0); }}
                  className="px-8 py-4 bg-white/10 text-white font-bold rounded-2xl border border-white/30 hover:bg-white/20 transition-colors duration-200"
                >
                  Order Medicines
                </button>
              </div>
            </div>

            {/* Right — Stats */}
            <div className="flex flex-wrap justify-center gap-3 sm:gap-6 md:flex-col">
              {[
                { value: "100+", label: "Doctors" },
                { value: "50K+", label: "Patients" },
                { value: "4.9★", label: "Rating" },
              ].map((stat, i) => (
                <div key={i} className="rounded-2xl bg-white/10 px-4 py-4 text-center sm:px-6">
                  <p className="text-2xl sm:text-3xl font-bold text-white">{stat.value}</p>
                  <p className="text-teal-200 text-sm">{stat.label}</p>
                </div>
              ))}
            </div>

          </div>
        </div>
      </div>
    </section>
  );
};

export default Banner;
