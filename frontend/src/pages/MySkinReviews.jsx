import { useContext, useEffect, useState } from "react";
import { AppContext } from "../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";
import {
  FaUserMd, FaNotesMedical, FaStethoscope, FaFlask,
  FaClock, FaCheckCircle, FaExclamationCircle,
} from "react-icons/fa";
import ProfileSidebar from "../components/ProfileSidebar";

const MySkinReviews = () => {
  const { backendUrl, token } = useContext(AppContext);
  const [reviews, setReviews] = useState([]);

  const getUserSkinReviews = async () => {
    try {
      const { data } = await axios.get(backendUrl + "/api/user/skin-reviews", { headers: { token } });
      if (data.success) setReviews(data.reviews);
    } catch (error) { toast.error(error.message); }
  };

  const loadRazorpay = () => new Promise((resolve) => {
    if (window.Razorpay) { resolve(true); return; }
    const s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.async = true;
    s.onload = () => resolve(true);
    s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });

  const initPay = async (order) => {
    const loaded = await loadRazorpay();
    if (!loaded) { toast.error("Razorpay SDK failed to load"); return; }
    new window.Razorpay({
      key: import.meta.env.VITE_RAZORPAY_ID,
      amount: order.amount, currency: order.currency,
      name: "Skin Review Payment", description: "Dermatologist Skin Review",
      order_id: order.id, receipt: order.receipt,
      handler: async (response) => {
        try {
          const { data } = await axios.post(backendUrl + "/api/user/verify-skinreview-razorpay", response, { headers: { token } });
          if (data.success) { getUserSkinReviews(); toast.success(data.message); }
        } catch (error) { toast.error(error.message); }
      },
    }).open();
  };

  const payForReview = async (reviewId) => {
    try {
      const { data } = await axios.post(backendUrl + "/api/user/payment-skinreview-razorpay", { reviewId }, { headers: { token } });
      if (data.success) initPay(data.order);
    } catch (error) { toast.error(error.message); }
  };

  useEffect(() => { if (token) getUserSkinReviews(); }, [token]);

  /* ─────────────────────────────────────────────────────────── */
  return (
    <div
      className="min-h-screen pt-6 pb-14 px-4 sm:px-6 lg:px-8"
      style={{ background: "linear-gradient(110deg,#effcfb 0%,#f7fcfc 48%,#e9f8f8 100%)" }}
    >
      <div className="max-w-5xl mx-auto">

        <div className="mb-7">
          <h1 className="text-2xl font-extrabold text-[#10233f]">My Skin Reviews</h1>
          <p className="text-sm text-[#718398] mt-0.5">Track your AI skin analysis and doctor evaluations.</p>
        </div>

        <div className="flex gap-6 items-start">
          <ProfileSidebar />

          <div className="flex-1 min-w-0">
            {reviews.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 bg-white rounded-2xl shadow-sm border border-[#dceeed]">
                <div className="w-16 h-16 rounded-full bg-[#e8f9f6] flex items-center justify-center mb-4">
                  <FaNotesMedical className="text-3xl text-[#009f9a]" />
                </div>
                <p className="text-base font-semibold text-[#10233f] mb-1">No skin reviews found</p>
                <p className="text-sm text-[#718398] text-center max-w-xs">
                  Submit a skin image via the AI Skin tool to get a doctor evaluation.
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {reviews.map((item, index) => (
                  <div
                    key={index}
                    className="bg-white rounded-2xl shadow-sm border border-[#dceeed] p-5 flex flex-col sm:flex-row gap-5 hover:shadow-md transition-shadow duration-200"
                  >
                    {/* Skin image */}
                    <div className="w-full sm:w-40 h-40 flex-shrink-0 rounded-xl overflow-hidden bg-[#f5fdfc] border border-[#dceeed] flex items-center justify-center">
                      {item.imageUrl ? (
                        <img className="w-full h-full object-contain" src={item.imageUrl} alt="Skin Issue" />
                      ) : (
                        <span className="text-sm text-[#9ab5c0]">Image removed</span>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                        <div>
                          <h2 className="text-base font-bold text-[#10233f]">
                            AI Prediction:{" "}
                            <span className="text-[#009f9a]">{item.aiPrediction}</span>
                          </h2>
                          <p className="text-xs text-[#718398] mt-0.5">
                            Submitted: {new Date(item.createdAt).toLocaleDateString()}
                          </p>
                        </div>

                        {/* Status badge */}
                        <div>
                          {!item.payment ? (
                            <span className="px-3 py-1 bg-amber-50 text-amber-600 text-xs font-semibold rounded-full border border-amber-200">
                              Payment Pending
                            </span>
                          ) : item.status === "pending" || item.status === "in_review" ? (
                            <span className="px-3 py-1 bg-yellow-50 text-yellow-600 text-xs font-semibold rounded-full border border-yellow-200 flex items-center gap-1">
                              <FaClock className="text-xs" /> Awaiting Doctor
                            </span>
                          ) : item.status === "completed" ? (
                            <span className="px-3 py-1 bg-[#e8f9f6] text-[#009f9a] text-xs font-semibold rounded-full border border-[#b2ebe0] flex items-center gap-1">
                              <FaCheckCircle className="text-xs" /> Reviewed
                            </span>
                          ) : item.status === "flagged" ? (
                            <span className="px-3 py-1 bg-orange-50 text-orange-600 text-xs font-semibold rounded-full border border-orange-200 flex items-center gap-1">
                              <FaExclamationCircle className="text-xs" /> Flagged
                            </span>
                          ) : null}
                        </div>
                      </div>

                      {/* Assigned doctor */}
                      <div className="flex items-center gap-2 text-sm text-[#5f7185] mb-4 bg-[#f5fdfc] border border-[#dceeed] p-2.5 rounded-xl">
                        <FaUserMd className="text-[#009f9a] flex-shrink-0" />
                        <span>
                          Assigned to:{" "}
                          <strong className="text-[#10233f]">
                            {item.docData ? "Dr. " + item.docData.name : "Pending Assignment"}
                          </strong>
                        </span>
                      </div>

                      {/* Doctor evaluation */}
                      {item.payment && (item.status === "completed" || item.status === "flagged") && item.doctorEvaluation && (
                        <div className="border border-[#dceeed] rounded-xl overflow-hidden">
                          <div className="bg-[#f5fdfc] px-4 py-2.5 border-b border-[#dceeed]">
                            <h3 className="text-sm font-bold text-[#10233f] flex items-center gap-2">
                              <FaNotesMedical className="text-[#009f9a]" /> Doctor's Evaluation
                            </h3>
                          </div>
                          <div className="p-4 space-y-3">
                            {item.doctorEvaluation.diagnosis && (
                              <div>
                                <span className="text-xs font-bold text-[#5f7185] uppercase tracking-wide block mb-0.5">Diagnosis</span>
                                <p className="text-sm text-[#10233f]">{item.doctorEvaluation.diagnosis}</p>
                              </div>
                            )}
                            {item.doctorEvaluation.notes && (
                              <div>
                                <span className="text-xs font-bold text-[#5f7185] uppercase tracking-wide block mb-0.5">Notes</span>
                                <p className="text-sm text-[#10233f]">{item.doctorEvaluation.notes}</p>
                              </div>
                            )}
                            {item.doctorEvaluation.recommendation && (
                              <div>
                                <span className="text-xs font-bold text-[#5f7185] uppercase tracking-wide block mb-0.5">Recommendation</span>
                                <p className="text-sm text-[#10233f]">{item.doctorEvaluation.recommendation}</p>
                              </div>
                            )}
                            {item.doctorEvaluation.flagType && (
                              <div className={`mt-1 p-3 rounded-xl border flex items-start gap-3 ${
                                item.doctorEvaluation.flagType === "physical_checkup"
                                  ? "bg-orange-50 border-orange-200 text-orange-800"
                                  : "bg-[#e8f9f6] border-[#b2ebe0] text-[#009f9a]"
                              }`}>
                                {item.doctorEvaluation.flagType === "physical_checkup"
                                  ? <FaStethoscope className="text-lg mt-0.5 flex-shrink-0" />
                                  : <FaFlask className="text-lg mt-0.5 flex-shrink-0" />
                                }
                                <div>
                                  <p className="text-sm font-semibold">
                                    {item.doctorEvaluation.flagType === "physical_checkup"
                                      ? "Physical Checkup Recommended"
                                      : "Lab Test Recommended"}
                                  </p>
                                  <p className="text-xs mt-0.5">
                                    The doctor recommends booking a{" "}
                                    {item.doctorEvaluation.flagType === "physical_checkup" ? "physical appointment" : "lab test"}{" "}
                                    for further examination.
                                  </p>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Pay button */}
                      {!item.payment && (
                        <div className="mt-4">
                          <button
                            onClick={() => payForReview(item._id)}
                            className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white hover:opacity-90 transition-opacity"
                            style={{ background: "linear-gradient(135deg,#04a99d,#008eaa)" }}
                          >
                            💳 Pay ₹{item.amount}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MySkinReviews;
