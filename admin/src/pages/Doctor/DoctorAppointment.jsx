import { useContext, useEffect } from "react";
import { DoctorContext } from "../../context/DoctorContext.jsx";
import { assets } from "../../assets/assets.js";
import { AppContext } from "../../context/AppContext.jsx";

const DoctorAppointment = () => {
  const { calculateAge, slotDateFormat } = useContext(AppContext);
  const { dToken, appointments, getAppointments, completeAppointment, cancelAppointment } = useContext(DoctorContext);

  useEffect(() => {
    if (dToken) getAppointments();
  }, [dToken]);

  return (
    <div className="w-full min-w-0 max-w-6xl p-3 sm:p-5">
      <p className="mb-3 text-lg font-medium">All Appointments</p>

      <div className="min-h-[50vh] max-h-[80vh] overflow-y-auto rounded border bg-white text-sm">
        <div className="max-sm:hidden grid grid-cols-[0.5fr_2fr_2fr_1fr_1fr_3fr_1fr_1fr] gap-1 py-3 px-6 border-b">
          <p>#</p>
          <p>Patient</p>
          <p>Email</p>
          <p>Payment</p>
          <p>Age</p>
          <p>Date & Time</p>
          <p>Fees</p>
          <p>Action</p>
        </div>
        {appointments && appointments.length > 0 ? (
          [...appointments].reverse().map((item, index) => (
            <div
              className="grid grid-cols-1 gap-3 border-b px-4 py-3 text-gray-500 hover:bg-gray-50 sm:grid-cols-[0.5fr_2fr_2fr_1fr_1fr_3fr_1fr_1fr] sm:items-center sm:gap-1 sm:px-6"
              key={item._id}
            >
              <p className="max-sm:hidden">{index + 1}</p>
              <div className="flex min-w-0 items-center gap-2">
                <img className="w-8 rounded-full" src={item.userData.image} alt="" />
                <div>
                  <p>{item.patientData?.name || item.userData.name}</p>
                  {item.patientData?.relation && <p className="text-xs text-gray-400">({item.patientData.relation})</p>}
                </div>
              </div>
              <p>{item.userData.email}</p>
              <div>
                <p className="text-xs inline border border-primary px-2 rounded-full">
                  {item.payment ? "Online" : "Cash"}
                </p>
              </div>
              <p className="max-sm:hidden">{item.patientData?.age || calculateAge(item.userData.dob)}</p>
              <p>
                {slotDateFormat(item.slotData)}, {item.slotTime}
              </p>
              <p>₹{item.amount}</p>
              {item.cancelled ? (
                <p className="text-red-400 text-xs font-medium">Cancelled</p>
              ) : item.isCompleted ? (
                <p className="text-green-500 text-xs font-medium">Completed</p>
              ) : (
                <div className="flex">
                  <img
                    onClick={() => cancelAppointment(item._id)}
                    className="w-10 cursor-pointer"
                    src={assets.cancel_icon}
                    alt="Cancel appointment"
                  />
                  <img
                    onClick={() => completeAppointment(item._id)}
                    className="w-10 cursor-pointer"
                    src={assets.tick_icon}
                    alt="Complete appointment"
                  />
                </div>
              )}
            </div>
          ))
        ) : (
          <p className="text-center text-gray-500 py-6">No appointments found</p>
        )}
      </div>
    </div>
  );
};

export default DoctorAppointment;
