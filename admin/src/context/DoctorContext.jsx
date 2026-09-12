import { createContext, useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";

export const DoctorContext = createContext();

const DoctorContextProvider = (props) => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const [dToken, setDToken] = useState(localStorage.getItem("dToken") || "");
  const [appointments, setAppointments] = useState(
    JSON.parse(localStorage.getItem("doctorAppointments")) || []
  );
  const [dashData, setDashData] = useState(
    JSON.parse(localStorage.getItem("doctorDashData")) || false
  );
  const [profileData, setProfileData] = useState(
    JSON.parse(localStorage.getItem("doctorProfileData")) || false
  );
  const [skinReviews, setSkinReviews] = useState(
    JSON.parse(localStorage.getItem("doctorSkinReviews")) || []
  );
  const [isLoading, setIsLoading] = useState(false); // Loading state

  // 🔁 Get Appointments
  const getAppointments = async () => {
    if (localStorage.getItem("doctorAppointments") || isLoading) return; // Skip if cached or loading
    setIsLoading(true);
    try {
      const { data } = await axios.get(backendUrl + "/api/doctor/appointments", {
        headers: { dToken },
      });
      if (data.success) {
        setAppointments(data.appointments);
        localStorage.setItem(
          "doctorAppointments",
          JSON.stringify(data.appointments)
        );
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // 🔁 Complete Appointment
  const completeAppointment = async (appointmentId) => {
    if (isLoading) return; // Prevent concurrent calls
    setIsLoading(true);
    try {
      const { data } = await axios.post(
        backendUrl + "/api/doctor/complete-appointment",
        { appointmentId },
        { headers: { dToken } }
      );
      if (data.success) {
        toast.success(data.message);
        localStorage.removeItem("doctorAppointments"); // Clear cache
        await getAppointments();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error(error);
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
        backendUrl + "/api/doctor/cancel-appointment",
        { appointmentId },
        { headers: { dToken } }
      );
      if (data.success) {
        toast.success(data.message);
        localStorage.removeItem("doctorAppointments"); // Clear cache
        await getAppointments();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // 🔁 Get Dashboard Data
  const getDashData = async () => {
    if (localStorage.getItem("doctorDashData") || isLoading) return; // Skip if cached or loading
    setIsLoading(true);
    try {
      const { data } = await axios.get(backendUrl + "/api/doctor/dashboard", {
        headers: { dToken },
      });
      if (data.success) {
        setDashData(data.dashData);
        localStorage.setItem("doctorDashData", JSON.stringify(data.dashData));
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // 🔁 Get Profile Data
  const getProfileData = async () => {
    if (localStorage.getItem("doctorProfileData") || isLoading) return; // Skip if cached or loading
    setIsLoading(true);
    try {
      const { data } = await axios.get(backendUrl + "/api/doctor/profile", {
        headers: { dToken },
      });
      if (data.success) {
        setProfileData(data.profileData[0]);
        localStorage.setItem(
          "doctorProfileData",
          JSON.stringify(data.profileData[0])
        );
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // 🔁 Get Skin Reviews
  const getSkinReviews = async () => {
    if (localStorage.getItem("doctorSkinReviews") || isLoading) return; 
    setIsLoading(true);
    try {
      const { data } = await axios.get(backendUrl + "/api/doctor/skin-reviews", {
        headers: { dToken },
      });
      if (data.success) {
        setSkinReviews(data.reviews);
        localStorage.setItem(
          "doctorSkinReviews",
          JSON.stringify(data.reviews)
        );
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // 🔁 Submit Skin Evaluation
  const submitSkinEvaluation = async (evaluationData) => {
    try {
      const { data } = await axios.post(
        backendUrl + "/api/doctor/submit-skin-evaluation",
        evaluationData,
        { headers: { dToken } }
      );
      if (data.success) {
        toast.success(data.message);
        localStorage.removeItem("doctorSkinReviews");
        localStorage.removeItem("doctorDashData");
        await getSkinReviews();
        await getDashData();
        return true;
      } else {
        toast.error(data.message);
        return false;
      }
    } catch (error) {
      console.error(error);
      toast.error(error.message);
      return false;
    }
  };

  // 🔁 Clear Doctor Cache
  const clearDoctorCache = async () => {
    if (isLoading) return; // Prevent concurrent calls
    setIsLoading(true);
    try {
      localStorage.removeItem("doctorAppointments");
      localStorage.removeItem("doctorDashData");
      localStorage.removeItem("doctorProfileData");
      localStorage.removeItem("doctorSkinReviews");
      setAppointments([]);
      setDashData(false);
      setProfileData(false);
      setSkinReviews([]);
      // Fetch all data in parallel
      await Promise.all([getAppointments(), getDashData(), getProfileData(), getSkinReviews()]);
      toast.success("Cache cleared and data refreshed");
    } catch (error) {
      console.error(error);
      toast.error("Failed to clear cache and refresh data");
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch data when dToken changes or on initial mount
  useEffect(() => {
    if (dToken) {
      getAppointments();
      getDashData();
      getProfileData();
      getSkinReviews();
    }
  }, [dToken]);

  const value = {
    dToken,
    setDToken,
    backendUrl,
    appointments,
    setAppointments,
    getAppointments,
    completeAppointment,
    cancelAppointment,
    dashData,
    setDashData,
    getDashData,
    profileData,
    setProfileData,
    getProfileData,
    skinReviews,
    setSkinReviews,
    getSkinReviews,
    submitSkinEvaluation,
    clearDoctorCache, // Added refresh method
  };

  return (
    <DoctorContext.Provider value={value}>
      {props.children}
    </DoctorContext.Provider>
  );
};

export default DoctorContextProvider;