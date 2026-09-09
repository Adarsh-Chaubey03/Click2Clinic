import { useEffect, useState, useRef } from "react";
import { FaGlobe } from "react-icons/fa";

const TranslateWidget = () => {
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState("English");
  const [isTranslating, setIsTranslating] = useState(false);
  const modalRef = useRef(null);

  const detectCurrentLanguage = () => {
    const cookies = document.cookie.split(';');
    const googtransCookie = cookies.find(cookie => cookie.trim().startsWith('googtrans='));
    if (googtransCookie) {
      const langCode = googtransCookie.split('=')[1];
      if (langCode.includes('/hi')) setCurrentLanguage("Hindi");
      else if (langCode.includes('/mr')) setCurrentLanguage("Marathi");
      else if (langCode.includes('/sa')) setCurrentLanguage("Sanskrit");
      else if (langCode.includes('/mni-Mtei')) setCurrentLanguage("Manipuri");
      else setCurrentLanguage("English");
    }
  };

  const monitorTranslationChanges = () => {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
          detectCurrentLanguage();
        }
      });
    });
    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ['class']
    });
    return observer;
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        setShowLanguageModal(false);
      }
    };

    if (showLanguageModal) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showLanguageModal]);

  useEffect(() => {
    const initGoogleTranslate = () => {
      if (window.google && window.google.translate) {
        new window.google.translate.TranslateElement(
          {
            pageLanguage: "en",
            includedLanguages: "en,hi,mr,sa,mni-Mtei",
            layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
            autoDisplay: false,
          },
          "google_translate_element"
        );
        setTimeout(detectCurrentLanguage, 1000);
      }
    };

    const addGoogleTranslateScript = () => {
      const script = document.createElement("script");
      script.src = "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
      script.async = true;
      document.body.appendChild(script);
    };

    window.googleTranslateElementInit = initGoogleTranslate;

    if (!document.querySelector('script[src*="translate_a/element.js"]')) {
      addGoogleTranslateScript();
    } else {
      setTimeout(() => {
        if (window.google && window.google.translate) {
          initGoogleTranslate();
        }
      }, 500);
    }

    detectCurrentLanguage();
    const observer = monitorTranslationChanges();

    return () => {
      if (observer) observer.disconnect();
    };
  }, []);

  const handleLanguageChange = (language, langCode) => {
    setCurrentLanguage(language);
    setShowLanguageModal(false);
    setIsTranslating(true);

    const supportedCodes = ["en", "hi", "mr", "sa", "mni-Mtei"];
    if (!supportedCodes.includes(langCode)) {
      alert(`${language} translation is currently not supported by Google Translate.`);
      setIsTranslating(false);
      return;
    }

    document.cookie = `googtrans=/en/${langCode}; path=/`;
    setTimeout(() => {
      window.location.reload();
    }, 500);
  };

  const languages = [
    { name: "English", code: "en", flag: "🇺🇸" },
    { name: "Hindi", code: "hi", flag: "🇮🇳" },
    { name: "Marathi", code: "mr", flag: "🇮🇳" },
    { name: "Sanskrit", code: "sa", flag: "🕉️" },
    { name: "Marwari", code: "raj", flag: "🎭" }, // not supported
    { name: "Manipuri", code: "mni-Mtei", flag: "🏞️" },
  ];

  return (
    <div className="relative inline-flex items-center">
      <button
        onClick={() => setShowLanguageModal(true)}
        className="inline-flex items-center gap-2 px-3 py-2 min-h-11 rounded-lg bg-white hover:bg-gray-50 border border-gray-200 transition-all duration-200 shadow-sm hover:shadow-md shrink-0"
        title="Select Language"
        disabled={isTranslating}
      >
        {isTranslating ? (
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-cyan-600"></div>
        ) : (
          <FaGlobe className="text-lg text-gray-600" />
        )}
        <span className="hidden text-sm font-medium text-gray-700 xl:block">
          {isTranslating ? "Translating..." : currentLanguage}
        </span>
      </button>

      {showLanguageModal && (
        <div className="absolute left-0 right-0 top-full z-50 mt-3 w-[min(92vw,22rem)] overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-2xl ring-1 ring-black/5 sm:left-auto sm:right-0 sm:w-96">
          <div ref={modalRef} className="max-h-[calc(100vh-6rem)] overflow-y-auto p-5 sm:max-h-[calc(100vh-8rem)] sm:p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-gray-800">Select Language</h3>
              <button
                onClick={() => setShowLanguageModal(false)}
                className="text-gray-400 hover:text-gray-600"
                disabled={isTranslating}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-2">
              {languages.map((language) => (
                <button
                  key={language.code}
                  onClick={() => handleLanguageChange(language.name, language.code)}
                  disabled={isTranslating}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all ${
                    currentLanguage === language.name
                      ? "bg-blue-50 text-blue-700 border border-blue-200"
                      : "hover:bg-gray-50 text-gray-700"
                  } ${isTranslating ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  <span className="text-2xl">{language.flag}</span>
                  <span className="font-medium">{language.name}</span>
                  {currentLanguage === language.name && (
                    <svg className="w-5 h-5 ml-auto text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>
              ))}
            </div>

            {isTranslating && (
              <div className="mt-4 text-center">
                <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-cyan-600"></div>
                  Translating page...
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <div id="google_translate_element" className="hidden" />
    </div>
  );
};

export default TranslateWidget;
