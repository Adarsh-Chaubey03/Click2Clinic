import { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import { assets } from "../assets/assets";
import RelatedDoctors from "../components/RelatedDoctors";
import { toast } from "react-toastify";
import axios from "axios";
import { FaMapMarkerAlt, FaChevronLeft, FaChevronRight, FaCalendarAlt, FaClock, FaDollarSign } from "react-icons/fa";

const DAY_SHORT  = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
const MONTH_SHORT= ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

const Appointments = () => {
  const { docId } = useParams();
  const { doctors, backendUrl, token, getDoctorsData, userData } = useContext(AppContext);
  const [docInfo, setDocInfo]   = useState(null);
  const [docSlots, setDocSlots] = useState([]);
  const [slotIndex, setSlotIndex] = useState(0);
  const [slotTime, setSlotTime]   = useState("");
  const [selectedPatientIndex, setSelectedPatientIndex] = useState(-1);
  const [dateOffset, setDateOffset] = useState(0); // for chevron navigation
  const navigate = useNavigate();

  const formatTime12h = (date) => {
    let h = date.getHours(), m = date.getMinutes();
    const ampm = h >= 12 ? "pm" : "am";
    h = h % 12 || 12;
    return `${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")} ${ampm}`;
  };

  const fetchDocInfo = () => {
    const doc = doctors.find((d) => d._id === docId);
    setDocInfo(doc);
  };

  const getAvailSlots = () => {
    setDocSlots([]);
    const today = new Date();
    for (let i = 0; i < 7; i++) {
      const curr = new Date(today);
      curr.setDate(today.getDate() + i);
      const end = new Date(curr);
      end.setHours(21, 0, 0, 0);

      if (i === 0) {
        curr.setHours(curr.getHours() > 10 ? curr.getHours() + 1 : 10);
        curr.setMinutes(curr.getMinutes() > 30 ? 30 : 0);
      } else {
        curr.setHours(10, 0, 0, 0);
      }

      const slots = [];
      while (curr < end) {
        const time = formatTime12h(curr);
        const d = curr.getDate(), mo = curr.getMonth()+1, yr = curr.getFullYear();
        const key = `${d}_${mo}_${yr}`;
        if (!(docInfo.slot_booked?.[key]?.includes(time))) {
          slots.push({ datetime: new Date(curr), time });
        }
        curr.setMinutes(curr.getMinutes() + 30);
      }
      setDocSlots(prev => [...prev, slots]);
    }
  };

  const bookAppointment = async () => {
    if (!token) { toast.warn("Login to book appointment"); return navigate("/login"); }
    if (!slotTime) { toast.warn("Please select a time slot"); return; }
    try {
      const date = docSlots[slotIndex][0].datetime;
      const slotData = `${date.getDate()}_${date.getMonth()+1}_${date.getFullYear()}`;
      let patientData = null;
      if (selectedPatientIndex !== -1 && userData?.familyMembers) {
        patientData = userData.familyMembers[selectedPatientIndex];
      }
      const { data } = await axios.post(
        `${backendUrl}/api/user/book-appointment`,
        { docId, slotData, slotTime, patientData },
        { headers: { token } }
      );
      if (data.success) {
        toast.success(data.message);
        getDoctorsData();
        navigate("/my-appointment");
        window.scrollTo(0, 0);
      } else { toast.error(data.message); }
    } catch (e) { toast.error(e.message); }
  };

  useEffect(() => { fetchDocInfo(); }, [doctors, docId]);
  useEffect(() => { if (docInfo) getAvailSlots(); }, [docInfo]);

  /* Selected slot display */
  const selectedDay = docSlots[slotIndex]?.[0]?.datetime;
  const selectedDateLabel = selectedDay
    ? `${DAY_SHORT[selectedDay.getDay()]}, ${selectedDay.getDate()} ${MONTH_SHORT[selectedDay.getMonth()]} ${selectedDay.getFullYear()}`
    : "";

  /* Expertise tags — fallback parsed from about */
  const tags = docInfo?.tags || ["Preventive Care", "Diabetes Management", "Hypertension", "General Health"];

  if (!docInfo) return null;

  return (
    <div
      className="min-h-screen px-4 py-8 sm:px-6 lg:px-8"
      style={{ background: "linear-gradient(110deg,#effcfb 0%,#f2fbfa 50%,#e9f8f8 100%)" }}
    >
      <div className="max-w-6xl mx-auto space-y-5">

        {/* ── DOCTOR PROFILE CARD ── */}
        <div className="bg-white rounded-2xl border border-[#dceeed] shadow-sm overflow-hidden">
          <div className="flex flex-col md:flex-row">

            {/* Photo */}
            <div className="relative md:w-56 lg:w-64 flex-shrink-0 bg-[#e8f9f6] flex items-end justify-center">
              <img
                src={docInfo.image}
                alt={docInfo.name}
                className="w-full h-56 md:h-full object-cover object-top"
              />
              {/* Available badge */}
              <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-white rounded-full px-3 py-1 shadow-sm border border-[#dceeed]">
                <span className={`w-2 h-2 rounded-full ${docInfo.available ? "bg-[#009f9a]" : "bg-gray-400"}`} />
                <span className="text-xs font-semibold text-[#10233f]">
                  {docInfo.available ? "Available Today" : "Not Available"}
                </span>
              </div>
            </div>

            {/* Info */}
            <div className="flex-1 p-6 lg:p-8 flex flex-col md:flex-row gap-6">
              {/* Left block */}
              <div className="flex-1 min-w-0">
                {/* Name + verified */}
                <div className="flex items-center gap-2 mb-1">
                  <h1 className="text-2xl font-extrabold text-[#10233f]">{docInfo.name}</h1>
                  <img src={assets.verified_icon} alt="Verified" className="w-5 h-5" />
                </div>

                {/* Degree · Speciality */}
                <p className="text-sm text-[#5f7185] mb-3">
                  {docInfo.degree} · {docInfo.speciality}
                </p>

                {/* Experience + Location */}
                <div className="flex flex-wrap gap-4 mb-4 text-sm text-[#5f7185]">
                  <span className="flex items-center gap-1.5">
                    <FaClock className="text-[#009f9a]" />
                    {docInfo.experience}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <FaMapMarkerAlt className="text-[#009f9a]" />
                    {docInfo.address?.line1}{docInfo.address?.line2 ? `, ${docInfo.address.line2}` : ""}
                  </span>
                </div>

                {/* About */}
                <p className="text-xs font-bold text-[#10233f] mb-1 uppercase tracking-wide">About</p>
                <p className="text-sm text-[#5f7185] leading-relaxed mb-4">{docInfo.about}</p>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {tags.map((tag) => (
                    <span key={tag} className="px-3 py-1 rounded-full border border-[#dceeed] text-xs font-medium text-[#5f7185] bg-[#f5fdfc]">
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Appointment fee */}
                <div className="flex items-center gap-2 text-sm">
                  <FaDollarSign className="text-[#009f9a]" />
                  <span className="text-[#5f7185]">Appointment fee:</span>
                  <span className="text-xl font-extrabold text-[#10233f]">₹{docInfo.fees}</span>
                </div>
              </div>

              {/* Right block — meta info */}
              <div className="md:w-52 flex-shrink-0 space-y-5">
                {/* Consultation type */}
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-[#e8f9f6]">
                    <FaCalendarAlt className="text-[#009f9a] text-sm" />
                  </div>
                  <div>
                    <p className="text-xs text-[#718398]">Consultation type</p>
                    <p className="text-sm font-semibold text-[#10233f]">In-clinic · Online</p>
                  </div>
                </div>

                {/* Avg time */}
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-[#e8f9f6]">
                    <FaClock className="text-[#009f9a] text-sm" />
                  </div>
                  <div>
                    <p className="text-xs text-[#718398]">Average consultation time</p>
                    <p className="text-sm font-semibold text-[#10233f]">15 – 20 minutes</p>
                  </div>
                </div>

                {/* Languages */}
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-[#e8f9f6]">
                    <svg className="w-4 h-4 text-[#009f9a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs text-[#718398]">Languages spoken</p>
                    <p className="text-sm font-semibold text-[#10233f]">English, Hindi, Marathi</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── BOOKING SECTION ── */}
        <div className="bg-white rounded-2xl border border-[#dceeed] shadow-sm p-6 lg:p-8">
          <div className="flex flex-col lg:flex-row gap-8">

            {/* Left — date + time */}
            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-extrabold text-[#10233f] mb-0.5">Book an appointment</h2>
              <p className="text-sm text-[#718398] mb-5">Select a date and time that works for you.</p>

              {/* Patient selector */}
              {userData && (
                <div className="mb-5">
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    <button
                      onClick={() => setSelectedPatientIndex(-1)}
                      className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                        selectedPatientIndex === -1
                          ? "bg-[#009f9a] text-white border-[#009f9a]"
                          : "bg-white text-[#5f7185] border-[#dceeed] hover:border-[#009f9a]"
                      }`}
                    >
                      Self
                    </button>
                    {userData.familyMembers?.map((m, i) => (
                      <button
                        key={i}
                        onClick={() => setSelectedPatientIndex(i)}
                        className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                          selectedPatientIndex === i
                            ? "bg-[#009f9a] text-white border-[#009f9a]"
                            : "bg-white text-[#5f7185] border-[#dceeed] hover:border-[#009f9a]"
                        }`}
                      >
                        {m.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Date row with chevrons */}
              <div className="flex items-center gap-2 mb-5">
                <button
                  onClick={() => setDateOffset(Math.max(0, dateOffset - 1))}
                  className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border border-[#dceeed] hover:bg-[#effcfb] transition-colors"
                >
                  <FaChevronLeft className="text-[#718398] text-xs" />
                </button>

                <div className="flex gap-2 overflow-hidden flex-1">
                  {docSlots.slice(dateOffset, dateOffset + 7).map((item, idx) => {
                    const realIdx = idx + dateOffset;
                    const dt = item[0]?.datetime;
                    return (
                      <button
                        key={realIdx}
                        onClick={() => { setSlotIndex(realIdx); setSlotTime(""); }}
                        className={`flex-1 min-w-[52px] flex flex-col items-center rounded-xl py-2.5 text-center transition-all duration-200 ${
                          slotIndex === realIdx
                            ? "text-white shadow-md"
                            : "bg-[#f5fdfc] text-[#10233f] hover:bg-[#ddf8f2] border border-[#dceeed]"
                        }`}
                        style={slotIndex === realIdx ? { background: "linear-gradient(135deg,#04a99d,#008eaa)" } : {}}
                      >
                        <span className="text-[11px] font-medium">{dt ? DAY_SHORT[dt.getDay()] : ""}</span>
                        <span className="text-base font-extrabold leading-tight">{dt?.getDate()}</span>
                        <span className="text-[11px]">{dt ? MONTH_SHORT[dt.getMonth()] : ""}</span>
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => setDateOffset(Math.min(docSlots.length - 7, dateOffset + 1))}
                  className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border border-[#dceeed] hover:bg-[#effcfb] transition-colors"
                >
                  <FaChevronRight className="text-[#718398] text-xs" />
                </button>
              </div>

              {/* Time grid */}
              <p className="text-sm font-bold text-[#10233f] mb-3">Select time</p>
              <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-4 xl:grid-cols-6 gap-2">
                {docSlots[slotIndex]?.length > 0 ? (
                  docSlots[slotIndex].map((item, i) => (
                    <button
                      key={i}
                      onClick={() => setSlotTime(item.time)}
                      className={`px-2 py-2 rounded-xl text-xs font-semibold border transition-all duration-200 ${
                        slotTime === item.time
                          ? "text-white border-transparent shadow"
                          : "bg-white text-[#10233f] border-[#dceeed] hover:border-[#009f9a] hover:bg-[#effcfb]"
                      }`}
                      style={slotTime === item.time ? { background: "linear-gradient(135deg,#04a99d,#008eaa)" } : {}}
                    >
                      {item.time}
                    </button>
                  ))
                ) : (
                  <p className="col-span-full text-sm text-[#718398]">No slots available for this day.</p>
                )}
              </div>
            </div>

            {/* Right — selected appointment summary */}
            <div className="lg:w-64 flex-shrink-0">
              <div className="rounded-2xl border border-[#dceeed] bg-[#f5fdfc] p-5 h-full flex flex-col justify-between">
                <div>
                  <p className="text-sm font-bold text-[#10233f] mb-4">Selected appointment</p>

                  {/* Date */}
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-white border border-[#dceeed]">
                      <FaCalendarAlt className="text-[#009f9a] text-sm" />
                    </div>
                    <span className="text-sm font-semibold text-[#10233f]">
                      {selectedDateLabel || "—"}
                    </span>
                  </div>

                  {/* Time */}
                  <div className="flex items-center gap-3 mb-6">
                    <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-white border border-[#dceeed]">
                      <FaClock className="text-[#009f9a] text-sm" />
                    </div>
                    <span className="text-sm font-semibold text-[#10233f]">
                      {slotTime || "—"}
                    </span>
                  </div>
                </div>

                {/* Confirm button */}
                <button
                  onClick={bookAppointment}
                  disabled={!slotTime}
                  className={`w-full py-3 rounded-xl text-sm font-bold transition-all duration-200 flex items-center justify-center gap-2 ${
                    slotTime
                      ? "text-white shadow-lg hover:opacity-90"
                      : "bg-[#dceeed] text-[#718398] cursor-not-allowed"
                  }`}
                  style={slotTime ? { background: "linear-gradient(135deg,#04a99d,#008eaa)" } : {}}
                >
                  Confirm appointment
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </button>
              </div>
            </div>

          </div>
        </div>

        {/* ── RELATED DOCTORS ── */}
        <RelatedDoctors docId={docId} speciality={docInfo.speciality} />

      </div>
    </div>
  );
};

export default Appointments;
