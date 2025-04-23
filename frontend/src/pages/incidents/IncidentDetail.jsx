import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { fetchIncidents, deleteIncident } from '../../store/slices/incidentSlice';
import { updateIncidentStatus } from '../../store/slices/adminSlice';
import MapComponent from '../../components/map/MapComponent';
import { format } from 'date-fns';

const IncidentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const { incidents, isLoading } = useSelector(state => state.incidents);
  const { user } = useSelector(state => state.auth);
  
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [incident, setIncident] = useState(null);

  useEffect(() => {
    if (incidents.length === 0) {
      dispatch(fetchIncidents());
    }
  }, [dispatch, incidents.length]);

  useEffect(() => {
    const foundIncident = incidents.find(inc => inc.id === parseInt(id));
    setIncident(foundIncident);
  }, [incidents, id]);

  const handleStatusChange = async (newStatus) => {
    try {
      await dispatch(updateIncidentStatus({ incidentId: incident.id, status: newStatus })).unwrap();
      dispatch(fetchIncidents());
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  const handleDelete = async () => {
    try {
      await dispatch(deleteIncident(incident.id)).unwrap();
      navigate('/incidents');
    } catch (err) {
      console.error('Failed to delete incident:', err);
    }
  };

  const getStatusBadgeClass = (status) => {
    const baseClasses = 'status-badge';
    switch (status) {
      case 'reported':
        return `${baseClasses} status-reported`;
      case 'under investigation':
        return `${baseClasses} status-under-investigation`;
      case 'resolved':
        return `${baseClasses} status-resolved`;
      case 'rejected':
        return `${baseClasses} status-rejected`;
      default:
        return baseClasses;
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!incident) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Incident Not Found</h2>
        <p className="text-gray-600 mb-6">The incident you're looking for doesn't exist or has been removed.</p>
        <Link to="/incidents" className="btn btn-primary">
          View All Incidents
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{incident.title}</h1>
            <div className="mt-2 space-x-4">
              <span className={getStatusBadgeClass(incident.status)}>
                {incident.status}
              </span>
              <span className="text-gray-500">
                Reported {format(new Date(incident.created_at), 'MMM d, yyyy h:mm a')}
              </span>
            </div>
          </div>
          {(user?.id === incident.user_id || user?.role === 'admin') && (
            <div className="flex space-x-2">
              <Link
                to={`/incidents/${incident.id}/edit`}
                className="btn btn-secondary"
              >
                Edit
              </Link>
              <button
                onClick={() => setShowDeleteModal(true)}
                className="btn btn-danger"
              >
                Delete
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4">Description</h2>
            <p className="text-gray-700 whitespace-pre-wrap">{incident.description}</p>
          </div>

          {/* Media */}
          {incident.media_url && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-4">Media</h2>
              <div className="rounded-lg overflow-hidden">
                {incident.media_url.endsWith('.mp4') ? (
                  <video
                    src={incident.media_url}
                    controls
                    className="w-full"
                  />
                ) : (
                  <img
                    src={incident.media_url}
                    alt="Incident"
                    className="w-full"
                  />
                )}
              </div>
            </div>
          )}

          {/* Map */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4">Location</h2>
            {incident.latitude && incident.longitude ? (
              <>
                <div className="h-[400px] rounded-lg overflow-hidden">
                  <MapComponent
                    markerPosition={{
                      lat: parseFloat(incident.latitude),
                      lng: parseFloat(incident.longitude)
                    }}
                    readOnly={true}
                    zoom={15}
                  />
                </div>
                <p className="mt-2 text-sm text-gray-500">
                  Coordinates: {parseFloat(incident.latitude).toFixed(6)}, {parseFloat(incident.longitude).toFixed(6)}
                </p>
                <a 
                  href={`https://www.openstreetmap.org/?mlat=${incident.latitude}&mlon=${incident.longitude}#map=15/${incident.latitude}/${incident.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:underline mt-2 inline-block"
                >
                  View on OpenStreetMap
                </a>
              </>
            ) : (
              <div className="h-[400px] flex items-center justify-center bg-gray-100 rounded-lg">
                <p className="text-gray-500">Location data not available</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Status Management (Admin Only) */}
          {user?.role === 'admin' && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-4">Manage Status</h2>
              <select
                value={incident.status}
                onChange={(e) => handleStatusChange(e.target.value)}
                className="input w-full"
              >
                <option value="reported">Reported</option>
                <option value="under investigation">Under Investigation</option>
                <option value="resolved">Resolved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          )}

          {/* Reporter Info */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4">Reporter Information</h2>
            <p className="text-gray-700">
              Reported by: <span className="font-medium">{incident.reporter?.username}</span>
            </p>
          </div>

          {/* Timeline */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4">Timeline</h2>
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <div className="h-2 w-2 rounded-full bg-blue-600 mt-2"></div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium">Incident Reported</p>
                  <p className="text-xs text-gray-500">
                    {format(new Date(incident.created_at), 'MMM d, yyyy h:mm a')}
                  </p>
                </div>
              </div>
              {incident.updated_at !== incident.created_at && (
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <div className="h-2 w-2 rounded-full bg-blue-600 mt-2"></div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium">Last Updated</p>
                    <p className="text-xs text-gray-500">
                      {format(new Date(incident.updated_at), 'MMM d, yyyy h:mm a')}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">Confirm Delete</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this incident? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="btn btn-danger"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default IncidentDetail;
