import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateNotificationPreferences } from '../../store/slices/authSlice';

const NotificationPreferences = () => {
  const dispatch = useDispatch();
  const { user, isLoading, error, successMessage } = useSelector(state => state.auth);
  
  const [preferences, setPreferences] = useState({
    email_notifications: true,
    sms_notifications: true,
    phone_number: ''
  });

  useEffect(() => {
    if (user) {
      setPreferences({
        email_notifications: user.email_notifications ?? true,
        sms_notifications: user.sms_notifications ?? true,
        phone_number: user.phone_number || ''
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setPreferences(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await dispatch(updateNotificationPreferences(preferences));
  };

  return (
    <div className="card animate-fade-in">
      <h2 className="text-2xl font-bold mb-6">Notification Preferences</h2>
      
      {error && (
        <div className="alert alert-error mb-4">
          {error}
        </div>
      )}
      
      {successMessage && (
        <div className="alert bg-green-50 border-green-500 text-green-700 mb-4">
          {successMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors duration-200">
            <div>
              <label htmlFor="email_notifications" className="font-medium text-gray-900">
                Email Notifications
              </label>
              <p className="text-sm text-gray-500">
                Receive updates about your reported incidents via email
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                name="email_notifications"
                id="email_notifications"
                checked={preferences.email_notifications}
                onChange={handleChange}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors duration-200">
            <div>
              <label htmlFor="sms_notifications" className="font-medium text-gray-900">
                SMS Notifications
              </label>
              <p className="text-sm text-gray-500">
                Receive urgent updates via SMS
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                name="sms_notifications"
                id="sms_notifications"
                checked={preferences.sms_notifications}
                onChange={handleChange}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="form-group">
            <label htmlFor="phone_number" className="form-label">
              Phone Number
            </label>
            <div className="relative">
              <input
                type="tel"
                name="phone_number"
                id="phone_number"
                value={preferences.phone_number}
                onChange={handleChange}
                placeholder="+254 XXX XXX XXX"
                className="input pl-12"
              />
              <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                </svg>
              </div>
            </div>
            <p className="mt-2 text-sm text-gray-500">
              Required for SMS notifications. Format: +254 XXX XXX XXX
            </p>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="btn btn-primary"
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving...
              </span>
            ) : (
              'Save Preferences'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default NotificationPreferences;
