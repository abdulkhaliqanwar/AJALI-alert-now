import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { format } from 'date-fns';

const IncidentCard = ({ incident, onStatusChange }) => {
  const { user } = useSelector(state => state.auth);
  const isOwner = user?.id === incident.user_id;
  const isAdmin = user?.role === 'admin';

  const getStatusIcon = (status) => {
    switch (status) {
      case 'reported':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        );
      case 'under investigation':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        );
      case 'resolved':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        );
      case 'rejected':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        );
      default:
        return null;
    }
  };

  const getStatusStyles = (status) => {
    switch (status) {
      case 'reported':
        return 'bg-kenya-red bg-opacity-10 text-kenya-red';
      case 'under investigation':
        return 'bg-kenya-black bg-opacity-10 text-kenya-black';
      case 'resolved':
        return 'bg-kenya-green bg-opacity-10 text-kenya-green';
      case 'rejected':
        return 'bg-gray-100 text-gray-500';
      default:
        return 'bg-gray-100 text-gray-500';
    }
  };

  const handleStatusChange = (e) => {
    if (onStatusChange) {
      onStatusChange(incident.id, e.target.value);
    }
  };

  return (
    <div className="bg-kenya-white border border-gray-200 rounded-lg p-6 group hover:shadow-lg transition-all duration-300">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-semibold text-kenya-black group-hover:text-kenya-red transition-colors duration-200">
            {incident.title}
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            Reported {format(new Date(incident.created_at), 'MMM d, yyyy h:mm a')}
          </p>
        </div>
        <div>
          {isAdmin ? (
            <select
              value={incident.status}
              onChange={handleStatusChange}
              className={`text-sm font-medium capitalize rounded-md border border-gray-300 px-3 py-1 focus:outline-none focus:ring-2 focus:ring-kenya-red focus:ring-opacity-50 ${getStatusStyles(incident.status)}`}
            >
              <option value="reported">Reported</option>
              <option value="under investigation">Under Investigation</option>
              <option value="resolved">Resolved</option>
              <option value="rejected">Rejected</option>
            </select>
          ) : (
            <div className={`flex items-center space-x-2 px-3 py-1 rounded-full ${getStatusStyles(incident.status)}`}>
              {getStatusIcon(incident.status)}
              <span className="text-sm font-medium capitalize">{incident.status}</span>
            </div>
          )}
          </div>
        </div>

        <p className="text-gray-600 mb-4 line-clamp-2">
          {incident.description}
        </p>

      {incident.media_url && (
        <div className="mb-4 relative overflow-hidden rounded-lg aspect-video bg-gray-100">
          {incident.media_url.match(/\.(jpg|jpeg|png|gif)$/i) ? (
            <img
              src={incident.media_url}
              alt="Incident"
              className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-300"
            />
          ) : incident.media_url.match(/\.(mp4|webm)$/i) ? (
            <video
              src={incident.media_url}
              controls
              className="w-full h-full object-cover"
            />
          ) : null}
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center text-sm text-gray-500">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>
              {incident.location?.latitude.toFixed(6)}, {incident.location?.longitude.toFixed(6)}
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {(isOwner || isAdmin) && (
            <Link
              to={`/incidents/${incident.id}/edit`}
              className="px-4 py-2 text-sm font-medium text-kenya-black bg-kenya-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-kenya-red"
            >
              Edit
            </Link>
          )}
          <Link
            to={`/incidents/${incident.id}`}
            className="px-4 py-2 text-sm font-medium text-kenya-white bg-kenya-red rounded-md hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-kenya-red"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
};

export default IncidentCard;
