import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const ConsultationForm = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [symptoms, setSymptoms] = useState('');
  const [selectedSpeciality, setSelectedSpeciality] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');

  const specialities = [
    { name: 'Pediatrics', price: '499' },
    { name: 'General physician', price: '399' },
    { name: 'Ear, Nose, Throat', price: '499' }
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    navigate('/appointments', {
      state: {
        symptoms,
        speciality: selectedSpeciality,
        mobileNumber
      }
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="relative flex max-h-[90vh] w-full max-w-4xl flex-col overflow-y-auto rounded-xl bg-white p-4 sm:p-6 lg:flex-row lg:p-8">
        {/* Left Section */}
        <div className="min-w-0 flex-1 lg:pr-8">
          {/* Header with close button */}
          <div className="mb-6 flex items-start justify-between gap-4">
            <div className="min-w-0">
              <h2 className="mb-1 text-xl font-bold text-gray-800 sm:text-2xl">Consult with a Doctor</h2>
              <p className="text-gray-600">Tell us your symptom or health problem</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Symptoms Input */}
            <div>
              <input
                type="text"
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
                placeholder="fever"
                className="w-full p-3 border-2 border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700 placeholder-gray-400"
                minLength={4}
                required
              />
              <p className="text-xs text-gray-400 mt-1">Min 4 characters</p>
            </div>

            {/* Specialities */}
            <div>
              <h3 className="text-gray-700 font-medium mb-3">Choose a relevant speciality</h3>
              <div className="space-y-3">
                {specialities.map((speciality) => (
                  <label
                    key={speciality.name}
                    className={`flex items-center justify-between p-3 border-2 rounded-lg cursor-pointer transition-colors ${
                      selectedSpeciality === speciality.name
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-100 hover:border-blue-200'
                    }`}
                  >
                    <div className="flex items-center">
                      <input
                        type="radio"
                        name="speciality"
                        value={speciality.name}
                        checked={selectedSpeciality === speciality.name}
                        onChange={(e) => setSelectedSpeciality(e.target.value)}
                        className="w-4 h-4 text-blue-500 border-gray-300 focus:ring-blue-500"
                      />
                      <span className="ml-3 text-gray-700">{speciality.name}</span>
                    </div>
                    <span className="text-gray-600">₹{speciality.price}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Mobile Number */}
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Mobile number
              </label>
              <div className="flex">
                <span className="inline-flex items-center px-3 border-2 border-r-0 border-gray-100 bg-gray-50 text-gray-500 rounded-l-lg">
                  <img
                    src="https://flagcdn.com/w20/in.png"
                    alt="India"
                    className="h-4 mr-2"
                  />
                  +91
                </span>
                <input
                  type="tel"
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value)}
                  className="min-w-0 flex-1 border-2 border-gray-100 p-3 rounded-r-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  pattern="[0-9]{10}"
                  maxLength={10}
                  required
                />
              </div>
            </div>

            {/* Continue Button */}
            <button
              type="submit"
              className="w-full rounded-lg bg-blue-500 py-3 font-medium text-white transition-colors hover:bg-blue-600 sm:w-32"
            >
              Continue
            </button>
          </form>
        </div>

        {/* Right Section - Shield Icon */}
        <div className="mt-8 flex w-full flex-col items-center justify-center border-t border-gray-100 pt-6 lg:mt-0 lg:w-64 lg:border-t-0 lg:pt-0">
          <div className="w-32 h-32 bg-purple-100 rounded-full flex items-center justify-center mb-4">
            <svg className="w-16 h-16 text-purple-500" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              <path d="M12 8v8M8 12h8" fill="none" stroke="white" strokeWidth="2"/>
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-800">Private & Secure</h3>
        </div>
      </div>
    </div>
  );
};

export default ConsultationForm; 
