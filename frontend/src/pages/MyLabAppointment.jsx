import { useContext, useEffect, useState } from "react";
import { AppContext } from '../context/AppContext';
import axios from "axios";
import { useNavigate } from 'react-router-dom';
import { toast } from "react-toastify";
import { FaCalendarAlt, FaVial, FaMapMarkerAlt, FaClock } from 'react-icons/fa';

const MyLabAppointments = () => {
  const { backendUrl, token } = useContext(AppContext);
  const navigate = useNavigate();

  const [labAppointments, setLabAppointments] = useState([]);

  const getUserLabAppointments = async () => {
    try {
      const { data } = await axios.get(backendUrl + '/api/user/lab-appointments', { headers: { token } });
      if (data.success) {
        // Sort by createdAt timestamp (newest first)
        const sorted = data.appointments.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setLabAppointments(sorted);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  const cancelLabAppointment = async (labId) => {
    try {
      const { data } = await axios.post(backendUrl + '/api/user/cancellab-appointment', { labId }, { headers: { token } });
      if (data.success) {
        toast.success(data.message);
        getUserLabAppointments();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  const loadRazorpay = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const initPay = (order) => {
    const options = {
      key: import.meta.env.VITE_RAZORPAY_ID,
      amount: order.price,
      currency: order.currency,
      name: "Lab Appointment Payment",
      description: "Lab Appointment Payment",
      order_id: order.id,
      receipt: order.receipt,
      handler: async (response) => {
        try {
          const { data } = await axios.post(backendUrl + '/api/user/verifylab-razorpay', response, { headers: { token } });
          if (data.success) {
            getUserLabAppointments();
            navigate('/mylab-appointments');
            toast.success(data.message);
          }
        } catch (error) {
          console.log(error);
          toast.error(error.message);
        }
        // console.log(response)
      },
    };
    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  const labAppointmentRazorpay = async (labId) => {
    const loaded = await loadRazorpay();
    if (!loaded) {
      toast.error("Razorpay SDK failed to load");
      return;
    }

    try {
      const { data } = await axios.post(backendUrl + '/api/user/paymentlab-razorpay', { labId }, { headers: { token } });
      if (data.success) {
        initPay(data.order);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (token) {
      getUserLabAppointments();
    }
  }, [token]);

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold text-indigo-700 mb-6 border-b-2 border-indigo-200 pb-2">
          My Lab Appointments
        </h1>
        {labAppointments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 bg-white rounded-lg shadow-md">
            <FaCalendarAlt className="text-5xl text-gray-400 mb-4" />
            <p className="text-lg text-gray-600">No lab appointments found.</p>
            <button
              onClick={() => navigate('/lab')}
              className="mt-4 bg-indigo-700 text-white px-6 py-2 rounded-full font-medium hover:bg-indigo-600 transition-all duration-300"
            >
              Book a Lab Test
            </button>
          </div>
        ) : (
          <div className="grid gap-6">
            {labAppointments.map((item, index) => (
              <div
                key={index}
                className="bg-white rounded-lg shadow-md p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 hover:shadow-lg transition-shadow duration-300"
              >
                {/* Lab Icon */}
                <div className="w-24 h-24 sm:w-32 sm:h-32 flex-shrink-0">
                  <div className="w-full h-full bg-indigo-100 rounded-md flex items-center justify-center">
                    <FaVial className="text-indigo-600 text-4xl" />
                  </div>
                </div>

                {/* Appointment Details */}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <FaVial className="text-indigo-600 text-lg" />
                    <h2 className="text-lg sm:text-xl font-semibold text-gray-800">
                      {item.labData.testname}
                    </h2>
                  </div>
                  <p className="text-sm text-gray-600 mb-1">{item.labData.category}</p>
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                    <FaMapMarkerAlt className="text-indigo-600" />
                    <p>{item.labData.address}</p>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <FaClock className="text-indigo-600" />
                    <p>Results by: {item.labData.resultAt}</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2 w-full sm:w-auto">
                  {!item.isCancelled && item.payment && !item.isCompleted && (
                    <button className="w-full sm:w-48 py-2 bg-indigo-50 text-indigo-600 font-medium rounded-md border border-indigo-200 hover:bg-indigo-100 transition-colors duration-200">
                      Paid
                    </button>
                  )}
                  {!item.isCancelled && !item.payment && !item.isCompleted && (
                    <button
                      onClick={() => labAppointmentRazorpay(item._id)}
                      className="w-full sm:w-48 py-2 bg-indigo-700 text-white font-medium rounded-md hover:bg-indigo-600 transition-colors duration-200"
                    >
                      Pay Online
                    </button>
                  )}
                  {!item.isCancelled && !item.isCompleted && (
                    <button
                      onClick={() => cancelLabAppointment(item._id)}
                      className="w-full sm:w-48 py-2 bg-red-50 text-red-600 font-medium rounded-md border border-red-200 hover:bg-red-100 transition-colors duration-200"
                    >
                      Cancel
                    </button>
                  )}
                  {item.isCancelled && !item.isCompleted && (
                    <button className="w-full sm:w-48 py-2 bg-red-50 text-red-600 font-medium rounded-md border border-red-200">
                      Cancelled
                    </button>
                  )}
                  {item.isCompleted && (
                    <button className="w-full sm:w-48 py-2 bg-green-50 text-green-600 font-medium rounded-md border border-green-200">
                      Completed
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyLabAppointments;