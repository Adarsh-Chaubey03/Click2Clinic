import { useState, useEffect, useContext } from "react";
import { motion } from "framer-motion";
import {
  FaSearch,
  FaFilter,
  FaHeartbeat,
  FaVial,
  FaDna,
  FaTimes,
  FaMapMarkerAlt,
  FaCheckCircle,
  FaClock,
  FaShieldAlt,
  FaStar,
  FaArrowRight,
  FaChevronDown,
} from "react-icons/fa";
import axios from "axios";
import { AppContext } from "../context/AppContext";
import { useNavigate } from "react-router-dom";
import labImage from "../assets/lab_image.jpg"; // Import the background image
import { toast } from "react-toastify";

const LabSection = () => {
  const { backendUrl ,token} = useContext(AppContext);
  const [labTests, setLabTests] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [showFilters, setShowFilters] = useState(false);
  const [location, setLocation] = useState("");
  const [locationMessage, setLocationMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [visibleTests, setVisibleTests] = useState(6); // Show only 6 tests initially
  const navigate = useNavigate();
  const categories = [
    "All",
    "Hematology",
    "Endocrinology",
    "Cardiology",
    "Nephrology",
    "Hepatology",
    "Diabetology",
    "Pathology",
    "Infectious Diseases",
    "Immunology",
  ];

  const fetchLabTests = async () => {
    const cachedTests = localStorage.getItem("labTests");

    if (cachedTests) {
      setLabTests(JSON.parse(cachedTests));
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data } = await axios.get(`${backendUrl}/api/user/lab-data`);
      if (data.success) {
        setLabTests(data.labData);
        localStorage.setItem("labTests", JSON.stringify(data.labData));
      } else {
        setError(
          data.message || "Something went wrong while fetching lab tests."
        );
      }
    } catch (err) {
      console.error(err);
      setError("Failed to fetch lab tests. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLabTests();
  }, []);

  const filteredTests = labTests.filter(
    (test) =>
      test.testname.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (selectedCategory === "All" || test.category === selectedCategory) &&
      (location === "" || test.availableLocations.includes(location))
  );

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    setShowFilters(false);
  };

  const handleLocationSearch = (e) => {
    e.preventDefault();
    setTimeout(() => {
      const mockLocation = "Mumbai"; // Replace with dynamic location if needed
      setLocation(mockLocation);
      const availableTests = labTests.filter((test) =>
        test.availableLocations.includes(mockLocation)
      ).length;
      setLocationMessage(
        availableTests > 0
          ? `${availableTests} test(s) available in ${mockLocation}.`
          : `No tests available in ${mockLocation}.`
      );
    }, 300);
  };

  const handleClick = (labId) => {
    if(token){
    navigate(`/lab/${labId}`);
    window.scrollTo(0,0)
    }
    else{
      toast.warn("login to book test")
    }
  };

  const loadMoreTests = () => {
    setVisibleTests((prev) => prev + 6); // Load 6 more tests
  };

  const displayedTests = filteredTests.slice(0, visibleTests);

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8" style={{ background: "linear-gradient(110deg,#effcfb 0%,#f7fcfc 48%,#e9f8f8 100%)" }}>
      <div className="max-w-7xl mx-auto">
        {/* Updated Banner with Background Image */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative mb-8 flex min-h-72 items-center overflow-hidden rounded-2xl sm:mb-12 sm:h-60"
          style={{
            backgroundImage: `url(${labImage})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
        >
          <div className="absolute inset-0 bg-black/50"></div>{" "}
          {/* Adjusted opacity for better text visibility */}
          <div className="relative z-10 flex flex-col items-start px-4 text-white sm:px-12">
            <h1 className="mb-3 text-3xl font-extrabold tracking-tight sm:text-5xl">
              Book Lab Tests Online
            </h1>
            <p className="mb-4 max-w-md text-base sm:text-xl">
              Fast, certified, and affordable diagnostics at your fingertips.
            </p>
            <button className="bg-white text-cyan-600 px-6 py-3 rounded-xl font-semibold hover:bg-gray-100 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
              Explore Tests
            </button>
          </div>
        </motion.div>

        {/* Rest of the code remains unchanged */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-10 rounded-2xl border border-[#dceeed] bg-white p-4 shadow-lg sm:p-6"
        >
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="relative w-full sm:w-3/5">
              <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg" />
              <input
                type="text"
                placeholder="Search tests or health packages"
                className="w-full pl-12 pr-4 py-4 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 text-gray-700 text-base transition-all duration-300"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
              <button
                className="flex w-full items-center justify-center gap-3 rounded-xl bg-cyan-600 px-4 py-4 text-sm font-semibold text-white shadow-md transition-all duration-300 hover:-translate-y-0.5 hover:bg-cyan-700 hover:shadow-lg sm:w-auto sm:px-6"
                onClick={handleLocationSearch}
              >
                <FaMapMarkerAlt className="text-lg" />
                Find Nearby Labs
              </button>
              <button
                className="flex w-full items-center justify-center gap-3 rounded-xl border border-gray-300 bg-gray-100 px-4 py-4 text-sm font-semibold text-gray-700 transition-all duration-300 hover:bg-gray-200 sm:w-auto sm:px-6"
                onClick={() => setShowFilters(true)}
              >
                <FaFilter className="text-lg" />
                Filter Tests
              </button>
            </div>
          </div>
        </motion.div>

        {/* Loading and Error States */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-flex items-center gap-3 text-gray-600">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-cyan-600"></div>
              Loading laboratory tests...
            </div>
          </div>
        )}
        {error && (
          <div className="text-center py-12">
            <div className="bg-red-50 border border-red-200 rounded-xl p-6 max-w-md mx-auto">
              <p className="text-red-600 font-medium">{error}</p>
            </div>
          </div>
        )}

        {/* Enhanced Location Message */}
        {locationMessage && !loading && !error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="mb-8 bg-cyan-50 border border-cyan-200 rounded-xl p-4"
          >
            <div className="flex items-center gap-3">
              <FaMapMarkerAlt className="text-cyan-600 text-lg" />
              <span className="text-cyan-800 font-medium">
                {locationMessage}
              </span>
            </div>
          </motion.div>
        )}

        {/* Enhanced Filter Modal */}
        {showFilters && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-4 shadow-2xl sm:p-8"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-900">
                  Select Test Category
                </h3>
                <button
                  className="text-gray-400 hover:text-gray-600 transition-colors p-2 rounded-full hover:bg-gray-100"
                  onClick={() => setShowFilters(false)}
                >
                  <FaTimes size={20} />
                </button>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {categories.map((category) => (
                  <button
                    key={category}
                    className={`px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                      selectedCategory === category
                        ? "bg-cyan-600 text-white shadow-lg"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-md"
                    }`}
                    onClick={() => handleCategorySelect(category)}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </motion.div>
          </div>
        )}

        {/* Enhanced Selected Category Display */}
        {selectedCategory !== "All" && !loading && !error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="mb-8 flex items-center gap-4 bg-gray-50 rounded-xl p-4 border border-gray-200"
          >
            <span className="text-gray-700 font-semibold">
              Filtered by:{" "}
              <span className="text-cyan-600">{selectedCategory}</span>
            </span>
            <button
              className="text-cyan-600 hover:text-cyan-800 text-sm font-medium hover:underline transition-colors"
              onClick={() => setSelectedCategory("All")}
            >
              Clear Filter
            </button>
          </motion.div>
        )}

        {/* Enhanced Why Choose Us Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-12"
        >
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Why Choose Our Lab Services
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Experience healthcare excellence with our comprehensive diagnostic
              solutions
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 group">
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <FaCheckCircle className="text-white text-2xl" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Certified Excellence
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Partnered with top-rated, NABL certified diagnostic centers
                  ensuring highest quality standards.
                </p>
              </div>
            </div>
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 group">
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-teal-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <FaClock className="text-white text-2xl" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Rapid Results
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Get your test results within 24-48 hours with secure online
                  access and notifications.
                </p>
              </div>
            </div>
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 group">
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <FaShieldAlt className="text-white text-2xl" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Transparent Pricing
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  No hidden costs with upfront pricing and special discounts on
                  health packages.
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Enhanced Lab Tests Grid with Scroll Feature */}
        {!loading && !error && (
          <div className="mb-12">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  Available Tests
                </h2>
                <p className="text-gray-600">
                  Browse our comprehensive range of diagnostic tests
                </p>
              </div>
              <div className="text-right">
                <span className="text-2xl font-bold text-cyan-600">
                  {filteredTests.length}
                </span>
                <p className="text-sm text-gray-500">tests available</p>
              </div>
            </div>

            {/* Simplified Popular Health Tests Banner */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mb-10 bg-gray-400 rounded-2xl p-8 text-white"
            >
              <div className="flex flex-col md:flex-row items-center justify-between">
                <div className="mb-6 md:mb-0">
                  <h2 className="text-3xl font-bold mb-3">
                    Popular Health Tests
                  </h2>
                  <p className="text-lg opacity-90">
                    Discover our most booked diagnostic tests with special
                    pricing
                  </p>
                </div>
                <button className="bg-white text-cyan-600 px-6 py-3 rounded-xl font-semibold hover:bg-gray-100 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
                  View Popular Tests
                </button>
              </div>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayedTests.length > 0 ? (
                displayedTests.map((test, index) => (
                  <motion.div
                    key={test.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border border-gray-200 group overflow-hidden flex flex-col h-full justify-between"
                  >
                    {/* Simplified Card Header */}
                    <div className="p-6 border-b border-gray-100">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 bg-cyan-100 rounded-lg flex items-center justify-center">
                          <FaVial className="text-cyan-600 text-lg" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-gray-900 group divertimento-color">
                            {test.name}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {test.category}
                          </p>
                        </div>
                        <div className="flex items-center gap-1">
                          <FaStar className="text-yellow-400 text-sm" />
                          <span className="text-sm font-medium text-gray-600">
                            4.8
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Card Content and Button Layout */}
                    <div className="flex-1 flex flex-col justify-between">
                      <div className="p-6 pb-0">
                        <div className="space-y-3 mb-6">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Price</span>
                            <span className="text-xl font-bold text-emerald-600">
                              ₹{test.price}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">
                              Result Time
                            </span>
                            <span className="text-sm font-medium text-gray-800">
                              {test.resultAt}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <FaMapMarkerAlt className="text-cyan-500 flex-shrink-0" />
                            <div className="text-sm text-gray-500 leading-snug text-left ml-1 break-words">
                              {test.address}
                            </div>
                          </div>
                        </div>
                      </div>
                      {/* Book Now Button always at the bottom */}
                      <div className="p-6 pt-0 mt-auto">
                        <button
                          onClick={() => handleClick(test._id)}
                          className="w-full bg-gray-100 text-cyan-600 border border-cyan-200 py-3 rounded-lg hover:bg-gray-200 hover:text-cyan-700 transition-all duration-300 font-semibold shadow-sm flex items-center justify-center gap-2"
                        >
                          <span>Book Now</span>
                          <FaArrowRight className="text-sm" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="col-span-full text-center py-16">
                  <div className="bg-gray-50 rounded-2xl p-12 max-w-md mx-auto border border-gray-200">
                    <div className="w-20 h-20 bg-cyan-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                      <FaVial className="text-white text-3xl" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-700 mb-3">
                      No tests found
                    </h3>
                    <p className="text-gray-500 mb-6">
                      Try adjusting your search criteria or browse our popular
                      tests
                    </p>
                    <button className="bg-cyan-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-cyan-700 transition-all duration-300">
                      Browse All Tests
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Load More Button */}
            {filteredTests.length > visibleTests && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="text-center mt-12"
              >
                <button
                  onClick={loadMoreTests}
                  className="bg-cyan-600 text-white px-8 py-4 rounded-xl hover:bg-cyan-700 transition-all duration-300 font-semibold shadow-md hover:shadow-lg transform hover:-translate-y-0.5 flex items-center gap-3 mx-auto"
                >
                  <span>Load More Tests</span>
                  <FaChevronDown className="text-sm" />
                </button>
                <p className="text-gray-500 mt-3">
                  Showing {displayedTests.length} of {filteredTests.length}{" "}
                  tests
                </p>
              </motion.div>
            )}
          </div>
        )}

        {/* Enhanced Featured Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl p-8 shadow-lg border border-blue-200"
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center">
                <FaHeartbeat className="text-white text-2xl" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Health Checkup Packages
                </h2>
                <p className="text-gray-600">
                  Comprehensive health monitoring solutions
                </p>
              </div>
            </div>
            <p className="text-gray-700 mb-6 leading-relaxed">
              Choose from our range of health packages designed for different
              age groups and health requirements. Get complete health insights
              with detailed reports and expert consultations.
            </p>
            <button className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
              Explore Packages
            </button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="bg-gradient-to-br from-green-50 to-teal-100 rounded-2xl p-8 shadow-lg border border-green-200"
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-teal-600 rounded-2xl flex items-center justify-center">
                <FaDna className="text-white text-2xl" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Specialized Diagnostics
                </h2>
                <p className="text-gray-600">
                  Advanced testing for specific conditions
                </p>
              </div>
            </div>
            <p className="text-gray-700 mb-6 leading-relaxed">
              Access cutting-edge diagnostic tests for specific health
              conditions. Our specialized tests provide accurate results for
              better treatment planning.
            </p>
            <button className="bg-gradient-to-r from-green-600 to-teal-600 text-white px-6 py-3 rounded-xl hover:from-green-700 hover:to-teal-700 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
              View Specialized Tests
            </button>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default LabSection;
