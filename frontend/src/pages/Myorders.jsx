import { useContext, useEffect, useState } from "react";
import { AppContext } from "../context/AppContext";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import ProfileSidebar from "../components/ProfileSidebar";

const statusConfig = (item) => {
  if (!item.orderPlaced)   return { label: "Cancelled",       color: "text-red-500",     bg: "bg-red-50",      dot: "bg-red-400"     };
  if (item.orderDelivered) return { label: "Delivered",       color: "text-emerald-600", bg: "bg-emerald-50",  dot: "bg-emerald-500" };
  if (item.paymentStatus)  return { label: "Paid · Processing",color: "text-blue-600",   bg: "bg-blue-50",     dot: "bg-blue-500"    };
  return                          { label: "Order Placed",    color: "text-teal-600",    bg: "bg-teal-50",     dot: "bg-teal-500"    };
};

const MyOrders = () => {
  const { backendUrl, token, getMedicineData } = useContext(AppContext);
  const navigate = useNavigate();
  const [orders, setOrders]   = useState([]);
  const [loading, setLoading] = useState(true);

  const getUserOrder = async () => {
    try {
      const { data } = await axios.get(backendUrl + "/api/user/userOrder", { headers: { token } });
      if (data.success) {
        setOrders(data.order.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
      }
    } catch (error) { toast.error(error.message); }
    finally { setLoading(false); }
  };

  const cancelOrder = async (orderId) => {
    try {
      const { data } = await axios.post(backendUrl + "/api/user/cancel-order", { orderId }, { headers: { token } });
      if (data.success) { toast.success(data.message); getUserOrder(); getMedicineData(); }
      else toast.error(data.message);
    } catch (error) { toast.error(error.message); }
  };

  const loadRazorpay = () => new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.onload = () => resolve(true);
    s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });

  const initPay = (order) => {
    new window.Razorpay({
      key: import.meta.env.VITE_RAZORPAY_ID,
      amount: order.amount, currency: order.currency,
      name: "Medicine Order Payment", description: "Payment for medicine order",
      order_id: order.id, receipt: order.receipt,
      handler: async (response) => {
        try {
          const { data } = await axios.post(backendUrl + "/api/user/verify-medOrderRazorpay", response, { headers: { token } });
          if (data.success) { getUserOrder(); toast.success(data.message); }
        } catch (error) { toast.error(error.message); }
      },
    }).open();
  };

  const orderRazorpay = async (orderId) => {
    const loaded = await loadRazorpay();
    if (!loaded) return toast.error("Razorpay SDK failed to load");
    try {
      const { data } = await axios.post(backendUrl + "/api/user/payment-orderRazorpay", { orderId }, { headers: { token } });
      if (data.success) initPay(data.order);
    } catch (error) { toast.error(error.message); }
  };

  useEffect(() => { if (token) getUserOrder(); }, [token]);

  /* ─────────────────────────────────────────────────────────── */
  return (
    <div
      className="min-h-screen pt-6 pb-14 px-4 sm:px-6 lg:px-8"
      style={{ background: "linear-gradient(110deg,#effcfb 0%,#f7fcfc 48%,#e9f8f8 100%)" }}
    >
      <div className="max-w-5xl mx-auto">

        <div className="mb-7">
          <h1 className="text-2xl font-extrabold text-[#10233f]">My Orders</h1>
          <p className="text-sm text-[#718398] mt-0.5">View and manage your medicine orders.</p>
        </div>

        <div className="flex gap-6 items-start">
          <ProfileSidebar />

          <div className="flex-1 min-w-0">
            {/* Loading skeleton */}
            {loading && (
              <div className="flex flex-col gap-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-white rounded-2xl p-5 shadow-sm border border-[#dceeed] animate-pulse flex gap-4">
                    <div className="w-20 h-20 rounded-xl bg-gray-100 flex-shrink-0" />
                    <div className="flex-1 space-y-3 py-1">
                      <div className="h-4 bg-gray-100 rounded w-1/3" />
                      <div className="h-3 bg-gray-100 rounded w-1/4" />
                      <div className="h-3 bg-gray-100 rounded w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Empty state */}
            {!loading && orders.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 bg-white rounded-2xl shadow-sm border border-[#dceeed]">
                <div className="w-16 h-16 rounded-full bg-[#e8f9f6] flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-[#009f9a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
                  </svg>
                </div>
                <p className="text-base font-semibold text-[#10233f] mb-1">No orders yet</p>
                <p className="text-sm text-[#718398] mb-4 text-center max-w-xs">
                  You haven't placed any medicine orders. Browse our pharmacy to get started.
                </p>
                <button
                  onClick={() => navigate("/store")}
                  className="text-white px-7 py-2.5 rounded-full text-sm font-semibold transition-all hover:opacity-90"
                  style={{ background: "linear-gradient(135deg,#04a99d,#008eaa)" }}
                >
                  Browse Medicines
                </button>
              </div>
            )}

            {/* Orders list */}
            {!loading && orders.length > 0 && (
              <div className="flex flex-col gap-4">
                <AnimatePresence>
                  {orders.map((item, index) => {
                    const status = statusConfig(item);
                    const subtotal = item.totalPrice || item.medData.price * (item.quantity || 1);
                    return (
                      <motion.div
                        key={item._id || index}
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ delay: index * 0.04 }}
                        className="bg-white rounded-2xl shadow-sm border border-[#dceeed] p-5 flex flex-col sm:flex-row gap-5 hover:shadow-md transition-shadow duration-200"
                      >
                        {/* Image */}
                        <div className="w-20 h-20 flex-shrink-0 rounded-xl overflow-hidden bg-gray-50 border border-[#dceeed]">
                          <img src={item.medData.image} alt={item.medData.name} className="w-full h-full object-contain p-1" />
                        </div>

                        {/* Details */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start gap-2 flex-wrap">
                            <h2 className="text-sm font-semibold text-[#10233f] leading-snug">{item.medData.name}</h2>
                            <span className="capitalize text-xs font-medium text-[#718398] bg-[#f5fdfc] border border-[#dceeed] px-2 py-0.5 rounded-full">
                              {item.medData.category}
                            </span>
                          </div>

                          {/* Status pill */}
                          <div className={`mt-1.5 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${status.bg} ${status.color}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
                            {status.label}
                          </div>

                          {/* Meta row */}
                          <div className="mt-2.5 flex flex-wrap gap-x-4 gap-y-1 text-xs text-[#718398]">
                            <span className="flex items-center gap-1 font-semibold text-[#009f9a]">
                              ₹{item.medData.price} × {item.quantity || 1} = ₹{subtotal}
                            </span>
                            <span className="flex items-center gap-1">
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0zM15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                              </svg>
                              {item.address}
                            </span>
                            <span className="flex items-center gap-1">
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                              </svg>
                              {item.orderDate}
                            </span>
                          </div>

                          <div className="mt-2 inline-flex items-center gap-1.5 text-xs text-[#718398] bg-[#f5fdfc] border border-[#dceeed] px-2 py-1 rounded-lg">
                            <svg className="w-3.5 h-3.5 text-[#009f9a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                            </svg>
                            {item.paymentStatus ? "Paid Online" : "Cash on Delivery (COD)"}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex sm:flex-col gap-2 sm:w-36 w-full flex-wrap flex-shrink-0">
                          {item.orderPlaced && item.paymentStatus && !item.orderDelivered && (
                            <div className="w-full text-center py-2 text-xs font-semibold text-[#009f9a] bg-[#e8f9f6] border border-[#b2ebe0] rounded-xl">
                              ✓ Payment Done
                            </div>
                          )}
                          {item.orderPlaced && !item.paymentStatus && !item.orderDelivered && (
                            <button onClick={() => orderRazorpay(item._id)}
                              className="w-full py-2 text-sm font-semibold text-white rounded-xl hover:opacity-90 transition-opacity"
                              style={{ background: "linear-gradient(135deg,#04a99d,#008eaa)" }}>
                              Pay Online
                            </button>
                          )}
                          {item.orderPlaced && !item.orderDelivered && (
                            <button onClick={() => cancelOrder(item._id)}
                              className="w-full py-2 text-sm font-semibold text-red-500 bg-white border border-red-200 hover:bg-red-50 rounded-xl transition-colors">
                              Cancel Order
                            </button>
                          )}
                          {!item.orderPlaced && (
                            <div className="w-full text-center py-2 text-xs font-semibold text-red-400 bg-red-50 border border-red-100 rounded-xl">
                              Order Cancelled
                            </div>
                          )}
                          {item.orderDelivered && (
                            <div className="w-full text-center py-2 text-xs font-semibold text-emerald-600 bg-emerald-50 border border-emerald-100 rounded-xl">
                              ✓ Delivered
                            </div>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyOrders;
