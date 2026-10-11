import { useNavigate } from "react-router-dom";
import { assets } from "../assets/assets";
import heroImg from "../assets/Hero.png";

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
      <div className="section-wrap relative grid min-h-[620px] items-center gap-8 py-12 lg:grid-cols-[1fr_1.1fr] lg:py-16">

        {/* ── Left Column ── */}
        <div className="relative z-10 max-w-xl">

          {/* Badge */}
          <div className="eyebrow mb-5">
            <span>Trusted by 50,000+ Patients</span>
          </div>

          {/* Heading */}
          <h1 className="mb-5 text-5xl font-extrabold leading-[1.1] text-[#10233f] sm:text-6xl lg:text-7xl">
            Your Health,{" "}
            <span className="gradient-text">Our Priority</span>
          </h1>

          {/* Subheading */}
          <p className="mb-8 max-w-md text-sm leading-7 text-[#5f7185] sm:text-base">
            Book appointments with trusted doctors, order medicines,
            schedule lab tests and get expert health tips – all in one place.
          </p>

          {/* CTA Buttons */}
          <div className="mb-8 flex flex-col gap-3 sm:flex-row">
            <button onClick={handleBookingClick} className="primary-button">
              <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>Book Appointment</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </button>

            <button onClick={() => navigate("/store")} className="secondary-button">
              <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18" />
              </svg>
              <span>Order Medicines</span>
            </button>
          </div>

          {/* Stats */}
          <div className="mb-8 flex items-center gap-8">
            {[
              { value: "500+", label: "Expert Doctors" },
              { value: "50K+", label: "Happy Patients" },
              { value: "24/7", label: "Support" },
            ].map((stat, i) => (
              <div key={i} className="flex flex-col items-start">
                <p className="text-2xl font-extrabold text-[#10233f]">{stat.value}</p>
                <p className="text-xs text-[#718398]">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Trust / Rating */}
          <div className="flex flex-wrap items-center gap-3">
            <img
              className="h-10 w-auto opacity-80"
              src={assets.group_profiles}
              alt="Happy patients"
            />
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <svg key={star} className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
              <span className="ml-1 text-sm text-[#64758a]">4.9/5 Rating from our patients</span>
            </div>
          </div>
        </div>

        {/* ── Right Column — Hero image + floating cards ── */}
        <div className="relative min-h-[360px] lg:min-h-[520px]">
          {/* Soft glow blob */}
          <div className="absolute inset-8 rounded-full bg-[#c9efeb] blur-3xl opacity-50" />

          {/* Hero image */}
          <img
            src={heroImg}
            alt="Doctor ready to help patients"
            className="relative z-10 h-full w-full object-contain object-center drop-shadow-xl"
          />

          {/* Floating card — Online Consultation */}
          <div className="absolute left-4 top-6 z-20 flex items-center gap-2 rounded-xl border border-[#e4f3f1] bg-white px-4 py-3 shadow-md">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#ddf8f2]">
              <svg className="w-4 h-4 text-[#009f9a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.069A1 1 0 0121 8.82v6.36a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
            <strong className="text-xs font-semibold text-[#10233f]">Online Consultation</strong>
          </div>

          {/* Floating card — Verified Doctors */}
          <div className="absolute right-2 top-16 z-20 flex items-center gap-2 rounded-xl border border-[#e4f3f1] bg-white px-4 py-3 shadow-md">
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[#ddf8f2]">
              <svg className="w-4 h-4 text-[#009f9a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div>
              <strong className="block text-xs font-semibold text-[#10233f]">Verified Doctors</strong>
              <span className="text-[10px] text-[#718398]">Trusted care, anywhere</span>
            </div>
          </div>

          {/* Floating card — 24/7 Support */}
          <div className="absolute bottom-8 right-4 z-20 flex items-center gap-2 rounded-xl border border-[#e4f3f1] bg-white px-4 py-3 shadow-md">
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[#ddf8f2]">
              <svg className="w-4 h-4 text-[#009f9a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <strong className="block text-xs font-semibold text-[#10233f]">24/7 Support</strong>
              <span className="text-[10px] text-[#718398]">We are here for you</span>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};

export default Header;
