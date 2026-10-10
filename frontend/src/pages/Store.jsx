import { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import { useCart } from "../context/CartContext";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import pharmacyBg from "../assets/pharmacy.png";

const Store = () => {
  const { category } = useParams();
  const { medicines } = useContext(AppContext);
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const [filteredMedicines, setFilteredMedicines] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [priceFilter, setPriceFilter] = useState({ min: 0, max: Infinity });
  const [selectedCategory, setSelectedCategory] = useState(category || "all");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [itemQuantities, setItemQuantities] = useState({});

  const categories = [
    { id: "all", name: "All", icon: "🏪" },
    { id: "tablet", name: "Tablets", icon: "💊" },
    { id: "syrup", name: "Syrups", icon: "🧴" },
    { id: "capsule", name: "Capsules", icon: "💉" },
    { id: "ointment", name: "Ointments", icon: "🧈" },
    { id: "injection", name: "Injections", icon: "💉" },
    { id: "dressing", name: "Dressings", icon: "🩹" },
  ];

  useEffect(() => {
    let result = medicines || [];

    if (selectedCategory && selectedCategory !== "all") {
      result = result.filter((med) => med.category === selectedCategory);
    }

    if (searchTerm) {
      result = result.filter((med) =>
        med.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (priceFilter.min || priceFilter.max !== Infinity) {
      result = result.filter(
        (med) => med.price >= priceFilter.min && med.price <= priceFilter.max
      );
    }

    setFilteredMedicines(result);
  }, [medicines, selectedCategory, searchTerm, priceFilter]);

  useEffect(() => {
    if (category) {
      setSelectedCategory(category);
    }
  }, [category]);

  const handleCategoryClick = (catId) => {
    setSelectedCategory(catId);
    if (catId === "all") {
      navigate("/store");
    } else {
      navigate(`/store/${catId}`);
    }
  };

  const handleCardClick = (id) => {
    window.scrollTo(0, 0);
    navigate(`/medicine/${id}`);
  };

  const handleQuantityChange = (itemId, delta) => {
    setItemQuantities(prev => ({
      ...prev,
      [itemId]: Math.max(1, (prev[itemId] || 1) + delta)
    }));
  };

  const handleAddToCart = (e, med) => {
    e.stopPropagation();
    if (med.available) {
      const quantity = itemQuantities[med._id] || 1;
      addToCart(med, quantity);
      toast.success(`${quantity} × ${med.name} added to cart!`);
      setItemQuantities(prev => ({ ...prev, [med._id]: 1 }));
    } else {
      toast.error("This item is out of stock");
    }
  };

  const clearFilters = () => {
    setSearchTerm("");
    setPriceFilter({ min: 0, max: Infinity });
    setSelectedCategory("all");
    navigate("/store");
    setIsFilterOpen(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50/50 via-white to-white">
      {/* Hero Search Section */}
      <div
        className="relative overflow-hidden"
        style={{
          backgroundImage: `url(${pharmacyBg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {/* Dark overlay so text stays readable */}
        <div className="absolute inset-0 bg-[#009f9a]/70" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-6"
          >
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-2">
              Your Health, Delivered 💊
            </h1>
            <p className="text-white/80 text-sm sm:text-base">
              Order medicines from trusted pharmacies
            </p>
          </motion.div>

          {/* Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="max-w-2xl mx-auto"
          >
            <div className="relative">
              <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search for medicines, health products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-white rounded-2xl shadow-lg text-gray-800
                         placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-white/30
                         text-base transition-all duration-200"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Category Chips */}
      <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 py-3 overflow-x-auto scrollbar-hide">
            {categories.map((cat) => (
              <motion.button
                key={cat.id}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleCategoryClick(cat.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap text-sm font-medium
                           transition-all duration-200 flex-shrink-0
                           ${selectedCategory === cat.id
                    ? "bg-emerald-600 text-white shadow-md shadow-emerald-200"
                    : "bg-gray-100 text-gray-700 hover:bg-emerald-50 hover:text-emerald-700"
                  }`}
              >
                <span>{cat.icon}</span>
                <span>{cat.name}</span>
              </motion.button>
            ))}

            {/* Filter Button */}
            <button
              onClick={() => setIsFilterOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-gray-100 text-gray-700 
                       hover:bg-gray-200 whitespace-nowrap text-sm font-medium transition-all flex-shrink-0 ml-auto"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              <span className="hidden sm:inline">Filters</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Results Count */}
        <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-gray-600 text-sm">
            Showing <span className="font-semibold text-gray-800">{filteredMedicines.length}</span> products
            {selectedCategory !== "all" && (
              <span> in <span className="text-emerald-600 font-medium capitalize">{selectedCategory}</span></span>
            )}
          </p>
          {(searchTerm || selectedCategory !== "all" || priceFilter.min > 0 || priceFilter.max !== Infinity) && (
            <button
              onClick={clearFilters}
              className="text-sm text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Clear filters
            </button>
          )}
        </div>

        {/* Product Grid */}
        {filteredMedicines.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-16 bg-gray-50 rounded-2xl"
          >
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">No medicines found</h3>
            <p className="text-gray-500 mb-4">Try adjusting your search or filters</p>
            <button
              onClick={clearFilters}
              className="px-6 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-colors"
            >
              View All Medicines
            </button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 sm:gap-6">
            {filteredMedicines.map((med, index) => (
              <motion.div
                key={med._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
                onClick={() => handleCardClick(med._id)}
                className="group bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden 
                         hover:shadow-xl hover:border-emerald-100 transition-all duration-300 cursor-pointer"
              >
                {/* Image Container */}
                <div className="relative bg-gradient-to-br from-gray-50 to-gray-100 p-4 h-36 sm:h-44">
                  <img
                    className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                    src={med.image}
                    alt={med.name}
                  />

                  {/* Stock Badge */}
                  <div className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-medium
                                 ${med.available
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"}`}>
                    {med.available ? "In Stock" : "Out of Stock"}
                  </div>
                </div>

                {/* Content */}
                <div className="p-4">
                  {/* Category */}
                  <p className="text-xs text-emerald-600 font-medium uppercase tracking-wide mb-1">
                    {med.category}
                  </p>

                  {/* Name */}
                  <h3 className="font-semibold text-gray-800 text-sm sm:text-base mb-2 line-clamp-2 
                               group-hover:text-emerald-700 transition-colors min-h-[2.5rem]">
                    {med.name}
                  </h3>

                  {/* Price */}
                  <div className="flex items-baseline gap-1 mb-3">
                    <span className="text-lg sm:text-xl font-bold text-gray-900">₹{med.price}</span>
                    {med.originalPrice && med.originalPrice > med.price && (
                      <>
                        <span className="text-sm text-gray-400 line-through">₹{med.originalPrice}</span>
                        <span className="text-xs text-green-600 font-medium">
                          {Math.round((1 - med.price / med.originalPrice) * 100)}% off
                        </span>
                      </>
                    )}
                  </div>

                  {/* Quantity & Add to Cart */}
                  <div className="flex min-w-0 items-center gap-2">
                    {/* Quantity Selector */}
                    <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                      <button
                        onClick={(e) => { e.stopPropagation(); handleQuantityChange(med._id, -1); }}
                        className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-100 
                                 transition-colors disabled:opacity-50"
                        disabled={!med.available || (itemQuantities[med._id] || 1) <= 1}
                      >
                        −
                      </button>
                      <span className="w-8 text-center text-sm font-medium">
                        {itemQuantities[med._id] || 1}
                      </span>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleQuantityChange(med._id, 1); }}
                        className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-100 
                                 transition-colors disabled:opacity-50"
                        disabled={!med.available}
                      >
                        +
                      </button>
                    </div>

                    {/* Add to Cart Button */}
                    <button
                      onClick={(e) => handleAddToCart(e, med)}
                      disabled={!med.available}
                       className={`min-w-0 flex-1 rounded-lg px-3 py-2 text-sm font-semibold transition-all duration-200
                                ${med.available
                          ? "bg-emerald-600 text-white hover:bg-emerald-700 active:scale-95"
                          : "bg-gray-200 text-gray-400 cursor-not-allowed"
                        }`}
                    >
                      <span className="hidden sm:inline">Add to Cart</span>
                      <span className="sm:hidden">Add</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Filter Bottom Sheet Modal */}
      <AnimatePresence>
        {isFilterOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsFilterOpen(false)}
              className="fixed inset-0 bg-black/40 z-40"
            />

            {/* Bottom Sheet */}
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl z-50 max-h-[80vh] overflow-y-auto"
            >
              <div className="sticky top-0 bg-white border-b border-gray-100 p-4 flex items-center justify-between">
                <h2 className="text-lg font-bold text-gray-800">Filters</h2>
                <div className="flex items-center gap-3">
                  <button
                    onClick={clearFilters}
                    className="text-sm text-emerald-600 font-medium"
                  >
                    Clear All
                  </button>
                  <button
                    onClick={() => setIsFilterOpen(false)}
                    className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100"
                  >
                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="p-4 space-y-6">
                {/* Price Range */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-800 mb-3">Price Range</h3>
                  <div className="flex gap-3">
                    <div className="flex-1">
                      <label className="text-xs text-gray-500 mb-1 block">Min Price</label>
                      <input
                        type="number"
                        placeholder="₹0"
                        value={priceFilter.min || ""}
                        onChange={(e) => setPriceFilter({ ...priceFilter, min: Number(e.target.value) || 0 })}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="text-xs text-gray-500 mb-1 block">Max Price</label>
                      <input
                        type="number"
                        placeholder="₹9999"
                        value={priceFilter.max === Infinity ? "" : priceFilter.max}
                        onChange={(e) => setPriceFilter({ ...priceFilter, max: Number(e.target.value) || Infinity })}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Quick Price Filters */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-800 mb-3">Quick Filters</h3>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { label: "Under ₹100", min: 0, max: 100 },
                      { label: "₹100 - ₹500", min: 100, max: 500 },
                      { label: "₹500 - ₹1000", min: 500, max: 1000 },
                      { label: "Above ₹1000", min: 1000, max: Infinity },
                    ].map((filter) => (
                      <button
                        key={filter.label}
                        onClick={() => setPriceFilter({ min: filter.min, max: filter.max })}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-colors
                                  ${priceFilter.min === filter.min && priceFilter.max === filter.max
                            ? "bg-emerald-600 text-white"
                            : "bg-gray-100 text-gray-700 hover:bg-emerald-50"
                          }`}
                      >
                        {filter.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Apply Button */}
              <div className="sticky bottom-0 bg-white border-t border-gray-100 p-4">
                <button
                  onClick={() => setIsFilterOpen(false)}
                  className="w-full py-3 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 transition-colors"
                >
                  Apply Filters
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Store;
