import { useContext, useEffect, useState } from "react";
import { AppContext } from "../context/AppContext";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  FaCalendarAlt, FaVial, FaMapMarkerAlt, FaClock,
  FaCheckCircle, FaTimesCircle, FaRedo,
} from "react-icons/fa";
import ProfileSidebar from "../components/ProfileSidebar";

const CalIcon = () => (
  <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19 4h-1V2h-2v2H8V2H6v2H5C3.9 4 3 4.9 3 6v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2Zm0 16H5V9h14v11ZM7 11h5v5H7Z"/>
  </svg>
);

const statusMap = {
  upcoming:  { label: "Upcoming",  icon: <CalIcon />,        cls: "bg-[#e8f9f6] text-[#009f9a] border border-[#b2ebe0]" },
  completed: { label: "Completed", icon: <FaCheckCircle />,  cls: "bg-[#e8f9f6] text-[#009f9a] border border-[#b2ebe0]" },
  cancelled: { label: "Cancelled", icon: <FaTimesCircle />,  cls: "bg-red-50 text-red-500 border border-red-200" },
  pending:   { label: "Pay Now",   icon: <CalIcon />,        cls: "bg-amber-50 text-amber-600 border border-amber-200" },
};

const StatusBadge = ({ status }) => {
  const { label, icon, cls } = statusMap[status] || statusMap.upcoming;
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full ${cls}`}>
      {icon} {label}
    </span>
  );
};

const MyLabAppointments = () => {
  const { backendUrl, token } = useContext(AppContext);
  const navigate = useNavigate();
  const [labAppointments, setLabAppointments] = useState([]);

  const getUserLabAppointments = async () => {
    try {
      const { data } = await axios.get(backendUrl + "/api/user/lab-appointments", { headers: { token } });
      if (data.success) {
        setLabAppointments(data.appointments.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
      }
    } catch (error) { toast.error(error.message); }
  };

  const cancelLabAppointment = async (labId) => {
    try {
      const { data } = await axios.post(backendUrl + "/api/user/cancellab-appointment", { labId }, { headers: { token } });
      if (data.success) { toast.success(data.message); getUserLabAppointments(); }
      else toast.error(data.message);
    } catch (error) { toast.error(error.message); }
  };

  const loadRazorpay = () => new Promise((resolve) => {
    if (window.Razorpay) { resolve(true); return; }
    const s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.onload = () => resolve(true);
    s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });

  const initPay = async (order) => {
    const loaded = await loadRazorpay();
    if (!loaded) { toast.error("Razorpay SDK failed to load"); return; }
    new window.Razorpay({
      key: import.meta.env.VITE_RAZORPAY_ID,
      amount: order.amount, currency: order.currency,
      name: "Lab Test Payment", description: "Lab Appointment",
      order_id: order.id, receipt: order.receipt,
      handler: async (response) => {
        try {
          const { data } = await axios.post(backendUrl + "/api/user/verifylab-razorpay", response, { headers: { token } });
          if (data.success) { toast.success("Payment successful!"); getUserLabAppointments(); }
          else toast.error(data.message);
        } catch (err) { toast.error(err.message); }
      },
    }).open();
  };

  const labAppointmentRazorpay = async (labId) => {
    const loaded = await loadRazorpay();
    if (!loaded) { toast.error("Razorpay SDK failed to load"); return; }
    try {
      const { data } = await axios.post(backendUrl + "/api/user/paymentlab-razorpay", { labId }, { headers: { token } });
      if (data.success) initPay(data.order);
    } catch (error) { toast.error(error.message); }
  };

  useEffect(() => { if (token) getUserLabAppointments(); }, [token]);

  const getStatus = (item) => {
    if (item.isCancelled)  return "cancelled";
    if (item.isCompleted)  return "completed";
    if (!item.payment)     return "pending";
    return "upcoming";
  };

  /* ─────────────────────────────────────────────────────────── */
  return (
    <div
      className="min-h-screen pt-6 pb-14 px-4 sm:px-6 lg:px-8"
      style={{ background: "linear-gradient(110deg,#effcfb 0%,#f7fcfc 48%,#e9f8f8 100%)" }}
    >
      <div className="max-w-5xl mx-auto">

        <div className="mb-7">
          <h1 className="text-2xl font-extrabold text-[#10233f]">Lab Appointments</h1>
          <p className="text-sm text-[#718398] mt-0.5">View and manage your upcoming and past lab test bookings.</p>
        </div>

        <div className="flex gap-6 items-start">
          <ProfileSidebar />

          <div className="flex-1 min-w-0">
            {labAppointments.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 bg-white rounded-2xl shadow-sm border border-[#dceeed]">
                <FaCalendarAlt className="text-5xl text-[#b2ebe0] mb-4" />
                <p className="text-base text-[#5f7185] mb-4">No lab appointments found.</p>
                <button
                  onClick={() => navigate("/lab")}
                  className="text-white px-7 py-2.5 rounded-full text-sm font-semibold transition-all hover:opacity-90"
                  style={{ background: "linear-gradient(135deg,#04a99d,#008eaa)" }}
                >
                  Book a Lab Test
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {labAppointments.map((item, index) => {
                  const status = getStatus(item);
                  return (
                    <div
                      key={index}
                      className="bg-white rounded-2xl shadow-sm border border-[#dceeed] p-5 flex flex-col sm:flex-row gap-5 hover:shadow-md transition-shadow duration-200"
                    >
                      {/* Lab icon */}
                      <div className="flex-shrink-0">
                        <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl bg-[#e8f9f6] border border-[#dceeed] flex items-center justify-center">
                          <FaVial className="text-[#009f9a] text-4xl" />
                        </div>
                      </div>

                      {/* Details */}
                      <div className="flex-1 min-w-0 flex flex-col justify-between gap-3">
                        <div>
                          <h2 className="text-base font-bold text-[#10233f] leading-tight">{item.labData.testname}</h2>
                          <p className="text-sm text-[#5f7185] mt-0.5">{item.labData.category}</p>
                          <div className="flex flex-wrap gap-x-5 gap-y-1.5 mt-2.5">
                            <span className="flex items-center gap-1.5 text-sm text-[#5f7185]">
                              <FaMapMarkerAlt className="text-[#009f9a] flex-shrink-0" />
                              {item.labData.address}
                            </span>
                            <span className="flex items-center gap-1.5 text-sm text-[#5f7185]">
                              <FaClock className="text-[#009f9a] flex-shrink-0" />
                              Results by: {item.labData.resultAt}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-[#718398]">Patient:</span>
                          <span className="font-semibold text-[#10233f] uppercase tracking-wide">{item.userData?.name}</span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col items-end justify-between gap-3 flex-shrink-0 min-w-[10rem]">
                        <StatusBadge status={status} />
                        <div className="flex flex-col gap-2 w-full">
                          {status === "pending" && (
                            <>
                              <button onClick={() => labAppointmentRazorpay(item._id)}
                                className="w-full py-2 rounded-lg text-sm font-semibold text-white flex items-center justify-center gap-2 hover:opacity-90"
                                style={{ background: "linear-gradient(135deg,#04a99d,#008eaa)" }}>
                                💳 Pay Now
                              </button>
                              <button onClick={() => cancelLabAppointment(item._id)}
                                className="w-full py-2 rounded-lg text-sm font-semibold text-[#5f7185] border border-[#dceeed] hover:bg-[#f5fdfc] transition-colors">
                                Cancel
                              </button>
                            </>
                          )}
                          {status === "upcoming" && (
                            <>
                              <button disabled className="w-full py-2 rounded-lg text-sm font-semibold text-[#009f9a] bg-[#e8f9f6] border border-[#b2ebe0] cursor-default">
                                ✓ Paid & Confirmed
                              </button>
                              <button onClick={() => cancelLabAppointment(item._id)}
                                className="w-full py-2 rounded-lg text-sm font-semibold text-[#009f9a] border border-[#009f9a] hover:bg-[#e8f9f6] transition-colors">
                                Cancel
                              </button>
                            </>
                          )}
                          {status === "completed" && (
                            <>
                              <button disabled className="w-full py-2 rounded-lg text-sm font-semibold text-[#009f9a] bg-[#e8f9f6] border border-[#b2ebe0] cursor-default flex items-center justify-center gap-1.5">
                                <FaCheckCircle /> Completed
                              </button>
                              <button onClick={() => navigate("/lab")}
                                className="w-full py-2 rounded-lg text-sm font-semibold text-[#009f9a] border border-[#009f9a] hover:bg-[#e8f9f6] transition-colors flex items-center justify-center gap-1.5">
                                <FaRedo className="text-xs" /> Book Again
                              </button>
                            </>
                          )}
                          {status === "cancelled" && (
                            <>
                              <button disabled className="w-full py-2 rounded-lg text-sm font-semibold text-red-400 bg-red-50 border border-red-200 cursor-default">
                                Booking Cancelled
                              </button>
                              <button onClick={() => navigate("/lab")}
                                className="w-full py-2 rounded-lg text-sm font-semibold text-[#009f9a] border border-[#009f9a] hover:bg-[#e8f9f6] transition-colors flex items-center justify-center gap-1.5">
                                <FaRedo className="text-xs" /> Book Again
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyLabAppointments;
