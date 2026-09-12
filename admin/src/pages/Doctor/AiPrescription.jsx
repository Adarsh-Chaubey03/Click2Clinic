import { useState, useContext } from "react";
import axios from "axios";
import { DoctorContext } from "../../context/DoctorContext.jsx";
import { toast } from "react-toastify";
import { FaUser, FaPills, FaSyringe, FaPrescriptionBottle, FaRedo } from "react-icons/fa";

const AiPrescription = () => {
  const { backendUrl, dToken } = useContext(DoctorContext);

  const [details, setDetails] = useState({
    medication: "",
    dosage: "",
    quantity: "",
    refills: "",
  });

  const [email, setEmail] = useState("");
  const [userId, setUserId] = useState(null);
  const [generatedPrescription, setGeneratedPrescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setDetails({ ...details, [e.target.name]: e.target.value });
  };

  const getUserId = async () => {
    try {
      setIsLoading(true);
      const { data } = await axios.post(`${backendUrl}/api/user/userId`, { email });
      if (data.success) {
        setUserId(data.userId);
        toast.success("User found successfully!");
      } else {
        setUserId(null);
        toast.error("User not found");
      }
    } catch (error) {
      console.error("Error fetching user ID:", error);
      toast.error("Error fetching user ID");
      setUserId(null);
    } finally {
      setIsLoading(false);
    }
  };

  const generatePrescription = async () => {
    if (!userId) return toast.error("User ID is required!");
    if (!dToken) return toast.error("Authorization token missing!");

    setIsLoading(true);
    const requestData = {
      userId,
      prescriptionDetails: details,
    };
    try {
      const { data } = await axios.post(
        backendUrl + "/api/user/generate-prescription",
        requestData,
        { headers: { dToken } }
      );
      if (data.success) {
        setGeneratedPrescription(data.imageUrl);
        toast.success(data.message);
      }
    } catch (error) {
      console.error("Error generating prescription:", error);
      toast.error("Failed to generate prescription");
    } finally {
      setIsLoading(false);
    }
  };

  const inputIcons = {
    medication: <FaPills className="text-gray-500" />,
    dosage: <FaSyringe className="text-gray-500" />,
    quantity: <FaPrescriptionBottle className="text-gray-500" />,
    refills: <FaRedo className="text-gray-500" />,
  };

  return (
    <div className="flex min-h-screen w-full min-w-0 items-center justify-center p-3 sm:p-6">
      <div className="w-full max-w-5xl bg-gray-50 dark:bg-gray-700 rounded-2xl shadow-md p-6 sm:p-8 lg:p-10 border border-gray-200 dark:border-gray-600 transition-all duration-300">
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-center text-gray-800 dark:text-gray-100 mb-6 sm:mb-8 lg:mb-10">
          AI Prescription Generator
        </h2>
        <div className="space-y-6">
          {!userId ? (
            <div className="space-y-4">
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400">
                  <FaUser />
                </span>
                <input
                  type="text"
                  placeholder="Enter User Email"
                  onChange={(e) => setEmail(e.target.value)}
                  value={email}
                  required
                  className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 dark:border-gray-500 bg-white dark:bg-gray-600 text-gray-800 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 dark:focus:ring-teal-400 shadow-sm transition-all duration-300"
                />
              </div>
              <button
                onClick={getUserId}
                disabled={isLoading}
                className={`w-full flex items-center justify-center gap-2 py-3 rounded-lg font-semibold text-white transition-all duration-300 ${
                  isLoading
                    ? "bg-teal-400 cursor-not-allowed opacity-75"
                    : "bg-teal-600 hover:bg-teal-700"
                }`}
              >
                {isLoading ? (
                  <>
                    <svg
                      className="animate-spin h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.373A8 8 0 0012 20v4c-6.627 0-12-5.373-12-12h4z"
                      />
                    </svg>
                    Loading...
                  </>
                ) : (
                  "Get User ID"
                )}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {Object.keys(details).map((key) => (
                <div key={key} className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400">
                    {inputIcons[key]}
                  </span>
                  <input
                    type="text"
                    name={key}
                    placeholder={key.charAt(0).toUpperCase() + key.slice(1)}
                    required
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 dark:border-gray-500 bg-white dark:bg-gray-600 text-gray-800 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 dark:focus:ring-teal-400 shadow-sm transition-all duration-300"
                  />
                </div>
              ))}
              <button
                onClick={generatePrescription}
                disabled={isLoading}
                className={`w-full flex items-center justify-center gap-2 py-3 rounded-lg font-semibold text-white transition-all duration-300 ${
                  isLoading
                    ? "bg-teal-400 cursor-not-allowed opacity-75"
                    : "bg-teal-600 hover:bg-teal-700"
                }`}
              >
                {isLoading ? (
                  <>
                    <svg
                      className="animate-spin h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.373A8 8 0 0012 20v4c-6.627 0-12-5.373-12-12h4z"
                      />
                    </svg>
                    Generating...
                  </>
                ) : (
                  "Generate Prescription"
                )}
              </button>
              {generatedPrescription && (
                <div className="mt-6 p-4 bg-white dark:bg-gray-600 rounded-lg shadow-sm border border-gray-200 dark:border-gray-500 transition-all duration-300">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2">
                    Generated Prescription
                  </h3>
                  <a
                    href={generatedPrescription}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-teal-600 dark:text-teal-400 hover:text-teal-800 dark:hover:text-teal-300 font-medium transition-colors duration-300"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                      />
                    </svg>
                    View Prescription
                  </a>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AiPrescription;
