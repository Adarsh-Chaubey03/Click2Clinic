import axios from "axios";
import { createContext, useState, useEffect } from "react";
import { toast } from "react-toastify";

export const AdminContext = createContext();

const AdminContextProvider = (props) => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const [aToken, setAToken] = useState(localStorage.getItem("aToken") || "");
  const [doctors, setDoctors] = useState(
    JSON.parse(localStorage.getItem("doctors")) || []
  );
  const [appointments, setAppointments] = useState(
    JSON.parse(localStorage.getItem("appointments")) || []
  );
  const [dashData, setDashData] = useState(
    JSON.parse(localStorage.getItem("dashData")) || false
  );
  const [isLoading, setIsLoading] = useState(false); // New loading state

  // 🔁 Get All Doctors
  const getAllDoctors = async () => {
    if (localStorage.getItem("doctors") || isLoading) return; // Skip if cached or loading
    setIsLoading(true);
    try {
      const { data } = await axios.post(
        backendUrl + "/api/admin/all-doctors",
        {},
        { headers: { aToken } }
      );
      if (data.success) {
        setDoctors(data.doctors);
        localStorage.setItem("doctors", JSON.stringify(data.doctors));
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // 🔁 Change Doctor Availability
  const changeAvailability = async (docId) => {
    if (isLoading) return; // Prevent concurrent calls
    setIsLoading(true);
    try {
      const { data } = await axios.post(
        backendUrl + "/api/admin/change-availability",
        { docId },
        { headers: { aToken } }
      );
      if (data.success) {
        toast.success(data.message);
        localStorage.removeItem("doctors"); // Clear cache to force re-fetch
        await getAllDoctors();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // 🔁 Get All Appointments
  const getAllAppointments = async () => {
    if (localStorage.getItem("appointments") || isLoading) return; // Skip if cached or loading
    setIsLoading(true);
    try {
      const { data } = await axios.get(
        backendUrl + "/api/admin/appointments",
        { headers: { aToken } }
      );
      if (data.success) {
        setAppointments(data.appointments);
        localStorage.setItem("appointments", JSON.stringify(data.appointments));
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // 🔁 Cancel Appointment
  const cancelAppointment = async (appointmentId) => {
    if (isLoading) return; // Prevent concurrent calls
    setIsLoading(true);
    try {
      const { data } = await axios.post(
        backendUrl + "/api/admin/cancel-appointment",
        { appointmentId },
        { headers: { aToken } }
      );
      if (data.success) {
        toast.success(data.message);
        localStorage.removeItem("appointments");
        await getAllAppointments();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // 🔁 Dashboard Data
  const getDashData = async () => {
    if (localStorage.getItem("dashData") || isLoading) return; // Skip if cached or loading
    setIsLoading(true);
    try {
      const { data } = await axios.get(backendUrl + "/api/admin/dashboard", {
        headers: { aToken },
      });
      if (data.success) {
        setDashData(data.dashData);
        localStorage.setItem("dashData", JSON.stringify(data.dashData));
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Clear all cached admin data
  const clearAdminCache = async () => {
    if (isLoading) return; // Prevent concurrent calls
    setIsLoading(true);
    try {
      localStorage.removeItem("doctors");
      localStorage.removeItem("appointments");
      localStorage.removeItem("dashData");
      setDoctors([]);
      setAppointments([]);
      setDashData(false);
      // Fetch all data in parallel to reduce wait time
      await Promise.all([getAllDoctors(), getAllAppointments(), getDashData()]);
      toast.success("Cache cleared and data refreshed");
    } catch (error) {
      toast.error("Failed to clear cache and refresh data");
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch data when aToken changes or on initial mount
  useEffect(() => {
    if (aToken) {
      getAllDoctors();
      getAllAppointments();
      getDashData();
    }
  }, [aToken]);

  const value = {
    aToken,
    setAToken,
    backendUrl,
    doctors,
    getAllDoctors,
    changeAvailability,
    appointments,
    setAppointments,
    getAllAppointments,
    cancelAppointment,
    dashData,
    setDashData,
    getDashData,
    clearAdminCache,
  };

  return (
    <AdminContext.Provider value={value}>
      {props.children}
    </AdminContext.Provider>
  );
};

export default AdminContextProvider;