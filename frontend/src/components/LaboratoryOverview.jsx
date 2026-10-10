import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

/* ── Static fallback cards matching the image exactly ── */
const STATIC_TESTS = [
  {
    id: "cbc",
    name: "Complete Blood Count (CBC)",
    desc: "Basic health checkup",
    price: 500,
    originalPrice: 700,
    bg: "#fce8e8",
    icon: (
      <svg viewBox="0 0 64 64" className="w-9 h-9" fill="none">
        <ellipse cx="24" cy="40" rx="10" ry="14" fill="#f87171" opacity="0.85" />
        <ellipse cx="40" cy="40" rx="10" ry="14" fill="#fb923c" opacity="0.75" />
        <path d="M32 18 Q32 10 24 12 Q32 8 32 18Z" fill="#f87171" />
      </svg>
    ),
  },
  {
    id: "tft",
    name: "Thyroid Function Test (TFT)",
    desc: "Check thyroid health",
    price: 800,
    originalPrice: 1000,
    bg: "#e8f5f0",
    icon: (
      <svg viewBox="0 0 64 64" className="w-9 h-9" fill="none">
        <ellipse cx="32" cy="36" rx="14" ry="10" fill="#34d399" opacity="0.8" />
        <ellipse cx="20" cy="28" rx="8" ry="11" fill="#6ee7b7" opacity="0.9" />
        <ellipse cx="44" cy="28" rx="8" ry="11" fill="#6ee7b7" opacity="0.9" />
        <circle cx="32" cy="26" r="5" fill="#059669" />
      </svg>
    ),
  },
  {
    id: "lipid",
    name: "Lipid Profile",
    desc: "Assess heart health",
    price: 600,
    originalPrice: 800,
    bg: "#fce8f0",
    icon: (
      <svg viewBox="0 0 64 64" className="w-9 h-9" fill="none">
        <path d="M32 52 C18 44 10 34 10 24 C10 16 18 10 32 16 C46 10 54 16 54 24 C54 34 46 44 32 52Z" fill="#f472b6" opacity="0.8" />
        <path d="M20 28 Q32 20 44 28" stroke="white" strokeWidth="2.5" strokeLinecap="round" fill="none" />
        <circle cx="32" cy="32" r="5" fill="white" opacity="0.7" />
      </svg>
    ),
  },
  {
    id: "lft",
    name: "Liver Function Test (LFT)",
    desc: "Check liver health",
    price: 700,
    originalPrice: 900,
    bg: "#fef3e2",
    icon: (
      <svg viewBox="0 0 64 64" className="w-9 h-9" fill="none">
        <path d="M14 30 Q14 16 28 14 Q40 12 48 22 Q56 32 46 44 Q36 54 26 48 Q14 42 14 30Z" fill="#fb923c" opacity="0.85" />
        <path d="M28 24 Q36 20 42 28" stroke="white" strokeWidth="2" strokeLinecap="round" fill="none" />
      </svg>
    ),
  },
  {
    id: "kft",
    name: "Kidney Function Test (KFT)",
    desc: "Check kidney health",
    price: 650,
    originalPrice: 850,
    bg: "#ede9fe",
    icon: (
      <svg viewBox="0 0 64 64" className="w-9 h-9" fill="none">
        <ellipse cx="22" cy="32" rx="10" ry="16" fill="#a78bfa" opacity="0.85" />
        <ellipse cx="42" cy="32" rx="10" ry="16" fill="#7c3aed" opacity="0.75" />
        <ellipse cx="22" cy="32" rx="5" ry="9" fill="#ede9fe" opacity="0.6" />
        <ellipse cx="42" cy="32" rx="5" ry="9" fill="#ede9fe" opacity="0.6" />
      </svg>
    ),
  },
  {
    id: "covid",
    name: "COVID-19 RT-PCR",
    desc: "Accurate detection",
    price: 500,
    originalPrice: 700,
    bg: "#e0e7ff",
    icon: (
      <svg viewBox="0 0 64 64" className="w-9 h-9" fill="none">
        <circle cx="32" cy="32" r="14" fill="#6366f1" opacity="0.8" />
        {[0,45,90,135,180,225,270,315].map((deg, i) => (
          <line
            key={i}
            x1={32 + 14 * Math.cos((deg * Math.PI) / 180)}
            y1={32 + 14 * Math.sin((deg * Math.PI) / 180)}
            x2={32 + 22 * Math.cos((deg * Math.PI) / 180)}
            y2={32 + 22 * Math.sin((deg * Math.PI) / 180)}
            stroke="#818cf8"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        ))}
        <circle cx="32" cy="32" r="7" fill="#e0e7ff" opacity="0.9" />
      </svg>
    ),
  },
];

const LaboratoryOverview = () => {
  const navigate = useNavigate();

  /* Always show the curated static cards on the home page */
  const displayTests = STATIC_TESTS;

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
          {/* Eyebrow badge — lab flask icon + text */}
          <span className="eyebrow mb-4 inline-flex">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
            </svg>
            Lab Tests
          </span>

          <h2 className="mt-2 text-4xl font-extrabold text-[#10233f] sm:text-5xl">
            Book <span className="gradient-text">Lab Tests</span> Online
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-base text-[#687b90]">
            Accurate diagnostics with home sample collection and fast results.
          </p>
        </motion.div>

        {/* Cards — 6 columns on lg, scrollable on mobile */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {displayTests.map((test, index) => (
            <motion.div
              key={test.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.06 }}
              onClick={() => { navigate("/lab"); window.scrollTo(0, 0); }}
              className="group cursor-pointer flex flex-col rounded-2xl border border-[#e3eeee] bg-white p-4 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#009f9a] hover:shadow-[0_12px_32px_rgba(0,159,154,0.11)]"
            >
              {/* Icon circle */}
              <div
                className="mb-4 flex h-14 w-14 items-center justify-center rounded-full transition-transform duration-300 group-hover:scale-105"
                style={{ backgroundColor: test.bg }}
              >
                {test.icon}
              </div>

              {/* Name */}
              <p className="text-sm font-bold leading-snug text-[#10233f] mb-1 group-hover:text-[#009f9a] transition-colors">
                {test.name}
              </p>

              {/* Description */}
              <p className="text-xs text-[#718398] mb-3 flex-1">{test.desc}</p>

              {/* Price row + arrow */}
              <div className="flex items-center justify-between mt-auto">
                <div className="flex items-baseline gap-1.5">
                  <span className="text-sm font-bold text-[#10233f]">₹{test.price}</span>
                  <span className="text-xs text-[#b0bec5] line-through">₹{test.originalPrice}</span>
                </div>
                {/* Arrow button */}
                <div className="flex h-7 w-7 items-center justify-center rounded-full border border-[#dceeed] bg-[#f5fdfc] text-[#009f9a] transition-all duration-300 group-hover:bg-[#009f9a] group-hover:text-white group-hover:border-[#009f9a]">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Explore All button */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="mt-10 text-center"
        >
          <button
            onClick={() => { navigate("/lab"); window.scrollTo(0, 0); }}
            className="primary-button mx-auto"
          >
            Explore All Lab Tests
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </button>
        </motion.div>

      </div>
    </section>
  );
};

export default LaboratoryOverview;
