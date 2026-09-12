import { useContext, useEffect } from "react";
import { DoctorContext } from "../../context/DoctorContext.jsx";

const LabReport = () => {
  const { dToken, appointments, getAppointments } = useContext(DoctorContext);

  useEffect(() => {
    if (dToken) getAppointments();
  }, [dToken]);

  return (
    <div className="w-full min-w-0 max-w-6xl p-3 sm:p-5">
      <p className="mb-3 text-lg font-medium">Lab Reports</p>

      <div className="min-h-[50vh] max-h-[80vh] overflow-y-auto rounded border bg-white text-sm">
        <div className="hidden sm:grid grid-cols-[0.5fr_2fr_5fr] gap-1 py-3 px-6 border-b">
          <p>#</p>
          <p>Patient</p>
          <p className="text-right">Lab Report</p>
        </div>
        {appointments.map((item, index) => (
          <div
            key={index}
            className="grid grid-cols-1 gap-3 border-b px-4 py-3 text-gray-500 hover:bg-gray-50 sm:grid-cols-[0.5fr_2fr_5fr] sm:items-center sm:gap-1 sm:px-6"
          >

            <p className="hidden sm:block">{index + 1}</p>
            <div className="flex min-w-0 items-center gap-2">
              <img className="w-10 h-10 rounded-full" src={item.userData.image} alt="User" />
              <p className="font-medium">{item.userData.name}</p>
            </div>

            <div className="w-full sm:w-auto flex justify-end">
              {!item.isCompleted && !item.cancelled && item.userData.labFile ? (
                <a href={item.userData.labFile} target="_blank" rel="noopener noreferrer">
                  <img
                    className="w-32 h-32 object-cover rounded-lg border shadow-md cursor-pointer hover:scale-105 transition-transform"
                    src={item.userData.labFile}
                    alt="Lab Report"
                  />
                </a>
              ) : item.isCompleted ?
              <p className="text-green-500 text-xs font-medium">Completed</p>

               : item.cancelled ? 
               <p className="text-red-500 text-right">Cancelled</p>
               :
               (
                <p className="text-red-500 text-right">No Report Available</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LabReport;
