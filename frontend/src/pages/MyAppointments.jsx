import { useContext, useEffect, useState } from "react";
import { AppContext } from "../context/AppContext";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { FaVideo, FaCalendarAlt, FaUserMd, FaMapMarkerAlt, FaClock } from "react-icons/fa";

const MyAppointments = () => {
  const { backendUrl, token, getDoctorsData } = useContext(AppContext);
  const navigate = useNavigate();
  const months = ["", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "July", "Aug", "Sep", "Oct", "Nov", "Dec"];

  const slotDateFormat = (slotData) => {
    const dateArray = slotData.split("_");
    return `${dateArray[0]} ${months[Number(dateArray[1])]}, ${dateArray[2]}`;
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

  const loadRazorpay = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) { resolve(true); return; }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const initPay = async (order) => {
    const loaded = await loadRazorpay();
    if (!loaded) { toast.error("Razorpay SDK failed to load"); return; }
    if (!window.Razorpay) { console.error("Razorpay not available"); return; }
    const options = {
      key: import.meta.env.VITE_RAZORPAY_ID,
      amount: order.amount,
      currency: order.currency,
      name: "Appointment Payment",
      description: "Appointment Payment",
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
            getUserAppointment();
            navigate("/my-appointment");
            toast.success(data.message);
          }
        } catch (error) {
          console.log(error);
          toast.error(error.message);
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
    }
  };

  useEffect(() => {
    if (token) { getUserAppointment(); }
  }, [token]);

  return (
    <div
      className="min-h-screen pt-20 pb-10 px-4 sm:px-6 lg:px-8"
      style={{ background: "linear-gradient(110deg,#effcfb 0%,#f7fcfc 48%,#e9f8f8 100%)" }}
    >
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold text-[#10233f] mb-6 border-b-2 border-[#dceeed] pb-2">
          My Appointments
        </h1>
        {appointments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 bg-white rounded-2xl shadow-md border border-[#dceeed]">
            <FaCalendarAlt className="text-5xl text-[#b2ebe0] mb-4" />
            <p className="text-lg text-[#5f7185]">No appointments found.</p>
            <button
              onClick={() => navigate("/doctors")}
              className="mt-4 text-white px-6 py-2 rounded-full font-medium transition-all duration-300"
              style={{ background: "linear-gradient(135deg,#04a99d,#008eaa)" }}
            >
              Book an Appointment
            </button>
          </div>
        ) : (
          <div className="grid gap-6">
            {appointments.map((item, index) => (
              <div
                key={index}
                className="bg-white rounded-xl shadow-md p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 hover:shadow-lg transition-shadow duration-300 border border-[#dceeed]"
              >
                {/* Doctor Image */}
                <div className="w-24 h-24 sm:w-32 sm:h-32 flex-shrink-0">
                  <img
                    className="w-full h-full object-cover rounded-xl border border-[#dceeed]"
                    src={item.docData.image}
                    alt={item.docData.name}
                  />
                </div>

                {/* Appointment Details */}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <FaUserMd className="text-[#009f9a] text-lg" />
                    <h2 className="text-lg sm:text-xl font-semibold text-[#10233f]">
                      {item.docData.name}
                    </h2>
                  </div>
                  <p className="text-sm text-[#5f7185] mb-1">{item.docData.speciality}</p>
                  <div className="flex items-center gap-2 text-sm text-[#5f7185] mb-1">
                    <FaMapMarkerAlt className="text-[#009f9a]" />
                    <p>{item.docData.address.line1}, {item.docData.address.line2}</p>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-[#5f7185]">
                    <FaClock className="text-[#009f9a]" />
                    <p>{slotDateFormat(item.slotData)} | {item.slotTime}</p>
                  </div>
                  <div className="mt-3 pt-3 border-t border-[#dceeed] flex flex-wrap items-center gap-2 text-sm text-[#10233f] font-medium">
                    <span className="text-[#718398]">Patient:</span>
                    <span>{item.patientData?.name || item.userData?.name}</span>
                    {item.patientData?.relation && (
                      <span className="text-xs text-[#718398] bg-[#effcfb] px-2 py-0.5 rounded-full">
                        {item.patientData.relation} • {item.patientData.age} yrs
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2 w-full sm:w-auto">
                  {!item.cancelled && item.payment && !item.isCompleted && (
                    <button className="w-full sm:w-48 py-2 bg-[#ddf8f2] text-[#009f9a] font-medium rounded-md border border-[#b2ebe0]">
                      Paid
                    </button>
                  )}
                  {!item.cancelled && !item.payment && !item.isCompleted && (
                    <button
                      onClick={() => appointmentRazorpay(item._id)}
                      className="w-full sm:w-48 py-2 text-white font-medium rounded-md transition-colors duration-200"
                      style={{ background: "linear-gradient(135deg,#04a99d,#008eaa)" }}
                    >
                      Pay Online
                    </button>
                  )}
                  <div className="flex gap-2">
                    {!item.cancelled && !item.isCompleted && (
                      <button
                        onClick={() => navigate("/consult")}
                        className="flex-1 sm:w-12 py-2 bg-[#009f9a] text-white rounded-md hover:bg-[#008eaa] transition-colors duration-200 flex items-center justify-center"
                        title="Join Video Consultation"
                      >
                        <FaVideo className="text-lg" />
                      </button>
                    )}
                    {!item.cancelled && !item.isCompleted && (
                      <button
                        onClick={() => cancelAppointment(item._id)}
                        className="flex-1 sm:w-48 py-2 bg-red-50 text-red-600 font-medium rounded-md border border-red-200 hover:bg-red-100 transition-colors duration-200"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                  {item.cancelled && !item.isCompleted && (
                    <button className="w-full sm:w-48 py-2 bg-red-50 text-red-600 font-medium rounded-md border border-red-200">
                      Cancelled
                    </button>
                  )}
                  {item.isCompleted && (
                    <button className="w-full sm:w-48 py-2 bg-[#ddf8f2] text-[#009f9a] font-medium rounded-md border border-[#b2ebe0]">
                      Completed
                    </button>
                  )}
                  {item.userData.prescription && item.isCompleted && (
                    <a
                      href={item.userData.prescription}
                      className="w-full sm:w-48 py-2 bg-[#effcfb] text-[#009f9a] font-medium rounded-md border border-[#b2ebe0] hover:bg-[#ddf8f2] transition-colors duration-200 text-center"
                    >
                      View Prescription
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyAppointments;
