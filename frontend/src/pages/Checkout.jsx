import { useContext, useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import { useCart } from "../context/CartContext";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import axios from "axios";

const Checkout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { token, backendUrl, userData } = useContext(AppContext);
  const { cart, getCartTotal, clearCart } = useCart();

  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const checkoutCart = location.state?.cart || cart;

  useEffect(() => {
    if (!token) {
      toast.error("Please login to checkout");
      navigate("/login");
      return;
    }
    if (checkoutCart.length === 0) {
      toast.error("Your cart is empty");
      navigate("/store");
    }
  }, [token, checkoutCart, navigate]);

  const getCurrentDateTime = () => {
    const now = new Date();
    return [
      String(now.getDate()).padStart(2, "0"),
      String(now.getMonth() + 1).padStart(2, "0"),
      now.getFullYear(),
    ].join("-") + " " +
      [
        String(now.getHours()).padStart(2, "0"),
        String(now.getMinutes()).padStart(2, "0"),
      ].join(":");
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (!address.trim() || !phone.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }
    if (phone.length < 10) {
      toast.error("Please enter a valid phone number");
      return;
    }

    setIsLoading(true);
    try {
      const orderPromises = checkoutCart.map((item) =>
        axios.post(
          `${backendUrl}/api/user/order`,
          {
            mg: item.category === "tablet" || item.category === "capsule" ? item.quantity : 0,
            ml: item.category === "syrup" ? item.quantity : 0,
            quantity: item.quantity,
            address: address.trim(),
            phone: Number(phone),
            medData: {
              _id: item._id,
              name: item.name,
              price: item.price,
              image: item.image,
              category: item.category,
              available: item.available,
            },
            orderDate: getCurrentDateTime(),
          },
          { headers: { token, "Content-Type": "application/json" } }
        )
      );

      const results = await Promise.all(orderPromises);
      const successful = results.filter((r) => r.data.success);
      const failed = results.filter((r) => !r.data.success);

      if (successful.length === checkoutCart.length) {
        toast.success(`${checkoutCart.length} order${checkoutCart.length > 1 ? "s" : ""} placed successfully!`);
        clearCart();
        navigate("/my-orders");
      } else if (successful.length > 0) {
        toast.warning(`${successful.length} placed, ${failed.length} failed.`);
        clearCart();
        navigate("/my-orders");
      } else {
        toast.error("Failed to place orders. Please try again.");
      }
    } catch (error) {
      const msg = error.response?.data?.message || error.message;
      toast.error(`Order failed: ${msg}`);
    } finally {
      setIsLoading(false);
    }
  };

  if (checkoutCart.length === 0) return null;

  const total = getCartTotal();

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50/60 via-white to-emerald-50/40 pt-24 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="mb-8 flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="w-9 h-9 flex items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-500 hover:text-teal-600 hover:border-teal-300 transition-colors"
            aria-label="Go back"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Checkout</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {checkoutCart.length} item{checkoutCart.length > 1 ? "s" : ""} in your order
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

          {/* ── Left: Order Summary ── */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="lg:col-span-3 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
          >
            <div className="px-5 py-4 border-b border-gray-100">
              <h2 className="text-base font-semibold text-gray-800">Order Summary</h2>
            </div>

            {/* Items */}
            <div className="divide-y divide-gray-50">
              {checkoutCart.map((item) => (
                <div key={item._id} className="flex items-center gap-4 px-5 py-4">
                  <div className="w-14 h-14 flex-shrink-0 rounded-xl overflow-hidden bg-gray-50 border border-gray-100">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-contain p-1"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800 truncate">{item.name}</p>
                    <p className="text-xs text-gray-400 capitalize mt-0.5">{item.category}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-bold text-teal-700">₹{item.price * item.quantity}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      ₹{item.price} × {item.quantity}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Price breakdown */}
            <div className="px-5 py-4 border-t border-gray-100 bg-gray-50/50 space-y-2">
              {checkoutCart.map((item) => (
                <div key={item._id} className="flex justify-between items-center text-xs text-gray-500">
                  <span className="truncate max-w-[60%]">
                    {item.name} (Qty: {item.quantity})
                  </span>
                  <span className="font-semibold text-gray-700">₹{item.price * item.quantity}</span>
                </div>
              ))}
              <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                <span className="text-sm font-bold text-gray-900">Total</span>
                <span className="text-base font-bold text-teal-700">₹{total}</span>
              </div>
            </div>
          </motion.div>

          {/* ── Right: Delivery form ── */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden self-start"
          >
            <div className="px-5 py-4 border-b border-gray-100">
              <h2 className="text-base font-semibold text-gray-800">Delivery Details</h2>
            </div>

            <form onSubmit={handlePlaceOrder} className="px-5 py-5 space-y-4">
              {/* Address */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                  Delivery Address
                </label>
                <div className="relative">
                  <span className="absolute top-3 left-3 text-gray-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </span>
                  <textarea
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Enter your full delivery address"
                    rows={3}
                    required
                    className="w-full pl-9 pr-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent resize-none placeholder:text-gray-300"
                  />
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                  Phone Number
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-3 flex items-center text-gray-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </span>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="10-digit mobile number"
                    required
                    className="w-full pl-9 pr-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent placeholder:text-gray-300"
                  />
                </div>
              </div>

              {/* Payment note */}
              <div className="flex items-center gap-2 px-3 py-2.5 bg-teal-50 rounded-xl border border-teal-100">
                <svg className="w-4 h-4 text-teal-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-xs text-teal-700 font-medium">
                  Cash on Delivery or pay online after placing
                </p>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full py-3 rounded-xl text-sm font-bold transition-colors duration-200 ${
                  isLoading
                    ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                    : "bg-[#009f9a] hover:bg-[#00888a] active:bg-[#007a7c] text-white shadow-sm"
                }`}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    Placing Order…
                  </span>
                ) : (
                  `Place Order · ₹${total}`
                )}
              </button>

              <button
                type="button"
                onClick={() => navigate("/store")}
                className="w-full py-2.5 rounded-xl text-sm font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-50 transition-colors"
              >
                ← Continue Shopping
              </button>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
