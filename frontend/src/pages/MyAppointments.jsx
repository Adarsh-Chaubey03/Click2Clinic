import { useContext, useEffect, useState } from "react";
import { AppContext } from "../context/AppContext";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  FaVideo, FaCalendarAlt, FaMapMarkerAlt, FaClock,
  FaArrowLeft, FaEye, FaRedo, FaCheckCircle, FaTimesCircle,
} from "react-icons/fa";

const MyAppointments = () => {
  const { backendUrl, token, getDoctorsData } = useContext(AppContext);
  const navigate = useNavigate();

  const months = ["","Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

  const slotDateFormat = (slotData) => {
    const [d, m, y] = slotData.split("_");
    return `${d} ${months[Number(m)]}, ${y}`;
  };

  const [appointments, setAppointment] = useState([]);

  const getUserAppointment = async () => {
    try {
      const { data } = await axios.get(backendUrl + "/api/user/appointments", {
        headers: { token },
      });
      if (data.success) {
        const sorted = data.appointments.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        setAppointment(sorted);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  const cancelAppointment = async (appointmentId) => {
    try {
      const { data } = await axios.post(
        backendUrl + "/api/user/cancel-appointment",
        { appointmentId },
        { headers: { token } }
      );
      if (data.success) {
        toast.success(data.message);
        getUserAppointment();
        getDoctorsData();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  const loadRazorpay = () =>
    new Promise((resolve) => {
      if (window.Razorpay) { resolve(true); return; }
      const s = document.createElement("script");
      s.src = "https://checkout.razorpay.com/v1/checkout.js";
      s.async = true;
      s.onload = () => resolve(true);
      s.onerror = () => resolve(false);
      document.body.appendChild(s);
    });

  const initPay = async (order) => {
    const loaded = await loadRazorpay();
    if (!loaded) { toast.error("Razorpay SDK failed to load"); return; }
    const options = {
      key: import.meta.env.VITE_RAZORPAY_ID,
      amount: order.amount,
      currency: order.currency,
      name: "Appointment Payment",
      description: "Doctor Appointment",
      order_id: order.id,
      receipt: order.receipt,
      handler: async (response) => {
        try {
          const { data } = await axios.post(
            backendUrl + "/api/user/verify-razorpay",
            response,
            { headers: { token } }
          );
          if (data.success) {
            toast.success("Payment successful!");
            getUserAppointment();
          } else {
            toast.error(data.message);
          }
        } catch (err) {
          toast.error(err.message);
        }
      },
    };
    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  const appointmentRazorpay = async (appointmentId) => {
    try {
      const { data } = await axios.post(
        backendUrl + "/api/user/payment-razorpay",
        { appointmentId },
        { headers: { token } }
      );
      if (data.success) { initPay(data.order); }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  useEffect(() => {
    if (token) { getUserAppointment(); }
  }, [token]);

  /* ── derive per-card status ─────────────────────────────── */
  const getStatus = (item) => {
    if (item.cancelled)    return "cancelled";
    if (item.isCompleted)  return "completed";
    if (!item.payment)     return "pending";   // booked but unpaid
    return "upcoming";
  };

  const StatusBadge = ({ status }) => {
    const map = {
      upcoming:  { label: "Upcoming",  icon: <MdCalendarToday />, cls: "bg-[#e8f9f6] text-[#009f9a] border border-[#b2ebe0]" },
      completed: { label: "Completed", icon: <FaCheckCircle />,   cls: "bg-[#e8f9f6] text-[#009f9a] border border-[#b2ebe0]" },
      cancelled: { label: "Cancelled", icon: <FaTimesCircle />,   cls: "bg-red-50 text-red-500 border border-red-200" },
      pending:   { label: "Pay Now",   icon: <MdCalendarToday />, cls: "bg-amber-50 text-amber-600 border border-amber-200" },
    };
    const { label, icon, cls } = map[status] || map.upcoming;
    return (
      <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full ${cls}`}>
        {icon} {label}
      </span>
    );
  };

  return (
    <div
      className="min-h-screen pt-20 pb-14 px-4 sm:px-6 lg:px-8"
      style={{ background: "linear-gradient(110deg,#effcfb 0%,#f7fcfc 48%,#e9f8f8 100%)" }}
    >
      <div className="max-w-4xl mx-auto">

        {/* ── Page header ── */}
        <button
          onClick={() => navigate("/my-profile")}
          className="flex items-center gap-1.5 text-sm text-[#009f9a] font-medium mb-5 hover:underline"
        >
          <FaArrowLeft className="text-xs" /> My Account
        </button>

        <h1 className="text-3xl font-extrabold text-[#10233f] mb-1">My Appointments</h1>
        <p className="text-sm text-[#718398] mb-8">View and manage your upcoming and past appointments.</p>

        {/* ── Empty state ── */}
        {appointments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 bg-white rounded-2xl shadow-sm border border-[#dceeed]">
            <FaCalendarAlt className="text-5xl text-[#b2ebe0] mb-4" />
            <p className="text-base text-[#5f7185] mb-4">No appointments found.</p>
            <button
              onClick={() => navigate("/doctors")}
              className="text-white px-7 py-2.5 rounded-full text-sm font-semibold transition-all hover:opacity-90"
              style={{ background: "linear-gradient(135deg,#04a99d,#008eaa)" }}
            >
              Book an Appointment
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {appointments.map((item, index) => {
              const status = getStatus(item);
              return (
                <div
                  key={index}
                  className="bg-white rounded-2xl shadow-sm border border-[#dceeed] p-5 flex flex-col sm:flex-row gap-5 hover:shadow-md transition-shadow duration-200"
                >
                  {/* Doctor image */}
                  <div className="flex-shrink-0">
                    <img
                      className="w-24 h-24 sm:w-28 sm:h-28 object-cover rounded-xl border border-[#dceeed] bg-[#e8f9f6]"
                      src={item.docData.image}
                      alt={item.docData.name}
                    />
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0 flex flex-col justify-between gap-3">
                    <div>
                      <h2 className="text-lg font-bold text-[#10233f] leading-tight">
                        {item.docData.name}
                      </h2>
                      <p className="text-sm text-[#5f7185] mt-0.5">{item.docData.speciality}</p>

                      <div className="flex flex-wrap gap-x-5 gap-y-1.5 mt-3">
                        <span className="flex items-center gap-1.5 text-sm text-[#5f7185]">
                          <FaMapMarkerAlt className="text-[#009f9a] flex-shrink-0" />
                          {item.docData.address.line1}, {item.docData.address.line2}
                        </span>
                        <span className="flex items-center gap-1.5 text-sm text-[#5f7185]">
                          <FaClock className="text-[#009f9a] flex-shrink-0" />
                          {slotDateFormat(item.slotData)} | {item.slotTime}
                        </span>
                      </div>
                    </div>

                    {/* Patient row */}
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-[#718398]">Patient:</span>
                      <span className="font-semibold text-[#10233f] uppercase tracking-wide">
                        {item.patientData?.name || item.userData?.name}
                      </span>
                      {item.patientData?.relation && (
                        <span className="text-xs text-[#718398] bg-[#effcfb] px-2 py-0.5 rounded-full border border-[#dceeed]">
                          {item.patientData.relation} · {item.patientData.age} yrs
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions column */}
                  <div className="flex flex-col items-end justify-between gap-3 flex-shrink-0 min-w-[11rem]">
                    {/* Status badge — top right */}
                    <StatusBadge status={status} />

                    {/* Action buttons */}
                    <div className="flex flex-col gap-2 w-full">

                      {/* PENDING — unpaid */}
                      {status === "pending" && (
                        <>
                          <button
                            onClick={() => appointmentRazorpay(item._id)}
                            className="w-full py-2 rounded-lg text-sm font-semibold text-white flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
                            style={{ background: "linear-gradient(135deg,#04a99d,#008eaa)" }}
                          >
                            💳 Pay Now
                          </button>
                          <button
                            onClick={() => cancelAppointment(item._id)}
                            className="w-full py-2 rounded-lg text-sm font-semibold text-[#5f7185] border border-[#dceeed] hover:bg-[#f5fdfc] transition-colors"
                          >
                            Cancel
                          </button>
                        </>
                      )}

                      {/* UPCOMING — paid, not completed */}
                      {status === "upcoming" && (
                        <>
                          <button
                            onClick={() => navigate("/consult")}
                            className="w-full py-2 rounded-lg text-sm font-semibold text-white flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
                            style={{ background: "linear-gradient(135deg,#04a99d,#008eaa)" }}
                          >
                            <FaVideo /> Join Consultation
                          </button>
                          <button
                            onClick={() => cancelAppointment(item._id)}
                            className="w-full py-2 rounded-lg text-sm font-semibold text-[#009f9a] border border-[#009f9a] hover:bg-[#e8f9f6] transition-colors"
                          >
                            Cancel
                          </button>
                        </>
                      )}

                      {/* COMPLETED */}
                      {status === "completed" && (
                        <>
                          <button
                            onClick={() =>
                              item.userData?.prescription
                                ? window.open(item.userData.prescription, "_blank")
                                : toast.info("No prescription available yet.")
                            }
                            className="w-full py-2 rounded-lg text-sm font-semibold text-white flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
                            style={{ background: "linear-gradient(135deg,#04a99d,#008eaa)" }}
                          >
                            <FaEye /> View Details
                          </button>
                          <button
                            onClick={() => navigate(`/appointment/${item.docId}`)}
                            className="w-full py-2 rounded-lg text-sm font-semibold text-[#009f9a] border border-[#009f9a] hover:bg-[#e8f9f6] transition-colors"
                          >
                            <span className="flex items-center justify-center gap-1.5">
                              <FaRedo className="text-xs" /> Book Again
                            </span>
                          </button>
                        </>
                      )}

                      {/* CANCELLED */}
                      {status === "cancelled" && (
                        <>
                          <button
                            disabled
                            className="w-full py-2 rounded-lg text-sm font-semibold text-red-400 bg-red-50 border border-red-200 cursor-default"
                          >
                            Appointment Cancelled
                          </button>
                          <button
                            onClick={() => navigate(`/appointment/${item.docId}`)}
                            className="w-full py-2 rounded-lg text-sm font-semibold text-[#009f9a] border border-[#009f9a] hover:bg-[#e8f9f6] transition-colors flex items-center justify-center gap-1.5"
                          >
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
  );
};

export default MyAppointments;
