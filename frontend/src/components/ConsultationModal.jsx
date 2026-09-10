import { useState, useEffect, useRef } from 'react';

const doctorAvatars = [
  '/src/assets/doc1.png',
  '/src/assets/doc2.png',
  '/src/assets/doc3.png',
  '/src/assets/doc4.png',
];

const allSpecialities = [
  { name: 'Pediatrics', price: 499 },
  { name: 'General physician', price: 399 },
  { name: 'Ear, Nose, Throat', price: 499 },
  { name: 'Cardiologist', price: 699 },
  { name: 'Orthopedist', price: 599 },
  { name: 'Dermatologist', price: 499 },
  { name: 'Neurologist', price: 799 },
  { name: 'Gastroenterologist', price: 599 },
];

const symptomToSpecialities = [
  { keywords: ['fever', 'cold', 'cough'], specialities: ['General physician', 'Pediatrics'] },
  { keywords: ['heart', 'cardiac', 'chest pain'], specialities: ['Cardiologist'] },
  { keywords: ['bone', 'fracture', 'joint', 'orthopedic'], specialities: ['Orthopedist'] },
  { keywords: ['skin', 'rash', 'itch'], specialities: ['Dermatologist'] },
  { keywords: ['headache', 'migraine', 'brain'], specialities: ['Neurologist'] },
  { keywords: ['stomach', 'abdomen', 'digestion'], specialities: ['Gastroenterologist'] },
  { keywords: ['throat', 'ear', 'nose'], specialities: ['Ear, Nose, Throat'] },
];

