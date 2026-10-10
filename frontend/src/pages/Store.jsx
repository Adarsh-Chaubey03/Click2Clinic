import { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import { useCart } from "../context/CartContext";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import pharmacyBg from "../assets/pharmacy.png";

const CATEGORIES = ["All", "Tablets", "Syrups", "Capsules", "Ointments", "Injections", "Dressings"];
const CAT_MAP    = { All:"all", Tablets:"tablet", Syrups:"syrup", Capsules:"capsule", Ointments:"ointment", Injections:"injection", Dressings:"dressing" };
const SORT_OPTIONS = ["Most Relevant", "Price: Low to High", "Price: High to Low", "Name: A-Z"];

const Store = () => {
  const { category } = useParams();
  const { medicines } = useContext(AppContext);
  const { addToCart }  = useCart();
  const navigate       = useNavigate();

  const [searchTerm,        setSearchTerm]        = useState("");
  const [searchInput,       setSearchInput]        = useState("");
  const [selectedCategory,  setSelectedCategory]   = useState(category || "all");
  const [priceMin,          setPriceMin]           = useState("");
  const [priceMax,          setPriceMax]           = useState("");
  const [priceRange,        setPriceRange]         = useState([0, 500]);
  const [availFilter,       setAvailFilter]        = useState({ inStock: true, outOfStock: false });
  const [brandSearch,       setBrandSearch]        = useState("");
  const [sortBy,            setSortBy]             = useState("Most Relevant");
  const [viewMode,          setViewMode]           = useState("grid"); // grid | list
  const [itemQuantities,    setItemQuantities]     = useState({});
  const [filteredMedicines, setFilteredMedicines] = useState([]);

  /* derive unique brands */
  const allBrands = [...new Set((medicines || []).map(m => m.brand).filter(Boolean))];
  const visibleBrands = allBrands.filter(b => b.toLowerCase().includes(brandSearch.toLowerCase()));

  useEffect(() => {
    let result = medicines || [];
    if (selectedCategory !== "all") result = result.filter(m => m.category === selectedCategory);
    if (searchTerm) result = result.filter(m => m.name.toLowerCase().includes(searchTerm.toLowerCase()));
    const min = Number(priceMin) || 0;
    const max = Number(priceMax) || Infinity;
    result = result.filter(m => m.price >= min && m.price <= max);
    if (availFilter.inStock && !availFilter.outOfStock)  result = result.filter(m => m.available);
    if (!availFilter.inStock && availFilter.outOfStock)  result = result.filter(m => !m.available);
    if (sortBy === "Price: Low to High")  result = [...result].sort((a,b) => a.price - b.price);
    if (sortBy === "Price: High to Low")  result = [...result].sort((a,b) => b.price - a.price);
    if (sortBy === "Name: A-Z")           result = [...result].sort((a,b) => a.name.localeCompare(b.name));
    setFilteredMedicines(result);
  }, [medicines, selectedCategory, searchTerm, priceMin, priceMax, availFilter, sortBy]);

  useEffect(() => { if (category) setSelectedCategory(category); }, [category]);

  const handleCategoryClick = (label) => {
    const id = CAT_MAP[label];
    setSelectedCategory(id);
    id === "all" ? navigate("/store") : navigate(`/store/${id}`);
  };

  const handleQty = (id, delta) =>
    setItemQuantities(p => ({ ...p, [id]: Math.max(1, (p[id] || 1) + delta) }));

  const handleAddToCart = (e, med) => {
    e.stopPropagation();
    if (!med.available) { toast.error("Out of stock"); return; }
    const qty = itemQuantities[med._id] || 1;
    addToCart(med, qty);
    toast.success(`${qty} × ${med.name} added to cart!`);
    setItemQuantities(p => ({ ...p, [med._id]: 1 }));
  };

  const clearFilters = () => {
    setSearchTerm(""); setSearchInput(""); setPriceMin(""); setPriceMax("");
    setAvailFilter({ inStock: true, outOfStock: false });
    setSelectedCategory("all"); navigate("/store");
  };

  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(110deg,#effcfb 0%,#f2fbfa 50%,#e9f8f8 100%)" }}>

      {/* ── HERO ── */}
      <div className="relative overflow-hidden">
        {/* Full-width background image */}
        <img
          src={pharmacyBg}
          alt="Pharmacy hero"
          className="w-full h-48 sm:h-56 lg:h-64 object-cover object-center"
        />
        {/* Overlay — left-side teal gradient so text is readable */}
        <div className="absolute inset-0"
          style={{ background: "linear-gradient(90deg, rgba(0,159,154,0.82) 0%, rgba(0,159,154,0.55) 45%, rgba(0,159,154,0.05) 100%)" }} />

        {/* Text content */}
        <div className="absolute inset-0 flex items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8"
          >
            <div className="max-w-lg">
              <h1 className="mb-2 text-2xl sm:text-3xl lg:text-4xl font-extrabold leading-tight text-white">
                Medicines, <span className="text-[#c9ffef]">Delivered</span> to Your Door.
              </h1>
              <p className="mb-4 text-xs sm:text-sm text-white/80 max-w-sm leading-relaxed">
                Your everyday healthcare essentials, from trusted pharmacies to your doorstep.
              </p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* ── MAIN LAYOUT ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex gap-6" style={{ alignItems: "flex-start" }}>

          {/* ══ LEFT SIDEBAR FILTERS ══ */}
          <div className="hidden lg:block w-56 flex-shrink-0" style={{ position:"sticky", top:"80px", alignSelf:"flex-start" }}>
            <div className="bg-white rounded-2xl border border-[#dceeed] shadow-sm p-5">

              {/* Header */}
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-bold text-[#10233f] text-base">Filters</h3>
                <button onClick={clearFilters} className="text-xs font-semibold text-[#009f9a] hover:underline">Clear All</button>
              </div>

              {/* Category */}
              <div className="mb-5">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-bold text-[#10233f]">Category</p>
                  <svg className="w-4 h-4 text-[#718398]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7"/>
                  </svg>
                </div>
                <div className="space-y-2">
                  {CATEGORIES.map(cat => {
                    const id = CAT_MAP[cat];
                    const active = selectedCategory === id;
                    return (
                      <label key={cat} className="flex items-center gap-2.5 cursor-pointer group">
                        <div
                          onClick={() => handleCategoryClick(cat)}
                          className={`w-4 h-4 rounded flex-shrink-0 border-2 flex items-center justify-center cursor-pointer transition-all ${
                            active ? "bg-[#009f9a] border-[#009f9a]" : "border-[#b0bec5] group-hover:border-[#009f9a]"
                          }`}
                        >
                          {active && <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7"/>
                          </svg>}
                        </div>
                        <span onClick={() => handleCategoryClick(cat)} className="text-sm text-[#5f7185] group-hover:text-[#10233f] cursor-pointer">{cat}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="border-t border-[#dceeed] my-4" />

              {/* Price Range */}
              <div className="mb-5">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-bold text-[#10233f]">Price Range</p>
                  <svg className="w-4 h-4 text-[#718398]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7"/>
                  </svg>
                </div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex-1 relative">
                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[#718398] text-xs">₹</span>
                    <input type="number" placeholder="Min" value={priceMin}
                      onChange={e => setPriceMin(e.target.value)}
                      className="w-full pl-5 pr-2 py-1.5 border border-[#dceeed] rounded-lg text-xs text-[#10233f] focus:outline-none focus:border-[#009f9a]"/>
                  </div>
                  <span className="text-[#718398] text-xs">—</span>
                  <div className="flex-1 relative">
                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[#718398] text-xs">₹</span>
                    <input type="number" placeholder="Max" value={priceMax}
                      onChange={e => setPriceMax(e.target.value)}
                      className="w-full pl-5 pr-2 py-1.5 border border-[#dceeed] rounded-lg text-xs text-[#10233f] focus:outline-none focus:border-[#009f9a]"/>
                  </div>
                </div>
                {/* Slider track */}
                <div className="relative h-1.5 bg-[#dceeed] rounded-full mx-1">
                  <div className="absolute h-1.5 rounded-full" style={{ background:"linear-gradient(135deg,#04a99d,#008eaa)", left:"0%", right:"0%" }}/>
                  <div className="absolute w-4 h-4 rounded-full bg-[#009f9a] border-2 border-white shadow -translate-y-1/3" style={{ left:"0%" }}/>
                  <div className="absolute w-4 h-4 rounded-full bg-[#009f9a] border-2 border-white shadow -translate-y-1/3" style={{ left:"100%" }}/>
                </div>
              </div>

              <div className="border-t border-[#dceeed] my-4" />

              {/* Availability */}
              <div className="mb-5">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-bold text-[#10233f]">Availability</p>
                  <svg className="w-4 h-4 text-[#718398]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7"/>
                  </svg>
                </div>
                <div className="space-y-2">
                  {[{ key:"inStock", label:"In Stock" },{ key:"outOfStock", label:"Out of Stock" }].map(({ key, label }) => (
                    <label key={key} className="flex items-center gap-2.5 cursor-pointer group">
                      <div
                        onClick={() => setAvailFilter(p => ({ ...p, [key]: !p[key] }))}
                        className={`w-4 h-4 rounded flex-shrink-0 border-2 flex items-center justify-center cursor-pointer transition-all ${
                          availFilter[key] ? "bg-[#009f9a] border-[#009f9a]" : "border-[#b0bec5] group-hover:border-[#009f9a]"
                        }`}
                      >
                        {availFilter[key] && <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7"/>
                        </svg>}
                      </div>
                      <span onClick={() => setAvailFilter(p => ({ ...p, [key]: !p[key] }))} className="text-sm text-[#5f7185] group-hover:text-[#10233f] cursor-pointer">{label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="border-t border-[#dceeed] my-4" />

              {/* Brands */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-bold text-[#10233f]">Brands</p>
                  <svg className="w-4 h-4 text-[#718398]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7"/>
                  </svg>
                </div>
                <div className="relative mb-2">
                  <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#b0bec5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                  </svg>
                  <input type="text" placeholder="Search brands..." value={brandSearch}
                    onChange={e => setBrandSearch(e.target.value)}
                    className="w-full pl-7 pr-3 py-1.5 border border-[#dceeed] rounded-lg text-xs text-[#10233f] focus:outline-none focus:border-[#009f9a]"/>
                </div>
                {visibleBrands.length === 0 && <p className="text-xs text-[#718398]">No brands found</p>}
              </div>

            </div>
          </div>

          {/* ══ RIGHT — SEARCH BAR + SORT + GRID ══ */}
          <div className="flex-1 min-w-0">

            {/* Top bar: search + Search btn + sort + view toggle */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-4">
              {/* Search */}
              <div className="relative flex-1">
                <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#b0bec5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                </svg>
                <input type="text" placeholder="Search for medicines, health products, brands..."
                  value={searchInput} onChange={e => setSearchInput(e.target.value)}
                  onKeyDown={e => e.key==="Enter" && setSearchTerm(searchInput)}
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#dceeed] rounded-xl text-sm text-[#10233f] placeholder-[#b0bec5] focus:outline-none focus:ring-2 focus:ring-[#009f9a] focus:border-[#009f9a] transition-all"/>
              </div>
              {/* Search button */}
              <button
                onClick={() => setSearchTerm(searchInput)}
                className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90"
                style={{ background:"linear-gradient(135deg,#04a99d,#008eaa)" }}
              >
                Search
              </button>
              {/* Sort */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-[#718398] whitespace-nowrap hidden sm:inline">Sort by</span>
                <select value={sortBy} onChange={e => setSortBy(e.target.value)}
                  className="pl-3 pr-8 py-2.5 bg-white border border-[#dceeed] rounded-xl text-sm text-[#10233f] focus:outline-none focus:border-[#009f9a] cursor-pointer">
                  {SORT_OPTIONS.map(o => <option key={o}>{o}</option>)}
                </select>
              </div>
              {/* Grid / List toggle */}
              <div className="flex items-center gap-1 bg-white border border-[#dceeed] rounded-xl p-1">
                <button onClick={() => setViewMode("grid")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${viewMode==="grid" ? "bg-[#effcfb] text-[#009f9a]" : "text-[#718398] hover:text-[#10233f]"}`}>
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M1 2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 01-1 1H2a1 1 0 01-1-1V2zm5 0a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 01-1 1H7a1 1 0 01-1-1V2zm5 0a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 01-1 1h-2a1 1 0 01-1-1V2zM1 7a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 01-1 1H2a1 1 0 01-1-1V7zm5 0a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 01-1 1H7a1 1 0 01-1-1V7zm5 0a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 01-1 1h-2a1 1 0 01-1-1V7zM1 12a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 01-1 1H2a1 1 0 01-1-1v-2zm5 0a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 01-1 1H7a1 1 0 01-1-1v-2zm5 0a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 01-1 1h-2a1 1 0 01-1-1v-2z"/>
                  </svg>
                  Grid
                </button>
                <button onClick={() => setViewMode("list")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${viewMode==="list" ? "bg-[#effcfb] text-[#009f9a]" : "text-[#718398] hover:text-[#10233f]"}`}>
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16"/>
                  </svg>
                  List
                </button>
              </div>
            </div>

            {/* Results count */}
            <p className="text-sm text-[#5f7185] mb-4">
              Showing <span className="font-bold text-[#10233f]">{filteredMedicines.length}</span> products
            </p>

            {/* ── PRODUCT GRID / LIST ── */}
            {filteredMedicines.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 bg-white rounded-2xl border border-[#dceeed]">
                <div className="w-16 h-16 bg-[#e8f9f6] rounded-full flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-[#009f9a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"/>
                  </svg>
                </div>
                <p className="font-semibold text-[#10233f] mb-1">No medicines found</p>
                <p className="text-sm text-[#718398] mb-4">Try adjusting your filters or search term</p>
                <button onClick={clearFilters} className="px-5 py-2 rounded-xl text-sm font-semibold text-white" style={{ background:"linear-gradient(135deg,#04a99d,#008eaa)" }}>
                  Clear Filters
                </button>
              </div>
            ) : viewMode === "grid" ? (
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
                {filteredMedicines.map((med, i) => (
                  <motion.div key={med._id}
                    initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay: i*0.02 }}
                    onClick={() => { navigate(`/medicine/${med._id}`); window.scrollTo(0,0); }}
                    className="group bg-white rounded-2xl border border-[#dceeed] overflow-hidden cursor-pointer hover:border-[#009f9a] hover:shadow-md transition-all duration-300"
                  >
                    {/* Image */}
                    <div className="relative bg-white p-3 h-36">
                      <img className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                        src={med.image} alt={med.name}
                        onError={e => e.target.src="https://via.placeholder.com/160x120?text=Med"}/>
                      {/* Stock badge */}
                      <div className={`absolute top-2 right-2 flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        med.available ? "text-[#009f9a]" : "text-red-500"}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${med.available ? "bg-[#009f9a]" : "bg-red-500"}`}/>
                        {med.available ? "In Stock" : "Out of Stock"}
                      </div>
                    </div>

                    {/* Info */}
                    <div className="px-3 pb-3">
                      <p className="text-[10px] font-bold uppercase tracking-wide text-[#009f9a] mb-0.5">
                        {med.category}
                      </p>
                      <p className="text-sm font-semibold text-[#10233f] leading-snug line-clamp-2 mb-1.5 group-hover:text-[#009f9a] transition-colors">
                        {med.name}
                      </p>
                      <p className="text-base font-extrabold text-[#10233f] mb-2">₹{med.price}</p>

                      {/* Qty + Add to Cart */}
                      <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center border border-[#dceeed] rounded-lg overflow-hidden">
                          <button onClick={e => { e.stopPropagation(); handleQty(med._id, -1); }}
                            disabled={!med.available || (itemQuantities[med._id]||1) <= 1}
                            className="w-7 h-7 flex items-center justify-center text-[#10233f] hover:bg-[#effcfb] disabled:opacity-40 text-sm font-bold">−</button>
                          <span className="w-6 text-center text-xs font-semibold text-[#10233f]">{itemQuantities[med._id]||1}</span>
                          <button onClick={e => { e.stopPropagation(); handleQty(med._id, 1); }}
                            disabled={!med.available}
                            className="w-7 h-7 flex items-center justify-center text-[#10233f] hover:bg-[#effcfb] disabled:opacity-40 text-sm font-bold">+</button>
                        </div>
                        <button onClick={e => handleAddToCart(e, med)}
                          disabled={!med.available}
                          className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                            med.available ? "text-white hover:opacity-90" : "bg-[#e8e8e8] text-[#b0bec5] cursor-not-allowed"
                          }`}
                          style={med.available ? { background:"linear-gradient(135deg,#04a99d,#008eaa)" } : {}}>
                          Add to Cart
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              /* LIST VIEW */
              <div className="space-y-3">
                {filteredMedicines.map((med, i) => (
                  <motion.div key={med._id}
                    initial={{ opacity:0, x:-10 }} animate={{ opacity:1, x:0 }} transition={{ delay: i*0.02 }}
                    onClick={() => { navigate(`/medicine/${med._id}`); window.scrollTo(0,0); }}
                    className="group flex items-center gap-4 bg-white rounded-2xl border border-[#dceeed] p-4 cursor-pointer hover:border-[#009f9a] hover:shadow-md transition-all duration-300"
                  >
                    <div className="w-20 h-20 flex-shrink-0 bg-white border border-[#dceeed] rounded-xl overflow-hidden">
                      <img className="w-full h-full object-contain group-hover:scale-105 transition-transform"
                        src={med.image} alt={med.name}
                        onError={e => e.target.src="https://via.placeholder.com/80?text=Med"}/>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-bold uppercase tracking-wide text-[#009f9a] mb-0.5">{med.category}</p>
                      <p className="text-sm font-semibold text-[#10233f] group-hover:text-[#009f9a] transition-colors">{med.name}</p>
                      <div className={`flex items-center gap-1 text-xs font-semibold mt-1 ${med.available ? "text-[#009f9a]" : "text-red-500"}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${med.available ? "bg-[#009f9a]" : "bg-red-500"}`}/>
                        {med.available ? "In Stock" : "Out of Stock"}
                      </div>
                    </div>
                    <div className="text-xl font-extrabold text-[#10233f]">₹{med.price}</div>
                    <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                      <div className="flex items-center border border-[#dceeed] rounded-lg overflow-hidden">
                        <button onClick={e => { e.stopPropagation(); handleQty(med._id,-1); }} disabled={!med.available||(itemQuantities[med._id]||1)<=1}
                          className="w-7 h-7 flex items-center justify-center text-[#10233f] hover:bg-[#effcfb] disabled:opacity-40 text-sm font-bold">−</button>
                        <span className="w-6 text-center text-xs font-semibold">{itemQuantities[med._id]||1}</span>
                        <button onClick={e => { e.stopPropagation(); handleQty(med._id,1); }} disabled={!med.available}
                          className="w-7 h-7 flex items-center justify-center text-[#10233f] hover:bg-[#effcfb] disabled:opacity-40 text-sm font-bold">+</button>
                      </div>
                      <button onClick={e => handleAddToCart(e,med)} disabled={!med.available}
                        className={`px-4 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                          med.available ? "text-white hover:opacity-90" : "bg-[#e8e8e8] text-[#b0bec5] cursor-not-allowed"
                        }`}
                        style={med.available ? { background:"linear-gradient(135deg,#04a99d,#008eaa)" } : {}}>
                        Add to Cart
                      </button>
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

export default Store;
