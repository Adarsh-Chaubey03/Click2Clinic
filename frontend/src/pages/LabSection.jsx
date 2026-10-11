import { useState, useEffect, useContext } from "react";
import { motion } from "framer-motion";
import { FaSearch, FaVial, FaHome, FaFileAlt, FaUsers, FaHeartbeat } from "react-icons/fa";
import axios from "axios";
import { AppContext } from "../context/AppContext";
import { useNavigate } from "react-router-dom";
import labImage from "../assets/lab_image.jpg";
import { toast } from "react-toastify";

/* ── Static test categories matching the 8 available tests ── */
const CATEGORIES = [
  "All",
  "Hematology",
  "Endocrinology",
  "Cardiology",
  "Biochemistry",
  "Nephrology",
  "Diabetes Tests",
  "Urinalysis",
];

const SORT_OPTIONS = ["Most Popular", "Price: Low to High", "Price: High to Low", "Name: A-Z"];

/* ── Icon + bg color per test type ── */
const TEST_STYLE = [
  { bg: "#fce8e8", icon: <svg viewBox="0 0 48 48" className="w-8 h-8" fill="none"><ellipse cx="18" cy="30" rx="8" ry="11" fill="#f87171" opacity="0.85"/><ellipse cx="30" cy="30" rx="8" ry="11" fill="#fb923c" opacity="0.7"/><path d="M24 14 Q24 8 18 10 Q24 6 24 14Z" fill="#f87171"/></svg> },
  { bg: "#f0eaf8", icon: <svg viewBox="0 0 48 48" className="w-8 h-8" fill="none"><ellipse cx="24" cy="28" rx="11" ry="8" fill="#a78bfa" opacity="0.8"/><ellipse cx="15" cy="21" rx="6" ry="9" fill="#c4b5fd" opacity="0.9"/><ellipse cx="33" cy="21" rx="6" ry="9" fill="#c4b5fd" opacity="0.9"/><circle cx="24" cy="20" r="4" fill="#7c3aed" opacity="0.7"/></svg> },
  { bg: "#fce8f0", icon: <svg viewBox="0 0 48 48" className="w-8 h-8" fill="none"><path d="M24 40 C13 33 7 25 7 17 C7 11 13 7 24 12 C35 7 41 11 41 17 C41 25 35 33 24 40Z" fill="#f472b6" opacity="0.8"/><path d="M15 21 Q24 15 33 21" stroke="white" strokeWidth="2" strokeLinecap="round"/><circle cx="24" cy="24" r="4" fill="white" opacity="0.65"/></svg> },
  { bg: "#fef3e2", icon: <svg viewBox="0 0 48 48" className="w-8 h-8" fill="none"><path d="M10 22 Q10 12 20 10 Q30 8 36 16 Q42 24 34 32 Q26 40 18 36 Q10 30 10 22Z" fill="#fb923c" opacity="0.85"/><path d="M20 18 Q27 15 32 21" stroke="white" strokeWidth="1.5" strokeLinecap="round"/></svg> },
  { bg: "#ede9fe", icon: <svg viewBox="0 0 48 48" className="w-8 h-8" fill="none"><ellipse cx="16" cy="24" rx="8" ry="13" fill="#a78bfa" opacity="0.85"/><ellipse cx="32" cy="24" rx="8" ry="13" fill="#7c3aed" opacity="0.75"/><ellipse cx="16" cy="24" rx="4" ry="7" fill="#ede9fe" opacity="0.6"/><ellipse cx="32" cy="24" rx="4" ry="7" fill="#ede9fe" opacity="0.6"/></svg> },
  { bg: "#e0e7ff", icon: <svg viewBox="0 0 48 48" className="w-8 h-8" fill="none"><circle cx="24" cy="24" r="11" fill="#6366f1" opacity="0.8"/>{[0,45,90,135,180,225,270,315].map((d,i)=><line key={i} x1={24+11*Math.cos(d*Math.PI/180)} y1={24+11*Math.sin(d*Math.PI/180)} x2={24+17*Math.cos(d*Math.PI/180)} y2={24+17*Math.sin(d*Math.PI/180)} stroke="#818cf8" strokeWidth="2" strokeLinecap="round"/>)}<circle cx="24" cy="24" r="5" fill="#e0e7ff" opacity="0.9"/></svg> },
  { bg: "#fef9c3", icon: <svg viewBox="0 0 48 48" className="w-8 h-8" fill="none"><circle cx="24" cy="20" r="10" fill="#fbbf24" opacity="0.8"/><path d="M18 32 Q24 28 30 32 L28 40 H20 Z" fill="#f59e0b" opacity="0.7"/></svg> },
  { bg: "#ecfdf5", icon: <svg viewBox="0 0 48 48" className="w-8 h-8" fill="none"><rect x="16" y="8" width="16" height="32" rx="6" fill="#34d399" opacity="0.8"/><rect x="8" y="16" width="32" height="16" rx="6" fill="#10b981" opacity="0.6"/></svg> },
];

