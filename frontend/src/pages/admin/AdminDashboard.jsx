import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchDashboardStats, fetchAllUsers, updateUserRole } from '../../store/slices/adminSlice';
import { updateIncidentStatus } from '../../store/slices/adminSlice';
import IncidentCard from '../../components/incident/IncidentCard';
import MapComponent from '../../components/map/MapComponent';

const AdminDashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user: currentUser } = useSelector(state => state.auth);
  const { 
    dashboardStats, 
    users,
    isLoading, 
    error,
    successMessage 
  } = useSelector(state => state.admin);

  const [activeTab, setActiveTab] = useState('overview');
  const [selectedStatus, setSelectedStatus] = useState('all');

  useEffect(() => {
    // Redirect if not admin
    if (!currentUser || currentUser.role !== 'admin') {
      navigate('/');
      return;
    }

    dispatch(fetchDashboardStats());
    dispatch(fetchAllUsers());
  }, [dispatch, currentUser, navigate]);

  const handleStatusChange = async (incidentId, newStatus) => {
    try {
      await dispatch(updateIncidentStatus({ incidentId, status: newStatus })).unwrap();
      dispatch(fetchDashboardStats());
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await dispatch(updateUserRole({ userId, role: newRole })).unwrap();
      dispatch(fetchAllUsers());
    } catch (err) {
      console.error('Failed to update user role:', err);
    }
  };

  const filteredIncidents = selectedStatus === 'all'
    ? dashboardStats.recentIncidents
    : dashboardStats.recentIncidents?.filter(incident => incident.status === selectedStatus);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Admin Dashboard</h1>
        
        {error && (
          <div className="alert alert-error mb-4">
            {error}
          </div>
        )}
        
        {successMessage && (
          <div className="alert alert-success mb-4">
            {successMessage}
          </div>
        )}

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-blue-700">Total Incidents</h3>
            <p className="text-3xl font-bold text-blue-900">{dashboardStats.totalIncidents}</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-green-700">Resolved</h3>
            <p className="text-3xl font-bold text-green-900">
              {dashboardStats.statusStats?.resolved || 0}
            </p>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-yellow-700">Under Investigation</h3>
            <p className="text-3xl font-bold text-yellow-900">
              {dashboardStats.statusStats?.['under investigation'] || 0}
            </p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-purple-700">Total Users</h3>
            <p className="text-3xl font-bold text-purple-900">{dashboardStats.totalUsers}</p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('overview')}
              className={`pb-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'overview'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('incidents')}
              className={`pb-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'incidents'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Incidents
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`pb-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'users'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Users
            </button>
            <button
              onClick={() => setActiveTab('map')}
              className={`pb-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'map'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Map View
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="bg-gray-50 p-6 rounded-lg">
              <h2 className="text-xl font-semibold mb-4">Status Distribution</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(dashboardStats.statusStats || {}).map(([status, count]) => (
                  <div key={status} className="bg-white p-4 rounded-lg shadow-sm">
                    <h3 className="text-sm font-medium text-gray-500 capitalize">{status}</h3>
                    <p className="mt-1 text-2xl font-semibold text-gray-900">{count}</p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
              <div className="space-y-4">
                {dashboardStats.recentIncidents?.slice(0, 5).map(incident => (
                  <IncidentCard
                    key={incident.id}
                    incident={incident}
                    onStatusChange={handleStatusChange}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'incidents' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="input max-w-xs"
              >
                <option value="all">All Statuses</option>
                <option value="reported">Reported</option>
                <option value="under investigation">Under Investigation</option>
                <option value="resolved">Resolved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredIncidents?.map(incident => (
                <IncidentCard
                  key={incident.id}
                  incident={incident}
                  onStatusChange={handleStatusChange}
                />
              ))}
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Username
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Joined
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map(user => (
                  <tr key={user.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{user.username}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={user.role}
                        onChange={(e) => handleRoleChange(user.id, e.target.value)}
                        className="input text-sm py-1"
                        disabled={user.id === currentUser.id}
                      >
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => navigate(`/users/${user.id}`)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'map' && (
          <div className="h-[600px] rounded-lg overflow-hidden">
            <MapComponent
              markers={dashboardStats.recentIncidents?.map(incident => ({
                position: { lat: incident.latitude, lng: incident.longitude },
                title: incident.title,
              }))}
              readOnly={true}
              zoom={10}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
