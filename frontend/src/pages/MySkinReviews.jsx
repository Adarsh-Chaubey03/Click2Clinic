import { useContext, useEffect, useState } from "react";
import { AppContext } from "../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";
import { FaUserMd, FaNotesMedical, FaStethoscope, FaFlask, FaClock, FaCheckCircle, FaExclamationCircle } from "react-icons/fa";

const MySkinReviews = () => {
  const { backendUrl, token } = useContext(AppContext);
  const [reviews, setReviews] = useState([]);

  const getUserSkinReviews = async () => {
    try {
      const { data } = await axios.get(backendUrl + "/api/user/skin-reviews", {
        headers: { token },
      });
      if (data.success) {
        setReviews(data.reviews);
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
      script.async = true;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const initPay = async (order) => {
    const loaded = await loadRazorpay();
    if (!loaded) {
      toast.error("Razorpay SDK failed to load");
      return;
    }
    const options = {
      key: import.meta.env.VITE_RAZORPAY_ID,
      amount: order.amount,
      currency: order.currency,
      name: "Skin Review Payment",
      description: "Dermatologist Skin Review",
      order_id: order.id,
      receipt: order.receipt,
      handler: async (response) => {
        try {
          const { data } = await axios.post(
            backendUrl + "/api/user/verify-skinreview-razorpay",
            response,
            { headers: { token } },
          );
          if (data.success) {
            getUserSkinReviews();
            toast.success(data.message);
          }
        } catch (error) {
          console.log(error);
          toast.error(error.message);
        }
      },
    };
    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  const payForReview = async (reviewId) => {
    try {
      const { data } = await axios.post(
        backendUrl + "/api/user/payment-skinreview-razorpay",
        { reviewId },
        { headers: { token } },
      );
      if (data.success) {
        initPay(data.order);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (token) {
      getUserSkinReviews();
    }
  }, [token]);

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold text-indigo-800 mb-6 border-b-2 border-indigo-200 pb-2">
          My Skin Reviews
        </h1>
        {reviews.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 bg-white rounded-lg shadow-md">
            <FaNotesMedical className="text-5xl text-gray-400 mb-4" />
            <p className="text-lg text-gray-600">No skin reviews found.</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {reviews.map((item, index) => (
              <div
                key={index}
                className="bg-white rounded-lg shadow-md p-4 sm:p-6 flex flex-col sm:flex-row items-start gap-4 sm:gap-6 hover:shadow-lg transition-shadow duration-300"
              >
                {/* Image */}
                <div className="w-full sm:w-48 h-48 flex-shrink-0 bg-gray-100 rounded-md border border-gray-200 flex items-center justify-center overflow-hidden relative group">
                  {item.imageUrl ? (
                    <img
                      className="w-full h-full object-contain"
                      src={item.imageUrl}
                      alt="Skin Issue"
                    />
                  ) : (
                    <span className="text-gray-400">Image removed</span>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 w-full">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h2 className="text-lg font-bold text-gray-800 mb-1">
                        AI Prediction: <span className="text-indigo-600">{item.aiPrediction}</span>
                      </h2>
                      <p className="text-sm text-gray-500">
                        Submitted: {new Date(item.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    {/* Status Badge */}
                    <div className="flex items-center gap-2">
                      {!item.payment ? (
                        <span className="px-3 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded-full border border-red-200">
                          Payment Pending
                        </span>
                      ) : item.status === "pending" || item.status === "in_review" ? (
                        <span className="px-3 py-1 bg-yellow-100 text-yellow-700 text-xs font-semibold rounded-full border border-yellow-200 flex items-center gap-1">
                          <FaClock /> Awaiting Doctor
                        </span>
                      ) : item.status === "completed" ? (
                        <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full border border-green-200 flex items-center gap-1">
                          <FaCheckCircle /> Reviewed
                        </span>
                      ) : item.status === "flagged" ? (
                        <span className="px-3 py-1 bg-orange-100 text-orange-700 text-xs font-semibold rounded-full border border-orange-200 flex items-center gap-1">
                          <FaExclamationCircle /> Flagged
                        </span>
                      ) : null}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-4 bg-gray-50 p-2 rounded border border-gray-100">
                    <FaUserMd className="text-indigo-600" />
                    <span>Assigned to: <strong>{item.docData ? "Dr. " + item.docData.name : "Pending Assignment"}</strong></span>
                  </div>

                  {/* Evaluation Section */}
                  {item.payment && (item.status === "completed" || item.status === "flagged") && item.doctorEvaluation && (
                    <div className="mt-4 border border-indigo-100 rounded-lg bg-indigo-50/30 overflow-hidden">
                      <div className="bg-indigo-100/50 px-4 py-2 border-b border-indigo-100">
                        <h3 className="font-semibold text-indigo-900 flex items-center gap-2">
                          <FaNotesMedical /> Doctor's Evaluation
                        </h3>
                      </div>
                      <div className="p-4 space-y-3">
                        {item.doctorEvaluation.diagnosis && (
                          <div>
                            <span className="text-sm font-semibold text-gray-700 block">Diagnosis:</span>
                            <p className="text-sm text-gray-800">{item.doctorEvaluation.diagnosis}</p>
                          </div>
                        )}
                        {item.doctorEvaluation.notes && (
                          <div>
                            <span className="text-sm font-semibold text-gray-700 block">Notes:</span>
                            <p className="text-sm text-gray-800">{item.doctorEvaluation.notes}</p>
                          </div>
                        )}
                        {item.doctorEvaluation.recommendation && (
                          <div>
                            <span className="text-sm font-semibold text-gray-700 block">Recommendation:</span>
                            <p className="text-sm text-gray-800">{item.doctorEvaluation.recommendation}</p>
                          </div>
                        )}
                        
                        {/* Flag Notice */}
                        {item.doctorEvaluation.flagType && (
                          <div className={`mt-3 p-3 rounded-md border flex items-start gap-3 ${item.doctorEvaluation.flagType === 'physical_checkup' ? 'bg-orange-50 border-orange-200 text-orange-800' : 'bg-blue-50 border-blue-200 text-blue-800'}`}>
                            {item.doctorEvaluation.flagType === 'physical_checkup' ? <FaStethoscope className="text-xl mt-0.5" /> : <FaFlask className="text-xl mt-0.5" />}
                            <div>
                              <p className="font-semibold text-sm">
                                {item.doctorEvaluation.flagType === 'physical_checkup' ? 'Physical Checkup Recommended' : 'Lab Test Recommended'}
                              </p>
                              <p className="text-xs mt-1">
                                The doctor highly recommends you book a {item.doctorEvaluation.flagType === 'physical_checkup' ? 'physical appointment' : 'lab test'} for further examination.
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2 w-full sm:w-auto mt-4 sm:mt-0 justify-center">
                  {!item.payment && (
                    <button
                      onClick={() => payForReview(item._id)}
                      className="w-full sm:w-40 py-2.5 bg-indigo-600 text-white font-medium rounded-md hover:bg-indigo-700 transition-colors duration-200"
                    >
                      Pay ₹{item.amount}
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

export default MySkinReviews;
