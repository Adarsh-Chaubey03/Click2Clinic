import { useContext, useState } from "react";
import { AppContext } from "../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import loginBg from "../assets/login_bg.jpg"; // Import the background image

const MailIcon = () => (
  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><rect width="20" height="14" x="2" y="5" rx="3"/><path d="M3 6.5l9 7 9-7"/></svg>
);
const LockIcon = () => (
  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><rect x="5" y="11" width="14" height="8" rx="2"/><path d="M8 11V7a4 4 0 1 1 8 0v4"/></svg>
);

const Login = () => {
  const { backendUrl, setToken } = useContext(AppContext);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  
  const onSubmitHandler = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.post(backendUrl + "/api/user/login", {
        password,
        email,
      });
      if (data.success) {
        localStorage.setItem("token", data.token);
        setToken(data.token);
        navigate("/");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div 
      className="flex min-h-screen items-center justify-center px-4 py-8"
      style={{
        backgroundImage: `url(${loginBg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <form onSubmit={onSubmitHandler} className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-5 flex flex-col gap-6 items-center">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-600 to-teal-400 flex items-center justify-center mb-2">
            <svg width="32" height="32" fill="none" stroke="white" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-2.5 3.5-4.5 8-4.5s8 2 8 4.5V21H4v-1z"/></svg>
          </div>
          <h2 className="text-2xl font-bold text-center"><span className="text-blue-600">User</span> Login</h2>
          <p className="text-gray-500 text-center -mt-3 mb-2">Welcome back! Please sign in to your account.</p>
          <div className="w-full text-left">
            <label className="block font-semibold mb-1">Email Address</label>
            <div className="relative flex items-center">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"><MailIcon /></span>
              <input
                className="pl-10 pr-4 py-2 w-full rounded-lg border border-gray-200 bg-[#f3fafd] focus:outline-none focus:ring-2 focus:ring-blue-200 text-base placeholder-gray-400"
                type="email"
                placeholder="Enter your email"
                onChange={(e) => setEmail(e.target.value)}
                required
                value={email}
              />
            </div>
          </div>
          <div className="w-full text-left">
            <label className="block font-semibold mb-1">Password</label>
            <div className="relative flex items-center">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"><LockIcon /></span>
              <input
                className="pl-10 pr-12 py-2 w-full rounded-lg border border-gray-200 bg-[#f3fafd] focus:outline-none focus:ring-2 focus:ring-blue-200 text-base placeholder-gray-400"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                onChange={(e) => setPassword(e.target.value)}
                required
                value={password}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showPassword ? (
                  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                ) : (
                  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                    <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/>
                    <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/>
                    <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/>
                    <line x1="2" x2="22" y1="2" y2="22"/>
                  </svg>
                )}
              </button>
            </div>
          </div>
          <button
            type="submit"
            className="mt-2 w-full bg-gradient-to-r from-blue-600 to-teal-400 text-white py-2 rounded-lg text-lg font-semibold shadow hover:from-blue-700 hover:to-teal-500 transition-all"
          >
            Sign In
          </button>
          <hr className="w-full my-2 border-gray-200" />
          <div className="text-center text-gray-500 text-base mt-2">
            Don't have an account?{' '}
            <span
              onClick={() => navigate("/signup")}
              className="text-blue-600 font-semibold underline cursor-pointer"
            >
              Sign up
            </span>
          </div>
        </div>
      </form>
    </div>
  );
};

export default Login;
