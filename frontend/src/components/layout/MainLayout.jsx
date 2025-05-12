import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../../store/slices/authSlice';

const MainLayout = ({ children }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { isAuthenticated, user } = useSelector(state => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  const userMenu = [
    { path: '/dashboard', label: 'Dashboard', icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z" />
        <path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z" />
      </svg>
    )},
    { path: '/report-incident', label: 'Report', icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
      </svg>
    )},
    { path: '/settings', label: 'Settings', icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
      </svg>
    )}
  ];

  if (user?.role === 'admin') {
    userMenu.push({
      path: '/admin',
      label: 'Admin',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
      )
    });
  }

  return (
    <div className="min-h-screen flex flex-col bg-white font-sans">
      {/* Navigation */}
      <nav className={`fixed w-full z-50 transition-all duration-200 ${
        isScrolled ? 'bg-white shadow-md' : 'bg-white'
      } border-b border-gray-200`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              {/* Logo */}
              <Link to="/" className="flex-shrink-0 flex items-center space-x-2">
                <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-md">
                  <span className="text-2xl font-bold text-white">A</span>
                </div>
                <span className="text-3xl font-bold text-gray-900 tracking-wide">
                  Ajali!
                </span>
              </Link>
              {/* Desktop Navigation */}
              <div className="hidden sm:ml-8 sm:flex sm:space-x-2">
                {[
                  { path: '/', label: 'Home', icon: (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                    </svg>
                  )},
                  { path: '/incidents', label: 'Incidents', icon: (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                      <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                    </svg>
                  )},
                  ...(isAuthenticated ? userMenu : [])
                ].map(item => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center px-4 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900 mx-1`}
                  >
                    {item.icon}
                    <span className="ml-2">{item.label}</span>
                  </Link>
                ))}
              </div>
            </div>
            {/* Auth Buttons */}
            <div className="hidden sm:ml-6 sm:flex sm:items-center">
              {isAuthenticated ? (
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center shadow-md">
                      <span className="text-base font-bold text-white">
                        {user?.username[0].toUpperCase()}
                      </span>
                    </div>
                    <span className="text-base text-gray-900">
                      {user?.username}
                    </span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="px-5 py-2 text-base text-white bg-blue-600 rounded-md shadow-md hover:bg-blue-700 transition duration-150"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <div className="space-x-4">
                  <Link 
                    to="/login" 
                    className="px-5 py-2 text-base text-blue-600 border border-blue-600 rounded-md hover:bg-blue-50 transition duration-150"
                  >
                    Login
                  </Link>
                  <Link 
                    to="/register" 
                    className="px-5 py-2 text-base text-white bg-blue-600 rounded-md hover:bg-blue-700 transition duration-150"
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>
            {/* Mobile menu button */}
            <div className="flex items-center sm:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-600"
              >
                <span className="sr-only">Open main menu</span>
                <svg
                  className={`${isMobileMenuOpen ? 'hidden' : 'block'} h-6 w-6`}
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
                <svg
                  className={`${isMobileMenuOpen ? 'block' : 'hidden'} h-6 w-6`}
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        <div className={`${isMobileMenuOpen ? 'block' : 'hidden'} sm:hidden bg-white border-t border-gray-200`}>
          <div className="pt-2 pb-3 space-y-1 px-4">
            {[
              { path: '/', label: 'Home' },
              { path: '/incidents', label: 'Incidents' },
              ...(isAuthenticated ? userMenu : [])
            ].map(item => (
              <Link
                key={item.path}
                to={item.path}
                className={`block py-2 px-3 rounded-md text-base font-medium ${
                  isActive(item.path)
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 hover:bg-blue-600 hover:text-white'
                }`}
              >
                <span className="flex items-center">
                  {item.icon}
                  <span className="ml-2">{item.label}</span>
                </span>
              </Link>
            ))}
          </div>
          <div className="pt-4 pb-3 border-t border-gray-200">
            {isAuthenticated ? (
              <div className="px-4 space-y-3">
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
                    <span className="text-sm font-medium text-white">{user?.username}</span>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-700">{user?.username}</p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-md"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="px-4 space-y-3">
                <Link
                  to="/login"
                  className="block w-full text-center py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-md border border-gray-300"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="block w-full text-center py-2 text-sm font-medium bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Main content */}
      <main className="flex-grow pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <Link to="/" className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
                  <span className="text-xl font-bold text-white">A</span>
                </div>
                <span className="text-xl font-bold text-gray-900">Ajali!</span>
              </Link>
              <p className="mt-4 text-sm text-gray-600">
                Emergency Incident Reporting System for Kenya. Report incidents quickly and efficiently.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">Quick Links</h3>
              <ul className="mt-4 space-y-2">
                <li>
                  <Link to="/incidents" className="text-sm text-gray-600 hover:text-blue-600">
                    View Incidents
                  </Link>
                </li>
                <li>
                  <Link to="/report-incident" className="text-sm text-gray-600 hover:text-blue-600">
                    Report Incident
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">Emergency Contacts</h3>
              <ul className="mt-4 space-y-2">
                <li className="text-sm text-gray-600">Police: 999</li>
                <li className="text-sm text-gray-600">Ambulance: 911</li>
                <li className="text-sm text-gray-600">Fire: 998</li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-200">
            <p className="text-center text-sm text-gray-500">
              © {new Date().getFullYear()} Ajali! All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default MainLayout;
