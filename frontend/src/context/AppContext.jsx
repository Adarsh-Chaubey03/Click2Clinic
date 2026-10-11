import { createContext, useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

export const AppContext = createContext();

const AppContextProvider = (props) => {
  const currencySymbol = "$";
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const [token, setToken] = useState(localStorage.getItem("token") || false);
  const [userData, setUserData] = useState(false);
  const [doctors, setDoctors] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [labTests, setLabTests] = useState([]);

  // A JWT becomes invalid when the backend secret changes or the session expires.
  // Clear it centrally so every authenticated page returns to the login flow.
  useEffect(() => {
    const interceptorId = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem("token");
          setToken(false);
          setUserData(false);
        }
        return Promise.reject(error);
      }
    );

    return () => axios.interceptors.response.eject(interceptorId);
  }, []);

  // Always fetch fresh from API — never trust a cached doctor _id for booking
  const getDoctorsData = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/doctor/list`);
      if (data.success) {
        setDoctors(data.doctors);
        localStorage.setItem("doctors", JSON.stringify(data.doctors));
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      // Fall back to cache only when network fails
      const cachedDoctors = localStorage.getItem("doctors");
      if (cachedDoctors) {
        setDoctors(JSON.parse(cachedDoctors));
      } else {
        console.error(error.message);
        toast.error("Failed to fetch doctor data");
      }
    }
  };

  // ✅ Fetch medicines only if not in localStorage
  const getMedicineData = async () => {
    const cachedMedicines = localStorage.getItem("medicines");
    if (cachedMedicines) {
      setMedicines(JSON.parse(cachedMedicines));
      return;
    }

    try {
      const { data } = await axios.get(`${backendUrl}/api/admin/medicine-list`);
      if (data.success) {
        setMedicines(data.medicines);
        localStorage.setItem("medicines", JSON.stringify(data.medicines));
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error(error.message);
      toast.error("Failed to fetch medicine data");
    }
  };

  // Fetch doctors + medicines + lab tests on app load (all public endpoints)
  useEffect(() => {
    localStorage.removeItem("labTests");  // evict stale cache once on mount
    localStorage.removeItem("doctors");   // always fetch fresh — stale _ids break booking
    getDoctorsData();
    getMedicineData();
    fetchLabTests();
  }, []);

  // ✅ Authenticated user profile
  const loadUserProfileData = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/user/get-profile`, {
        headers: { token }
      });
      if (data.success) {
        setUserData(data.userData);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error(error.message);
      toast.error("Failed to load user profile");
    }
  };

  // ✅ Lab tests data
  const fetchLabTests = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/user/lab-data`);
      if (data.success) {
        setLabTests(data.labData);
      }
    } catch (error) {
      console.error(error.message);
      toast.error("Failed to fetch lab tests");
    }
  };

  // ✅ Only call auth-based APIs if token exists
  useEffect(() => {
    if (token) {
      loadUserProfileData();
    } else {
      setUserData(false);
    }
  }, [token]);

  // ✅ Context value
  const value = {
    currencySymbol,
    token,
    setToken,
    backendUrl,
    userData,
    setUserData,
    loadUserProfileData,
    doctors,
    getDoctorsData, // Can still be called manually to refresh
    medicines,
    setMedicines,
    getMedicineData, // Same
    labTests,
    setLabTests,
    fetchLabTests
  };

  return (
    <AppContext.Provider value={value}>
      {props.children}
    </AppContext.Provider>
  );
};

export default AppContextProvider;
