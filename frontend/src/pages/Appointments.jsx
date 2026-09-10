import { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import { assets } from "../assets/assets";
import RelatedDoctors from "../components/RelatedDoctors";
import { toast } from "react-toastify";
import axios from "axios";

const Appointments = () => {
  const { docId } = useParams();
  const { doctors, backendUrl, token, getDoctorsData, userData } = useContext(AppContext);
  const [docInfo, setDocInfo] = useState(null);
  const [docSlots, setDocSlots] = useState([]);
  const [slotIndex, setSlotIndex] = useState(0);
  const [slotTime, setSlotTime] = useState('');
  const [selectedPatientIndex, setSelectedPatientIndex] = useState(-1);
  const daysOfWeek = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
  const [verified, setVerified] = useState(false);
  const navigate = useNavigate();

  // Consistent 12-hour time format matching across web and mobile (e.g. "10:00 AM", "01:30 PM")
  const formatTime12h = (date) => {
    let hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    const hourStr = hours.toString().padStart(2, '0');
    const minuteStr = minutes.toString().padStart(2, '0');
    return `${hourStr}:${minuteStr} ${ampm}`;
  };

  const fetchDocInfo = async () => {
    const docInfo = await doctors.find((doc) => doc._id === docId);
    setDocInfo(docInfo);
  };

  const getAvailSlots = async () => {
    setDocSlots([]);
    let today = new Date();

    for (let i = 0; i < 7; i++) {
      let currDate = new Date(today);
      currDate.setDate(today.getDate() + i);
      let endTime = new Date();
      endTime.setDate(today.getDate() + i);
      endTime.setHours(21, 0, 0, 0);

      if (today.getDate() === currDate.getDate()) {
        currDate.setHours(currDate.getHours() > 10 ? currDate.getHours() + 1 : 10);
        currDate.setMinutes(currDate.getMinutes() > 30 ? 30 : 0);
      } else {
        currDate.setHours(10);
        currDate.setMinutes(0);
      }

      let timeSlot = [];
      while (currDate < endTime) {
        let formattedTime = formatTime12h(currDate);
        let day = currDate.getDate();
        let month = currDate.getMonth() + 1;
        let year = currDate.getFullYear();
        const slotDate = `${day}_${month}_${year}`;
        const isSlotAvail = !(docInfo.slot_booked[slotDate]?.includes(formattedTime));

        if (isSlotAvail) {
          timeSlot.push({
            datetime: new Date(currDate),
            time: formattedTime
          });
        }
        currDate.setMinutes(currDate.getMinutes() + 30);
      }
      setDocSlots(prev => [...prev, timeSlot]);
    }
  };

  const verifyLab = async () => {
    try {
      const { data } = await axios.post(`${backendUrl}/api/user/verify-lab`, {}, {
        headers: { token }
      });
      if (data.success) setVerified(true);
    } catch (error) {
      toast.error(error.message);
    }
  };

  const bookAppointment = async () => {
    if (!token) {
      toast.warn("Login to book appointment");
      return navigate('/login');
    }
    if (!verified) {
      toast.warn("Lab file not uploaded yet");
    }

    try {
      const date = docSlots[slotIndex][0].datetime;
      let day = date.getDate();
      let month = date.getMonth() + 1;
      let year = date.getFullYear();
      const slotData = `${day}_${month}_${year}`;

      let patientData = null;
      if (selectedPatientIndex !== -1 && userData && userData.familyMembers) {
        patientData = userData.familyMembers[selectedPatientIndex];
      }

      const { data } = await axios.post(`${backendUrl}/api/user/book-appointment`, {
        docId, slotData, slotTime, patientData
      }, {
        headers: { token }
      });

      if (data.success) {
        toast.success(data.message);
        getDoctorsData();
        navigate('/my-appointment');
        window.scrollTo(0,0)
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    fetchDocInfo();
    verifyLab();
  }, [doctors, docId]);

  useEffect(() => {
    if (docInfo) getAvailSlots();
  }, [docInfo]);

  return (
    docInfo && (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-gray-100 px-4 py-6 sm:px-6 md:px-8 lg:px-12">
        {/* Doctor Info */}
        <div className="bg-white rounded-2xl shadow-md p-4 sm:p-6 md:p-8 flex flex-col md:flex-row gap-6 mb-8">
          <div className="md:w-1/3">
            <div className="relative w-full h-64 sm:h-72 lg:h-[22rem] rounded-xl overflow-hidden border border-cyan-100 shadow-sm">
              <img src={docInfo.image} alt={docInfo.name} className="object-contain w-full h-full" />
              <span className="absolute top-3 right-3 bg-cyan-700 text-white text-xs px-3 py-1 rounded-full animate-pulse">{docInfo.available ? "Available":"Unavailable"}</span>
            </div>
          </div>

          <div className="md:w-2/3 flex flex-col justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2 sm:gap-4 mb-3">
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">{docInfo.name}</h2>
                <img src={assets.verified_icon} alt="Verified" className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <p className="text-sm sm:text-base text-gray-600 font-medium mb-2">{docInfo.degree} - {docInfo.speciality}</p>
              <span className="bg-cyan-100 text-cyan-800 text-xs font-semibold px-3 py-1 rounded-full">{docInfo.experience}</span>
            </div>

            <div className="mt-4">
              <h3 className="text-base font-semibold mb-1">About</h3>
              <p className="text-sm sm:text-base text-gray-600">{docInfo.about}</p>
            </div>

            <p className="mt-4 text-sm sm:text-base text-gray-800 font-semibold">
              Appointment fee: <span className="text-cyan-700 font-bold">₹{docInfo.fees}</span>
            </p>
          </div>
        </div>

        {/* Booking Section */}
        <div className="bg-white rounded-2xl shadow-md p-4 sm:p-6 md:p-8">
          
          {userData && (
            <div className="mb-6">
              <h3 className="text-xl sm:text-2xl font-semibold mb-4 text-gray-800">Select Patient</h3>
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                <button
                  onClick={() => setSelectedPatientIndex(-1)}
                  className={`flex-shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-all border ${
                    selectedPatientIndex === -1
                      ? 'bg-cyan-700 text-white border-cyan-700'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  Self ({userData.name})
                </button>
                {userData.familyMembers && userData.familyMembers.map((member, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedPatientIndex(index)}
                    className={`flex-shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-all border ${
                      selectedPatientIndex === index
                        ? 'bg-cyan-700 text-white border-cyan-700'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {member.name} ({member.relation})
                  </button>
                ))}
              </div>
            </div>
          )}

          <h3 className="text-xl sm:text-2xl font-semibold mb-4 text-gray-800">Select Date</h3>
          <div className="flex gap-3 overflow-x-auto pb-3">
            {docSlots.map((item, index) => (
              <button
                key={index}
                onClick={() => {
                  setSlotIndex(index);
                  setSlotTime('');
                }}
                className={`min-w-[70px] px-4 py-2 rounded-lg text-center text-sm font-medium transition-all ${
                  slotIndex === index
                    ? 'bg-cyan-700 text-white'
                    : 'bg-gray-100 text-gray-800 hover:bg-cyan-50'
                }`}
              >
                <p>{item[0] && daysOfWeek[item[0].datetime.getDay()]}</p>
                <p className="font-bold">{item[0] && item[0].datetime.getDate()}</p>
              </button>
            ))}
          </div>

          <h4 className="mt-6 mb-3 text-lg font-semibold text-gray-800">Select Time</h4>
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {docSlots[slotIndex]?.map((item, index) => (
              <button
                key={index}
                onClick={() => setSlotTime(item.time)}
                className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition ${
                  slotTime === item.time
                    ? 'bg-cyan-700 text-white'
                    : 'bg-gray-100 hover:bg-cyan-50 text-gray-700'
                }`}
              >
                {item.time.toLowerCase()}
              </button>
            ))}
          </div>

          <button
            onClick={bookAppointment}
            disabled={!slotTime}
            className={`mt-6 w-full md:w-auto px-6 py-3 rounded-full text-base font-semibold transition ${
              slotTime
                ? 'bg-cyan-700 text-white hover:bg-cyan-800'
                : 'bg-gray-300 text-gray-600 cursor-not-allowed'
            }`}
          >
            Book Appointment
          </button>
        </div>

        {/* Related Doctors */}
        <div className="mt-10">
          <RelatedDoctors docId={docId} speciality={docInfo.speciality} />
        </div>
      </div>
    )
  );
};

export default Appointments;
