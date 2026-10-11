import { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AppContext } from "../context/AppContext.jsx";
import { toast } from "react-toastify";
import axios from "axios";
import { FaArrowLeft, FaChevronLeft, FaChevronRight, FaHome, FaFileAlt, FaShieldAlt } from "react-icons/fa";
import { motion } from "framer-motion";
import labIcon1 from "../assets/l1.png";
import labIcon2 from "../assets/l2.png";
import labIcon3 from "../assets/l3.png";
import labIcon4 from "../assets/l4.png";
import labIcon5 from "../assets/l5.png";
import labIcon6 from "../assets/l6.png";
import labIcon7 from "../assets/l7.png";
import labIcon8 from "../assets/l8.png";

const DAY_SHORT   = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
const MONTH_SHORT = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

const TIME_SLOTS = [
  "09:00 am","09:30 am","10:00 am","10:30 am",
  "11:00 am","11:30 am","12:00 pm","12:30 pm",
];

/* Build next 7 days */
const buildDays = () => {
  const days = [];
  const today = new Date();
  for (let i = 0; i < 7; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    days.push(d);
  }
  return days;
};

const LAB_ICONS = [labIcon1, labIcon2, labIcon3, labIcon4, labIcon5, labIcon6, labIcon7, labIcon8];

const LabAppointment = () => {
  const { labId } = useParams();
  const { labTests, backendUrl, token } = useContext(AppContext);
  const [labInfo, setLabInfo] = useState(null);
  const [selectedDayIdx, setSelectedDayIdx] = useState(0);
  const [selectedTime, setSelectedTime]     = useState("10:00 am");
  const [dateOffset, setDateOffset]         = useState(0);
  const [days]                               = useState(buildDays);
  const navigate = useNavigate();

  useEffect(() => {
    const info = labTests.find((l) => l._id === labId);
    setLabInfo(info);
  }, [labTests, labId]);

  // ── Razorpay helpers ──────────────────────────────────────────
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
      name: "Lab Test Payment",
      description: "Lab Appointment",
      order_id: order.id,
      receipt: order.receipt,
      handler: async (response) => {
        try {
          const { data } = await axios.post(
            `${backendUrl}/api/user/verifylab-razorpay`,
            response,
            { headers: { token } }
          );
          if (data.success) {
            toast.success("Payment successful! Lab test booked.");
            navigate("/mylab-appointments");
            window.scrollTo(0, 0);
          } else {
            toast.error(data.message);
          }
        } catch (err) {
          toast.error(err.message);
        }
      },
      modal: {
        ondismiss: () => {
          toast.info("Payment cancelled. Complete payment from My Lab Appointments.");
          navigate("/mylab-appointments");
          window.scrollTo(0, 0);
        },
      },
    };
    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  // ── Book + immediately pay ─────────────────────────────────────
  const bookLabAppointment = async () => {
    if (!token) { toast.warn("Login to book test"); return navigate("/login"); }
    if (!selectedTime) { toast.warn("Please select a time slot"); return; }
    try {
      // Step 1: book the appointment
      const { data } = await axios.post(
        `${backendUrl}/api/user/bookLab-appointment`,
        { labId },
        { headers: { token } }
      );
      if (!data.success) { toast.error(data.message); return; }

      // Step 2: immediately open Razorpay for payment
      const { data: payData } = await axios.post(
        `${backendUrl}/api/user/paymentlab-razorpay`,
        { labId: data.appointmentId },
        { headers: { token } }
      );
      if (payData.success) {
        await initPay(payData.order);
      } else {
        toast.warn("Lab test booked. Complete payment from My Lab Appointments.");
        navigate("/mylab-appointments");
        window.scrollTo(0, 0);
      }
    } catch (e) { toast.error(e.message); }
  };

  // ── Guard: lab not found or missing required booking fields ──────────────
  const isValidLab =
    labInfo &&
    labInfo.testname &&
    labInfo.price > 0 &&
    labInfo.isAvailable !== false;

  if (!isValidLab) {
    return (
      <div
        className="min-h-screen flex items-center justify-center px-4"
        style={{ background: "linear-gradient(110deg,#effcfb 0%,#f2fbfa 50%,#e9f8f8 100%)" }}
      >
        <div className="w-full max-w-md rounded-2xl border border-[#dceeed] bg-white p-8 text-center shadow-sm">
          {/* Icon */}
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-[#e8f9f6]">
            <svg className="w-8 h-8 text-[#009f9a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6}
                d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
            </svg>
          </div>

          {/* Heading */}
          <h2 className="mb-2 text-xl font-extrabold text-[#10233f]">Lab Not Registered Yet</h2>

          {/* Explanation */}
          <p className="mb-6 text-sm leading-6 text-[#718398]">
            This lab test is not available for online booking at the moment. It may not be registered
            in our system or is temporarily unavailable. Please check back later or browse other tests.
          </p>

          {/* Back button */}
          <button
            onClick={() => { navigate("/lab"); window.scrollTo(0, 0); }}
            className="inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-bold text-white transition-opacity hover:opacity-90"
            style={{ background: "linear-gradient(135deg,#04a99d,#008eaa)" }}
          >
            <FaArrowLeft className="text-xs" />
            Back to Lab Tests
          </button>
        </div>
      </div>
    );
  }
  // ── End guard ─────────────────────────────────────────────────────────────

  const labIndex = Math.max(0, labTests.findIndex((test) => test._id === labInfo._id));
  const labIcon = LAB_ICONS[labIndex % LAB_ICONS.length];
  const origPrice = Math.round(labInfo.price * 1.25);
  const discount  = Math.round((1 - labInfo.price / origPrice) * 100);

  /* test includes — parse from description or use defaults */
  const includes = labInfo.includes ||
    (labInfo.category?.toLowerCase().includes("thyroid")
      ? ["T3 (Triiodothyronine)","T4 (Thyroxine)","TSH (Thyroid Stimulating Hormone)"]
      : ["Sample collection","Laboratory analysis","Digital report"]);

  const visibleDays = days.slice(dateOffset, dateOffset + 5);

  return (
    <div className="min-h-screen px-4 py-6 sm:px-6 lg:px-8"
      style={{ background:"linear-gradient(110deg,#effcfb 0%,#f2fbfa 50%,#e9f8f8 100%)" }}>
      <div className="max-w-6xl mx-auto">

        {/* Breadcrumb */}
        <button onClick={() => navigate("/lab")}
          className="flex items-center gap-1.5 text-sm text-[#5f7185] hover:text-[#009f9a] transition-colors mb-3">
          <FaArrowLeft className="text-xs"/> Back to Lab Tests
        </button>

        <h1 className="text-2xl font-extrabold text-[#10233f] mb-0.5">Lab Test Details</h1>
        <p className="text-sm text-[#718398] mb-6">Review details and book your lab test appointment</p>

        <div className="flex flex-col gap-5 lg:flex-row lg:items-stretch">

          {/* ── LEFT — Test details ── */}
          <div className="flex-1 min-w-0 flex flex-col">
            <div className="bg-white rounded-2xl border border-[#dceeed] shadow-sm p-6 flex flex-col flex-1 justify-between">

              {/* Test header */}
              <div className="flex items-start justify-between gap-4 mb-6">
                <div className="flex items-center gap-4">
                  <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-[#bfe7e3] bg-[#effcfb] p-0.5">
                    <img src={labIcon} alt="" className="h-full w-full object-cover" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-extrabold text-[#10233f] mb-1.5">{labInfo.testname}</h2>
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="px-3 py-0.5 rounded-full text-xs font-semibold bg-[#ede9fe] text-[#7c3aed]">
                        {labInfo.category}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-[#009f9a]"/>
                        <span className="text-xs font-semibold text-[#009f9a]">Available</span>
                      </div>
                    </div>
                  </div>
                </div>
                {/* Heart */}
                <button className="text-[#b0bec5] hover:text-red-400 transition-colors flex-shrink-0">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
                  </svg>
                </button>
              </div>

              {/* Price row */}
              <div className="flex items-center gap-3 mb-6">
                <span className="text-4xl font-extrabold text-[#10233f]">₹{labInfo.price}</span>
                <span className="text-sm text-[#b0bec5] line-through">₹{origPrice}</span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#ddf8f2] text-[#009f9a]">
                  {discount}% OFF
                </span>
              </div>

              {/* Feature badges */}
              <div className="flex flex-wrap gap-6 mb-7 pb-6 border-b border-[#dceeed]">
                {[
                  { icon:<FaHome className="text-[#009f9a]"/>, title:"Home sample collection", sub:"Available" },
                  { icon:<FaFileAlt className="text-[#009f9a]"/>, title:"Digital reports", sub:"Within 24 hours" },
                  { icon:<FaShieldAlt className="text-[#009f9a]"/>, title:"Trusted by 10,000+ users", sub:"Verified & secure" },
                ].map(f => (
                  <div key={f.title} className="flex items-center gap-2.5">
                    <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-[#e8f9f6]">
                      {f.icon}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[#10233f]">{f.title}</p>
                      <p className="text-xs text-[#718398]">{f.sub}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* About */}
              <div className="mb-6">
                <h3 className="text-base font-bold text-[#10233f] mb-3">About this test</h3>
                <p className="text-sm text-[#5f7185] leading-relaxed">
                  {labInfo.description ||
                    `The ${labInfo.testname} helps evaluate the health and function of your body. It includes key diagnostic tests that aid in identifying conditions and monitoring your health accurately.`}
                </p>
              </div>

              {/* Test includes */}
              <div className="rounded-xl border border-[#dceeed] bg-[#f5fdfc] p-5 mt-auto">
                <p className="text-sm font-bold text-[#10233f] mb-4">Test Includes</p>
                <div className="flex flex-wrap gap-4">
                  {includes.map((item) => (
                    <div key={item} className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#009f9a] flex-shrink-0"/>
                      <span className="text-sm text-[#5f7185]">{item}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>

          {/* ── RIGHT — Booking card ── */}
          <div className="lg:w-80 flex-shrink-0 flex flex-col">
            <div className="bg-white rounded-2xl border border-[#dceeed] shadow-sm p-6 flex-1 flex flex-col">
              <h3 className="text-lg font-extrabold text-[#10233f] mb-5">Book Your Test</h3>

              {/* Select Date */}
              <p className="text-xs font-bold text-[#10233f] mb-3">Select Date</p>
              <div className="flex items-center gap-1.5 mb-5">
                <button
                  onClick={() => setDateOffset(Math.max(0, dateOffset - 1))}
                  className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full border border-[#dceeed] hover:bg-[#effcfb] transition-colors">
                  <FaChevronLeft className="text-[#718398] text-[10px]"/>
                </button>

                <div className="flex gap-1.5 flex-1 overflow-hidden">
                  {visibleDays.map((day, idx) => {
                    const realIdx = idx + dateOffset;
                    const active  = selectedDayIdx === realIdx;
                    return (
                      <button key={realIdx} onClick={() => setSelectedDayIdx(realIdx)}
                        className={`flex-1 flex flex-col items-center rounded-xl py-2 text-center transition-all duration-200 ${
                          active ? "text-white shadow" : "bg-[#f5fdfc] text-[#10233f] border border-[#dceeed] hover:border-[#009f9a]"
                        }`}
                        style={active ? { background:"linear-gradient(135deg,#04a99d,#008eaa)" } : {}}>
                        <span className="text-[10px] font-medium">{DAY_SHORT[day.getDay()]}</span>
                        <span className="text-sm font-extrabold leading-tight">{day.getDate()}</span>
                        <span className="text-[10px]">{MONTH_SHORT[day.getMonth()]}</span>
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => setDateOffset(Math.min(days.length - 5, dateOffset + 1))}
                  className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full border border-[#dceeed] hover:bg-[#effcfb] transition-colors">
                  <FaChevronRight className="text-[#718398] text-[10px]"/>
                </button>
              </div>

              {/* Select Time */}
              <p className="text-xs font-bold text-[#10233f] mb-3">Select Time</p>
              <div className="grid grid-cols-2 gap-2 mb-5">
                {TIME_SLOTS.map(slot => (
                  <button key={slot} onClick={() => setSelectedTime(slot)}
                    className={`py-2 rounded-xl text-xs font-semibold border transition-all duration-200 ${
                      selectedTime === slot
                        ? "text-white border-transparent shadow"
                        : "bg-white text-[#10233f] border-[#dceeed] hover:border-[#009f9a] hover:bg-[#effcfb]"
                    }`}
                    style={selectedTime === slot ? { background:"linear-gradient(135deg,#04a99d,#008eaa)" } : {}}>
                    {slot}
                  </button>
                ))}
              </div>

              {/* Price */}
              <div className="flex items-center justify-between mb-4 pt-4 border-t border-[#dceeed] mt-auto">
                <span className="text-sm font-semibold text-[#10233f]">Test Price</span>
                <span className="text-2xl font-extrabold text-[#10233f]">₹{labInfo.price}</span>
              </div>

              {/* Book button */}
              <button onClick={bookLabAppointment}
                className="w-full py-3.5 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90 shadow-md mb-3"
                style={{ background:"linear-gradient(135deg,#04a99d,#008eaa)" }}>
                Book Test Now
              </button>

              <p className="text-center text-xs text-[#718398]">
                By booking, you agree to our terms and conditions
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default LabAppointment;
