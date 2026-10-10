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
import labImage from "../assets/lab_image.jpg";
import { toast } from "react-toastify";

const LabSection = () => {
  const { backendUrl, token } = useContext(AppContext);
  const [labTests, setLabTests] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [showFilters, setShowFilters] = useState(false);
  const [location, setLocation] = useState("");
  const [locationMessage, setLocationMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [visibleTests, setVisibleTests] = useState(6);
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
        setError(data.message || "Something went wrong while fetching lab tests.");
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
      const mockLocation = "Mumbai";
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
    if (token) {
      navigate(`/lab/${labId}`);
      window.scrollTo(0, 0);
    } else {
      toast.warn("login to book test");
    }
  };

  const loadMoreTests = () => {
    setVisibleTests((prev) => prev + 6);
  };

  const displayedTests = filteredTests.slice(0, visibleTests);

  return (
    <div
      className="min-h-screen py-8 px-4 sm:px-6 lg:px-8"
      style={{ background: "linear-gradient(110deg,#effcfb 0%,#f7fcfc 48%,#e9f8f8 100%)" }}
    >
      <div className="max-w-7xl mx-auto">

        {/* Hero Banner */}
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
          <div className="absolute inset-0 bg-black/50" />
          <div className="relative z-10 flex flex-col items-start px-4 text-white sm:px-12">
            <h1 className="mb-3 text-3xl font-extrabold tracking-tight sm:text-5xl">
              Book Lab Tests Online
            </h1>
            <p className="mb-4 max-w-md text-base sm:text-xl">
              Fast, certified, and affordable diagnostics at your fingertips.
            </p>
            <button className="bg-white text-[#009f9a] px-6 py-3 rounded-xl font-semibold hover:bg-[#effcfb] transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
              Explore Tests
            </button>
          </div>
        </motion.div>

        {/* Search & Filter Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-10 rounded-2xl border border-[#dceeed] bg-white p-4 shadow-lg sm:p-6"
        >
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="relative w-full sm:w-3/5">
              <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#718398] text-lg" />
              <input
                type="text"
                placeholder="Search tests or health packages"
                className="w-full pl-12 pr-4 py-4 rounded-xl border border-[#dceeed] focus:outline-none focus:ring-2 focus:ring-[#009f9a] focus:border-[#009f9a] text-[#10233f] text-base transition-all duration-300"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
              <button
                className="flex w-full items-center justify-center gap-3 rounded-xl px-4 py-4 text-sm font-semibold text-white shadow-md transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg sm:w-auto sm:px-6"
                style={{ background: "linear-gradient(135deg,#04a99d,#008eaa)" }}
                onClick={handleLocationSearch}
              >
                <FaMapMarkerAlt className="text-lg" />
                Find Nearby Labs
              </button>
              <button
                className="flex w-full items-center justify-center gap-3 rounded-xl border border-[#dceeed] bg-[#effcfb] px-4 py-4 text-sm font-semibold text-[#10233f] transition-all duration-300 hover:bg-[#ddf8f2] sm:w-auto sm:px-6"
                onClick={() => setShowFilters(true)}
              >
                <FaFilter className="text-lg" />
                Filter Tests
              </button>
            </div>
          </div>
        </motion.div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-flex items-center gap-3 text-[#5f7185]">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#009f9a]"></div>
              Loading laboratory tests...
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-12">
            <div className="bg-red-50 border border-red-200 rounded-xl p-6 max-w-md mx-auto">
              <p className="text-red-600 font-medium">{error}</p>
            </div>
          </div>
        )}

        {/* Location Message */}
        {locationMessage && !loading && !error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="mb-8 bg-[#ddf8f2] border border-[#b2ebe0] rounded-xl p-4"
          >
            <div className="flex items-center gap-3">
              <FaMapMarkerAlt className="text-[#009f9a] text-lg" />
              <span className="text-[#10233f] font-medium">{locationMessage}</span>
            </div>
          </motion.div>
        )}

        {/* Filter Modal */}
        {showFilters && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-4 shadow-2xl sm:p-8 border border-[#dceeed]"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-[#10233f]">Select Test Category</h3>
                <button
                  className="text-[#718398] hover:text-[#10233f] transition-colors p-2 rounded-full hover:bg-[#effcfb]"
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
                        ? "text-white shadow-lg"
                        : "bg-[#effcfb] text-[#10233f] hover:bg-[#ddf8f2] hover:shadow-md"
                    }`}
                    style={
                      selectedCategory === category
                        ? { background: "linear-gradient(135deg,#04a99d,#008eaa)" }
                        : {}
                    }
                    onClick={() => handleCategorySelect(category)}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </motion.div>
          </div>
        )}

        {/* Active Filter Badge */}
        {selectedCategory !== "All" && !loading && !error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="mb-8 flex items-center gap-4 bg-[#effcfb] rounded-xl p-4 border border-[#dceeed]"
          >
            <span className="text-[#10233f] font-semibold">
              Filtered by: <span className="text-[#009f9a]">{selectedCategory}</span>
            </span>
            <button
              className="text-[#009f9a] hover:text-[#008eaa] text-sm font-medium hover:underline transition-colors"
              onClick={() => setSelectedCategory("All")}
            >
              Clear Filter
            </button>
          </motion.div>
        )}

        {/* Why Choose Us */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-12"
        >
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-[#10233f] mb-4">Why Choose Our Lab Services</h2>
            <p className="text-[#5f7185] max-w-2xl mx-auto">
              Experience healthcare excellence with our comprehensive diagnostic solutions
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: FaCheckCircle, title: "Certified Excellence", desc: "Partnered with top-rated, NABL certified diagnostic centers ensuring highest quality standards." },
              { icon: FaClock, title: "Rapid Results", desc: "Get your test results within 24-48 hours with secure online access and notifications." },
              { icon: FaShieldAlt, title: "Transparent Pricing", desc: "No hidden costs with upfront pricing and special discounts on health packages." },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-[#dceeed] group">
                <div className="flex flex-col items-center text-center">
                  <div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300"
                    style={{ background: "linear-gradient(135deg,#04a99d,#008eaa)" }}
                  >
                    <Icon className="text-white text-2xl" />
                  </div>
                  <h3 className="text-xl font-bold text-[#10233f] mb-3">{title}</h3>
                  <p className="text-[#5f7185] leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Lab Tests Grid */}
        {!loading && !error && (
          <div className="mb-12">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-3xl font-bold text-[#10233f] mb-2">Available Tests</h2>
                <p className="text-[#5f7185]">Browse our comprehensive range of diagnostic tests</p>
              </div>
              <div className="text-right">
                <span className="text-2xl font-bold text-[#009f9a]">{filteredTests.length}</span>
                <p className="text-sm text-[#718398]">tests available</p>
              </div>
            </div>

            {/* Popular Tests Banner */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mb-10 rounded-2xl p-8 text-white"
              style={{ background: "linear-gradient(135deg,#04a99d,#008eaa)" }}
            >
              <div className="flex flex-col md:flex-row items-center justify-between">
                <div className="mb-6 md:mb-0">
                  <h2 className="text-3xl font-bold mb-3">Popular Health Tests</h2>
                  <p className="text-lg opacity-90">
                    Discover our most booked diagnostic tests with special pricing
                  </p>
                </div>
                <button className="bg-white text-[#009f9a] px-6 py-3 rounded-xl font-semibold hover:bg-[#effcfb] transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
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
                    className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border border-[#dceeed] group overflow-hidden flex flex-col h-full justify-between"
                  >
                    <div className="p-6 border-b border-[#dceeed]">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 bg-[#ddf8f2] rounded-lg flex items-center justify-center">
                          <FaVial className="text-[#009f9a] text-lg" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-[#10233f]">{test.name}</h3>
                          <p className="text-sm text-[#718398]">{test.category}</p>
                        </div>
                        <div className="flex items-center gap-1">
                          <FaStar className="text-yellow-400 text-sm" />
                          <span className="text-sm font-medium text-[#5f7185]">4.8</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex-1 flex flex-col justify-between">
                      <div className="p-6 pb-0">
                        <div className="space-y-3 mb-6">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-[#5f7185]">Price</span>
                            <span className="text-xl font-bold text-[#009f9a]">₹{test.price}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-[#5f7185]">Result Time</span>
                            <span className="text-sm font-medium text-[#10233f]">{test.resultAt}</span>
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <FaMapMarkerAlt className="text-[#009f9a] flex-shrink-0" />
                            <div className="text-sm text-[#718398] leading-snug text-left ml-1 break-words">
                              {test.address}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="p-6 pt-0 mt-auto">
                        <button
                          onClick={() => handleClick(test._id)}
                          className="w-full bg-[#effcfb] text-[#009f9a] border border-[#b2ebe0] py-3 rounded-lg hover:bg-[#ddf8f2] transition-all duration-300 font-semibold shadow-sm flex items-center justify-center gap-2"
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
                  <div className="bg-[#effcfb] rounded-2xl p-12 max-w-md mx-auto border border-[#dceeed]">
                    <div
                      className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6"
                      style={{ background: "linear-gradient(135deg,#04a99d,#008eaa)" }}
                    >
                      <FaVial className="text-white text-3xl" />
                    </div>
                    <h3 className="text-xl font-bold text-[#10233f] mb-3">No tests found</h3>
                    <p className="text-[#5f7185] mb-6">
                      Try adjusting your search criteria or browse our popular tests
                    </p>
                    <button
                      className="text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300"
                      style={{ background: "linear-gradient(135deg,#04a99d,#008eaa)" }}
                    >
                      Browse All Tests
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Load More */}
            {filteredTests.length > visibleTests && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="text-center mt-12"
              >
                <button
                  onClick={loadMoreTests}
                  className="text-white px-8 py-4 rounded-xl transition-all duration-300 font-semibold shadow-md hover:shadow-lg transform hover:-translate-y-0.5 flex items-center gap-3 mx-auto"
                  style={{ background: "linear-gradient(135deg,#04a99d,#008eaa)" }}
                >
                  <span>Load More Tests</span>
                  <FaChevronDown className="text-sm" />
                </button>
                <p className="text-[#718398] mt-3">
                  Showing {displayedTests.length} of {filteredTests.length} tests
                </p>
              </motion.div>
            )}
          </div>
        )}

        {/* Featured Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="bg-white rounded-2xl p-8 shadow-lg border border-[#dceeed]"
          >
            <div className="flex items-center gap-4 mb-6">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center"
                style={{ background: "linear-gradient(135deg,#04a99d,#008eaa)" }}
              >
                <FaHeartbeat className="text-white text-2xl" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-[#10233f]">Health Checkup Packages</h2>
                <p className="text-[#5f7185]">Comprehensive health monitoring solutions</p>
              </div>
            </div>
            <p className="text-[#5f7185] mb-6 leading-relaxed">
              Choose from our range of health packages designed for different age groups and health
              requirements. Get complete health insights with detailed reports and expert consultations.
            </p>
            <button
              className="text-white px-6 py-3 rounded-xl transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              style={{ background: "linear-gradient(135deg,#04a99d,#008eaa)" }}
            >
              Explore Packages
            </button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="bg-white rounded-2xl p-8 shadow-lg border border-[#dceeed]"
          >
            <div className="flex items-center gap-4 mb-6">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center"
                style={{ background: "linear-gradient(135deg,#04a99d,#008eaa)" }}
              >
                <FaDna className="text-white text-2xl" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-[#10233f]">Specialized Diagnostics</h2>
                <p className="text-[#5f7185]">Advanced testing for specific conditions</p>
              </div>
            </div>
            <p className="text-[#5f7185] mb-6 leading-relaxed">
              Access cutting-edge diagnostic tests for specific health conditions. Our specialized
              tests provide accurate results for better treatment planning.
            </p>
            <button
              className="text-white px-6 py-3 rounded-xl transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              style={{ background: "linear-gradient(135deg,#04a99d,#008eaa)" }}
            >
              View Specialized Tests
            </button>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default LabSection;
