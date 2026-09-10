import { useContext, useState, useRef, useEffect } from 'react';
import { FaUpload, FaCrop, FaSearch } from 'react-icons/fa';
import Cropper from 'react-cropper';
import 'cropperjs/dist/cropper.css'; // Import cropper CSS
import { AppContext } from '../context/AppContext.jsx';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify'; // For error notifications
import 'react-toastify/dist/ReactToastify.css'; // Toast CSS

// Disease information database for showing condition details
const DISEASE_INFO = {
  'acne_rosacea': {
    description: 'Acne Rosacea is a chronic inflammatory skin condition that causes redness, visible blood vessels, and acne-like breakouts, primarily on the face.',
    severity: 'Moderate',
    sevColor: 'text-yellow-600',
    recommendation: 'Consult a dermatologist. Treatment options include topical antibiotics (metronidazole), oral antibiotics, laser therapy, and avoiding known triggers like sun, stress, and spicy food.',
  },
  'eczema': {
    description: 'Eczema (atopic dermatitis) is a condition that causes the skin to become inflamed, itchy, red, cracked, and rough. It is common in children but can occur at any age.',
    severity: 'Moderate',
    sevColor: 'text-yellow-600',
    recommendation: 'Keep skin moisturized, avoid irritants and allergens. Consult a doctor for prescription treatments such as topical corticosteroids, calcineurin inhibitors, or phototherapy.',
  },
  'melanoma': {
    description: 'Melanoma is the most serious type of skin cancer. It develops in the melanocytes — the cells that give skin its color. Early detection is critical for successful treatment.',
    severity: 'Critical',
    sevColor: 'text-red-700',
    recommendation: 'Seek urgent medical attention immediately. Early detection and treatment are crucial. Treatment may involve surgical excision, immunotherapy, targeted therapy, or radiation.',
  },
};

