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

  // ✅ Fetch doctors only if not in localStorage
  const getDoctorsData = async () => {
    const cachedDoctors = localStorage.getItem("doctors");
    if (cachedDoctors) {
      setDoctors(JSON.parse(cachedDoctors));
      return;
    }

    try {
      const { data } = await axios.get(`${backendUrl}/api/doctor/list`);
      if (data.success) {
        setDoctors(data.doctors);
        localStorage.setItem("doctors", JSON.stringify(data.doctors));
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error(error.message);
      toast.error("Failed to fetch doctor data");
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

  // ✅ Fetch doctors + medicines only once on app load
  useEffect(() => {
    getDoctorsData();
    getMedicineData();
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
      const { data } = await axios.get(`${backendUrl}/api/user/lab-data`, {
        headers: { token }
      });
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
      fetchLabTests();
    } else {
      setUserData(false);
      setLabTests([]);
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
