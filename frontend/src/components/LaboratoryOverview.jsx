import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import labHomeImg from "../assets/lab-home.png";

/* ── 3 featured tests shown on left (matching image) ── */
const FEATURED_TESTS = [
  {
    id: "cbc",
    name: "Complete Blood Count (CBC)",
    price: 500,
    originalPrice: 700,
    bg: "#fce8e8",
    icon: (
      <svg viewBox="0 0 48 48" className="w-7 h-7" fill="none">
        <ellipse cx="18" cy="30" rx="8" ry="11" fill="#f87171" opacity="0.85" />
        <ellipse cx="30" cy="30" rx="8" ry="11" fill="#fb923c" opacity="0.7" />
        <path d="M24 14 Q24 8 18 10 Q24 6 24 14Z" fill="#f87171" />
      </svg>
    ),
  },
  {
    id: "tft",
    name: "Thyroid Function Test (TFT)",
    price: 800,
    originalPrice: 1000,
    bg: "#f0eaf8",
    icon: (
      <svg viewBox="0 0 48 48" className="w-7 h-7" fill="none">
        <ellipse cx="24" cy="28" rx="11" ry="8" fill="#a78bfa" opacity="0.8" />
        <ellipse cx="15" cy="21" rx="6" ry="9" fill="#c4b5fd" opacity="0.9" />
        <ellipse cx="33" cy="21" rx="6" ry="9" fill="#c4b5fd" opacity="0.9" />
        <circle cx="24" cy="20" r="4" fill="#7c3aed" opacity="0.7" />
      </svg>
    ),
  },
  {
    id: "lipid",
    name: "Lipid Profile",
    price: 600,
    originalPrice: 800,
    bg: "#fce8f0",
    icon: (
      <svg viewBox="0 0 48 48" className="w-7 h-7" fill="none">
        <path d="M24 40 C13 33 7 25 7 17 C7 11 13 7 24 12 C35 7 41 11 41 17 C41 25 35 33 24 40Z" fill="#f472b6" opacity="0.8" />
        <path d="M15 21 Q24 15 33 21" stroke="white" strokeWidth="2" strokeLinecap="round" fill="none" />
        <circle cx="24" cy="24" r="4" fill="white" opacity="0.65" />
      </svg>
    ),
  },
];

/* ── Bottom trust badges ── */
const TRUST = [
  {
    label: "Home sample collection",
    icon: (
      <svg className="w-5 h-5 text-[#009f9a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
          d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    label: "Fast & accurate results",
    icon: (
      <svg className="w-5 h-5 text-[#009f9a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    label: "Certified & trusted labs",
    icon: (
      <svg className="w-5 h-5 text-[#009f9a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
          d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
  },
];

const LaboratoryOverview = () => {
  const navigate = useNavigate();

  return (
    <section className="py-16 sm:py-20">
      <div className="section-wrap">
        <div className="flex flex-col gap-10 lg:flex-row lg:items-center lg:gap-16">

          {/* ── LEFT CONTENT ── */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="flex-1 min-w-0"
          >
            {/* Eyebrow */}
            <span className="eyebrow mb-5 inline-flex">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
              </svg>
              Lab Tests
            </span>

            {/* Heading */}
            <h2 className="mb-3 text-4xl font-extrabold leading-tight text-[#10233f] sm:text-5xl">
              Accurate Lab Tests<br />
              from the <span className="gradient-text">Comfort of Home</span>
            </h2>

            {/* Subtext */}
            <p className="mb-8 text-sm text-[#687b90]">
              Trusted diagnostics with home sample collection and fast results.
            </p>

            {/* 3 test cards — horizontal row */}
            <div className="mb-8 grid grid-cols-3 gap-4">
              {FEATURED_TESTS.map((test) => (
                <motion.div
                  key={test.id}
                  whileInView={{ opacity: 1, y: 0 }}
                  initial={{ opacity: 0, y: 16 }}
                  viewport={{ once: true }}
                  onClick={() => { navigate("/lab"); window.scrollTo(0, 0); }}
                  className="group cursor-pointer rounded-2xl border border-[#e3eeee] bg-white p-4 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#009f9a] hover:shadow-[0_10px_28px_rgba(0,159,154,0.12)]"
                >
                  {/* Icon circle */}
                  <div
                    className="mb-3 flex h-12 w-12 items-center justify-center rounded-full transition-transform duration-300 group-hover:scale-105"
                    style={{ backgroundColor: test.bg }}
                  >
                    {test.icon}
                  </div>

                  {/* Name */}
                  <p className="mb-2 text-xs font-bold leading-snug text-[#10233f] group-hover:text-[#009f9a] transition-colors">
                    {test.name}
                  </p>

                  {/* Price row + arrow */}
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-bold text-[#10233f]">₹{test.price}</span>
                    <span className="text-xs text-[#b0bec5] line-through">₹{test.originalPrice}</span>
                    <div className="ml-auto flex h-6 w-6 items-center justify-center rounded-full border border-[#dceeed] bg-[#f5fdfc] text-[#009f9a] transition-all duration-300 group-hover:bg-[#009f9a] group-hover:text-white group-hover:border-[#009f9a]">
                      <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Trust badges */}
            <div className="mb-8 flex flex-wrap gap-x-8 gap-y-3">
              {TRUST.map((t) => (
                <div key={t.label} className="flex items-center gap-2">
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[#e8f9f6]">
                    {t.icon}
                  </div>
                  <span className="text-xs font-medium text-[#5f7185]">{t.label}</span>
                </div>
              ))}
            </div>

            {/* CTA */}
            <button
              onClick={() => { navigate("/lab"); window.scrollTo(0, 0); }}
              className="primary-button"
            >
              Explore All Lab Tests
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </button>
          </motion.div>

          {/* ── RIGHT — illustration ── */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="relative hidden lg:flex flex-shrink-0 items-center justify-center"
            style={{ width: "46%" }}
          >
            {/* Soft teal blob behind image */}
            <div className="absolute inset-0 rounded-full bg-[#d4f5f0] blur-3xl opacity-50" />
            <img
              src={labHomeImg}
              alt="Lab test at home"
              className="relative z-10 w-full max-w-lg object-contain drop-shadow-xl"
            />
          </motion.div>

        </div>
      </div>
    </section>
  );
};

export default LaboratoryOverview;
