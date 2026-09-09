import { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import { FaSearch, FaMapMarkerAlt, FaFilter, FaUserMd, FaStethoscope, FaBaby, FaBrain, FaFemale, FaUserInjured } from 'react-icons/fa';
import { GiStomach } from 'react-icons/gi';
import { motion } from "framer-motion";

const Doctors = () => {
  const { speciality } = useParams();
  const { doctors } = useContext(AppContext);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDoc, setFilterDoc] = useState([]);
  const navigate = useNavigate();
  const [showFilter, setShowFilter] = useState(false);

  const specialties = [
    {
      name: "General physician",
      icon: FaStethoscope,
      description: "Primary care and general health"
    },
    {
      name: "Gynecologist",
      icon: FaFemale,
      description: "Women's health and reproductive care"
    },
    {
      name: "Dermatologist",
      icon: FaUserInjured,
      description: "Skin, hair, and nail conditions"
    },
    {
      name: "Pediatricians",
      icon: FaBaby,
      description: "Child and adolescent healthcare"
    },
    {
      name: "Neurologist",
      icon: FaBrain,
      description: "Brain and nervous system disorders"
    },
    {
      name: "Gastroenterologist",
      icon: GiStomach,
      description: "Digestive system and gut health"
    },
  ];

  const applyFilter = () => {
    let filtered = doctors;

    if (speciality) {
      filtered = filtered.filter((doc) => doc.speciality === speciality);
    }

    if (searchTerm.trim() !== "") {
      filtered = filtered.filter((doc) =>
        doc.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilterDoc(filtered);
    window.scrollTo(0,0)
  };

  useEffect(() => {
    applyFilter();
  }, [doctors, speciality, searchTerm]);

  // Animation variants for cards
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (index) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: index * 0.1,
        duration: 0.5,
        ease: "easeOut",
      },
    }),
    hover: {
      scale: 1.05,
      y: -5,
      borderColor: "#0e7490",
      transition: {
        duration: 0.3,
        type: "spring",
        stiffness: 200,
      },
    },
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-10 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl min-w-0 flex-col gap-6 lg:flex-row">
        {/* Sticky Sidebar */}
        <div className="min-w-0 flex-shrink-0 lg:sticky lg:top-20 lg:w-80 lg:self-start">
          <div className="flex items-center justify-between mb-4 sm:hidden">
            <h2 className="text-lg font-semibold text-gray-800">Specialties</h2>
            <button
              className="p-2 bg-cyan-700 text-white rounded-md hover:bg-cyan-600 transition-all duration-200"
              onClick={() => setShowFilter((prev) => !prev)}
            >
              <FaFilter />
            </button>
          </div>
          <div
            className={`bg-white rounded-xl shadow-lg border border-gray-100 lg:block ${
              showFilter ? "block" : "hidden sm:block"
            }`}
          >
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-800 mb-1">
                Medical Specialties
              </h3>
              <p className="text-sm text-gray-500">
                Choose the area of expertise
              </p>
            </div>
            <div className="p-4 space-y-3">
              {specialties.map((spec) => {
                const IconComponent = spec.icon;
                return (
                  <button
                    key={spec.name}
                    onClick={() =>
                      speciality === spec.name ? navigate("/doctors") : navigate(`/doctors/${spec.name}`)
                    }
                    className={`w-full group relative overflow-hidden rounded-xl p-4 text-left transition-all duration-300 ${
                      speciality === spec.name
                        ? "bg-gradient-to-r from-cyan-500 to-cyan-600 text-white shadow-xl transform scale-105 animate-pulse"
                        : "bg-gray-50 hover:bg-gradient-to-r hover:from-cyan-50 hover:to-blue-50 hover:shadow-lg hover:transform hover:scale-102 border border-transparent hover:border-cyan-200"
                    }`}
                  >
                    <div className="flex min-w-0 items-start gap-4">
                      <div className={`p-3 rounded-xl ${
                        speciality === spec.name 
                          ? "bg-white/20 backdrop-blur-sm" 
                          : "bg-cyan-100 group-hover:bg-cyan-200"
                      }`}>
                        <IconComponent className={`text-xl ${
                          speciality === spec.name 
                            ? "text-white" 
                            : "text-cyan-600"
                        }`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className={`font-bold text-sm ${
                          speciality === spec.name 
                            ? "text-white" 
                            : "text-gray-800"
                        }`}>
                          {spec.name}
                        </h4>
                        <p className={`text-xs mt-2 leading-relaxed ${
                          speciality === spec.name 
                            ? "text-cyan-100" 
                            : "text-gray-500"
                        }`}>
                          {spec.description}
                        </p>
                      </div>
                      {speciality === spec.name && (
                        <div className="absolute top-3 right-3">
                          <div className="w-3 h-3 bg-white rounded-full shadow-lg"></div>
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
            {speciality && (
              <div className="p-4 bg-cyan-50 border-t border-cyan-100">
                <button
                  onClick={() => navigate("/doctors")}
                  className="w-full text-center text-cyan-700 font-medium text-sm hover:text-cyan-800 transition-colors duration-200"
                >
                  View All Specialties
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Scrollable Doctors Section */}
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl sm:text-3xl font-bold text-cyan-700 mb-6 border-b-2 border-cyan-200 pb-2">
            Find a Doctor
          </h1>
          <p className="text-gray-600 mb-6">
            Browse through our expert doctors by speciality or search by name.
          </p>

          {/* Search Bar and Location Button */}
          <div className="flex flex-col sm:flex-row items-center gap-3 mb-6">
            <div className="relative w-full sm:flex-1">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by doctor name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all duration-200"
              />
            </div>
            <button
              className="flex w-full items-center justify-center gap-2 rounded-md bg-blue-600 px-6 py-2 font-medium text-white transition-all duration-200 hover:bg-blue-500 sm:w-auto"
              onClick={() => navigate("/map")}
            >
              <FaMapMarkerAlt />
              Search by Location
            </button>
          </div>

          {/* Doctors List */}
          <div>
            {filterDoc.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 bg-white rounded-lg shadow-md">
                <FaUserMd className="text-5xl text-gray-400 mb-4" />
                <p className="text-lg text-gray-600">No doctors found.</p>
                <button
                  onClick={() => navigate("/doctors")}
                  className="mt-4 bg-cyan-700 text-white px-6 py-2 rounded-full font-medium hover:bg-cyan-600 transition-all duration-300"
                >
                  View All Doctors
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {filterDoc.map((item, index) => (
                  <motion.div
                    key={index}
                    custom={index}
                    initial="hidden"
                    animate="visible"
                    whileHover="hover"
                    variants={cardVariants}
                    onClick={() => navigate(`/appointment/${item._id}`)}
                    className="group mx-auto flex w-full max-w-[320px] cursor-pointer flex-col items-center rounded-3xl border border-gray-400 bg-white p-4 text-center backdrop-blur-md hover:shadow-2xl hover:shadow-cyan-900/10 sm:p-6"
                    aria-label={`Book an appointment with ${item.name}, ${item.speciality}`}
                  >
                    <img
                      className="w-full h-48 sm:h-56 object-contain rounded-2xl bg-blue-50"
                      src={item.image}
                      alt={`${item.name}, ${item.speciality}`}
                      onError={(e) => {
                        e.target.src = "https://via.placeholder.com/320x240?text=Doctor+Image";
                      }}
                    />
                    <div className="mt-4">
                      <div
                        className={`inline-flex items-center gap-2 text-xs font-semibold px-3 py-1 rounded-full mb-3 ${
                          item.available ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        <span>{item.available ? "Available" : "Not Available"}</span>
                      </div>
                      <p className="text-gray-900 text-base sm:text-lg font-medium group-hover:text-cyan-900">
                        {item.name}
                      </p>
                      <p className="text-gray-600 text-sm mt-1 group-hover:text-cyan-700">
                        {item.speciality}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Doctors;
