import { useContext, useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import { FaSearch, FaMapMarkerAlt, FaFilter, FaUserMd, FaShieldAlt, FaCalendarAlt, FaUsers } from "react-icons/fa";
import { motion } from "framer-motion";
import findDoctorImg from "../assets/finddoctor.png";

const specialties = [
  {
    name: "General physician",
    description: "Primary care and general health",
    icon: (
      <svg className="w-5 h-5 text-[#009f9a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
    ),
  },
  {
    name: "Gynecologist",
    description: "Women's health and reproductive care",
    icon: (
      <svg className="w-5 h-5 text-[#009f9a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
  },
  {
    name: "Dermatologist",
    description: "Skin, hair, and nail conditions",
    icon: (
      <svg className="w-5 h-5 text-[#009f9a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    name: "Pediatricians",
    description: "Child and adolescent healthcare",
    icon: (
      <svg className="w-5 h-5 text-[#009f9a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    ),
  },
  {
    name: "Neurologist",
    description: "Brain and nervous system disorders",
    icon: (
      <svg className="w-5 h-5 text-[#009f9a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    ),
  },
  {
    name: "Gastroenterologist",
    description: "Digestive system and gut health",
    icon: (
      <svg className="w-5 h-5 text-[#009f9a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
      </svg>
    ),
  },
];

const Doctors = () => {
  const { speciality } = useParams();
  const { doctors } = useContext(AppContext);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDoc, setFilterDoc] = useState([]);
  const navigate = useNavigate();
  const [showFilter, setShowFilter] = useState(false);
  const heroRef = useRef(null);
  const [heroHeight, setHeroHeight] = useState(0);

  // measure hero height so sticky top offset is exact
  useEffect(() => {
    if (heroRef.current) {
      setHeroHeight(heroRef.current.offsetHeight);
    }
  }, []);

  const applyFilter = () => {
    let filtered = doctors || [];
    if (speciality) filtered = filtered.filter((doc) => doc.speciality === speciality);
    if (searchTerm.trim()) filtered = filtered.filter((doc) =>
      doc.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilterDoc(filtered);
  };

  useEffect(() => {
    applyFilter();
  }, [doctors, speciality, searchTerm]);

  const cardVariants = {
    hidden: { opacity: 0, y: 16 },
    visible: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.06, duration: 0.35 } }),
    hover: { y: -3, transition: { duration: 0.2, type: "spring", stiffness: 260 } },
  };

  // Navbar is ~64px tall
  const NAVBAR_H = 64;

  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(110deg,#effcfb 0%,#f2fbfa 50%,#e9f8f8 100%)" }}>

      {/* ── HERO ── */}
      <div
        ref={heroRef}
        className="relative overflow-hidden"
        style={{ background: "linear-gradient(110deg,#effcfb 0%,#f2fbfa 50%,#e9f8f8 100%)" }}
      >
        <div className="section-wrap grid min-h-[260px] items-center gap-6 py-10 lg:grid-cols-2 lg:py-12">
          {/* Left */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.45 }}
            className="max-w-lg"
          >
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-[#009f9a]">
              Your Health, Our Priority
            </p>
            <h1 className="mb-3 text-4xl font-extrabold leading-tight text-[#10233f] sm:text-5xl">
              Find the <span className="text-[#009f9a]">Right</span> Doctor
            </h1>
            <p className="mb-6 max-w-sm text-sm leading-6 text-[#5f7185]">
              Book appointments with experienced and verified doctors across multiple specialties.
            </p>
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm font-medium text-[#10233f]">
              <span className="flex items-center gap-1.5"><FaShieldAlt className="text-[#009f9a]" /> Verified Doctors</span>
              <span className="text-[#c9efeb]">|</span>
              <span className="flex items-center gap-1.5"><FaCalendarAlt className="text-[#009f9a]" /> Easy Booking</span>
              <span className="text-[#c9efeb]">|</span>
              <span className="flex items-center gap-1.5"><FaUsers className="text-[#009f9a]" /> Trusted by Thousands</span>
            </div>
          </motion.div>

          {/* Right — illustration with bottom fade */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.45, delay: 0.1 }}
            className="relative hidden lg:flex justify-end"
          >
            <img src={findDoctorImg} alt="Find a Doctor" className="h-60 w-auto object-contain drop-shadow-md" />
            <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-[22%] bg-gradient-to-b from-transparent to-[#effcfb]" />
          </motion.div>
        </div>
      </div>

      {/* ── MAIN CONTENT ── */}
      <div className="section-wrap py-8">
        {/* CRITICAL: flex-start on align-items so sticky works; no overflow:hidden anywhere in this tree */}
        <div className="flex flex-col gap-6 lg:flex-row" style={{ alignItems: "flex-start" }}>

          {/* ── SIDEBAR ── sticky: locks in place once hero is scrolled past ── */}
          <div
            className="hidden lg:block flex-shrink-0 w-64"
            style={{
              position: "sticky",
              top: `${NAVBAR_H + 16}px`,
              alignSelf: "flex-start",
              /* Must not be inside any overflow:hidden ancestor */
            }}
          >
            {/* NOTE: overflow-hidden removed — it breaks position:sticky */}
            <div className="bg-white rounded-2xl border border-[#dceeed] shadow-sm">
              <div className="px-5 py-4 border-b border-[#dceeed]">
                <h3 className="font-bold text-[#10233f] text-base">Medical Specialties</h3>
                <p className="text-xs text-[#718398] mt-0.5">Choose the area of expertise</p>
              </div>
              <div className="p-3 space-y-0.5">
                {specialties.map((spec) => (
                  <button
                    key={spec.name}
                    onClick={() =>
                      speciality === spec.name ? navigate("/doctors") : navigate(`/doctors/${spec.name}`)
                    }
                    className={`w-full flex items-center gap-3 rounded-xl px-3 py-3 text-left transition-all duration-200 ${
                      speciality === spec.name
                        ? "bg-[#effcfb] border border-[#009f9a]"
                        : "hover:bg-[#f5fdfc] border border-transparent"
                    }`}
                  >
                    <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-[#e8f9f6]">
                      {spec.icon}
                    </div>
                    <div className="min-w-0">
                      <p className={`text-sm font-semibold leading-tight ${speciality === spec.name ? "text-[#009f9a]" : "text-[#10233f]"}`}>
                        {spec.name}
                      </p>
                      <p className="text-xs text-[#718398] leading-snug mt-0.5">{spec.description}</p>
                    </div>
                  </button>
                ))}
              </div>
              {speciality && (
                <div className="px-4 pb-4 pt-1">
                  <button
                    onClick={() => navigate("/doctors")}
                    className="w-full py-2 rounded-xl border border-[#dceeed] text-sm font-medium text-[#009f9a] hover:bg-[#effcfb] transition-colors"
                  >
                    View All Specialties
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Mobile filter toggle */}
          <div className="flex items-center justify-between lg:hidden mb-1">
            <h2 className="font-semibold text-[#10233f]">Specialties</h2>
            <button
              onClick={() => setShowFilter((p) => !p)}
              className="flex items-center gap-2 rounded-lg bg-[#009f9a] px-3 py-1.5 text-sm text-white"
            >
              <FaFilter className="text-xs" /> Filter
            </button>
          </div>
          {showFilter && (
            <div className="lg:hidden bg-white rounded-2xl border border-[#dceeed] shadow-sm overflow-hidden mb-4">
              <div className="p-3 space-y-0.5">
                {specialties.map((spec) => (
                  <button
                    key={spec.name}
                    onClick={() => {
                      speciality === spec.name ? navigate("/doctors") : navigate(`/doctors/${spec.name}`);
                      setShowFilter(false);
                    }}
                    className={`w-full flex items-center gap-3 rounded-xl px-3 py-3 text-left transition-all duration-200 ${
                      speciality === spec.name ? "bg-[#effcfb] border border-[#009f9a]" : "hover:bg-[#f5fdfc] border border-transparent"
                    }`}
                  >
                    <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-[#e8f9f6]">{spec.icon}</div>
                    <div className="min-w-0">
                      <p className={`text-sm font-semibold ${speciality === spec.name ? "text-[#009f9a]" : "text-[#10233f]"}`}>{spec.name}</p>
                      <p className="text-xs text-[#718398] mt-0.5">{spec.description}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ── DOCTORS SECTION ── */}
          <div className="min-w-0 flex-1">
            <h2 className="text-2xl font-bold text-[#10233f] mb-1">Find a Doctor</h2>
            <p className="text-sm text-[#5f7185] mb-5">Browse through our expert doctors by specialty or search by name.</p>

            {/* Search + Location */}
            <div className="flex flex-col sm:flex-row items-center gap-3 mb-7">
              <div className="relative w-full sm:flex-1">
                <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-[#b0bec5]" />
                <input
                  type="text"
                  placeholder="Search by doctor name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-[#dceeed] bg-white focus:outline-none focus:ring-2 focus:ring-[#009f9a] focus:border-[#009f9a] text-sm text-[#10233f] placeholder-[#b0bec5] transition-all"
                />
              </div>
              <button
                onClick={() => navigate("/map")}
                className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-white transition-all hover:opacity-90"
                style={{ background: "linear-gradient(135deg,#04a99d,#008eaa)" }}
              >
                <FaMapMarkerAlt />
                Search by Location
              </button>
            </div>

            {/* Grid / Empty state */}
            {filterDoc.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 bg-white rounded-2xl border border-[#dceeed] shadow-sm">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#e8f9f6] mb-4">
                  <FaUserMd className="text-3xl text-[#009f9a]" />
                </div>
                <p className="text-base font-semibold text-[#10233f] mb-1">No doctors found.</p>
                <p className="text-sm text-[#718398] mb-5">Try a different specialty or clear your search.</p>
                <button
                  onClick={() => navigate("/doctors")}
                  className="px-6 py-2.5 rounded-xl text-white text-sm font-semibold transition-all hover:opacity-90"
                  style={{ background: "linear-gradient(135deg,#04a99d,#008eaa)" }}
                >
                  View All Doctors
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filterDoc.map((item, index) => (
                  <motion.div
                    key={item._id || index}
                    custom={index}
                    initial="hidden"
                    animate="visible"
                    whileHover="hover"
                    variants={cardVariants}
                    onClick={() => { navigate(`/appointment/${item._id}`); window.scrollTo(0, 0); }}
                    className="group cursor-pointer rounded-2xl border border-[#dceeed] bg-white overflow-hidden shadow-sm hover:shadow-md hover:border-[#009f9a] transition-all duration-300"
                  >
                    {/* Doctor photo */}
                    <div className="relative h-40 w-full overflow-hidden bg-[#e8f9f6]">
                      <img
                        className="h-full w-full object-cover object-top group-hover:scale-[1.03] transition-transform duration-500"
                        src={item.image}
                        alt={`${item.name}`}
                        onError={(e) => { e.target.src = "https://via.placeholder.com/320x240?text=Doctor"; }}
                      />
                    </div>

                    {/* Info */}
                    <div className="p-3">
                      {/* Availability dot + label */}
                      <div className={`inline-flex items-center gap-1.5 text-xs font-semibold mb-2 ${
                        item.available ? "text-[#009f9a]" : "text-[#718398]"
                      }`}>
                        <span className={`w-2 h-2 rounded-full ${item.available ? "bg-[#009f9a]" : "bg-[#b0bec5]"}`} />
                        {item.available ? "Available" : "Not Available"}
                      </div>

                      <p className="font-bold text-[#10233f] text-base leading-tight group-hover:text-[#009f9a] transition-colors">
                        {item.name}
                      </p>
                      <p className="text-sm text-[#718398] mt-0.5 mb-3">{item.speciality}</p>

                      {/* Book CTA */}
                      <div className="pt-3 border-t border-[#dceeed]">
                        <span className="text-sm font-semibold text-[#009f9a] group-hover:underline">
                          Book Appointment →
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default Doctors;