const AiDetection = () => {
  const [image, setImage] = useState(null);
  const [cropper, setCropper] = useState(null);
  const [croppedImage, setCroppedImage] = useState(null);
  const [isCropped, setIsCropped] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [prediction, setPrediction] = useState(null);
  const [serverReady, setServerReady] = useState(false);
  const [serverStatus, setServerStatus] = useState('checking'); // 'checking' | 'waking' | 'loading' | 'on'
  const [healthCheckSeconds, setHealthCheckSeconds] = useState(0);
  const [showExpertReview, setShowExpertReview] = useState(false);
  const [selectedDocId, setSelectedDocId] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const { backendUrl, token, doctors } = useContext(AppContext);
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const healthTimerRef = useRef(null);

  // Poll /wake-ai health check when the page loads
  useEffect(() => {
    let cancelled = false;
    let secondsTimer = null;

    const checkHealth = async () => {
      try {
        const res = await axios.get(backendUrl + '/api/user/wake-ai', { timeout: 20000 });
        if (cancelled) return;
        const status = res.data?.status || 'waking';
        setServerStatus(status);
        if (status === 'on') {
          setServerReady(true);
          return; // stop polling
        }
      } catch {
        if (cancelled) return;
        setServerStatus('waking');
      }
      // Retry after 5 seconds
      healthTimerRef.current = setTimeout(checkHealth, 5000);
    };

    // Start elapsed seconds counter
    secondsTimer = setInterval(() => {
      setHealthCheckSeconds(prev => prev + 1);
    }, 1000);

    checkHealth();

    return () => {
      cancelled = true;
      if (healthTimerRef.current) clearTimeout(healthTimerRef.current);
      if (secondsTimer) clearInterval(secondsTimer);
    };
  }, [backendUrl]);

  // Handle image upload (click or drag-and-drop)
  const handleImageUpload = (file) => {
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setImage(reader.result);
        setCroppedImage(null);
        setIsCropped(false);
        setIsAnalyzing(false);
        setSearchQuery('');
        setPrediction(null);
        setShowExpertReview(false);
        setSelectedDocId('');
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle drag-and-drop
  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    handleImageUpload(file);
  };

  // Handle crop action
  const handleCrop = () => {
    if (cropper) {
      const croppedCanvas = cropper.getCroppedCanvas({
        imageSmoothingQuality: 'high',
      });
      if (croppedCanvas) {
        setCroppedImage(croppedCanvas.toDataURL('image/jpeg', 0.8));
        setIsCropped(true);
      } else {
        toast.error('Please adjust the crop area before cropping.');
      }
    } else {
      toast.error('Cropper is not initialized.');
    }
  };

  // Handle AI analysis upload
  const handleUpload = async () => {
    if (!croppedImage) {
      toast.error('Please crop the image first.');
      return;
    }

    setIsAnalyzing(true);
    try {
      // Convert base64 to File without using fetch
      const base64String = croppedImage.split(',')[1];
      const byteCharacters = atob(base64String);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const file = new File([byteArray], 'croppedImage.jpg', { type: 'image/jpeg' });
      const formData = new FormData();
      formData.append('image', file);

      const response = await axios.post(`${backendUrl}/api/user/analyze-image`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setPrediction(response.data.result);
      setCroppedImage(null);
      setIsAnalyzing(false);
    } catch (error) {
      console.error('Error analyzing image:', error.message);
      toast.error('Failed to analyze image. Please try again.');
      setIsAnalyzing(false);
    }
  };

  const handleSubmitExpertReview = async () => {
    if (!token) {
      toast.error('Please login to request an expert review.');
      return;
    }
    
    setIsSubmittingReview(true);
    try {
      // Get the image file
      const base64String = image.split(',')[1];
      const byteCharacters = atob(base64String);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const file = new File([byteArray], 'skinImage.jpg', { type: 'image/jpeg' });
      
      const formData = new FormData();
      formData.append('image', file);
      formData.append('aiPrediction', prediction.prediction);
      formData.append('aiConfidence', prediction.confidence);
      formData.append('aiProbabilities', JSON.stringify(prediction.probabilities));
      if (selectedDocId) {
        formData.append('docId', selectedDocId);
      }

      const response = await axios.post(`${backendUrl}/api/user/submit-skin-review`, formData, {
        headers: { 
          'Content-Type': 'multipart/form-data',
          token 
        },
      });

      if (response.data.success) {
        toast.success('Review request submitted! Please complete the payment.');
        navigate('/my-skin-reviews');
      } else {
        toast.error(response.data.message || 'Failed to submit request');
      }
    } catch (error) {
      console.error('Submit review error:', error);
      toast.error('Failed to submit review request');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  // Handle drag-over for drop zone
  const handleDragOver = (e) => {
    e.preventDefault();
  };

  // Status messages for the loading overlay
  const statusMessages = {
    checking: 'Connecting to AI server...',
    waking: 'Waking up AI server (cold start)...',
    loading: 'Loading AI model into memory...',
  };

  // If server is not ready, show full-screen loading overlay
  if (!serverReady) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8 border border-blue-100 text-center">
          {/* Animated brain/AI icon */}
          <div className="mx-auto mb-6 w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
            <svg className="w-10 h-10 text-white animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 0 1-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 0 1 4.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0 1 12 15a9.065 9.065 0 0 0-6.23.693L5 14.5m14.8.8 1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0 1 12 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
            </svg>
          </div>

          <h2 className="text-2xl font-bold text-gray-800 mb-2">Preparing AI Model</h2>
          <p className="text-gray-500 mb-6 text-sm">
            Our AI skin analysis model is being loaded. This typically takes 30–60 seconds on the first visit.
          </p>

          {/* Animated progress bar */}
          <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4 overflow-hidden">
            <div 
              className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-1000"
              style={{ 
                width: `${Math.min((healthCheckSeconds / 60) * 100, 95)}%`,
                animation: 'pulse 2s ease-in-out infinite'
              }}
            />
          </div>

          {/* Status text */}
          <div className="flex items-center justify-center gap-2 mb-4">
            <svg className="w-5 h-5 text-blue-600 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.373A8 8 0 0012 20v-4c-2.373 0-4-1.627-4-3.627h-2z"></path>
            </svg>
            <span className="text-sm font-medium text-blue-700">
              {statusMessages[serverStatus] || 'Connecting...'}
            </span>
          </div>

          {/* Elapsed time */}
          <p className="text-xs text-gray-400">
            Elapsed: {healthCheckSeconds}s
          </p>

          {healthCheckSeconds > 30 && (
            <p className="text-xs text-yellow-600 mt-3">
              ⏳ The server is taking longer than usual. Please be patient — free-tier servers sleep after inactivity.
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-blue-600 flex items-center justify-center p-4">
      <div className="w-full max-w-3xl bg-white rounded-xl shadow-lg p-8 border border-gray-200">
        <h1 className="text-3xl md:text-4xl font-bold text-center mb-6 text-blue-600">
          Skin Condition AI Detection
        </h1>
        <p className="text-center text-gray-600 mb-6">
          Upload an image of your skin, crop the area of interest, and let our AI analyze it for potential conditions.
        </p>

        {/* Upload Section with Drag-and-Drop */}
        <div
          className="mb-6 border-2 border-dashed border-blue-200 rounded-lg p-6 text-center"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
        >
          <label className="block w-full text-center bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-4 rounded-lg cursor-pointer transition duration-300 flex items-center justify-center gap-2">
            <FaUpload />
            <span>Choose or Drop Image</span>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              ref={fileInputRef}
              onChange={(e) => handleImageUpload(e.target.files[0])}
            />
          </label>
          <p className="mt-2 text-sm text-gray-500">Supports JPEG, PNG, and other image formats.</p>
        </div>

        {/* Cropper Section */}
        {!isCropped && image && (
          <div className="mb-6">
            <Cropper
              src={image}
              style={{ height: 400, width: '100%' }}
              aspectRatio={1} // Fixed 1:1 for skin lesion focus (DermNet-like)
              guides={true}
              viewMode={1}
              autoCropArea={0.8}
              cropBoxResizable={true}
              dragMode="move"
              scalable={true}
              zoomable={true}
              onInitialized={(instance) => setCropper(instance)}
              className="rounded-lg overflow-hidden"
              checkCrossOrigin={false}
            />
            <button
              onClick={handleCrop}
              className="mt-4 w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition duration-300"
            >
              <FaCrop />
              <span>Crop Image</span>
            </button>
          </div>
        )}

        {/* Preview and Analyze */}
        {croppedImage && (
          <div className="mb-6 text-center">
            <img
              src={croppedImage}
              alt="Cropped"
              className="mx-auto mb-4 rounded-lg shadow-md max-h-64 object-contain"
            />
            <button
              onClick={handleUpload}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg flex items-center justify-center gap-2 transition duration-300"
            >
              <FaUpload />
              <span>Analyze with AI</span>
            </button>
          </div>
        )}

        {/* Analyzing Indicator */}
        {isAnalyzing && (
          <div className="mt-6 flex flex-col items-center gap-4">
            <div className="flex items-center gap-2 animate-pulse">
              <svg
                className="w-6 h-6 text-blue-600 animate-spin"
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
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.373A8 8 0 0012 20v-4c-2.373 0-4-1.627-4-3.627h-2z"
                ></path>
              </svg>
              <span className="text-lg font-semibold text-blue-600">
                Analyzing your image...
              </span>
            </div>
          </div>
        )}

        {/* Prediction Display */}
        {prediction && (
          <div className="mt-6">
            <h2 className="text-2xl font-bold text-blue-600 mb-4 text-center">AI Analysis Results</h2>

            {/* Predicted Class Card */}
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-6 mb-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xl font-bold text-gray-800">
                  {prediction.prediction}
                </h3>
                <span className={`text-sm font-semibold px-3 py-1 rounded-full ${
                  DISEASE_INFO[prediction.prediction]?.severity === 'Critical'
                    ? 'bg-red-100 text-red-700'
                    : DISEASE_INFO[prediction.prediction]?.severity === 'High'
                    ? 'bg-orange-100 text-orange-700'
                    : DISEASE_INFO[prediction.prediction]?.severity === 'Moderate'
                    ? 'bg-yellow-100 text-yellow-700'
                    : 'bg-green-100 text-green-700'
                }`}>
                  {DISEASE_INFO[prediction.prediction]?.severity || 'Unknown'} Severity
                </span>
              </div>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-sm text-gray-500">Confidence:</span>
                <div className="flex-1 bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${
                      prediction.confidence > 0.8
                        ? 'bg-green-500'
                        : prediction.confidence > 0.5
                        ? 'bg-yellow-500'
                        : 'bg-red-500'
                    }`}
                    style={{ width: `${(prediction.confidence * 100).toFixed(1)}%` }}
                  />
                </div>
                <span className="text-sm font-bold text-gray-700">
                  {(prediction.confidence * 100).toFixed(1)}%
                </span>
              </div>

              {/* Disease Info */}
              {DISEASE_INFO[prediction.prediction] && (
                <div className="mt-3 space-y-2">
                  <p className="text-sm text-gray-700">
                    {DISEASE_INFO[prediction.prediction].description}
                  </p>
                  <div className="bg-white/70 rounded-lg p-3 border border-blue-100">
                    <p className="text-sm font-semibold text-blue-700 mb-1">Recommendation:</p>
                    <p className="text-sm text-gray-600">
                      {DISEASE_INFO[prediction.prediction].recommendation}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* All Class Probabilities */}
            {prediction.probabilities && (
              <div className="bg-white border border-gray-200 rounded-xl p-5 mb-4">
                <h4 className="text-md font-semibold text-gray-700 mb-3">
                  All Class Probabilities
                </h4>
                <div className="space-y-2">
                  {Object.entries(prediction.probabilities)
                    .sort(([, a], [, b]) => b - a)
                    .map(([className, prob]) => (
                      <div key={className} className="flex items-center gap-3">
                        <span className={`text-xs w-44 truncate ${
                          className === prediction.prediction
                            ? 'font-bold text-blue-700'
                            : 'text-gray-600'
                        }`}>
                          {className}
                        </span>
                        <div className="flex-1 bg-gray-100 rounded-full h-2.5 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-700 ${
                              className === prediction.prediction
                                ? 'bg-blue-500'
                                : 'bg-gray-300'
                            }`}
                            style={{ width: `${Math.max(prob * 100, 0.5)}%` }}
                          />
                        </div>
                        <span className={`text-xs w-14 text-right ${
                          className === prediction.prediction
                            ? 'font-bold text-blue-700'
                            : 'text-gray-500'
                        }`}>
                          {(prob * 100).toFixed(2)}%
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            )}

            <p className="text-sm text-gray-500 text-center mb-4">
              Note: This is an AI-generated analysis and not a medical diagnosis. Consult a healthcare professional for accurate diagnosis.
            </p>

            {/* EXPERT REVIEW CTA */}
            <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-6 mb-6">
              <h3 className="text-xl font-bold text-indigo-800 mb-2">Want a professional opinion?</h3>
              <p className="text-indigo-600 mb-4 text-sm">
                Get this AI analysis and your image reviewed by a certified Dermatologist for just ₹30.
              </p>
              
              {!showExpertReview ? (
                <button
                  onClick={() => setShowExpertReview(true)}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-300"
                >
                  Get Expert Dermatologist Review — ₹30
                </button>
              ) : (
                <div className="space-y-4 animate-fadeIn">
                  <div>
                    <label className="block text-sm font-medium text-indigo-800 mb-1">
                      Choose a Dermatologist (Optional)
                    </label>
                    <select
                      value={selectedDocId}
                      onChange={(e) => setSelectedDocId(e.target.value)}
                      className="w-full p-2 border border-indigo-300 rounded-md bg-white text-gray-800"
                    >
                      <option value="">Auto-assign (Fastest)</option>
                      {doctors && doctors.filter(d => d.speciality === 'Dermatologist').map((doc) => (
                        <option key={doc._id} value={doc._id}>
                          Dr. {doc.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowExpertReview(false)}
                      className="flex-1 bg-white border border-indigo-300 hover:bg-indigo-50 text-indigo-700 font-semibold py-2 px-4 rounded-lg transition duration-300"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSubmitExpertReview}
                      disabled={isSubmittingReview}
                      className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-300 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                      {isSubmittingReview ? 'Submitting...' : 'Confirm & Proceed'}
                    </button>
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={() => {
                setPrediction(null);
                setImage(null);
                setSearchQuery('');
              }}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition duration-300"
            >
              Start New Analysis
            </button>
          </div>
        )}

        {/* Search Bar */}
        {!isAnalyzing && !prediction && croppedImage && (
          <div className="mt-6">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for related skin conditions..."
                className="w-full px-4 py-2 rounded-lg bg-gray-100 text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <FaSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-500" />
            </div>
          </div>
        )}

        <p className="text-center text-sm text-gray-500 mt-6">
          Powered by advanced AI. For best results, ensure good lighting and clear focus on the area of interest.
        </p>
      </div>
    </div>
  );
};

export default AiDetection;