const LabSection = () => {
  const { backendUrl, token } = useContext(AppContext);
  const [labTests, setLabTests]         = useState([]);
  const [searchTerm, setSearchTerm]     = useState("");
  const [searchInput, setSearchInput]   = useState("");
  const [selectedCat, setSelectedCat]   = useState("All");
  const [priceMin, setPriceMin]         = useState("");
  const [priceMax, setPriceMax]         = useState("");
  const [availFilter, setAvailFilter]   = useState({ inStock: true, homeColl: false });
  const [labSearch, setLabSearch]       = useState("");
  const [sortBy, setSortBy]             = useState("Most Popular");
  const [viewMode, setViewMode]         = useState("grid");
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState(null);
  const navigate = useNavigate();

  /* ── Fetch (no localStorage cache — always fetch fresh from API) ── */
  const fetchLabTests = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`${backendUrl}/api/user/lab-data`);
      if (data.success) { setLabTests(data.labData); }
      else setError(data.message || "Failed to load.");
    } catch { setError("Failed to fetch lab tests."); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchLabTests(); }, []);

  /* ── Filter + sort ── */
  const filtered = labTests
    .filter(t => {
      const name = (t.testname || t.name || "").toLowerCase();
      if (searchTerm && !name.includes(searchTerm.toLowerCase())) return false;
      if (selectedCat !== "All" && (t.category || "") !== selectedCat) return false;
      if (priceMin && t.price < Number(priceMin)) return false;
      if (priceMax && t.price > Number(priceMax)) return false;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === "Price: Low to High") return a.price - b.price;
      if (sortBy === "Price: High to Low") return b.price - a.price;
      if (sortBy === "Name: A-Z") return (a.testname||a.name||"").localeCompare(b.testname||b.name||"");
      return 0;
    });

  const handleClick = (id) => {
    if (token) { navigate(`/lab/${id}`); window.scrollTo(0, 0); }
    else toast.warn("Login to book a test");
  };

  const clearFilters = () => {
    setSearchTerm(""); setSearchInput(""); setSelectedCat("All");
    setPriceMin(""); setPriceMax("");
    setAvailFilter({ inStock: true, homeColl: false });
  };

  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(110deg,#effcfb 0%,#f2fbfa 50%,#e9f8f8 100%)" }}>

      {/* ══ HERO ══ */}
      <div className="relative h-48 sm:h-56 lg:h-64 overflow-hidden" style={{ backgroundImage:`url(${labImage})`, backgroundSize:"cover", backgroundPosition:"center" }}>
        <div className="absolute inset-0 bg-[#009f9a]/70" />
        <div className="relative z-10 h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col justify-center">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            {/* Left text */}
            <div className="max-w-xl">
              <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-2 leading-tight">
                Book <span className="text-white">Lab Tests</span> Online
              </h1>
              <p className="text-white/80 text-sm mb-6">Accurate diagnostics with home sample collection and fast results.</p>
            </div>
            {/* Trusted badge */}
            <div className="hidden lg:flex flex-col items-center justify-center bg-white rounded-2xl px-8 py-5 shadow-xl text-center">
              <div className="w-10 h-10 rounded-full bg-[#e8f9f6] flex items-center justify-center mb-2">
                <FaUsers className="text-[#009f9a] text-lg" />
              </div>
              <p className="text-sm text-[#5f7185]">Trusted by</p>
              <p className="text-2xl font-extrabold text-[#10233f]">10,000+</p>
              <p className="text-sm text-[#5f7185]">patients</p>
            </div>
          </div>
        </div>
      </div>

      {/* ══ MAIN LAYOUT ══ */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex gap-6" style={{ alignItems:"flex-start" }}>

          {/* ── LEFT SIDEBAR ── */}
          <div className="hidden lg:block w-56 flex-shrink-0" style={{ position:"sticky", top:"80px", alignSelf:"flex-start" }}>
            <div className="bg-white rounded-2xl border border-[#dceeed] shadow-sm p-5">
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-bold text-[#10233f]">Filters</h3>
                <button onClick={clearFilters} className="text-xs font-semibold text-[#009f9a] hover:underline">Clear All</button>
              </div>

              {/* Category */}
              <div className="mb-5">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-bold text-[#10233f]">Category</p>
                  <svg className="w-4 h-4 text-[#718398]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7"/></svg>
                </div>
                <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                  {CATEGORIES.map(cat => {
                    const active = selectedCat === cat;
                    return (
                      <label key={cat} className="flex items-start gap-2.5 cursor-pointer group">
                        <div onClick={() => setSelectedCat(cat)}
                          className={`mt-0.5 w-4 h-4 rounded flex-shrink-0 border-2 flex items-center justify-center cursor-pointer transition-all ${active ? "bg-[#009f9a] border-[#009f9a]" : "border-[#b0bec5] group-hover:border-[#009f9a]"}`}>
                          {active && <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7"/></svg>}
                        </div>
                        <span onClick={() => setSelectedCat(cat)} className="text-xs text-[#5f7185] group-hover:text-[#10233f] cursor-pointer leading-snug">{cat}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="border-t border-[#dceeed] my-4"/>

              {/* Price Range */}
              <div className="mb-5">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-bold text-[#10233f]">Price Range</p>
                  <svg className="w-4 h-4 text-[#718398]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7"/></svg>
                </div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex-1 relative">
                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[#718398] text-xs">₹</span>
                    <input type="number" placeholder="Min" value={priceMin} onChange={e=>setPriceMin(e.target.value)}
                      className="w-full pl-5 pr-2 py-1.5 border border-[#dceeed] rounded-lg text-xs text-[#10233f] focus:outline-none focus:border-[#009f9a]"/>
                  </div>
                  <span className="text-[#718398] text-xs">—</span>
                  <div className="flex-1 relative">
                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[#718398] text-xs">₹</span>
                    <input type="number" placeholder="Max" value={priceMax} onChange={e=>setPriceMax(e.target.value)}
                      className="w-full pl-5 pr-2 py-1.5 border border-[#dceeed] rounded-lg text-xs text-[#10233f] focus:outline-none focus:border-[#009f9a]"/>
                  </div>
                </div>
                <div className="relative h-1.5 bg-[#dceeed] rounded-full mx-1">
                  <div className="absolute h-1.5 rounded-full" style={{ background:"linear-gradient(135deg,#04a99d,#008eaa)", left:"0%", right:"0%" }}/>
                  <div className="absolute w-4 h-4 rounded-full bg-[#009f9a] border-2 border-white shadow -translate-y-1/3" style={{ left:"0%" }}/>
                  <div className="absolute w-4 h-4 rounded-full bg-[#009f9a] border-2 border-white shadow -translate-y-1/3" style={{ left:"100%" }}/>
                </div>
              </div>

              <div className="border-t border-[#dceeed] my-4"/>

              {/* Availability */}
              <div className="mb-5">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-bold text-[#10233f]">Availability</p>
                  <svg className="w-4 h-4 text-[#718398]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7"/></svg>
                </div>
                {[{ key:"inStock", label:"In Stock" },{ key:"homeColl", label:"Home Collection Available" }].map(({ key, label }) => (
                  <label key={key} className="flex items-center gap-2.5 cursor-pointer group mb-2">
                    <div onClick={() => setAvailFilter(p=>({...p,[key]:!p[key]}))}
                      className={`w-4 h-4 rounded flex-shrink-0 border-2 flex items-center justify-center cursor-pointer transition-all ${availFilter[key] ? "bg-[#009f9a] border-[#009f9a]" : "border-[#b0bec5] group-hover:border-[#009f9a]"}`}>
                      {availFilter[key] && <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7"/></svg>}
                    </div>
                    <span onClick={() => setAvailFilter(p=>({...p,[key]:!p[key]}))} className="text-xs text-[#5f7185] group-hover:text-[#10233f] cursor-pointer">{label}</span>
                  </label>
                ))}
              </div>

              <div className="border-t border-[#dceeed] my-4"/>

              {/* Labs / Partners */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-bold text-[#10233f]">Labs / Partners</p>
                  <svg className="w-4 h-4 text-[#718398]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7"/></svg>
                </div>
                <div className="relative">
                  <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#b0bec5]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
                  <input type="text" placeholder="Search labs..." value={labSearch} onChange={e=>setLabSearch(e.target.value)}
                    className="w-full pl-7 pr-3 py-1.5 border border-[#dceeed] rounded-lg text-xs text-[#10233f] focus:outline-none focus:border-[#009f9a]"/>
                </div>
              </div>
            </div>
          </div>

          {/* ── RIGHT CONTENT ── */}
          <div className="flex-1 min-w-0">

            {/* Top bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-4">
              <div className="relative flex-1">
                <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#b0bec5]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
                <input type="text" placeholder="Search tests, packages, categories..."
                  value={searchInput} onChange={e=>setSearchInput(e.target.value)}
                  onKeyDown={e=>e.key==="Enter"&&setSearchTerm(searchInput)}
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#dceeed] rounded-xl text-sm text-[#10233f] placeholder-[#b0bec5] focus:outline-none focus:ring-2 focus:ring-[#009f9a] focus:border-[#009f9a] transition-all"/>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-[#718398] whitespace-nowrap hidden sm:inline">Sort by</span>
                <select value={sortBy} onChange={e=>setSortBy(e.target.value)}
                  className="pl-3 pr-8 py-2.5 bg-white border border-[#dceeed] rounded-xl text-sm text-[#10233f] focus:outline-none focus:border-[#009f9a] cursor-pointer">
                  {SORT_OPTIONS.map(o=><option key={o}>{o}</option>)}
                </select>
              </div>
              <div className="flex items-center gap-1 bg-white border border-[#dceeed] rounded-xl p-1">
                <button onClick={()=>setViewMode("grid")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${viewMode==="grid" ? "bg-[#effcfb] text-[#009f9a]" : "text-[#718398] hover:text-[#10233f]"}`}>
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 16 16"><path d="M1 2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 01-1 1H2a1 1 0 01-1-1V2zm5 0a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 01-1 1H7a1 1 0 01-1-1V2zm5 0a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 01-1 1h-2a1 1 0 01-1-1V2zM1 7a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 01-1 1H2a1 1 0 01-1-1V7zm5 0a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 01-1 1H7a1 1 0 01-1-1V7zm5 0a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 01-1 1h-2a1 1 0 01-1-1V7z"/></svg>
                  Grid
                </button>
                <button onClick={()=>setViewMode("list")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${viewMode==="list" ? "bg-[#effcfb] text-[#009f9a]" : "text-[#718398] hover:text-[#10233f]"}`}>
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16"/></svg>
                  List
                </button>
              </div>
            </div>

            {/* Count */}
            {!loading && <p className="text-sm text-[#5f7185] mb-4">Showing <span className="font-bold text-[#10233f]">{filtered.length}</span> tests</p>}

            {/* Loading */}
            {loading && (
              <div className="flex items-center justify-center py-20 gap-3 text-[#5f7185]">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#009f9a]"/>
                Loading lab tests...
              </div>
            )}

            {/* Error */}
            {error && <div className="text-center py-12 text-red-500 font-medium">{error}</div>}

            {/* Empty */}
            {!loading && !error && filtered.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 bg-white rounded-2xl border border-[#dceeed]">
                <div className="w-16 h-16 bg-[#e8f9f6] rounded-full flex items-center justify-center mb-4">
                  <FaVial className="text-[#009f9a] text-2xl"/>
                </div>
                <p className="font-semibold text-[#10233f] mb-1">No tests found</p>
                <p className="text-sm text-[#718398] mb-4">Try adjusting your filters</p>
                <button onClick={clearFilters} className="px-5 py-2 rounded-xl text-sm font-semibold text-white" style={{ background:"linear-gradient(135deg,#04a99d,#008eaa)" }}>Clear Filters</button>
              </div>
            )}

            {/* ── GRID VIEW ── */}
            {!loading && !error && filtered.length > 0 && viewMode === "grid" && (
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
                {filtered.map((test, i) => {
                  const style = TEST_STYLE[i % TEST_STYLE.length];
                  const name = test.testname || test.name || "Lab Test";
                  const origPrice = test.price + Math.round(test.price * 0.3);
                  return (
                    <motion.div key={test._id || i}
                      initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.35, delay:Math.min(i * 0.03, 0.3), ease:"easeOut" }}
                      className="group bg-white rounded-2xl border border-[#dceeed] overflow-hidden cursor-pointer hover:-translate-y-1 hover:border-[#009f9a] hover:shadow-md transition-[transform,box-shadow,border-color] duration-300 ease-out flex flex-col"
                    >
                      {/* Top: icon + heart */}
                      <div className="relative p-5 flex items-start justify-between">
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl" style={{ backgroundColor: style.bg }}>
                          {style.icon}
                        </div>
                        <button className="text-[#b0bec5] hover:text-red-400 transition-colors">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/></svg>
                        </button>
                      </div>

                      {/* Info */}
                      <div className="px-4 pb-4 flex-1 flex flex-col">
                        <p className="text-sm font-bold text-[#10233f] leading-snug mb-1 group-hover:text-[#009f9a] transition-colors line-clamp-2">{name}</p>
                        <p className="text-xs text-[#718398] mb-3">{test.category || "Diagnostic test"}</p>

                        {/* Badges */}
                        <div className="flex flex-wrap gap-1.5 mb-3">
                          <span className="px-2 py-0.5 rounded-full bg-[#ddf8f2] text-[#009f9a] text-[10px] font-semibold">Home Collection</span>
                          <span className="px-2 py-0.5 rounded-full bg-[#e8f9f6] text-[#009f9a] text-[10px] font-semibold">Report in 24 hrs</span>
                        </div>

                        {/* Price */}
                        <div className="flex items-baseline gap-1.5 mb-3 mt-auto">
                          <span className="text-base font-extrabold text-[#10233f]">₹{test.price}</span>
                          <span className="text-xs text-[#b0bec5] line-through">₹{origPrice}</span>
                        </div>

                        {/* Book button */}
                        <button
                          onClick={() => handleClick(test._id)}
                          className="w-full py-2 rounded-xl text-xs font-bold text-white flex items-center justify-center gap-1.5 transition-all hover:opacity-90"
                          style={{ background:"linear-gradient(135deg,#04a99d,#008eaa)" }}
                        >
                          Book Test
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg>
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}

            {/* ── LIST VIEW ── */}
            {!loading && !error && filtered.length > 0 && viewMode === "list" && (
              <div className="space-y-3">
                {filtered.map((test, i) => {
                  const style = TEST_STYLE[i % TEST_STYLE.length];
                  const name = test.testname || test.name || "Lab Test";
                  const origPrice = test.price + Math.round(test.price * 0.3);
                  return (
                    <motion.div key={test._id || i}
                      initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.35, delay:Math.min(i * 0.03, 0.3), ease:"easeOut" }}
                      className="group flex items-center gap-4 bg-white rounded-2xl border border-[#dceeed] p-4 hover:-translate-y-0.5 hover:border-[#009f9a] hover:shadow-md transition-[transform,box-shadow,border-color] duration-300 ease-out"
                    >
                      <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl" style={{ backgroundColor: style.bg }}>{style.icon}</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-[#10233f] group-hover:text-[#009f9a] transition-colors">{name}</p>
                        <p className="text-xs text-[#718398]">{test.category || "Diagnostic test"}</p>
                        <div className="flex gap-1.5 mt-1">
                          <span className="px-2 py-0.5 rounded-full bg-[#ddf8f2] text-[#009f9a] text-[10px] font-semibold">Home Collection</span>
                          <span className="px-2 py-0.5 rounded-full bg-[#e8f9f6] text-[#009f9a] text-[10px] font-semibold">Report in 24 hrs</span>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="flex items-baseline gap-1.5 justify-end mb-2">
                          <span className="text-base font-extrabold text-[#10233f]">₹{test.price}</span>
                          <span className="text-xs text-[#b0bec5] line-through">₹{origPrice}</span>
                        </div>
                        <button onClick={() => handleClick(test._id)}
                          className="px-4 py-1.5 rounded-xl text-xs font-bold text-white flex items-center gap-1.5 transition-all hover:opacity-90"
                          style={{ background:"linear-gradient(135deg,#04a99d,#008eaa)" }}>
                          Book Test <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg>
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}

            {/* ── Health Checkup Packages banner ── */}
            {!loading && !error && (
              <div className="mt-8 rounded-2xl border border-[#dceeed] bg-white p-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
                <div>
                  <h3 className="text-xl font-extrabold text-[#10233f] mb-1">Health Checkup Packages</h3>
                  <p className="text-sm text-[#5f7185] mb-4">Comprehensive health monitoring solutions for you and your family.</p>
                  <div className="flex flex-wrap gap-4 text-xs font-medium text-[#5f7185]">
                    {[
                      { icon:<FaVial className="text-[#009f9a]"/>, text:"Multiple tests at lower prices" },
                      { icon:<FaHome className="text-[#009f9a]"/>, text:"Home collection available" },
                      { icon:<FaFileAlt className="text-[#009f9a]"/>, text:"Detailed digital reports" },
                    ].map(b=>(
                      <span key={b.text} className="flex items-center gap-1.5">{b.icon}{b.text}</span>
                    ))}
                  </div>
                  <button className="mt-4 px-5 py-2.5 rounded-xl text-sm font-bold text-white flex items-center gap-2 transition-all hover:opacity-90"
                    style={{ background:"linear-gradient(135deg,#04a99d,#008eaa)" }}>
                    Explore Packages
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg>
                  </button>
                </div>
                <div className="flex h-24 w-24 flex-shrink-0 items-center justify-center rounded-full" style={{ background:"linear-gradient(135deg,#04a99d,#008eaa)" }}>
                  <FaHeartbeat className="text-white text-4xl"/>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};

export default LabSection;
