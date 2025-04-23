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
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Dashboard</h1>
            <p className="mt-1 text-gray-600">
              Welcome back, {user?.username}!
            </p>
          </div>
          <div className="mt-4 md:mt-0">
            <Link
              to="/report-incident"
              className="btn btn-primary"
            >
              Report New Incident
            </Link>
          </div>
        </div>

        {error && (
          <div className="alert alert-error mb-6">
            {error}
          </div>
        )}

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-blue-700">Total Reports</h3>
            <p className="mt-1 text-2xl font-semibold text-blue-900">
              {userIncidents.length}
            </p>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-yellow-700">Pending</h3>
            <p className="mt-1 text-2xl font-semibold text-yellow-900">
              {statusCounts['reported'] || 0}
            </p>
          </div>
          <div className="bg-indigo-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-indigo-700">Under Investigation</h3>
            <p className="mt-1 text-2xl font-semibold text-indigo-900">
              {statusCounts['under investigation'] || 0}
            </p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-green-700">Resolved</h3>
            <p className="mt-1 text-2xl font-semibold text-green-900">
              {statusCounts['resolved'] || 0}
            </p>
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
            <div className="flex justify-between items-center">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="input max-w-xs"
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
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No incidents found
                </h3>
                <p className="text-gray-500 mb-6">
                  {selectedStatus === 'all'
                    ? "You haven't reported any incidents yet."
                    : `You don't have any ${selectedStatus} incidents.`}
                </p>
                <Link
                  to="/report-incident"
                  className="btn btn-primary"
                >
                  Report an Incident
                </Link>
              </div>
            )}
          </div>
        )}

        {activeTab === 'map' && (
          <div className="space-y-6">
            <div className="h-[500px] rounded-lg overflow-hidden">
              <MapComponent
                markers={userIncidents.map(incident => ({
                  position: { lat: incident.latitude, lng: incident.longitude },
                  title: incident.title,
                }))}
                readOnly={true}
                zoom={10}
              />
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-2">Map Legend</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex items-center space-x-2">
                  <span className="w-3 h-3 rounded-full bg-red-500"></span>
                  <span className="text-sm text-gray-600">Reported</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="w-3 h-3 rounded-full bg-yellow-500"></span>
                  <span className="text-sm text-gray-600">Under Investigation</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="w-3 h-3 rounded-full bg-green-500"></span>
                  <span className="text-sm text-gray-600">Resolved</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="w-3 h-3 rounded-full bg-gray-500"></span>
                  <span className="text-sm text-gray-600">Rejected</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Quick Tips */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-semibold mb-4">Quick Tips</h2>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="p-4 bg-blue-50 rounded-lg">
            <h3 className="font-medium text-blue-900 mb-2">Reporting Tips</h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Be specific with incident details</li>
              <li>• Include clear photos when possible</li>
              <li>• Verify the location accuracy</li>
            </ul>
          </div>
          <div className="p-4 bg-green-50 rounded-lg">
            <h3 className="font-medium text-green-900 mb-2">Status Updates</h3>
            <ul className="text-sm text-green-700 space-y-1">
              <li>• Check back regularly for updates</li>
              <li>• Enable notifications if available</li>
              <li>• Contact support for urgent matters</li>
            </ul>
          </div>
          <div className="p-4 bg-purple-50 rounded-lg">
            <h3 className="font-medium text-purple-900 mb-2">Safety First</h3>
            <ul className="text-sm text-purple-700 space-y-1">
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
