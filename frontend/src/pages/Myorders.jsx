import { useContext, useEffect, useState } from "react";
import { AppContext } from "../context/AppContext";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";

const statusConfig = (item) => {
  if (!item.orderPlaced)
    return { label: "Cancelled", color: "text-red-500", bg: "bg-red-50", dot: "bg-red-400" };
  if (item.orderDelivered)
    return { label: "Delivered", color: "text-emerald-600", bg: "bg-emerald-50", dot: "bg-emerald-500" };
  if (item.paymentStatus)
    return { label: "Paid · Processing", color: "text-blue-600", bg: "bg-blue-50", dot: "bg-blue-500" };
  return { label: "Order Placed", color: "text-teal-600", bg: "bg-teal-50", dot: "bg-teal-500" };
};

const MyOrders = () => {
  const { backendUrl, token, getMedicineData } = useContext(AppContext);
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const getUserOrder = async () => {
    try {
      const { data } = await axios.get(backendUrl + "/api/user/userOrder", {
        headers: { token },
      });
      if (data.success) {
        const sorted = data.order.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        setOrders(sorted);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const cancelOrder = async (orderId) => {
    try {
      const { data } = await axios.post(
        backendUrl + "/api/user/cancel-order",
        { orderId },
        { headers: { token } }
      );
      if (data.success) {
        toast.success(data.message);
        getUserOrder();
        getMedicineData();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const loadRazorpay = () =>
    new Promise((resolve) => {
      if (window.Razorpay) return resolve(true);
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });

  const initPay = (order) => {
    const options = {
      key: import.meta.env.VITE_RAZORPAY_ID,
      amount: order.amount,
      currency: order.currency,
      name: "Medicine Order Payment",
      description: "Payment for medicine order",
      order_id: order.id,
      receipt: order.receipt,
      handler: async (response) => {
        try {
          const { data } = await axios.post(
            backendUrl + "/api/user/verify-medOrderRazorpay",
            response,
            { headers: { token } }
          );
          if (data.success) {
            getUserOrder();
            toast.success(data.message);
          }
        } catch (error) {
          toast.error(error.message);
        }
      },
    };
    new window.Razorpay(options).open();
  };

  const orderRazorpay = async (orderId) => {
    const loaded = await loadRazorpay();
    if (!loaded) return toast.error("Razorpay SDK failed to load");
    try {
      const { data } = await axios.post(
        backendUrl + "/api/user/payment-orderRazorpay",
        { orderId },
        { headers: { token } }
      );
      if (data.success) initPay(data.order);
    } catch (error) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    if (token) getUserOrder();
  }, [token]);

  /* ─── Loading skeleton ─── */
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50/60 via-white to-emerald-50/40 pt-24 pb-16 px-4">
        <div className="max-w-4xl mx-auto space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-2xl p-5 shadow-sm animate-pulse flex gap-4">
              <div className="w-20 h-20 rounded-xl bg-gray-100 flex-shrink-0" />
              <div className="flex-1 space-y-3 py-1">
                <div className="h-4 bg-gray-100 rounded w-1/3" />
                <div className="h-3 bg-gray-100 rounded w-1/4" />
                <div className="h-3 bg-gray-100 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  /* ─── Empty state ─── */
  if (orders.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50/60 via-white to-emerald-50/40 pt-24 pb-16 px-4 flex items-start justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-12 flex flex-col items-center gap-4 text-center"
        >
          <div className="w-20 h-20 rounded-full bg-teal-50 flex items-center justify-center">
            <svg className="w-10 h-10 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
          <p className="text-lg font-semibold text-gray-700">No orders yet</p>
          <p className="text-sm text-gray-400 max-w-xs">
            You haven't placed any medicine orders. Browse our pharmacy to get started.
          </p>
          <button
            onClick={() => navigate("/store")}
            className="mt-2 px-6 py-2.5 bg-[#009f9a] hover:bg-[#00888a] text-white text-sm font-semibold rounded-xl transition-colors"
          >
            Browse Medicines
          </button>
        </motion.div>
      </div>
    );
  }

  /* ─── Orders list ─── */
  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50/60 via-white to-emerald-50/40 pt-24 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">

        {/* Page header */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">My Orders</h1>
          <p className="mt-1 text-sm text-gray-500">View and manage your medicine orders</p>
        </div>

        {/* Order cards */}
        <div className="space-y-4">
          <AnimatePresence>
            {orders.map((item, index) => {
              const status = statusConfig(item);
              const subtotal = (item.totalPrice || item.medData.price * (item.quantity || 1));

              return (
                <motion.div
                  key={item._id || index}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow duration-200"
                >
                  <div className="p-5 flex flex-col sm:flex-row gap-5">

                    {/* ── Image ── */}
                    <div className="w-20 h-20 flex-shrink-0 rounded-xl overflow-hidden bg-gray-50 border border-gray-100">
                      <img
                        src={item.medData.image}
                        alt={item.medData.name}
                        className="w-full h-full object-contain p-1"
                      />
                    </div>

                    {/* ── Details ── */}
                    <div className="flex-1 min-w-0">
                      {/* Name + category */}
                      <div className="flex items-start gap-2 flex-wrap">
                        <h2 className="text-base font-semibold text-gray-900 leading-snug">
                          {item.medData.name}
                        </h2>
                        <span className="capitalize text-xs font-medium text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                          {item.medData.category}
                        </span>
                      </div>

                      {/* Status pill */}
                      <div className={`mt-1.5 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${status.bg} ${status.color}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
                        {status.label}
                      </div>

                      {/* Meta row */}
                      <div className="mt-2.5 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <svg className="w-3.5 h-3.5 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                          <span className="font-semibold text-teal-700">
                            ₹{item.medData.price} × {item.quantity || 1} = ₹{subtotal}
                          </span>
                        </span>
                        <span className="flex items-center gap-1">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          {item.address}
                        </span>
                        <span className="flex items-center gap-1">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          {item.orderDate}
                        </span>
                      </div>

                      {/* Payment method badge */}
                      <div className="mt-2 inline-flex items-center gap-1.5 text-xs text-gray-500 bg-gray-50 border border-gray-100 px-2 py-1 rounded-lg">
                        <svg className="w-3.5 h-3.5 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {item.paymentStatus ? "Paid Online" : "Cash on Delivery (COD)"}
                      </div>
                    </div>

                    {/* ── Actions ── */}
                    <div className="flex sm:flex-col gap-2 sm:w-36 w-full flex-wrap">
                      {/* Paid badge */}
                      {item.orderPlaced && item.paymentStatus && !item.orderDelivered && (
                        <div className="w-full text-center py-2 text-xs font-semibold text-blue-600 bg-blue-50 border border-blue-100 rounded-xl">
                          ✓ Payment Done
                        </div>
                      )}

                      {/* Pay Online */}
                      {item.orderPlaced && !item.paymentStatus && !item.orderDelivered && (
                        <button
                          onClick={() => orderRazorpay(item._id)}
                          className="w-full py-2 text-sm font-semibold text-white bg-[#009f9a] hover:bg-[#00888a] active:bg-[#007a7c] rounded-xl transition-colors"
                        >
                          Pay Online
                        </button>
                      )}

                      {/* Cancel */}
                      {item.orderPlaced && !item.orderDelivered && (
                        <button
                          onClick={() => cancelOrder(item._id)}
                          className="w-full py-2 text-sm font-semibold text-red-500 bg-white border border-red-200 hover:bg-red-50 rounded-xl transition-colors"
                        >
                          Cancel Order
                        </button>
                      )}

                      {/* Cancelled */}
                      {!item.orderPlaced && (
                        <div className="w-full text-center py-2 text-xs font-semibold text-red-400 bg-red-50 border border-red-100 rounded-xl">
                          Order Cancelled
                        </div>
                      )}

                      {/* Delivered */}
                      {item.orderDelivered && (
                        <div className="w-full text-center py-2 text-xs font-semibold text-emerald-600 bg-emerald-50 border border-emerald-100 rounded-xl">
                          ✓ Delivered
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default MyOrders;
