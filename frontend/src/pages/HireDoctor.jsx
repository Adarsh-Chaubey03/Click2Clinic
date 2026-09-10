
import { useContext, useState } from "react";
import { FaUserMd, FaEnvelope, FaBriefcase, FaIdBadge, FaClock, FaCamera, FaPhone, FaMapMarkerAlt } from "react-icons/fa";
import { toast } from "react-toastify";
import axios from "axios";
import { AppContext } from "../context/AppContext.jsx";
import { motion } from "framer-motion";

const HireDoctor = () => {
  const [formData, setFormData] = useState({
    name: "",
    specialization: "",
    experience: "",
    degree: "",
    email: "",
    licenseNumber: "",
    phone: "",
    address: "",
    about: "",
    photo: null,
  });

  const [submissionSuccess, setSubmissionSuccess] = useState(false);
  const { backendUrl } = useContext(AppContext);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePhotoChange = (e) => {
    setFormData({ ...formData, photo: e.target.files[0] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formDataToSend = new FormData();
    Object.keys(formData).forEach((key) => {
      formDataToSend.append(key, formData[key]);
    });

    if (!formData.photo) {
      toast.error("Please upload a photo.");
      return;
    }

    try {
      const { data } = await axios.post(`${backendUrl}/api/admin/hire-doctor`, formDataToSend, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (data.success) {
        setFormData({
          name: "",
          specialization: "",
          experience: "",
          degree: "",
          email: "",
          licenseNumber: "",
          phone: "",
          address: "",
          about: "",
          photo: null,
        });
        setSubmissionSuccess(true);
        toast.success("Proposal submitted successfully! The selected doctor can be reached directly by the authority.");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error(error.response?.data?.message || "Something went wrong");
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  const inputVariants = {
    hover: {
      scale: 1.02,
      borderColor: "#06b6d4", // cyan-500
      transition: { duration: 0.3, type: "spring", stiffness: 200 },
    },
    focus: {
      borderColor: "#06b6d4",
      boxShadow: "0 0 0 3px rgba(6, 182, 212, 0.2)",
    },
  };

  const buttonVariants = {
    hover: {
      scale: 1.05,
      background: "linear-gradient(to right, #0e7490, #2563eb)", // cyan-700 to blue-600
      transition: { duration: 0.3, type: "spring", stiffness: 200 },
    },
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="mx-4 my-8 max-w-6xl rounded-3xl border border-cyan-100/50 bg-gradient-to-r from-cyan-50 to-blue-50 px-4 shadow-xl sm:mx-6 sm:px-6 md:mx-8 md:px-8 lg:mx-auto lg:my-12"
    >
      <div className="text-center py-8">
        <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-2">
          Join Our Team of Expert Doctors
        </h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Apply to become a verified doctor and provide top-tier healthcare services with us.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 rounded-2xl bg-white/80 p-4 shadow-lg backdrop-blur-sm sm:p-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          {[
            { name: "name", placeholder: "Doctor's Name", icon: FaUserMd, type: "text" },
            { name: "specialization", placeholder: "Specialization", icon: FaBriefcase, type: "text" },
            { name: "experience", placeholder: "Years of Experience", icon: FaClock, type: "number" },
            { name: "degree", placeholder: "Degree", icon: FaIdBadge, type: "text" },
            { name: "email", placeholder: "Email", icon: FaEnvelope, type: "email" },
            { name: "licenseNumber", placeholder: "Medical License Number", icon: FaIdBadge, type: "text" },
            { name: "phone", placeholder: "Phone Number", icon: FaPhone, type: "text" },
            { name: "address", placeholder: "Address", icon: FaMapMarkerAlt, type: "text" },
          ].map((field) => (
            <motion.div key={field.name} whileHover="hover" variants={inputVariants} className="relative">
              <label htmlFor={field.name} className="sr-only">
                {field.placeholder}
              </label>
              <div className="flex min-w-0 items-center rounded-lg border border-gray-300 bg-gray-50 p-3 focus-within:border-cyan-500 focus-within:ring-2 focus-within:ring-cyan-200">
                <field.icon className="mr-2 shrink-0 text-gray-500" />
                <input
                  id={field.name}
                  type={field.type}
                  name={field.name}
                  placeholder={field.placeholder}
                  value={formData[field.name]}
                  onChange={handleChange}
                  className="w-full bg-transparent focus:outline-none text-gray-700 placeholder-gray-500"
                  required
                />
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div whileHover="hover" variants={inputVariants} className="relative">
          <label htmlFor="about" className="sr-only">
            About
          </label>
          <textarea
            id="about"
            name="about"
            placeholder="Tell us about yourself"
            value={formData.about}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg p-3 bg-gray-50 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 text-gray-700 placeholder-gray-500 h-32 resize-none"
            required
          ></textarea>
        </motion.div>

        <motion.div whileHover="hover" variants={inputVariants} className="relative">
          <label htmlFor="photo" className="sr-only">
            Doctors Photo
          </label>
          <div className="flex min-w-0 items-center rounded-lg border border-gray-300 bg-gray-50 p-3">
            <FaCamera className="mr-2 shrink-0 text-gray-500" />
            <input
              id="photo"
              type="file"
              name="photo"
              accept="image/*"
              onChange={handlePhotoChange}
              className="w-full min-w-0 text-gray-700 file:mr-4 file:rounded-md file:border-0 file:bg-cyan-100 file:px-4 file:py-2 file:text-cyan-700 file:cursor-pointer hover:file:bg-cyan-200"
              required
            />
          </div>
        </motion.div>

        <motion.button
          whileHover="hover"
          variants={buttonVariants}
          type="submit"
          className="w-full bg-gradient-to-r from-cyan-700 to-blue-600 text-white font-bold py-4 rounded-lg shadow-md hover:shadow-lg text-xl"
        >
          Submit for Verification
        </motion.button>

        {submissionSuccess && (
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="mt-4 text-center text-green-600 font-semibold bg-green-50 p-3 rounded-lg"
          >
            ✅ Proposal submitted successfully! The selected doctor can be reached directly by the authority.
          </motion.p>
        )}
      </form>
    </motion.div>
  );
};

export default HireDoctor;
