import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchIncidents } from '../store/slices/incidentSlice';
import MapComponent from '../components/map/MapComponent';
import IncidentCard from '../components/incident/IncidentCard';

const Home = () => {
  const dispatch = useDispatch();
  const { incidents, isLoading } = useSelector(state => state.incidents);
  const { isAuthenticated } = useSelector(state => state.auth);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchIncidents());
    }
  }, [dispatch, isAuthenticated]);

  // incidents is now an object with pagination metadata and incidents array
  const incidentsArray = incidents?.incidents || [];

  // Get the most recent incidents (limit to 3)
  const recentIncidents = incidentsArray.slice(0, 3);

  // Calculate the center point for all incidents, or use Nairobi as default
  const mapCenter = incidentsArray.length > 0
    ? {
        lat: incidentsArray.reduce((sum, inc) => sum + inc.latitude, 0) / incidentsArray.length,
        lng: incidentsArray.reduce((sum, inc) => sum + inc.longitude, 0) / incidentsArray.length,
      }
    : { lat: -1.2921, lng: 36.8219 }; // Nairobi coordinates

  if (!isAuthenticated) {
    return (
      <div className="space-y-12">
        {/* Hero Section */}
        <section className="text-center py-12 px-4 sm:px-6 lg:px-8 bg-white rounded-lg shadow-sm">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
            Welcome to Ajali!
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Your platform for reporting and tracking emergency incidents across Kenya.
            Help make your community safer by reporting incidents in real-time.
          </p>
          <div className="flex justify-center gap-4">
            <Link to="/register" className="btn btn-primary text-lg px-8 py-3">
              Get Started
            </Link>
            <Link to="/login" className="btn btn-secondary text-lg px-8 py-3">
              Sign In
            </Link>
          </div>
        </section>

        {/* Features Section */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-xl font-bold mb-4">Real-time Reporting</h3>
            <p className="text-gray-600">
              Report incidents as they happen with our easy-to-use interface.
              Include photos, videos, and precise location data.
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-xl font-bold mb-4">Location Tracking</h3>
            <p className="text-gray-600">
              Use our interactive map to view incident locations and track
              updates in your area.
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-xl font-bold mb-4">Status Updates</h3>
            <p className="text-gray-600">
              Stay informed with real-time status updates on reported incidents
              from authorities.
            </p>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="text-center py-12 px-4 sm:px-6 lg:px-8 bg-white rounded-lg shadow-sm">
        <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
          Welcome to Ajali!
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
          Your platform for reporting and tracking emergency incidents across Kenya.
          Help make your community safer by reporting incidents in real-time.
        </p>
        <div className="flex justify-center gap-4">
          <Link to="/report-incident" className="btn btn-primary text-lg px-8 py-3">
            Report an Incident
          </Link>
        </div>
      </section>

      {/* Map Section */}
      <section className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-2xl font-bold mb-6">Incident Map</h2>
        <div className="h-[500px] rounded-lg overflow-hidden">
          <MapComponent
            center={mapCenter}
            markers={incidentsArray.map(incident => ({
              position: { lat: incident.latitude, lng: incident.longitude },
              title: incident.title,
            }))}
            readOnly={true}
            zoom={10}
          />
        </div>
      </section>

      {/* Recent Incidents Section */}
      <section className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Recent Incidents</h2>
          <Link to="/incidents" className="text-blue-600 hover:text-blue-800">
            View all incidents →
          </Link>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : recentIncidents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentIncidents.map(incident => (
              <IncidentCard
                key={incident.id}
                incident={incident}
                showActions={false}
              />
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500 py-12">
            No incidents reported yet.
          </p>
        )}
      </section>

      {/* Features Section */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-xl font-bold mb-4">Real-time Reporting</h3>
          <p className="text-gray-600">
            Report incidents as they happen with our easy-to-use interface.
            Include photos, videos, and precise location data.
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-xl font-bold mb-4">Location Tracking</h3>
          <p className="text-gray-600">
            Use our interactive map to view incident locations and track
            updates in your area.
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-xl font-bold mb-4">Status Updates</h3>
          <p className="text-gray-600">
            Stay informed with real-time status updates on reported incidents
            from authorities.
          </p>
        </div>
      </section>
    </div>
  );
};

export default Home;
