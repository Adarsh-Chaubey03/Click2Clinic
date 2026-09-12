import { useContext, useState } from 'react';
import axios from 'axios';
import {
  FaVials, FaRupeeSign, FaList, FaClock, FaMapMarkerAlt,
  FaPhoneAlt, FaGlobe, FaMapMarkedAlt, FaCheckCircle
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import { AdminContext } from '../../context/AdminContext';

const AddLab = () => {
  const { backendUrl, aToken } = useContext(AdminContext);

  const [formData, setFormData] = useState({
    testname: '',
    price: '',
    category: '',
    resultAt: '',
    address: '',
    contact: '',
    longitude: '',
    latitude: '',
    isAvailable: false,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.post(
        `${backendUrl}/api/admin/add-lab`,
        formData,
        { headers: { aToken } }
      );

      if (data.success) {
        toast.success('Lab added successfully!');
        setFormData({
          testname: '',
          price: '',
          category: '',
          resultAt: '',
          address: '',
          contact: '',
          longitude: '',
          latitude: '',
          isAvailable: false,
        });
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to add lab');
    }
  };

  return (
    <div className="w-full min-w-0 bg-[#f8f9fc] px-3 py-6 sm:px-4 md:px-10 md:py-10">
      <div className="mx-auto max-w-6xl rounded-2xl bg-white p-4 shadow-lg sm:p-8 md:p-10">
        <h2 className="mb-8 text-center text-2xl font-bold text-blue-600 sm:text-3xl">
          Add New Lab Test
        </h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Input Fields */}
          {[
            { name: 'testname', icon: <FaVials />, placeholder: 'Test Name' },
            { name: 'price', type: 'number', icon: <FaRupeeSign />, placeholder: 'Price' },
            { name: 'category', icon: <FaList />, placeholder: 'Category' },
            { name: 'resultAt', icon: <FaClock />, placeholder: 'Result At (e.g., 24 hours)' },
            { name: 'address', icon: <FaMapMarkerAlt />, placeholder: 'Address' },
            { name: 'contact', type: 'number', icon: <FaPhoneAlt />, placeholder: 'Contact Number' },
            { name: 'longitude', type: 'number', icon: <FaGlobe />, placeholder: 'Longitude' },
            { name: 'latitude', type: 'number', icon: <FaMapMarkedAlt />, placeholder: 'Latitude' },
          ].map(({ name, type = 'text', icon, placeholder }) => (
            <div key={name} className="relative">
              <div className="absolute top-3.5 left-3 text-blue-500">{icon}</div>
              <input
                type={type}
                name={name}
                value={formData[name]}
                onChange={handleChange}
                placeholder={placeholder}
                step={type === 'number' ? 'any' : undefined}
                className="pl-10 pr-4 py-2 w-full rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm bg-white shadow-sm"
                required
              />
            </div>
          ))}

          {/* Availability checkbox full-width */}
          <div className="col-span-1 md:col-span-2 flex items-center gap-3 mt-2">
            <input
              type="checkbox"
              name="isAvailable"
              checked={formData.isAvailable}
              onChange={handleChange}
              className="w-5 h-5 text-blue-600 rounded focus:ring-0"
            />
            <label className="text-gray-700 font-medium">Available for Booking</label>
          </div>

          {/* Submit button full-width */}
          <div className="col-span-1 md:col-span-2">
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white py-3 px-6 rounded-xl flex items-center justify-center gap-2 font-semibold shadow-md transition duration-200"
            >
              <FaCheckCircle />
              Add Lab
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddLab;
