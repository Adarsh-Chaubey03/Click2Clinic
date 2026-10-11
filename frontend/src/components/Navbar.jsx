import { useContext, useState, Fragment } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext.jsx";
import { useCart } from "../context/CartContext.jsx";
import TranslateWidget from "../pages/TranslateWidget.jsx";
import Cart from "./Cart.jsx";
import { Menu, Transition } from "@headlessui/react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";

const Navbar = () => {
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { token, setToken, userData } = useContext(AppContext);
  const { getCartItemCount, clearCart } = useCart();

  const navLinks = [
    { path: "/", label: "Home", icon: "🏠" },
    { path: "/doctors", label: "Doctors", icon: "👨‍⚕️" },
    { path: "/lab", label: "Lab Tests", icon: "🔬" },
    { path: "/store", label: "Pharmacy", icon: "💊" },
    { path: "/awareness", label: "Health Tips", icon: "💡" },
  ];

  const logout = () => {
    setToken(false);
    localStorage.removeItem("token");
    clearCart();
    navigate('/');
    toast.success("Logged out successfully");
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <>
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100/50 shadow-sm">
        <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-18">
            {/* Logo */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/')}
              className="flex shrink-0 cursor-pointer items-center gap-2"
            >
              <span className="text-xl font-extrabold tracking-tight text-[#10233f] sm:text-2xl">
                Click<span className="text-[#009f9a]">2</span>Clinic
              </span>
            </motion.div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => (
                <NavLink
                  key={link.path}
                  to={link.path}
                  onClick={scrollToTop}
                  className={({ isActive }) =>
                    `relative px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300
                    ${isActive
                      ? "text-teal-700 bg-teal-50"
                      : "text-gray-600 hover:text-teal-600 hover:bg-gray-50"
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <span className="relative z-10">{link.label}</span>
                      {isActive && (
                        <motion.div
                          layoutId="activeNav"
                          className="absolute inset-0 bg-gradient-to-r from-teal-50 to-emerald-50 rounded-xl"
                          transition={{ type: "spring", stiffness: 400, damping: 30 }}
                        />
                      )}
                    </>
                  )}
                </NavLink>
              ))}
            </div>

            {/* Right Section */}
            <div className="flex min-w-0 items-center gap-2 sm:gap-3">
              {/* Language - Desktop */}
              <div className="hidden lg:block">
                <TranslateWidget />
              </div>

              {/* Cart Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsCartOpen(true)}
                className="relative rounded-xl border border-[#e2eeee] bg-white p-2.5 transition-colors hover:border-[#9edfd8] hover:bg-[#effcfb]"
                aria-label="Open cart"
              >
                <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                {getCartItemCount() > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold rounded-full flex items-center justify-center"
                  >
                    {getCartItemCount()}
                  </motion.span>
                )}
              </motion.button>

              {/* Profile / Auth */}
              {token && userData ? (
                <Menu as="div" className="relative">
                  {/* ── Trigger button — avatar icon + first name + chevron ── */}
                  <Menu.Button className="flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors">
                    {/* Generic person circle */}
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#dde8f0]">
                      <svg className="w-4 h-4 text-[#7a9ab5]" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10Zm0 2c-5.33 0-8 2.67-8 4v1h16v-1c0-1.33-2.67-4-8-4Z"/>
                      </svg>
                    </span>
                    <span className="hidden sm:inline text-sm font-semibold text-[#10233f] max-w-[90px] truncate uppercase tracking-wide">
                      {userData.name?.split(" ")[0] || "User"}
                    </span>
                    <svg className="w-3.5 h-3.5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                    </svg>
                  </Menu.Button>

                  <Transition
                    as={Fragment}
                    enter="transition ease-out duration-200"
                    enterFrom="opacity-0 scale-95 translate-y-2"
                    enterTo="opacity-100 scale-100 translate-y-0"
                    leave="transition ease-in duration-150"
                    leaveFrom="opacity-100 scale-100"
                    leaveTo="opacity-0 scale-95"
                  >
                    <Menu.Items className="absolute right-0 mt-3 w-72 bg-white rounded-2xl shadow-2xl ring-1 ring-black/5 focus:outline-none overflow-hidden">

                      {/* ── User info header ── */}
                      <div className="flex items-center gap-3 px-5 py-4 bg-[#f0fafa]">
                        <span className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-[#dde8f0]">
                          <svg className="w-6 h-6 text-[#7a9ab5]" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10Zm0 2c-5.33 0-8 2.67-8 4v1h16v-1c0-1.33-2.67-4-8-4Z"/>
                          </svg>
                        </span>
                        <div className="min-w-0">
                          <p className="font-bold text-[#10233f] truncate uppercase tracking-wide text-sm">
                            {userData.name || "User"}
                          </p>
                          <p className="text-xs text-[#718398] truncate">{userData.email}</p>
                        </div>
                      </div>

                      {/* ── Menu items ── */}
                      <div className="py-2">
                        {[
                          {
                            label: "My Profile",
                            path: "/my-profile",
                            bg: "bg-[#e8f9f2]",
                            icon: (
                              <svg className="w-4 h-4 text-[#009f9a]" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10Zm0 2c-5.33 0-8 2.67-8 4v1h16v-1c0-1.33-2.67-4-8-4Z"/>
                              </svg>
                            ),
                          },
                          {
                            label: "My Appointments",
                            path: "/my-appointment",
                            bg: "bg-[#e8f0fb]",
                            icon: (
                              <svg className="w-4 h-4 text-[#4a7fd4]" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M19 4h-1V2h-2v2H8V2H6v2H5C3.9 4 3 4.9 3 6v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2Zm0 16H5V9h14v11ZM7 11h5v5H7Z"/>
                              </svg>
                            ),
                          },
                          {
                            label: "Lab Appointments",
                            path: "/mylab-appointments",
                            bg: "bg-[#f0e8fb]",
                            icon: (
                              <svg className="w-4 h-4 text-[#9b59d4]" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M7 2v2h1v9.27A4 4 0 0 0 9.72 22h4.56A4 4 0 0 0 16 13.27V4h1V2H7Zm5 16a2 2 0 1 1 0-4 2 2 0 0 1 0 4Zm2-8.27V4H10v5.73a4 4 0 0 1 4 0Z"/>
                              </svg>
                            ),
                          },
                          {
                            label: "My Orders",
                            path: "/my-orders",
                            bg: "bg-[#fef3e2]",
                            icon: (
                              <svg className="w-4 h-4 text-[#e08c2a]" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M20.57 14.86L22 13.43 20.57 12 17 15.57 8.43 7 12 3.43 10.57 2 9.14 3.43 7.71 2 5.57 4.14 4.14 2.71 2.71 4.14l1.43 1.43L2 7.71l1.43 1.43L2 10.57 3.43 12 7 8.43 15.57 17 12 20.57 13.43 22l1.43-1.43L16.29 22l2.14-2.14 1.43 1.43 1.43-1.43-1.43-1.43L22 16.29l-1.43-1.43Z"/>
                              </svg>
                            ),
                          },
                          {
                            label: "My Skin Reviews",
                            path: "/my-skin-reviews",
                            bg: "bg-[#fde8f0]",
                            icon: (
                              <svg className="w-4 h-4 text-[#e2458a]" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M15.5 14h-.79l-.28-.27A6.47 6.47 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5Zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14Z"/>
                              </svg>
                            ),
                          },
                        ].map((item) => (
                          <Menu.Item key={item.path}>
                            {({ active }) => (
                              <button
                                onClick={() => { navigate(item.path); scrollToTop(); }}
                                className={`w-full flex items-center gap-3.5 px-5 py-3 text-sm font-medium transition-colors ${
                                  active ? "bg-gray-50" : ""
                                }`}
                              >
                                {/* Colored icon square */}
                                <span className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl ${item.bg}`}>
                                  {item.icon}
                                </span>
                                <span className="flex-1 text-left text-[#10233f]">{item.label}</span>
                                {/* Right chevron */}
                                <svg className="w-3.5 h-3.5 text-[#b0bec5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                                </svg>
                              </button>
                            )}
                          </Menu.Item>
                        ))}
                      </div>

                      {/* ── Sign Out ── */}
                      <div className="px-3 pb-3">
                        <Menu.Item>
                          {({ active }) => (
                            <button
                              onClick={logout}
                              className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-semibold text-red-500 transition-colors ${
                                active ? "bg-red-100" : "bg-red-50"
                              }`}
                            >
                              {/* Sign-out icon */}
                              <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                                <polyline points="16 17 21 12 16 7"/>
                                <line x1="21" y1="12" x2="9" y2="12"/>
                              </svg>
                              Sign Out
                            </button>
                          )}
                        </Menu.Item>
                      </div>

                    </Menu.Items>
                  </Transition>
                </Menu>
              ) : (
                <div className="hidden sm:flex items-center gap-2">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => { navigate("/login"); scrollToTop(); }}
                    className="px-4 py-2 text-sm font-medium text-teal-700 hover:bg-teal-50 rounded-xl transition-colors"
                  >
                    Login
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => { navigate("/signup"); scrollToTop(); }}
                    className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-teal-600 to-emerald-600 rounded-xl shadow-md shadow-teal-200 hover:shadow-lg transition-all"
                  >
                    Sign Up
                  </motion.button>
                </div>
              )}

              {/* Mobile Menu Toggle */}
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => setShowMenu(true)}
                className="lg:hidden p-2.5 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
                aria-label="Open menu"
              >
                <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </motion.button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {showMenu && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowMenu(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 lg:hidden"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed top-0 right-0 h-full w-80 max-w-[85vw] bg-white shadow-2xl z-50 lg:hidden"
            >
              <div className="flex flex-col h-full">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-100">
                  <h2 className="text-lg font-bold text-gray-800">Menu</h2>
                  <button
                    onClick={() => setShowMenu(false)}
                    className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                  >
                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* User Info (if logged in) */}
                {token && userData && (
                  <div className="p-4 bg-gradient-to-r from-teal-50 to-emerald-50">
                    <div className="flex min-w-0 items-center gap-3">
                      <img src={userData.image} className="w-12 h-12 rounded-full object-cover" alt="" />
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-gray-800">{userData.name || "User"}</p>
                        <p className="truncate text-xs text-gray-500">{userData.email}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Language */}
                <div className="p-4 border-b border-gray-100">
                  <TranslateWidget />
                </div>

                {/* Navigation */}
                <div className="flex-1 overflow-y-auto py-4">
                  <div className="space-y-1 px-3">
                    {navLinks.map((link) => (
                      <NavLink
                        key={link.path}
                        to={link.path}
                        onClick={() => { setShowMenu(false); scrollToTop(); }}
                        className={({ isActive }) =>
                          `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors
                          ${isActive
                            ? "bg-teal-50 text-teal-700"
                            : "text-gray-700 hover:bg-gray-50"
                          }`
                        }
                      >
                        <span className="text-lg">{link.icon}</span>
                        {link.label}
                      </NavLink>
                    ))}
                  </div>


                </div>

                {/* Bottom Actions */}
                <div className="p-4 border-t border-gray-100">
                  {token && userData ? (
                    <button
                      onClick={() => { setShowMenu(false); logout(); }}
                      className="w-full flex items-center justify-center gap-2 py-3 bg-red-50 text-red-600 rounded-xl font-medium hover:bg-red-100 transition-colors"
                    >
                      <span>🚪</span>
                      Sign Out
                    </button>
                  ) : (
                    <div className="space-y-2">
                      <button
                        onClick={() => { setShowMenu(false); navigate("/login"); scrollToTop(); }}
                        className="w-full py-3 border-2 border-teal-600 text-teal-700 rounded-xl font-medium hover:bg-teal-50 transition-colors"
                      >
                        Login
                      </button>
                      <button
                        onClick={() => { setShowMenu(false); navigate("/signup"); scrollToTop(); }}
                        className="w-full py-3 bg-gradient-to-r from-teal-600 to-emerald-600 text-white rounded-xl font-medium hover:shadow-lg transition-all"
                      >
                        Sign Up
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Cart Modal */}
      <Cart isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
};

export default Navbar;
