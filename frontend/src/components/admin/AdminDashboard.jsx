import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchIncidents, updateIncidentStatus } from '../../store/slices/incidentSlice';
import AdminIncidentList from './AdminIncidentList';
import AdminStats from './AdminStats';
import AdminUserManagement from './AdminUserManagement';

const AdminDashboard = () => {
  const dispatch = useDispatch();
  const { incidents, isLoading, error } = useSelector(state => state.incidents);
  const [activeTab, setActiveTab] = useState('incidents');

  useEffect(() => {
    dispatch(fetchIncidents());
  }, [dispatch]);

  const handleStatusUpdate = async (incidentId, newStatus) => {
    try {
      await dispatch(updateIncidentStatus({ id: incidentId, status: newStatus })).unwrap();
      dispatch(fetchIncidents()); // Refresh the list
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

      {/* Navigation Tabs */}
      <div className="flex space-x-4 mb-6">
        <button
          className={`px-4 py-2 rounded-lg ${
            activeTab === 'incidents' ? 'bg-blue-600 text-white' : 'bg-gray-200'
          }`}
          onClick={() => setActiveTab('incidents')}
        >
          Incidents
        </button>
        <button
          className={`px-4 py-2 rounded-lg ${
            activeTab === 'stats' ? 'bg-blue-600 text-white' : 'bg-gray-200'
          }`}
          onClick={() => setActiveTab('stats')}
        >
          Statistics
        </button>
        <button
          className={`px-4 py-2 rounded-lg ${
            activeTab === 'users' ? 'bg-blue-600 text-white' : 'bg-gray-200'
          }`}
          onClick={() => setActiveTab('users')}
        >
          User Management
        </button>
      </div>

      {/* Content Area */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <>
            {activeTab === 'incidents' && (
              <AdminIncidentList
                incidents={incidents}
                onStatusUpdate={handleStatusUpdate}
              />
            )}
            {activeTab === 'stats' && <AdminStats incidents={incidents} />}
            {activeTab === 'users' && <AdminUserManagement />}
          </>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard; 