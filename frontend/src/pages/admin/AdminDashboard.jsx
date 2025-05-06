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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-kenya-red"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-kenya-white rounded-lg shadow-sm p-6 border-t-4 border-kenya-red">
        <h1 className="text-3xl font-bold text-kenya-black mb-4">Admin Dashboard</h1>
        
        {error && (
          <div className="bg-kenya-red bg-opacity-10 text-kenya-red px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}
        
        {successMessage && (
          <div className="bg-kenya-green bg-opacity-10 text-kenya-green px-4 py-3 rounded-lg mb-4">
            {successMessage}
          </div>
        )}

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-kenya-black bg-opacity-5 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-kenya-black">Total Incidents</h3>
            <p className="text-3xl font-bold text-kenya-red">{dashboardStats.totalIncidents}</p>
          </div>
          <div className="bg-kenya-green bg-opacity-5 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-kenya-green">Resolved</h3>
            <p className="text-3xl font-bold text-kenya-green">
              {dashboardStats.statusStats?.resolved || 0}
            </p>
          </div>
          <div className="bg-kenya-red bg-opacity-5 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-kenya-red">Under Investigation</h3>
            <p className="text-3xl font-bold text-kenya-red">
              {dashboardStats.statusStats?.['under investigation'] || 0}
            </p>
          </div>
          <div className="bg-kenya-black bg-opacity-5 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-kenya-black">Total Users</h3>
            <p className="text-3xl font-bold text-kenya-black">{dashboardStats.totalUsers}</p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            {['overview', 'incidents', 'users', 'map'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-4 px-1 border-b-2 font-medium text-sm capitalize ${
                  activeTab === tab
                    ? 'border-kenya-red text-kenya-red'
                    : 'border-transparent text-gray-500 hover:text-kenya-black hover:border-kenya-black'
                }`}
              >
                {tab}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="bg-kenya-white p-6 rounded-lg border border-gray-200">
              <h2 className="text-xl font-semibold mb-4 text-kenya-black">Status Distribution</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(dashboardStats.statusStats || {}).map(([status, count]) => (
                  <div key={status} className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                    <h3 className="text-sm font-medium text-gray-500 capitalize">{status}</h3>
                    <p className="mt-1 text-2xl font-semibold text-kenya-black">{count}</p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-4 text-kenya-black">Recent Activity</h2>
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
                className="border-gray-300 rounded-md shadow-sm focus:border-kenya-red focus:ring focus:ring-kenya-red focus:ring-opacity-50"
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
              <thead className="bg-kenya-black bg-opacity-5">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-kenya-black uppercase tracking-wider">
                    Username
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-kenya-black uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-kenya-black uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-kenya-black uppercase tracking-wider">
                    Joined
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-kenya-black uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map(user => (
                  <tr key={user.id} className="hover:bg-kenya-black hover:bg-opacity-5">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-kenya-black">{user.username}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={user.role}
                        onChange={(e) => handleRoleChange(user.id, e.target.value)}
                        className="border-gray-300 rounded-md shadow-sm focus:border-kenya-red focus:ring focus:ring-kenya-red focus:ring-opacity-50"
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
                        className="text-kenya-red hover:text-kenya-black"
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
          <div className="h-[600px] rounded-lg overflow-hidden border border-gray-200">
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
