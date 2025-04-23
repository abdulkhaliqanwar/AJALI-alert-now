
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

const Navbar = () => {
  const { user, logout, isAuthenticated, isAdmin } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="bg-ajali-red text-white py-3 px-4 md:px-6 shadow-md sticky top-0 z-50">
      <div className="container mx-auto flex items-center justify-between">
        {/* Logo and Title */}
        <Link to="/" className="flex items-center space-x-2">
          <div className="bg-white p-1 rounded">
            <span className="text-ajali-red font-bold text-xl">!</span>
          </div>
          <h1 className="font-bold text-xl md:text-2xl tracking-tight">Ajali!</h1>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-6">
          <Link to="/" className="hover:text-ajali-yellow transition-colors">
            Home
          </Link>
          <Link to="/incidents" className="hover:text-ajali-yellow transition-colors">
            Incidents
          </Link>
          {isAuthenticated && (
            <Link to="/report" className="hover:text-ajali-yellow transition-colors">
              Report Incident
            </Link>
          )}
          {isAdmin && (
            <Link to="/admin" className="hover:text-ajali-yellow transition-colors">
              Admin Dashboard
            </Link>
          )}
        </div>

        {/* Authentication Buttons - Desktop */}
        <div className="hidden md:flex items-center space-x-4">
          {isAuthenticated ? (
            <div className="flex items-center space-x-4">
              <span className="text-sm">Welcome, {user?.name}</span>
              <Button 
                onClick={logout} 
                variant="secondary" 
                className="bg-white text-ajali-red hover:bg-ajali-yellow hover:text-ajali-dark"
              >
                Logout
              </Button>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <Link to="/login">
                <Button variant="outline" className="bg-transparent border-white text-white hover:bg-white hover:text-ajali-red">
                  Login
                </Button>
              </Link>
              <Link to="/register">
                <Button className="bg-white text-ajali-red hover:bg-ajali-yellow hover:text-ajali-dark">
                  Register
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button className="md:hidden" onClick={toggleMenu}>
          {isMenuOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <Menu className="w-6 h-6" />
          )}
        </button>
      </div>

      {/* Mobile Navigation Menu */}
      {isMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-ajali-red py-4 px-4 shadow-md">
          <div className="flex flex-col space-y-4">
            <Link to="/" className="hover:text-ajali-yellow" onClick={toggleMenu}>
              Home
            </Link>
            <Link to="/incidents" className="hover:text-ajali-yellow" onClick={toggleMenu}>
              Incidents
            </Link>
            {isAuthenticated && (
              <Link to="/report" className="hover:text-ajali-yellow" onClick={toggleMenu}>
                Report Incident
              </Link>
            )}
            {isAdmin && (
              <Link to="/admin" className="hover:text-ajali-yellow" onClick={toggleMenu}>
                Admin Dashboard
              </Link>
            )}
            
            {/* Authentication - Mobile */}
            {isAuthenticated ? (
              <div className="pt-2 border-t border-white/30">
                <span className="block mb-2 text-sm">Signed in as {user?.name}</span>
                <Button 
                  onClick={() => {
                    logout();
                    toggleMenu();
                  }} 
                  variant="secondary" 
                  className="w-full bg-white text-ajali-red hover:bg-ajali-yellow hover:text-ajali-dark"
                >
                  Logout
                </Button>
              </div>
            ) : (
              <div className="pt-2 border-t border-white/30 flex flex-col space-y-2">
                <Link to="/login" onClick={toggleMenu} className="w-full">
                  <Button variant="outline" className="w-full bg-transparent border-white text-white hover:bg-white hover:text-ajali-red">
                    Login
                  </Button>
                </Link>
                <Link to="/register" onClick={toggleMenu} className="w-full">
                  <Button className="w-full bg-white text-ajali-red hover:bg-ajali-yellow hover:text-ajali-dark">
                    Register
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
