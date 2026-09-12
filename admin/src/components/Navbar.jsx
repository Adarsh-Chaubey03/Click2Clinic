import { useContext } from "react";
import { assets } from "../assets/assets";
import { AdminContext } from "../context/AdminContext";
import { useNavigate } from "react-router-dom";
import { DoctorContext } from "../context/DoctorContext";
import { FaSyncAlt } from "react-icons/fa";

const Navbar = () => {
  const { aToken, setAToken, clearAdminCache } = useContext(AdminContext);
  const { dToken, setDToken, clearDoctorCache, isLoading } = useContext(DoctorContext);
  const navigate = useNavigate();

  const logout = () => {
    navigate("/");
    if (aToken) {
      setAToken("");
      localStorage.removeItem("aToken");
    }
    if (dToken) {
      setDToken("");
      localStorage.removeItem("dToken");
    }
  };

  return (
    <div className="sticky top-0 z-40 flex min-w-0 items-center justify-between gap-3 border-b bg-white px-3 py-3 sm:px-4">
      {/* Logo and Role */}
      <div className="flex min-w-0 items-center gap-2">
        <img
          className="w-20 shrink-0 cursor-pointer sm:w-24"
          src={assets.main_logo}
          alt="Logo"
        />
        <p className="shrink-0 rounded-full border border-gray-500 px-2 py-0.5 text-xs text-gray-600">
          {aToken ? "Admin" : "Doctor"}
        </p>
      </div>

      {/* Buttons */}
      <div className="flex shrink-0 items-center gap-2 sm:gap-3">
        {/* Show for Admin */}
        {aToken && (
          <button
            onClick={clearAdminCache}
            className={`text-gray-600 hover:text-blue-600 transition ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
            title="Refresh Admin Cache"
            aria-label="Refresh Admin Cache"
            disabled={isLoading}
          >
            <FaSyncAlt className={`text-lg ${isLoading ? "animate-spin" : ""}`} />
          </button>
        )}
        {/* Show for Doctor */}
        {dToken && (
          <button
            onClick={clearDoctorCache}
            className={`text-gray-600 hover:text-blue-600 transition ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
            title="Refresh Doctor Data"
            aria-label="Refresh Doctor Data"
            disabled={isLoading}
          >
            <FaSyncAlt className={`text-lg ${isLoading ? "animate-spin" : ""}`} />
          </button>
        )}
        <button
          onClick={logout}
          className="rounded-full bg-primary px-3 py-1.5 text-xs text-white sm:px-4"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default Navbar;
