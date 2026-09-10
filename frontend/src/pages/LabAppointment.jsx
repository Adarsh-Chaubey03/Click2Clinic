import { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AppContext } from "../context/AppContext.jsx";
import { toast } from "react-toastify";
import axios from "axios";
import { FaVial, FaMapMarkerAlt, FaPhone, FaClock, FaCheckCircle, FaShieldAlt, FaArrowLeft } from "react-icons/fa";
import { motion } from "framer-motion";

const LabAppointment = () => {
  const { labId } = useParams();
  const { labTests, backendUrl, token } = useContext(AppContext);
  const [labInfo, setLabInfo] = useState(null);
  const navigate = useNavigate();

  const fetchLabInfo = async () => {
    const labInfo = await labTests.find((lab) => lab._id === labId);
    setLabInfo(labInfo);
  };

  const bookLabAppointment = async () => {
    if (!token) {
      toast.warn("Login to book appointment");
      return navigate('/login');
    }
    try {
      const { data } = await axios.post(`${backendUrl}/api/user/bookLab-appointment`, { labId }, { headers: { token } });
      if (data.success) {
        toast.success(data.message);
        navigate('/mylab-appointments');
        window.scrollTo(0,0);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    fetchLabInfo();
  }, [labTests, labId]);

  return (
    labInfo && (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 pt-16 pb-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-8"
          >
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors duration-200 mb-4"
            >
              <FaArrowLeft className="text-sm" />
              <span className="text-sm font-medium">Back</span>
            </button>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-2">Lab Test Details</h1>
            <p className="text-gray-600">Review and book your lab test appointment</p>
          </motion.div>

          <div className="grid min-w-0 grid-cols-1 gap-6 lg:grid-cols-3 lg:gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="rounded-2xl bg-white p-4 shadow-lg sm:p-8"
              >
                {/* Test Header */}
                <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start">
                  <div className="w-fit rounded-xl bg-blue-100 p-4">
                    <FaVial className="text-blue-600 text-2xl" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
                      {labInfo.testname}
                    </h2>
                    <div className="mb-3 flex flex-wrap items-center gap-3">
                      <span className="bg-blue-100 text-blue-700 text-sm font-semibold px-3 py-1 rounded-full">
                        {labInfo.category}
                      </span>
                      <div className="flex items-center gap-1">
                        <FaCheckCircle className={`text-sm ${labInfo.isAvailable ? 'text-green-500' : 'text-gray-400'}`} />
                        <span className={`text-sm font-medium ${labInfo.isAvailable ? 'text-green-600' : 'text-gray-500'}`}>
                          {labInfo.isAvailable ? 'Available' : 'Unavailable'}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <FaShieldAlt className="text-green-500 text-sm" />
                      <span className="text-sm">Trusted by 10,000+ users</span>
                    </div>
                  </div>
                </div>

                {/* Test Information Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <FaMapMarkerAlt className="text-blue-600" />
                      <h3 className="font-semibold text-gray-800">Location</h3>
                    </div>
                    <p className="text-gray-600 text-sm">{labInfo.address}</p>
                  </div>

                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <FaPhone className="text-blue-600" />
                      <h3 className="font-semibold text-gray-800">Contact</h3>
                    </div>
                    <p className="text-gray-600 text-sm">{labInfo.contact}</p>
                  </div>

                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <FaClock className="text-blue-600" />
                      <h3 className="font-semibold text-gray-800">Results Timeline</h3>
                    </div>
                    <p className="text-gray-600 text-sm">Available by: {labInfo.resultAt}</p>
                  </div>

                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <FaMapMarkerAlt className="text-blue-600" />
                      <h3 className="font-semibold text-gray-800">Coordinates</h3>
                    </div>
                    <p className="text-gray-600 text-sm">({labInfo.latitude}, {labInfo.longitude})</p>
                  </div>
                </div>

                {/* Description */}
                <div className="bg-blue-50 rounded-xl p-4 mb-6">
                  <h3 className="font-semibold text-gray-800 mb-2">About this test</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    This comprehensive lab test provides accurate results to help diagnose and monitor your health condition. 
                    Our state-of-the-art facilities ensure reliable and timely results.
                  </p>
                </div>
              </motion.div>
            </div>

            {/* Sidebar - Booking Card */}
            <div className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="bg-white rounded-2xl shadow-lg p-6 sticky top-24"
              >
                <h3 className="text-xl font-bold text-gray-800 mb-4">Book Appointment</h3>
                
                {/* Price */}
                <div className="bg-gray-50 rounded-xl p-4 mb-6">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 font-medium">Test Price</span>
                    <span className="text-2xl font-bold text-blue-600">₹{labInfo.price}</span>
                  </div>
                </div>

                {/* Features */}
                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-3">
                    <FaCheckCircle className="text-green-500 text-sm" />
                    <span className="text-sm text-gray-600">Home sample collection</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <FaCheckCircle className="text-green-500 text-sm" />
                    <span className="text-sm text-gray-600">Digital reports</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <FaCheckCircle className="text-green-500 text-sm" />
                    <span className="text-sm text-gray-600">Expert consultation</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <FaCheckCircle className="text-green-500 text-sm" />
                    <span className="text-sm text-gray-600">24/7 support</span>
                  </div>
                </div>

                {/* Book Button */}
                <motion.button
                  whileHover={{ scale: labInfo.isAvailable ? 1.02 : 1 }}
                  whileTap={{ scale: labInfo.isAvailable ? 0.98 : 1 }}
                  onClick={bookLabAppointment}
                  disabled={!labInfo.isAvailable}
                  className={`w-full py-4 rounded-xl text-lg font-semibold transition-all duration-200 ${
                    labInfo.isAvailable
                      ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-xl'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {labInfo.isAvailable ? 'Book Test Now' : 'Currently Unavailable'}
                </motion.button>

                {/* Additional Info */}
                <div className="mt-4 text-center">
                  <p className="text-xs text-gray-500">
                    By booking, you agree to our terms and conditions
                  </p>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    )
  );
};

export default LabAppointment;
