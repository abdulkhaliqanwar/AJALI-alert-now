
import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-ajali-dark text-white py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4 flex items-center">
              <span className="bg-white text-ajali-red px-1 rounded mr-1">!</span>
              Ajali!
            </h3>
            <p className="text-gray-300">
              A platform to report and track emergencies and incidents across Kenya.
              Together, we can make Kenya safer.
            </p>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-300 hover:text-ajali-yellow transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/incidents" className="text-gray-300 hover:text-ajali-yellow transition-colors">
                  Incidents
                </Link>
              </li>
              <li>
                <Link to="/report" className="text-gray-300 hover:text-ajali-yellow transition-colors">
                  Report Incident
                </Link>
              </li>
              <li>
                <Link to="/login" className="text-gray-300 hover:text-ajali-yellow transition-colors">
                  Login
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Emergency Numbers</h3>
            <ul className="space-y-2">
              <li className="flex items-center">
                <span className="text-ajali-yellow mr-2">Police:</span> 
                <a href="tel:999" className="text-gray-300 hover:text-white">999</a>
              </li>
              <li className="flex items-center">
                <span className="text-ajali-yellow mr-2">Ambulance:</span> 
                <a href="tel:998" className="text-gray-300 hover:text-white">998</a>
              </li>
              <li className="flex items-center">
                <span className="text-ajali-yellow mr-2">Fire:</span> 
                <a href="tel:997" className="text-gray-300 hover:text-white">997</a>
              </li>
              <li className="flex items-center">
                <span className="text-ajali-yellow mr-2">National Disaster:</span> 
                <a href="tel:112" className="text-gray-300 hover:text-white">112</a>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-700 mt-8 pt-6 text-center text-gray-400">
          <p>© {currentYear} Ajali! Emergency Response System. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
