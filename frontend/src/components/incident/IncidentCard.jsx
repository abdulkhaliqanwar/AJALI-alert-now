import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { format } from 'date-fns';

const IncidentCard = ({ incident }) => {
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
        return 'bg-red-100 text-red-700';
      case 'under investigation':
        return 'bg-gray-100 text-gray-700';
      case 'resolved':
        return 'bg-green-100 text-green-700';
      case 'rejected':
        return 'bg-gray-100 text-gray-500';
      default:
        return 'bg-gray-100 text-gray-500';
    }
  };

  return (
    <div className="bg-white border border-gray-300 rounded-lg p-6 shadow hover:shadow-md transition duration-300">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-semibold text-gray-900">
            {incident.title}
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            Reported {format(new Date(incident.created_at), 'MMM d, yyyy h:mm a')}
          </p>
        </div>
        <div className={`flex items-center space-x-2 px-3 py-1 rounded-full border ${getStatusStyles(incident.status)}`}>
          {getStatusIcon(incident.status)}
          <span className="text-sm font-medium capitalize text-gray-900">{incident.status}</span>
        </div>
      </div>

      <p className="text-gray-900 mb-4 line-clamp-2">
        {incident.description}
      </p>

      {incident.media_url && (
        <div className="mb-4 relative overflow-hidden rounded-lg aspect-video bg-gray-100 border border-gray-300">
          {incident.media_url.match(/\.(jpg|jpeg|png|gif)$/i) ? (
            <img
              src={incident.media_url}
              alt="Incident"
              className="w-full h-full object-cover transition-transform duration-300"
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

      <div className="flex items-center justify-between mt-2">
        <div className="flex items-center space-x-4 text-green-700">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span>
            {incident.location?.latitude?.toFixed(6)}, {incident.location?.longitude?.toFixed(6)}
          </span>
        </div>

        <div className="flex items-center space-x-2">
          {(isOwner || isAdmin) && (
            <Link
              to={`/incidents/${incident.id}/edit`}
              className="px-4 py-2 text-sm text-blue-600 bg-white border border-blue-600 rounded shadow hover:bg-blue-600 hover:text-white transition duration-150"
            >
              Edit
            </Link>
          )}
          <Link
            to={`/incidents/${incident.id}`}
            className="px-4 py-2 text-sm text-green-600 bg-white border border-green-600 rounded shadow hover:bg-green-600 hover:text-white transition duration-150"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
};

export default IncidentCard;
