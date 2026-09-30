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
  const { getCartItemCount, setCartItems } = useCart();

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
    setCartItems([]);
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
                  <Menu.Button className="flex items-center gap-2 p-1.5 pr-3 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors">
                    <img
                      src={userData.image}
                      alt="Profile"
                      className="w-8 h-8 rounded-full object-cover ring-2 ring-white"
                    />
                    <span className="hidden sm:inline text-sm font-medium text-gray-700 max-w-[100px] truncate">
                      {userData.name?.split(' ')[0] || "User"}
                    </span>
                    <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
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
                    <Menu.Items className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl ring-1 ring-gray-100 py-2 focus:outline-none overflow-hidden">
                      {/* User Info */}
                      <div className="px-4 py-3 bg-gradient-to-r from-teal-50 to-emerald-50">
                    <div className="flex min-w-0 items-center gap-3">
                          <img src={userData.image} className="w-12 h-12 rounded-full object-cover" alt="" />
                          <div className="min-w-0">
                            <p className="truncate font-semibold text-gray-800">{userData.name || "User"}</p>
                            <p className="text-xs text-gray-500 truncate">{userData.email}</p>
                          </div>
                        </div>
                      </div>

                      <div className="py-2">
                        {[
                          { label: "My Profile", icon: "👤", path: "/my-profile" },
                          { label: "My Appointments", icon: "📅", path: "/my-appointment" },
                          { label: "Lab Appointments", icon: "🧪", path: "/mylab-appointments" },
                          { label: "My Orders", icon: "📦", path: "/my-orders" },
                          { label: "My Skin Reviews", icon: "🔎", path: "/my-skin-reviews" },
                        ].map((item) => (
                          <Menu.Item key={item.path}>
                            {({ active }) => (
                              <button
                                onClick={() => { navigate(item.path); scrollToTop(); }}
                                className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors
                                          ${active ? "bg-gray-50 text-teal-700" : "text-gray-700"}`}
                              >
                                <span className="text-lg">{item.icon}</span>
                                {item.label}
                              </button>
                            )}
                          </Menu.Item>
                        ))}
                      </div>

                      <div className="border-t border-gray-100 pt-2">
                        <Menu.Item>
                          {({ active }) => (
                            <button
                              onClick={logout}
                              className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors
                                        ${active ? "bg-red-50 text-red-600" : "text-red-500"}`}
                            >
                              <span className="text-lg">🚪</span>
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
