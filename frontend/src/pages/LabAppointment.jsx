import { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AppContext } from "../context/AppContext.jsx";
import { toast } from "react-toastify";
import axios from "axios";
import { FaArrowLeft, FaChevronLeft, FaChevronRight, FaHome, FaFileAlt, FaShieldAlt } from "react-icons/fa";
import { motion } from "framer-motion";

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

/* Icon per category */
const getCatStyle = (cat = "") => {
  const c = cat.toLowerCase();
  if (c.includes("thyroid") || c.includes("endocrin"))
    return { bg:"#f0eaf8", icon:<svg viewBox="0 0 48 48" className="w-9 h-9" fill="none"><ellipse cx="24" cy="28" rx="11" ry="8" fill="#a78bfa" opacity="0.8"/><ellipse cx="15" cy="21" rx="6" ry="9" fill="#c4b5fd" opacity="0.9"/><ellipse cx="33" cy="21" rx="6" ry="9" fill="#c4b5fd" opacity="0.9"/><circle cx="24" cy="20" r="4" fill="#7c3aed" opacity="0.7"/></svg> };
  if (c.includes("blood") || c.includes("hematol"))
    return { bg:"#fce8e8", icon:<svg viewBox="0 0 48 48" className="w-9 h-9" fill="none"><ellipse cx="18" cy="30" rx="8" ry="11" fill="#f87171" opacity="0.85"/><ellipse cx="30" cy="30" rx="8" ry="11" fill="#fb923c" opacity="0.7"/><path d="M24 14 Q24 8 18 10 Q24 6 24 14Z" fill="#f87171"/></svg> };
  if (c.includes("lipid") || c.includes("cardio"))
    return { bg:"#fce8f0", icon:<svg viewBox="0 0 48 48" className="w-9 h-9" fill="none"><path d="M24 40 C13 33 7 25 7 17 C7 11 13 7 24 12 C35 7 41 11 41 17 C41 25 35 33 24 40Z" fill="#f472b6" opacity="0.8"/><circle cx="24" cy="24" r="4" fill="white" opacity="0.65"/></svg> };
  if (c.includes("kidney") || c.includes("nephro"))
    return { bg:"#ede9fe", icon:<svg viewBox="0 0 48 48" className="w-9 h-9" fill="none"><ellipse cx="16" cy="24" rx="8" ry="13" fill="#a78bfa" opacity="0.85"/><ellipse cx="32" cy="24" rx="8" ry="13" fill="#7c3aed" opacity="0.75"/></svg> };
  return { bg:"#e8f9f6", icon:<svg viewBox="0 0 48 48" className="w-9 h-9" fill="none"><rect x="16" y="8" width="16" height="32" rx="6" fill="#34d399" opacity="0.8"/><rect x="8" y="16" width="32" height="16" rx="6" fill="#10b981" opacity="0.6"/></svg> };
};

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

  const bookLabAppointment = async () => {
    if (!token) { toast.warn("Login to book test"); return navigate("/login"); }
    if (!selectedTime) { toast.warn("Please select a time slot"); return; }
    try {
      const { data } = await axios.post(
        `${backendUrl}/api/user/bookLab-appointment`,
        { labId },
        { headers: { token } }
      );
      if (data.success) {
        toast.success(data.message);
        navigate("/mylab-appointments");
        window.scrollTo(0, 0);
      } else { toast.error(data.message); }
    } catch (e) { toast.error(e.message); }
  };

  if (!labInfo) return null;

  const catStyle  = getCatStyle(labInfo.category);
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
                  <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-2xl"
                    style={{ backgroundColor: catStyle.bg }}>
                    {catStyle.icon}
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
