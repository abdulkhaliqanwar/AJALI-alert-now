import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUserIncidents } from '../store/slices/incidentSlice';
import IncidentCard from '../components/incident/IncidentCard';
import MapComponent from '../components/map/MapComponent';

const UserDashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector(state => state.auth);
  const { userIncidents, isLoading, error } = useSelector(state => state.incidents);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedStatus, setSelectedStatus] = useState('all');

  useEffect(() => {
    if (!user) {
      navigate('/login', { state: { from: '/dashboard' } });
      return;
    }
    dispatch(fetchUserIncidents());
  }, [dispatch, user, navigate]);

  const filteredIncidents = selectedStatus === 'all'
    ? userIncidents
    : userIncidents.filter(incident => incident.status === selectedStatus);

  const statusCounts = userIncidents.reduce((acc, incident) => {
    acc[incident.status] = (acc[incident.status] || 0) + 1;
    return acc;
  }, {});

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white border border-gray-300 rounded-lg shadow p-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-1">My Dashboard</h1>
            <p className="text-gray-700">
              Welcome back, {user?.username}!
            </p>
          </div>
          <div className="mt-4 md:mt-0">
            <Link
              to="/report-incident"
              className="px-6 py-3 text-lg text-white bg-blue-600 rounded-lg shadow hover:bg-blue-700 transition duration-150"
            >
              Report New Incident
            </Link>
          </div>
        </div>

        {error && (
          <div className="bg-red-100 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white border border-gray-300 rounded p-4 shadow text-center">
            <h3 className="text-sm text-gray-700">Total Reports</h3>
            <p className="mt-1 text-2xl font-bold text-gray-900">{userIncidents.length}</p>
          </div>
          <div className="bg-white border border-gray-300 rounded p-4 shadow text-center">
            <h3 className="text-sm text-yellow-600">Pending</h3>
            <p className="mt-1 text-2xl font-bold text-yellow-600">{statusCounts['reported'] || 0}</p>
          </div>
          <div className="bg-white border border-gray-300 rounded p-4 shadow text-center">
            <h3 className="text-sm text-blue-600">Under Investigation</h3>
            <p className="mt-1 text-2xl font-bold text-blue-600">{statusCounts['under investigation'] || 0}</p>
          </div>
          <div className="bg-white border border-gray-300 rounded p-4 shadow text-center">
            <h3 className="text-sm text-green-600">Resolved</h3>
            <p className="mt-1 text-2xl font-bold text-green-600">{statusCounts['resolved'] || 0}</p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-300 mb-6">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('overview')}
              className={`pb-4 px-1 border-b-2 text-base transition duration-150 ${
                activeTab === 'overview'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-blue-600 hover:border-blue-600'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('map')}
              className={`pb-4 px-1 border-b-2 text-base transition duration-150 ${
                activeTab === 'map'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-blue-600 hover:border-blue-600'
              }`}
            >
              Map View
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="input max-w-xs bg-white border border-blue-600 text-blue-600 focus:ring-blue-600 focus:border-blue-600 rounded"
              >
                <option value="all">All Reports</option>
                <option value="reported">Pending</option>
                <option value="under investigation">Under Investigation</option>
                <option value="resolved">Resolved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            {filteredIncidents.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredIncidents.map(incident => (
                  <IncidentCard
                    key={incident.id}
                    incident={incident}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  No incidents found
                </h3>
                <p className="text-gray-700 mb-6">
                  {selectedStatus === 'all'
                    ? "You haven't reported any incidents yet."
                    : `You don't have any ${selectedStatus} incidents.`}
                </p>
                <Link
                  to="/report-incident"
                  className="px-6 py-3 text-lg text-white bg-blue-600 rounded-lg shadow hover:bg-blue-700 transition duration-150"
                >
                  Report an Incident
                </Link>
              </div>
            )}
          </div>
        )}

        {activeTab === 'map' && (
          <div className="space-y-6">
            <div className="h-[500px] rounded-lg overflow-hidden border border-gray-300 bg-white">
              <MapComponent
                markers={userIncidents.map(incident => ({
                  position: { lat: incident.latitude, lng: incident.longitude },
                  title: incident.title,
                }))}
                readOnly={true}
                zoom={10}
              />
            </div>

            <div className="bg-white border border-gray-300 p-4 rounded-lg mt-4">
              <h3 className="mb-2 text-blue-600">Map Legend</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex items-center space-x-2">
                  <span className="w-3 h-3 rounded-full bg-red-500"></span>
                  <span className="text-sm text-red-500">Reported</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="w-3 h-3 rounded-full bg-blue-600"></span>
                  <span className="text-sm text-blue-600">Under Investigation</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="w-3 h-3 rounded-full bg-green-600"></span>
                  <span className="text-sm text-green-600">Resolved</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="w-3 h-3 rounded-full bg-gray-400"></span>
                  <span className="text-sm text-gray-400">Rejected</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Quick Tips */}
      <div className="bg-white border border-gray-300 rounded-lg shadow p-8">
        <h2 className="mb-4 text-lg font-bold text-gray-900">Quick Tips</h2>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="p-4 bg-white border border-blue-600 rounded-lg">
            <h3 className="mb-2 text-blue-600">Reporting Tips</h3>
            <ul className="space-y-1 text-sm text-blue-600">
              <li>• Be specific with incident details</li>
              <li>• Include clear photos when possible</li>
              <li>• Verify the location accuracy</li>
            </ul>
          </div>
          <div className="p-4 bg-white border border-green-600 rounded-lg">
            <h3 className="mb-2 text-green-600">Status Updates</h3>
            <ul className="space-y-1 text-green-600 text-sm">
              <li>• Check back regularly for updates</li>
              <li>• Enable notifications if available</li>
              <li>• Contact support for urgent matters</li>
            </ul>
          </div>
          <div className="p-4 bg-white border border-red-600 rounded-lg">
            <h3 className="mb-2 text-red-600">Safety First</h3>
            <ul className="space-y-1 text-red-600 text-sm">
              <li>• Report emergencies to authorities first</li>
              <li>• Stay safe while documenting</li>
              <li>• Follow official guidance</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
