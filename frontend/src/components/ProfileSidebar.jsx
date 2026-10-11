import { useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import { toast } from "react-toastify";
import { useCart } from "../context/CartContext";

/* ── Nav items config ──────────────────────────────────────────── */
const NAV_ITEMS = [
  {
    label: "My Profile",
    path: "/my-profile",
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10Zm0 2c-5.33 0-8 2.67-8 4v1h16v-1c0-1.33-2.67-4-8-4Z" />
      </svg>
    ),
  },
  {
    label: "My Appointments",
    path: "/my-appointment",
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
        <path d="M19 4h-1V2h-2v2H8V2H6v2H5C3.9 4 3 4.9 3 6v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2Zm0 16H5V9h14v11ZM7 11h5v5H7Z" />
      </svg>
    ),
  },
  {
    label: "Lab Appointments",
    path: "/mylab-appointments",
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
        <path d="M7 2v2h1v9.27A4 4 0 0 0 9.72 22h4.56A4 4 0 0 0 16 13.27V4h1V2H7Zm5 16a2 2 0 1 1 0-4 2 2 0 0 1 0 4Zm2-8.27V4H10v5.73a4 4 0 0 1 4 0Z" />
      </svg>
    ),
  },
  {
    label: "My Orders",
    path: "/my-orders",
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
        <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2Zm-7 3a3 3 0 1 1 0 6 3 3 0 0 1 0-6Zm5 12H7v-.6c0-2 4-3.1 5-3.1s5 1.1 5 3.1v.6Z" />
      </svg>
    ),
  },
  {
    label: "My Skin Reviews",
    path: "/my-skin-reviews",
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
        <path d="M15.5 14h-.79l-.28-.27A6.47 6.47 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5Zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14Z" />
      </svg>
    ),
  },
];

/* ── Component ─────────────────────────────────────────────────── */
const ProfileSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { setToken } = useContext(AppContext);
  const { clearCart } = useCart();

  const logout = () => {
    setToken(false);
    localStorage.removeItem("token");
    clearCart();
    navigate("/");
    toast.success("Logged out successfully");
  };

  return (
    <aside className="w-56 flex-shrink-0">
      <div className="bg-white rounded-2xl border border-[#dceeed] shadow-sm overflow-hidden">
        {/* Nav links */}
        <nav className="py-2">
          {NAV_ITEMS.map((item) => {
            const active = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors text-left ${
                  active
                    ? "bg-[#e8f9f6] text-[#009f9a]"
                    : "text-[#5f7185] hover:bg-[#f5fdfc] hover:text-[#009f9a]"
                }`}
              >
                {/* Icon with teal tint when active */}
                <span className={active ? "text-[#009f9a]" : "text-[#9ab5c0]"}>
                  {item.icon}
                </span>
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Divider */}
        <div className="mx-4 border-t border-[#dceeed]" />

        {/* Sign Out */}
        <div className="py-2">
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold text-red-500 hover:bg-red-50 transition-colors"
          >
            {/* Door-exit icon */}
            <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Sign Out
          </button>
        </div>
      </div>
    </aside>
  );
};

export default ProfileSidebar;