const ConsultationModal = ({ isOpen, onClose, user, initialSpeciality = "" }) => {
  const [step, setStep] = useState(1);
  const [symptom, setSymptom] = useState('');
  const [speciality, setSpeciality] = useState('');
  const [mobile, setMobile] = useState('');
  const [patientName, setPatientName] = useState(user?.name || '');
  const [coupon, setCoupon] = useState('');
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [rememberCard, setRememberCard] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('card');
  
  const carouselItems = [
    {
      image: '/src/assets/verified_icon.svg',
      title: 'Verified Doctors',
      description: 'All our doctors are verified and highly qualified'
    },
    {
      image: '/src/assets/info_icon.svg',
      title: 'Private & Secure',
      description: 'Your data is protected and consultations are private'
    },
    {
      image: '/src/assets/chats_icon.svg',
      title: 'Free Follow-up',
      description: 'Get free follow-up for the next 3 days'
    }
  ];

  const carouselInterval = useRef(null);

  // Set initial speciality when modal opens
  useEffect(() => {
    if (isOpen && initialSpeciality) {
      setSpeciality(initialSpeciality);
    }
  }, [isOpen, initialSpeciality]);

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setStep(1);
      setSymptom('');
      setSpeciality('');
      setMobile('');
      setPatientName(user?.name || '');
      setCoupon('');
    }
  }, [isOpen, user]);

  // Find all relevant specialities for the entered symptom
  const getRelevantSpecialities = () => {
    if (symptom.length < 4) return [];
    const found = new Set();
    for (const mapping of symptomToSpecialities) {
      for (const keyword of mapping.keywords) {
        if (symptom.toLowerCase().includes(keyword)) {
          mapping.specialities.forEach(s => found.add(s));
        }
      }
    }
    // If nothing found, show General physician
    if (found.size === 0) found.add('General physician');
    return allSpecialities.filter(s => found.has(s.name));
  };
  const relevantSpecialities = getRelevantSpecialities();

  // Carousel logic
  useEffect(() => {
    if (step === 1) {
      carouselInterval.current = setInterval(() => {
        setCarouselIndex(i => (i + 1) % carouselItems.length);
      }, 3000);
    } else {
      clearInterval(carouselInterval.current);
    }
    return () => clearInterval(carouselInterval.current);
  }, [step]);

  const handleClose = () => {
    setShowConfirmation(true);
  };

  const handleConfirmClose = () => {
    setShowConfirmation(false);
    onClose();
  };

  const handleCancelClose = () => {
    setShowConfirmation(false);
  };

  // Payment methods
  const paymentMethods = [
    { id: 'card', name: 'Debit / Credit Card' },
    { id: 'paytm', name: 'Paytm Postpaid and Wallet' },
    { id: 'upi', name: 'UPI' },
    { id: 'gpay', name: 'Google Pay' },
    { id: 'amazon', name: 'Amazon Pay' },
    { id: 'phonepe', name: 'PhonePe / BHIM UPI' },
    { id: 'netbanking', name: 'Net Banking' },
    { id: 'paylater', name: 'Pay Later' },
    { id: 'others', name: 'Others' }
  ];

  // Format card number with spaces
  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length) {
      return parts.join(' ');
    } else {
      return value;
    }
  };

  // Format expiry date
  const formatExpiryDate = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.slice(0, 2) + ' / ' + v.slice(2, 4);
    }
    return v;
  };

  // Handle payment submission
  const handlePayment = () => {
    if (selectedPaymentMethod === 'card') {
      // Add validation here
      if (cardNumber.length < 19 || !cardHolder || expiryDate.length < 7 || cvv.length < 3) {
        alert('Please fill in all card details correctly');
        return;
      }
    }
    // Process payment logic here
    console.log('Processing payment...');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="relative flex max-h-[90vh] w-full max-w-4xl flex-col overflow-y-auto rounded-xl bg-white p-4 sm:p-6 lg:flex-row lg:p-8">
        {/* Close button */}
        <button onClick={handleClose} className="absolute right-4 top-4 text-2xl text-gray-400 hover:text-gray-600 sm:right-6 sm:top-6">×</button>

        {/* Confirmation Dialog */}
        {showConfirmation && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div className="w-full max-w-sm rounded-lg bg-white shadow-xl">
              <div className="p-6 relative">
                {/* Close button */}
                <button 
                  onClick={handleCancelClose}
                  className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-xl"
                >
                  ×
                </button>
                
                {/* Title */}
                <h3 className="text-xl font-semibold text-gray-800 mb-4">
                  Are you sure?
                </h3>
                
                {/* Message */}
                <p className="text-gray-600 mb-6">
                  If you leave now, the information you have entered will be lost.
                </p>
                
                {/* Action Button */}
                <button
                  onClick={handleConfirmClose}
                  className="w-full py-3 bg-cyan-600 hover:bg-cyan-700 text-white font-medium rounded transition-colors"
                >
                  Yes, Quit
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 1: Symptom, Speciality, Mobile */}
        {step === 1 && (
          <>
            <div className="min-w-0 flex-1 lg:pr-8">
              <h2 className="mb-4 text-xl font-bold text-gray-800 sm:text-2xl">Consult with a Doctor</h2>
              <label className="block text-gray-700 font-medium mb-2">Tell us your symptom or health problem</label>
              <input
                type="text"
                className="w-full p-4 border border-gray-300 rounded-lg mb-1 focus:ring-2 focus:ring-blue-400"
                placeholder="Eg: fever, headache"
                value={symptom}
                onChange={e => {
                  setSymptom(e.target.value);
                  setSpeciality('');
                }}
                minLength={4}
                required
              />
              <p className="text-xs text-gray-400 mb-4">Min 4 characters</p>
              <div className="mb-4">
                <span className="text-gray-700">A relevant speciality will be shown below...</span>
                {relevantSpecialities.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {relevantSpecialities.map(s => (
                      <label key={s.name} className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-colors ${speciality === s.name ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-400'}`}>
                        <div className="flex items-center">
                          <input
                            type="radio"
                            name="speciality"
                            value={s.name}
                            checked={speciality === s.name}
                            onChange={() => setSpeciality(s.name)}
                            className="w-4 h-4 text-blue-500 border-gray-300 focus:ring-blue-500"
                          />
                          <span className="ml-3 text-gray-700">{s.name}</span>
                        </div>
                        <span className="text-gray-600 font-medium">₹{s.price}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
              <label className="block text-gray-700 font-medium mb-2">Mobile number</label>
              <div className="flex mb-6">
                <span className="inline-flex items-center px-4 border border-r-0 border-gray-300 bg-gray-50 text-gray-500 rounded-l-lg">
                  <img src="https://flagcdn.com/w20/in.png" alt="India" className="h-4 mr-2" />+91
                </span>
                <input
                  type="tel"
                  className="min-w-0 flex-1 rounded-r-lg border border-gray-300 p-4 focus:ring-2 focus:ring-blue-400"
                  placeholder="Enter mobile number"
                  value={mobile}
                  onChange={e => setMobile(e.target.value)}
                  pattern="[0-9]{10}"
                  maxLength={10}
                  required
                />
              </div>
              <button
                className={`w-full rounded-lg py-3 font-medium text-white sm:w-40 ${(symptom.length >= 4 && mobile && speciality) ? 'bg-blue-500 hover:bg-blue-600' : 'bg-gray-200 cursor-not-allowed'}`}
                disabled={!(symptom.length >= 4 && mobile && speciality)}
                onClick={() => setStep(2)}
                type="button"
              >
                Continue
              </button>
            </div>
            <div className="mx-8 hidden w-1 border-r border-gray-200 lg:block"></div>
            <div className="mt-8 flex w-full flex-col items-center justify-center border-t border-gray-100 pt-6 lg:mt-0 lg:w-80 lg:border-t-0 lg:pt-0">
              <div className="relative w-full flex flex-col items-center">
                <img 
                  src={carouselItems[carouselIndex].image} 
                  alt={carouselItems[carouselIndex].title} 
                  className="w-32 h-32 object-contain mb-4 transition-all duration-500"
                />
                <h3 className="text-xl font-semibold text-gray-800 mb-2">{carouselItems[carouselIndex].title}</h3>
                <p className="text-center text-gray-600 text-sm">{carouselItems[carouselIndex].description}</p>
                <div className="flex gap-2 mt-4">
                  {carouselItems.map((_, idx) => (
                    <button
                      key={idx}
                      className={`w-2 h-2 rounded-full transition-all duration-300 ${idx === carouselIndex ? 'bg-blue-500 w-4' : 'bg-gray-300'}`}
                      onClick={() => setCarouselIndex(idx)}
                    />
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
        {/* Step 2: Confirmation */}
        {step === 2 && (
          <>
            <div className="min-w-0 flex-1 lg:pr-8">
              <button className="mb-4 text-lg text-gray-500" onClick={() => setStep(1)}>&larr; Back</button>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Confirm & Pay</h2>
              <div className="mb-2 flex items-center gap-2">
                <span className="font-medium text-gray-700">Verified {speciality}s online now</span>
                <span className="w-2 h-2 bg-green-500 rounded-full inline-block"></span>
              </div>
              <div className="flex items-center mb-2">
                {doctorAvatars.map((src, i) => (
                  <img key={i} src={src} alt="doc" className="w-10 h-10 rounded-full border-2 border-white -ml-2 first:ml-0" />
                ))}
                <span className="ml-2 text-gray-500 font-medium">+199</span>
              </div>
              <div className="mb-2 text-gray-700">One of them will speak to you shortly.</div>
              <div className="mb-2 flex items-center text-green-700"><span className="mr-2">💡</span>93% of users found online consultation helpful</div>
              <div className="mb-4 flex items-center text-green-700"><span className="mr-2">📱</span>Consultation will happen only on mobile app</div>
              <label className="block text-gray-700 font-medium mb-1">Patient name</label>
              <input
                type="text"
                className="w-full p-3 border border-gray-300 rounded-lg mb-2"
                value={patientName}
                onChange={e => setPatientName(e.target.value)}
                required
              />
              <a href="#" className="text-blue-500 text-sm mb-2 inline-block">Have a coupon code?</a>
              <div className="mb-2 text-gray-700 font-medium">Final Fee</div>
              <div className="mb-4 text-2xl font-bold">₹{allSpecialities.find(s => s.name === speciality)?.price || ''}</div>
              <button
                className="w-full bg-blue-500 text-white py-3 rounded-lg font-medium hover:bg-blue-600"
                onClick={() => setStep(3)}
                type="button"
              >
                Continue to payment
              </button>
            </div>
            <div className="mx-8 hidden w-1 border-r border-gray-200 lg:block"></div>
            <div className="mt-8 flex w-full flex-col items-center justify-center border-t border-gray-100 pt-6 lg:mt-0 lg:w-80 lg:border-t-0 lg:pt-0">
              <img src="/src/assets/3x more affordable.svg" alt="3x more affordable" className="w-48 h-48 object-contain mb-4" />
              <h3 className="text-xl font-semibold text-gray-800 mt-4">3x more affordable!</h3>
              <p className="text-center text-gray-500 mt-2">Get affordable healthcare online, with fees upto 3 times lesser than in clinic fees.</p>
            </div>
          </>
        )}
        {/* Step 3: Payment */}
        {step === 3 && (
          <>
            <div className="min-w-0 flex-1 lg:pr-8">
              <button className="mb-4 text-lg text-gray-500" onClick={() => setStep(2)}>&larr; Back</button>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Payment Options</h2>
              <div className="bg-indigo-900 text-white p-4 rounded-lg mb-6">
                <div className="text-xl font-semibold">Amount to Pay: <span className="font-bold">₹{allSpecialities.find(s => s.name === speciality)?.price || ''}.00</span></div>
              </div>
              <div className="flex flex-col gap-6 md:flex-row md:gap-0">
                <div className="w-full border-b border-gray-200 md:w-1/3 md:border-b-0 md:border-r">
                  {paymentMethods.map((method) => (
                    <div
                      key={method.id}
                      onClick={() => setSelectedPaymentMethod(method.id)}
                      className={`py-3 px-4 cursor-pointer transition-colors ${
                        selectedPaymentMethod === method.id 
                          ? 'border-l-4 border-cyan-600 bg-gray-50' 
                          : 'border-l-4 border-transparent hover:bg-gray-50'
                      }`}
                    >
                      {method.name}
                    </div>
                  ))}
                </div>
                <div className="min-w-0 flex-1 md:pl-8">
                  {selectedPaymentMethod === 'card' && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm text-gray-600 mb-1">CARD NUMBER</label>
                        <input
                          type="text"
                          value={cardNumber}
                          onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                          maxLength="19"
                          className="w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                          placeholder="XXXX - XXXX - XXXX - XXXX"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-600 mb-1">CARD HOLDER'S NAME</label>
                        <input
                          type="text"
                          value={cardHolder}
                          onChange={(e) => setCardHolder(e.target.value)}
                          className="w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                          placeholder="Eg: John Doe"
                        />
                      </div>
                      <div className="flex flex-col gap-4 sm:flex-row">
                        <div className="flex-1">
                          <label className="block text-sm text-gray-600 mb-1">VALID UPTO</label>
                          <input
                            type="text"
                            value={expiryDate}
                            onChange={(e) => setExpiryDate(formatExpiryDate(e.target.value))}
                            maxLength="7"
                            className="w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                            placeholder="MM / YY"
                          />
                        </div>
                        <div className="flex-1">
                          <label className="block text-sm text-gray-600 mb-1">ENTER CVV</label>
                          <input
                            type="password"
                            value={cvv}
                            onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').slice(0, 3))}
                            maxLength="3"
                            className="w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                            placeholder="CVV"
                          />
                        </div>
                      </div>
                      <div className="mt-6">
                        <p className="text-sm text-gray-600 mb-2">Your transactions are 100% secure</p>
                        <div className="flex flex-wrap gap-3">
                          <img src="https://www.mastercard.co.in/content/dam/public/mastercardcom/in/en/logos/mc-logo-52.svg" alt="Mastercard" className="h-8" />
                          <img src="https://www.visa.co.in/dam/VCOM/regional/ap/india/global-elements/images/in-visa-gold-card-498x280.png" alt="Visa" className="h-8" />
                          <img src="https://www.rupay.co.in/images/rupay-logo.png" alt="RuPay" className="h-8" />
                        </div>
                      </div>
                      <div className="flex items-center mt-4">
                        <input
                          type="checkbox"
                          id="remember-card"
                          checked={rememberCard}
                          onChange={(e) => setRememberCard(e.target.checked)}
                          className="w-4 h-4 text-cyan-600 border-gray-300 rounded focus:ring-cyan-500"
                        />
                        <label htmlFor="remember-card" className="ml-2 text-sm text-gray-600">
                          Remember this card (Your CVV won't be saved)
                        </label>
                      </div>
                      <button
                        onClick={handlePayment}
                        className="w-full mt-4 bg-cyan-600 text-white py-3 rounded font-medium hover:bg-cyan-700 transition-colors"
                      >
                        Pay
                      </button>
                    </div>
                  )}
                  {selectedPaymentMethod !== 'card' && (
                    <div className="h-full flex items-center justify-center">
                      <p className="text-gray-500">This payment method will be available soon.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ConsultationModal; 
