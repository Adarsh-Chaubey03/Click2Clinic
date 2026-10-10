import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const benefits = [
  {
    text: "Earn from online consultations",
    icon: (
      // Coins / earnings icon
      <svg className="w-5 h-5 text-[#009f9a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
          d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    text: "Flexible scheduling",
    icon: (
      // Calendar icon
      <svg className="w-5 h-5 text-[#009f9a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    text: "Reach patients nationwide",
    icon: (
      // People / group icon
      <svg className="w-5 h-5 text-[#009f9a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  {
    text: "Get verified badge",
    icon: (
      // Shield check icon
      <svg className="w-5 h-5 text-[#009f9a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
          d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
  },
];

const HireDoctorBanner = () => {
  return (
    <section className="py-8 sm:py-12 px-4 sm:px-6 mb-8">
      <div className="section-wrap">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative overflow-hidden rounded-3xl border border-[#d4f0ec] px-8 py-10 sm:px-14 sm:py-12"
          style={{ background: "linear-gradient(110deg,#effcfb 0%,#f7fcfc 48%,#e9f8f8 100%)" }}
        >
          {/* ── Decorative dots (top-right area) ── */}
          <div
            className="pointer-events-none absolute right-[38%] top-4 h-32 w-32 opacity-30"
            style={{
              backgroundImage: "radial-gradient(circle, #009f9a 1.2px, transparent 1.2px)",
              backgroundSize: "12px 12px",
            }}
          />
          <div
            className="pointer-events-none absolute bottom-4 left-8 h-24 w-24 opacity-20"
            style={{
              backgroundImage: "radial-gradient(circle, #009f9a 1.2px, transparent 1.2px)",
              backgroundSize: "12px 12px",
            }}
          />

          {/* ── Watermark medical cross ── */}
          <div className="pointer-events-none absolute right-[30%] top-1/2 -translate-y-1/2 opacity-[0.07]">
            <svg width="220" height="220" viewBox="0 0 100 100" fill="none">
              <rect x="35" y="5" width="30" height="90" rx="8" fill="#009f9a" />
              <rect x="5" y="35" width="90" height="30" rx="8" fill="#009f9a" />
            </svg>
          </div>

          <div className="relative flex flex-col gap-10 md:flex-row md:items-center md:justify-between">

            {/* ── Left content ── */}
            <div className="flex-1 md:max-w-sm">
              {/* Badge */}
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="eyebrow mb-5 inline-flex"
              >
                {/* person + plus icon */}
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
                Join Our Network
              </motion.span>

              {/* Heading */}
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="mb-4 text-3xl font-extrabold leading-tight text-[#10233f] sm:text-4xl"
              >
                Are You a Doctor?<br />
                <span className="text-[#009f9a]">Join Click2Clinic Today</span>
              </motion.h2>

              {/* Description */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
                className="mb-8 text-sm leading-6 text-[#5f7185] sm:text-base"
              >
                Expand your practice, reach more patients, and become part
                of our trusted healthcare network. Get verified and start
                consulting online.
              </motion.p>

              {/* CTA */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 }}
              >
                <Link
                  to="/hire-doctor"
                  onClick={() => window.scrollTo(0, 0)}
                  className="primary-button inline-flex"
                >
                  Apply Now
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
              </motion.div>
            </div>

            {/* ── Right — benefit cards ── */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="flex w-full flex-col gap-3 md:w-72 lg:w-80"
            >
              {benefits.map((b, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: 16 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.25 + i * 0.08 }}
                  className="flex items-center gap-4 rounded-2xl border border-[#dceeed] bg-white px-5 py-4 shadow-sm"
                >
                  {/* Icon circle */}
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[#e8f9f6]">
                    {b.icon}
                  </div>
                  <span className="text-sm font-semibold text-[#10233f]">{b.text}</span>
                </motion.div>
              ))}
            </motion.div>

          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default HireDoctorBanner;
