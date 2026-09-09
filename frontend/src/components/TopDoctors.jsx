import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import { motion } from "framer-motion";

const TopDoctors = () => {
  const navigate = useNavigate();
  const { doctors } = useContext(AppContext);

  return (
    <section className="py-16 sm:py-20 px-4 sm:px-6 bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-100 text-emerald-700 rounded-full text-sm font-medium mb-4">
            ⭐ Top Rated
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Meet Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-emerald-600">Expert Doctors</span>
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Book appointments with trusted and experienced healthcare professionals
          </p>
        </motion.div>

        {/* Doctors Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {doctors.slice(0, 8).map((doctor, index) => (
            <motion.div
              key={doctor._id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
              onClick={() => {
                navigate(`/appointment/${doctor._id}`);
                window.scrollTo(0, 0);
              }}
              className="group cursor-pointer bg-white rounded-2xl overflow-hidden border border-gray-100 
                       hover:border-teal-200 hover:shadow-2xl hover:shadow-teal-500/10 transition-all duration-300"
            >
              {/* Doctor Image */}
              <div className="relative h-52 bg-gradient-to-br from-teal-50 to-emerald-50 overflow-hidden">
                <img
                  src={doctor.image}
                  alt={doctor.name}
                  className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
                  onError={(e) => {
                    e.target.src = "https://via.placeholder.com/320x240?text=Doctor";
                  }}
                />
                {/* Availability Badge */}
                <div className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5
                              ${doctor.available
                    ? "bg-green-100 text-green-700"
                    : "bg-gray-100 text-gray-600"
                  }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${doctor.available ? "bg-green-500" : "bg-gray-400"}`} />
                  {doctor.available ? "Available" : "Busy"}
                </div>
              </div>

              {/* Doctor Info */}
              <div className="p-5">
                <h3 className="font-bold text-lg text-gray-900 group-hover:text-teal-700 transition-colors mb-1">
                  {doctor.name}
                </h3>
                <p className="text-teal-600 text-sm font-medium mb-3">{doctor.speciality}</p>

                {/* Experience & Rating */}
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>{doctor.experience}</span>
                  <div className="flex items-center gap-1">
                    <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <span>4.9</span>
                  </div>
                </div>

                {/* Book Button */}
                <button className="w-full mt-4 py-2.5 bg-gradient-to-r from-teal-50 to-emerald-50 text-teal-700 
                                 font-semibold rounded-xl group-hover:from-teal-600 group-hover:to-emerald-600 
                                 group-hover:text-white transition-all duration-300">
                  Book Appointment
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* View All Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <button
            onClick={() => {
              navigate("/doctors");
              window.scrollTo(0, 0);
            }}
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-teal-600 to-emerald-600 
                     text-white font-semibold rounded-2xl shadow-lg shadow-teal-500/30 
                     hover:shadow-xl hover:shadow-teal-500/40 hover:scale-105 transition-all duration-300"
          >
            View All Doctors
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </button>
        </motion.div>
      </div>
    </section>
  );
};

export default TopDoctors;