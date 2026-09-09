import { assets } from '../assets/assets';
import { useNavigate } from 'react-router-dom';

const Footer = () => {
  const navigate = useNavigate();

  // Navigation handler with smooth scroll to top
  const handleNavClick = (path) => {
    navigate(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-slate-100 text-gray-900 border-t-2 border-t-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 text-sm">
        {/* Left Section: Logo and Description */}
        <div>
          <img className="mb-5 w-40" src={assets.main_logo} alt="VaidyTek Logo" />
          <p className="text-gray-600 leading-6 md:w-2/3">
            VaidyTek bridges healthcare and technology, connecting patients with trusted medical professionals. Our mission is to make healthcare accessible, efficient, and personalized for all.
</p>
        </div>

        {/* Quick Links Section */}
        <div>
          <p className="text-xl font-medium mb-5 text-gray-800">Quick Links</p>
          <ul className="flex flex-col gap-2 text-gray-600">
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
          <p className="text-xl font-medium mb-5 text-gray-800">Explore</p>
          <ul className="flex flex-col gap-2 text-gray-600">
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
          <p className="text-xl font-medium mb-5 text-gray-800">Get In Touch</p>
          <ul className="flex flex-col gap-2 text-gray-600">
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
      <div className="bg-cyan-100/70">
        <hr className="border-gray-200" />
        <p className="py-5 text-sm text-center text-gray-600">
          Copyright 2025@ prescripto - All Rights Reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
