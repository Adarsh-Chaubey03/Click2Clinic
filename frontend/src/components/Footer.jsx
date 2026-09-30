import { useNavigate } from 'react-router-dom';

const Footer = () => {
  const navigate = useNavigate();

  // Navigation handler with smooth scroll to top
  const handleNavClick = (path) => {
    navigate(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="mt-auto border-t border-[#dceeed] bg-[#effafa] text-[#20334a]">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-4 py-14 text-sm sm:grid-cols-2 lg:grid-cols-4 lg:px-8">
        {/* Left Section: Logo and Description */}
        <div>
          <p className="mb-5 text-2xl font-extrabold tracking-tight text-[#10233f]">Click<span className="text-[#009f9a]">2</span>Clinic</p>
          <p className="leading-6 text-[#687b90] md:w-2/3">
            Click2Clinic connects patients with trusted healthcare professionals, diagnostics and medicines in one simple experience.
</p>
        </div>

        {/* Quick Links Section */}
        <div>
          <p className="mb-5 text-lg font-bold text-[#10233f]">Quick Links</p>
          <ul className="flex flex-col gap-3 text-[#687b90]">
            <li
              onClick={() => handleNavClick('/store')}
              className="cursor-pointer hover:text-cyan-700 hover:underline transition-all duration-200"
            >
              Store
            </li>
            <li
              onClick={() => handleNavClick('/doctors')}
              className="cursor-pointer hover:text-cyan-700 hover:underline transition-all duration-200"
            >
              Doctors
            </li>
            <li
              onClick={() => handleNavClick('/my-orders')}
              className="cursor-pointer hover:text-cyan-700 hover:underline transition-all duration-200"
            >
              My Orders
            </li>
            <li
              onClick={() => handleNavClick('/my-appointment')}
              className="cursor-pointer hover:text-cyan-700 hover:underline transition-all duration-200"
            >
              My Appointments
            </li>
          </ul>
        </div>

        {/* Explore Section */}
        <div>
          <p className="mb-5 text-lg font-bold text-[#10233f]">Explore</p>
          <ul className="flex flex-col gap-3 text-[#687b90]">
            <li
              onClick={() => handleNavClick('/')}
              className="cursor-pointer hover:text-cyan-700 hover:underline transition-all duration-200"
            >
              Home
            </li>
            <li
              onClick={() => handleNavClick('/about')}
              className="cursor-pointer hover:text-cyan-700 hover:underline transition-all duration-200"
            >
              About Us
            </li>
            <li
              onClick={() => handleNavClick('/contact')}
              className="cursor-pointer hover:text-cyan-700 hover:underline transition-all duration-200"
            >
              Contact Us
            </li>
            <li
              onClick={() => handleNavClick('/privacy')}
              className="cursor-pointer hover:text-cyan-700 hover:underline transition-all duration-200"
            >
              Privacy Policy
            </li>
          </ul>
        </div>

        {/* Get In Touch Section */}
        <div>
          <p className="mb-5 text-lg font-bold text-[#10233f]">Get In Touch</p>
          <ul className="flex flex-col gap-3 text-[#687b90]">
            <li>
              <a
                href="tel:+12124567890"
                className="hover:text-cyan-700 hover:underline transition-all duration-200"
              >
                +1-212-456-7890
              </a>
            </li>
            <li>
              <a
                href="mailto:laxkaraditya55@gmail.com"
                className="hover:text-cyan-700 hover:underline transition-all duration-200"
              >
                laxkaraditya55@gmail.com
              </a>
            </li>
          </ul>
        </div>
      </div>

      {/* Copyright Section */}
      <div className="border-t border-[#d4e9e8] bg-[#e2f7f5]">
        <hr className="border-gray-200" />
        <p className="py-5 text-sm text-center text-gray-600">
          Copyright 2025 Click2Clinic. All Rights Reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
