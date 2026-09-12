import { useContext, useEffect, useState } from "react";
import { DoctorContext } from "../../context/DoctorContext";
import { FaUserCircle, FaNotesMedical, FaExclamationTriangle, FaCheckCircle, FaClock, FaCheck } from "react-icons/fa";
import { toast } from "react-toastify";

const SkinReviewDashboard = () => {
  const { dToken, skinReviews, getSkinReviews, submitSkinEvaluation } = useContext(DoctorContext);
  const [selectedReview, setSelectedReview] = useState(null);

  // Form State
  const [diagnosis, setDiagnosis] = useState("");
  const [severity, setSeverity] = useState("");
  const [notes, setNotes] = useState("");
  const [recommendation, setRecommendation] = useState("");
  const [flagType, setFlagType] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isImageZoomed, setIsImageZoomed] = useState(false);

  useEffect(() => {
    if (dToken) {
      getSkinReviews();
    }
  }, [dToken]);

  const handleSelectReview = (review) => {
    setSelectedReview(review);
    setDiagnosis("");
    setSeverity("");
    setNotes("");
    setRecommendation("");
    setFlagType("");
  };

  const handleSubmitEvaluation = async (e) => {
    e.preventDefault();
    if (!diagnosis) {
      toast.error("Diagnosis is required");
      return;
    }

    setIsSubmitting(true);
    const success = await submitSkinEvaluation({
      docId: selectedReview.docId,
      reviewId: selectedReview._id,
      diagnosis,
      severity,
      notes,
      recommendation,
      flagType
    });

    if (success) {
      setSelectedReview(null);
    }
    setIsSubmitting(false);
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-5">
      <p className="mb-6 text-lg font-medium">Skin Disease Reviews</p>

      <div className="bg-white rounded border flex flex-col lg:flex-row min-h-[60vh]">
        {/* Left column: List of reviews */}
        <div className="w-full lg:w-1/3 border-r flex flex-col">
          <div className="p-4 border-b bg-gray-50 font-semibold text-gray-700">
            Pending Cases ({skinReviews.filter(r => r.status === 'pending' || r.status === 'in_review').length})
          </div>
          <div className="overflow-y-auto flex-1 max-h-[60vh] lg:max-h-full">
            {skinReviews.length === 0 ? (
              <p className="p-4 text-gray-500 text-center">No assigned reviews.</p>
            ) : (
              skinReviews.map((review) => (
                <div
                  key={review._id}
                  onClick={() => handleSelectReview(review)}
                  className={`p-4 border-b cursor-pointer transition-colors ${selectedReview?._id === review._id ? 'bg-indigo-50 border-l-4 border-l-indigo-500' : 'hover:bg-gray-50'}`}
                >
                  <div className="flex items-center gap-3">
                    <img src={review.userData.image} className="w-10 h-10 rounded-full object-cover bg-gray-200" alt="" />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-800 truncate">{review.userData.name}</p>
                      <p className="text-xs text-gray-500 truncate">AI: {review.aiPrediction}</p>
                    </div>
                  </div>
                  <div className="mt-2 flex justify-between items-center text-xs font-medium">
                    <span className="text-gray-400">{new Date(review.createdAt).toLocaleDateString()}</span>
                    {review.status === 'pending' || review.status === 'in_review' ? (
                      <span className="text-yellow-600 bg-yellow-100 px-2 py-0.5 rounded-full flex items-center gap-1"><FaClock /> Pending</span>
                    ) : review.status === 'completed' ? (
                      <span className="text-green-600 bg-green-100 px-2 py-0.5 rounded-full flex items-center gap-1"><FaCheck /> Completed</span>
                    ) : (
                      <span className="text-orange-600 bg-orange-100 px-2 py-0.5 rounded-full flex items-center gap-1"><FaExclamationTriangle /> Flagged</span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right column: Details and Form */}
        <div className="w-full lg:w-2/3 bg-gray-50/50">
          {selectedReview ? (
            <div className="p-6 h-full flex flex-col">

              <div className="flex justify-between items-start mb-6 pb-6 border-b">
                <div className="flex items-center gap-4">
                  <img src={selectedReview.userData.image} className="w-16 h-16 rounded-full object-cover border-2 border-gray-200" alt="" />
                  <div>
                    <h2 className="text-xl font-bold text-gray-800">{selectedReview.userData.name}</h2>
                    <p className="text-gray-500 text-sm">{selectedReview.userData.email}</p>
                    <p className="text-gray-400 text-xs mt-1">Submitted: {new Date(selectedReview.createdAt).toLocaleString()}</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col md:flex-row gap-6 mb-6 pb-6 border-b">
                {/* Image */}
                <div className="w-full md:w-1/2 flex flex-col">
                  <span className="text-sm font-semibold text-gray-600 mb-2">Patient's Uploaded Image</span>
                  <div className="bg-black rounded-lg overflow-hidden flex items-center justify-center h-64 border">
                    {selectedReview.imageUrl ? (
                      <img 
                        src={selectedReview.imageUrl} 
                        alt="Skin Issue" 
                        className="max-h-full max-w-full object-contain cursor-zoom-in transition-transform hover:scale-105" 
                        onClick={() => setIsImageZoomed(true)}
                        title="Click to zoom"
                      />
                    ) : (
                      <span className="text-gray-400 italic text-sm">Image has been securely removed</span>
                    )}
                  </div>
                </div>

                {/* AI Stats */}
                <div className="w-full md:w-1/2 flex flex-col">
                  <span className="text-sm font-semibold text-gray-600 mb-2">AI Microservice Analysis</span>
                  <div className="bg-white p-4 rounded-lg border shadow-sm flex-1">
                    <p className="text-sm text-gray-500">Predicted Condition</p>
                    <p className="text-lg font-bold text-indigo-700 mb-2">{selectedReview.aiPrediction}</p>

                    <p className="text-sm text-gray-500 mt-4">Confidence Score</p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div className={`h-full rounded-full ${selectedReview.aiConfidence > 0.7 ? 'bg-green-500' : 'bg-yellow-500'}`} style={{ width: `${selectedReview.aiConfidence * 100}%` }}></div>
                      </div>
                      <span className="text-sm font-bold text-gray-700">{(selectedReview.aiConfidence * 100).toFixed(1)}%</span>
                    </div>

                    <div className="mt-4 pt-4 border-t">
                      <p className="text-xs text-gray-400 mb-2 font-semibold uppercase tracking-wider">Top Probabilities</p>
                      <div className="space-y-1">
                        {Object.entries(selectedReview.aiProbabilities || {})
                          .sort((a, b) => b[1] - a[1])
                          .slice(0, 3)
                          .map(([key, val]) => (
                            <div key={key} className="flex justify-between text-xs">
                              <span className="text-gray-600">{key}</span>
                              <span className="font-medium text-gray-800">{(val * 100).toFixed(1)}%</span>
                            </div>
                          ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Evaluation Form */}
              {(selectedReview.status === 'pending' || selectedReview.status === 'in_review') ? (
                <form onSubmit={handleSubmitEvaluation} className="flex-1 flex flex-col">
                  <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <FaNotesMedical className="text-indigo-600" /> Provide Your Medical Evaluation
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Diagnosis *</label>
                      <input
                        type="text"
                        required
                        value={diagnosis}
                        onChange={(e) => setDiagnosis(e.target.value)}
                        placeholder="e.g. Mild Eczema"
                        className="w-full border rounded-md px-3 py-2 text-sm focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Severity</label>
                      <select
                        value={severity}
                        onChange={(e) => setSeverity(e.target.value)}
                        className="w-full border rounded-md px-3 py-2 text-sm focus:ring-1 focus:ring-indigo-500 bg-white"
                      >
                        <option value="">Select Severity...</option>
                        <option value="mild">Mild</option>
                        <option value="moderate">Moderate</option>
                        <option value="severe">Severe</option>
                        <option value="critical">Critical</option>
                      </select>
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Medical Notes / Observations</label>
                    <textarea
                      rows={3}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Enter detailed notes..."
                      className="w-full border rounded-md px-3 py-2 text-sm focus:ring-1 focus:ring-indigo-500 resize-none"
                    />
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Recommendations & Treatment</label>
                    <textarea
                      rows={2}
                      value={recommendation}
                      onChange={(e) => setRecommendation(e.target.value)}
                      placeholder="e.g. Use topical corticosteroid..."
                      className="w-full border rounded-md px-3 py-2 text-sm focus:ring-1 focus:ring-indigo-500 resize-none"
                    />
                  </div>

                  <div className="mb-6 p-4 bg-orange-50 border border-orange-200 rounded-md">
                    <label className="block text-sm font-bold text-orange-800 mb-1 flex items-center gap-2">
                      <FaExclamationTriangle /> Flag this case (Optional)
                    </label>
                    <p className="text-xs text-orange-600 mb-3">If the issue looks severe or cannot be diagnosed via a photo, flag it to recommend an in-person visit or lab test.</p>
                    <select
                      value={flagType}
                      onChange={(e) => setFlagType(e.target.value)}
                      className="w-full border-orange-300 rounded-md px-3 py-2 text-sm text-orange-900 bg-white focus:ring-1 focus:ring-orange-500"
                    >
                      <option value="">Do not flag</option>
                      <option value="physical_checkup">Recommend Physical Checkup</option>
                      <option value="lab_appointment">Recommend Lab Test</option>
                    </select>
                  </div>

                  <div className="mt-auto flex justify-end gap-3 pt-4 border-t">
                    <button type="button" onClick={() => setSelectedReview(null)} className="px-4 py-2 border rounded-md text-sm font-medium text-gray-600 hover:bg-gray-100">
                      Cancel
                    </button>
                    <button type="submit" disabled={isSubmitting} className="px-6 py-2 bg-indigo-600 rounded-md text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-70 flex items-center gap-2">
                      {isSubmitting ? 'Submitting...' : <><FaCheckCircle /> Complete Evaluation</>}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="flex-1 bg-white border rounded-lg p-6 flex flex-col justify-center items-center text-center">
                  <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
                    <FaCheckCircle className="text-3xl" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">Evaluation Completed</h3>
                  <p className="text-gray-500 mb-6 max-w-md">You have already submitted your diagnosis for this case. The patient has been notified and the uploaded image has been securely removed.</p>

                  <div className="w-full max-w-md text-left bg-gray-50 border rounded p-4">
                    <p className="text-sm text-gray-500 mb-1">Your Diagnosis</p>
                    <p className="font-semibold text-gray-800 mb-3">{selectedReview.doctorEvaluation?.diagnosis}</p>
                    {selectedReview.doctorEvaluation?.recommendation && (
                      <>
                        <p className="text-sm text-gray-500 mb-1">Recommendation</p>
                        <p className="text-sm text-gray-800">{selectedReview.doctorEvaluation.recommendation}</p>
                      </>
                    )}
                  </div>
                </div>
              )}

            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-gray-400 p-8 text-center">
              <FaNotesMedical className="text-6xl text-gray-200 mb-4" />
              <p className="text-lg font-medium text-gray-500 mb-2">Select a case to review</p>
              <p className="text-sm max-w-sm">Click on any patient from the left panel to view their uploaded skin photo, AI prediction, and submit your expert medical evaluation.</p>
            </div>
          )}
        </div>
      </div>

      {/* Image Zoom Modal */}
      {isImageZoomed && selectedReview?.imageUrl && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
          onClick={() => setIsImageZoomed(false)}
        >
          <div className="relative max-w-5xl max-h-screen">
            <button 
              className="absolute -top-10 right-0 text-white hover:text-gray-300 text-xl font-bold p-2"
              onClick={() => setIsImageZoomed(false)}
            >
              ✕ Close
            </button>
            <img 
              src={selectedReview.imageUrl} 
              alt="Zoomed Skin Issue" 
              className="max-w-full max-h-[90vh] object-contain rounded-lg border border-gray-700"
              onClick={(e) => e.stopPropagation()} 
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default SkinReviewDashboard;
