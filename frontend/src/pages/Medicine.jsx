import { useContext, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import { useCart } from "../context/CartContext";
import { toast } from "react-toastify";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";

const Medicine = () => {
  const { medicineId } = useParams();
  const { medicines, token, backendUrl } = useContext(AppContext);
  const { addToCart } = useCart();
  const navigate = useNavigate();

  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [mg, setMg] = useState(0);
  const [ml, setMl] = useState(0);
  const [medData, setMedData] = useState(null);
  const [cartQuantity, setCartQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState("addToCart");
  const [isLoading, setIsLoading] = useState(false);
  const [showImageZoom, setShowImageZoom] = useState(false);

  useEffect(() => {
    if (!token) {
      toast.warn("Login to order medicines");
      navigate("/login");
    }
  }, [token, navigate]);

  useEffect(() => {
    const selectedMedicine = medicines.find((med) => med._id === medicineId);
    setMedData(selectedMedicine);
  }, [medicineId, medicines]);

  const getCurrentDateTime = () => {
    const now = new Date();
    return now.toLocaleString("en-US", {
      year: "numeric", month: "2-digit", day: "2-digit",
      hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true,
    });
  };

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const quantity = medData.category === "tablet" ? mg : ml;
      const orderData = {
        mg, ml, quantity, address, phone, medData,
        orderDate: getCurrentDateTime(),
      };
      const { data } = await axios.post(
        backendUrl + "/api/user/order",
        orderData,
        { headers: { token } }
      );
      if (data.success) {
        toast.success(data.message);
        setMg(0); setMl(0); setPhone(""); setAddress("");
        window.scrollTo(0, 0);
        navigate("/my-orders");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (medData.available) {
      addToCart(medData, cartQuantity);
      toast.success(`${cartQuantity} × ${medData.name} added to cart!`);
    } else {
      toast.error("This item is out of stock");
    }
  };

  const handleQuantityChange = (delta) => {
    setCartQuantity(prev => Math.max(1, prev + delta));
  };

  if (!medData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-emerald-50 flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center bg-white rounded-3xl shadow-2xl p-10 max-w-md"
        >
          <div className="w-20 h-20 bg-gradient-to-br from-teal-100 to-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            >
              <svg className="w-10 h-10 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </motion.div>
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">Loading Medicine...</h3>
          <p className="text-gray-500 mb-6">Please wait while we fetch the details</p>
          <button
            onClick={() => navigate("/store")}
            className="px-8 py-3 bg-gradient-to-r from-teal-600 to-emerald-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
          >
            ← Back to Store
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50/30">
      {/* Image Zoom Modal */}
      <AnimatePresence>
        {showImageZoom && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowImageZoom(false)}
            className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 cursor-zoom-out"
          >
            <motion.img
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              src={medData.image}
              alt={medData.name}
              className="max-w-full max-h-[90vh] object-contain rounded-2xl"
            />
            <button
              onClick={() => setShowImageZoom(false)}
              className="absolute top-4 right-4 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sticky Header */}
      <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-lg border-b border-gray-100 shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <button
            onClick={() => navigate("/store")}
            className="flex items-center gap-2 text-gray-600 hover:text-teal-600 transition-colors font-medium"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="hidden sm:inline">Back to Store</span>
          </button>

          <div className="flex items-center gap-3">
            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide
                          ${medData.available
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"}`}>
              {medData.available ? "In Stock" : "Out of Stock"}
            </span>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:py-10">
        <div className="grid min-w-0 grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-12">

          {/* Left Column - Image */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-5"
          >
            <div className="sticky top-24">
              {/* Main Image */}
              <div
                onClick={() => setShowImageZoom(true)}
                className="relative bg-white rounded-3xl p-4 sm:p-8 shadow-xl border border-gray-100 cursor-zoom-in group overflow-hidden"
              >
                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-teal-100/50 to-transparent rounded-full -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-emerald-100/50 to-transparent rounded-full translate-y-1/2 -translate-x-1/2" />

                <div className="relative aspect-square bg-gradient-to-br from-gray-50 to-white rounded-2xl overflow-hidden">
                  <motion.img
                    initial={{ scale: 1.1 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.5 }}
                    src={medData.image || "https://via.placeholder.com/400"}
                    alt={medData.name}
                    className="w-full h-full object-contain p-6 group-hover:scale-110 transition-transform duration-500"
                  />

                  {/* Zoom Hint */}
                  <div className="absolute bottom-4 right-4 bg-black/60 text-white px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                    </svg>
                    Click to zoom
                  </div>
                </div>

                {/* Discount Badge */}
                {medData.originalPrice && medData.originalPrice > medData.price && (
                  <div className="absolute top-4 left-4 bg-gradient-to-r from-red-500 to-pink-500 text-white px-4 py-2 rounded-xl font-bold text-sm shadow-lg">
                    {Math.round((1 - medData.price / medData.originalPrice) * 100)}% OFF
                  </div>
                )}
              </div>

              {/* Delivery Info Cards */}
              <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
                {[
                  { icon: "🚚", title: "Free Delivery", sub: "Orders ₹500+" },
                  { icon: "🔄", title: "Easy Returns", sub: "7-day policy" },
                  { icon: "✓", title: "Genuine", sub: "100% authentic" },
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + i * 0.1 }}
                    className="bg-white rounded-2xl p-4 text-center shadow-sm border border-gray-100"
                  >
                    <span className="text-2xl mb-2 block">{item.icon}</span>
                    <p className="font-semibold text-gray-800 text-xs">{item.title}</p>
                    <p className="text-[10px] text-gray-500">{item.sub}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Right Column - Details */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="min-w-0 lg:col-span-7"
          >
            {/* Category Badge */}
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-teal-50 to-emerald-50 px-4 py-2 rounded-full mb-4">
              <span className="text-lg">💊</span>
              <span className="text-teal-700 font-semibold text-sm uppercase tracking-wide">{medData.category}</span>
            </div>

            {/* Product Name */}
            <h1 className="mb-4 break-words text-3xl font-bold leading-tight text-gray-900 sm:text-4xl lg:text-5xl">
              {medData.name}
            </h1>

            {/* Rating Placeholder */}
            <div className="mb-6 flex flex-wrap items-center gap-3 sm:gap-4">
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg key={star} className={`w-5 h-5 ${star <= 4 ? "text-yellow-400" : "text-gray-200"}`} fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <span className="text-gray-600 text-sm">4.2 (128 reviews)</span>
              <span className="text-gray-300">|</span>
              <span className="text-teal-600 text-sm font-medium">500+ sold</span>
            </div>

            {/* Price Section */}
            <div className="bg-gradient-to-r from-teal-50 via-emerald-50 to-cyan-50 rounded-3xl p-6 mb-6">
              <div className="mb-2 flex flex-wrap items-baseline gap-3 sm:gap-4">
                <span className="text-4xl font-bold text-gray-900 sm:text-5xl">₹{medData.price}</span>
                {medData.originalPrice && medData.originalPrice > medData.price && (
                  <span className="text-2xl text-gray-400 line-through">₹{medData.originalPrice}</span>
                )}
              </div>
              <p className="text-teal-700 font-medium">Inclusive of all taxes</p>

              {/* Express Delivery */}
              <div className="mt-4 flex min-w-0 items-center gap-3 rounded-xl bg-white/70 px-4 py-3">
                <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-red-500 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div>
                  <p className="font-bold text-gray-800">Express Delivery Available</p>
                  <p className="text-sm text-gray-500">Get it by tomorrow, 10 AM</p>
                </div>
              </div>
            </div>

            {/* Action Tabs */}
            <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
              {/* Tab Headers */}
              <div className="flex border-b border-gray-100">
                <button
                  onClick={() => setActiveTab("addToCart")}
                  className={`relative flex-1 px-3 py-4 text-sm font-semibold transition-all sm:px-6
                            ${activeTab === "addToCart"
                      ? "text-teal-600 bg-teal-50/50"
                      : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                    }`}
                >
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    Add to Cart
                  </span>
                  {activeTab === "addToCart" && (
                    <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-teal-600" />
                  )}
                </button>
                <button
                  onClick={() => setActiveTab("orderNow")}
                  className={`relative flex-1 px-3 py-4 text-sm font-semibold transition-all sm:px-6
                            ${activeTab === "orderNow"
                      ? "text-teal-600 bg-teal-50/50"
                      : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                    }`}
                >
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Order Now
                  </span>
                  {activeTab === "orderNow" && (
                    <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-teal-600" />
                  )}
                </button>
              </div>

              {/* Tab Content */}
              <div className="p-4 sm:p-6">
                <AnimatePresence mode="wait">
                  {activeTab === "addToCart" && (
                    <motion.div
                      key="cart"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="space-y-6"
                    >
                      {/* Quantity Selector */}
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <span className="text-gray-700 font-medium">Select Quantity</span>
                        <div className="flex items-center bg-gray-100 rounded-2xl p-1">
                          <button
                            onClick={() => handleQuantityChange(-1)}
                            disabled={cartQuantity <= 1 || !medData.available}
                            className="w-12 h-12 flex items-center justify-center text-2xl font-bold text-gray-600 
                                     hover:bg-white rounded-xl transition-all disabled:opacity-40"
                          >
                            −
                          </button>
                          <span className="w-16 text-center text-xl font-bold text-gray-900">{cartQuantity}</span>
                          <button
                            onClick={() => handleQuantityChange(1)}
                            disabled={!medData.available}
                            className="w-12 h-12 flex items-center justify-center text-2xl font-bold text-gray-600 
                                     hover:bg-white rounded-xl transition-all disabled:opacity-40"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      {/* Total */}
                      <div className="flex flex-col gap-3 rounded-2xl bg-gradient-to-r from-gray-50 to-gray-100 p-5 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="text-gray-500 text-sm">Total Amount</p>
                          <p className="text-3xl font-bold text-gray-900">₹{medData.price * cartQuantity}</p>
                        </div>
                        <div className="text-sm text-gray-500 sm:text-right">
                          <p>₹{medData.price} × {cartQuantity} items</p>
                        </div>
                      </div>

                      {/* Add to Cart Button */}
                      <motion.button
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        onClick={handleAddToCart}
                        disabled={!medData.available}
                        className={`w-full py-5 rounded-2xl font-bold text-lg transition-all flex items-center justify-center gap-3
                                  ${medData.available
                            ? "bg-gradient-to-r from-teal-600 via-emerald-600 to-teal-600 text-white shadow-xl shadow-teal-200 hover:shadow-2xl hover:shadow-teal-300"
                            : "bg-gray-200 text-gray-400 cursor-not-allowed"
                          }`}
                      >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        Add to Cart
                      </motion.button>
                    </motion.div>
                  )}

                  {activeTab === "orderNow" && (
                    <motion.form
                      key="order"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      onSubmit={onSubmitHandler}
                      className="space-y-5"
                    >
                      <div>
                        <label className="text-sm font-semibold text-gray-700 mb-2 block flex items-center gap-2">
                          <span className="w-6 h-6 bg-teal-100 rounded-lg flex items-center justify-center text-xs">📦</span>
                          Quantity ({medData.category === "tablet" ? "units" : "ml"})
                        </label>
                        <input
                          type="number"
                          value={medData.category === "tablet" ? mg : ml}
                          onChange={(e) => medData.category === "tablet" ? setMg(e.target.value) : setMl(e.target.value)}
                          placeholder="Enter quantity"
                          className="w-full px-5 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:outline-none focus:border-teal-500 focus:bg-white transition-all text-lg"
                          required
                        />
                      </div>

                      <div>
                        <label className="text-sm font-semibold text-gray-700 mb-2 block flex items-center gap-2">
                          <span className="w-6 h-6 bg-blue-100 rounded-lg flex items-center justify-center text-xs">📍</span>
                          Delivery Address
                        </label>
                        <textarea
                          value={address}
                          onChange={(e) => setAddress(e.target.value)}
                          placeholder="Enter your complete address with pincode"
                          rows="3"
                          className="w-full px-5 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:outline-none focus:border-teal-500 focus:bg-white transition-all resize-none"
                          required
                        />
                      </div>

                      <div>
                        <label className="text-sm font-semibold text-gray-700 mb-2 block flex items-center gap-2">
                          <span className="w-6 h-6 bg-green-100 rounded-lg flex items-center justify-center text-xs">📞</span>
                          Phone Number
                        </label>
                        <input
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="Enter 10-digit mobile number"
                          className="w-full px-5 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:outline-none focus:border-teal-500 focus:bg-white transition-all text-lg"
                          required
                        />
                      </div>

                      <motion.button
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        type="submit"
                        disabled={isLoading || !medData.available}
                        className={`w-full py-5 rounded-2xl font-bold text-lg transition-all flex items-center justify-center gap-3
                                  ${medData.available && !isLoading
                            ? "bg-gradient-to-r from-teal-600 via-emerald-600 to-teal-600 text-white shadow-xl shadow-teal-200 hover:shadow-2xl hover:shadow-teal-300"
                            : "bg-gray-200 text-gray-400 cursor-not-allowed"
                          }`}
                      >
                        {isLoading ? (
                          <>
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            >
                              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                              </svg>
                            </motion.div>
                            Processing Order...
                          </>
                        ) : (
                          <>
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                            Place Order Now
                          </>
                        )}
                      </motion.button>
                    </motion.form>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Why Choose Section */}
            <div className="mt-8 rounded-3xl border border-gray-100 bg-white p-4 shadow-sm sm:p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <span className="w-8 h-8 bg-gradient-to-br from-teal-500 to-emerald-500 rounded-lg flex items-center justify-center text-white text-sm">✓</span>
                Why buy from Click2Clinic?
              </h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {[
                  { icon: "🛡️", title: "100% Genuine Products", desc: "Sourced directly from manufacturers" },
                  { icon: "💰", title: "Best Prices", desc: "Up to 60% off on medicines" },
                  { icon: "🚚", title: "Pan India Delivery", desc: "Delivering across 19000+ pincodes" },
                  { icon: "📞", title: "24/7 Support", desc: "Get help anytime you need" },
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 + i * 0.1 }}
                    className="flex min-w-0 items-start gap-3 rounded-xl bg-gray-50 p-3"
                  >
                    <span className="text-2xl">{item.icon}</span>
                    <div>
                      <p className="font-semibold text-gray-800 text-sm">{item.title}</p>
                      <p className="text-xs text-gray-500">{item.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Medicine;
