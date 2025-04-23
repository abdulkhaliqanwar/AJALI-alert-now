import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { format } from 'date-fns';

const IncidentCard = ({ incident, onStatusChange, showActions = true }) => {
  const { user } = useSelector(state => state.auth);
  const isAdmin = user?.role === 'admin';
  const isOwner = user?.id === incident.user_id;

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

  const handleStatusChange = (e) => {
    e.preventDefault();
    onStatusChange(incident.id, e.target.value);
  };

  return (
    <div className="card hover:shadow-lg transition-shadow duration-200">
      {/* Media Preview */}
      {incident.media_url && (
        <div className="relative h-48 mb-4 overflow-hidden rounded-md">
          {incident.media_url.endsWith('.mp4') ? (
            <video
              src={incident.media_url}
              className="w-full h-full object-cover"
              controls
            />
          ) : (
            <img
              src={incident.media_url}
              alt={incident.title}
              className="w-full h-full object-cover"
            />
          )}
        </div>
      )}

      {/* Content */}
      <div>
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-xl font-semibold">
            <Link to={`/incidents/${incident.id}`} className="hover:text-blue-600">
              {incident.title}
            </Link>
          </h3>
          <span className={getStatusBadgeClass(incident.status)}>
            {incident.status}
          </span>
        </div>

        <p className="text-gray-600 mb-4 line-clamp-2">
          {incident.description}
        </p>

        <div className="flex flex-wrap gap-2 mb-4">
          <span className="text-sm text-gray-500">
            Reported: {format(new Date(incident.created_at), 'MMM d, yyyy h:mm a')}
          </span>
          {incident.updated_at !== incident.created_at && (
            <span className="text-sm text-gray-500">
              • Updated: {format(new Date(incident.updated_at), 'MMM d, yyyy h:mm a')}
            </span>
          )}
        </div>

        {/* Location */}
        <div className="text-sm text-gray-600 mb-4">
          <span className="font-medium">Location: </span>
          {incident.location?.latitude !== undefined && incident.location?.longitude !== undefined ? (
            `${incident.location.latitude.toFixed(6)}, ${incident.location.longitude.toFixed(6)}`
          ) : (
            'Location not available'
          )}
        </div>

        {/* Actions */}
        {showActions && (
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
            <div className="flex gap-2">
              {(isOwner || isAdmin) && (
                <Link
                  to={`/incidents/${incident.id}/edit`}
                  className="btn btn-secondary text-sm"
                >
                  Edit
                </Link>
              )}
              <Link
                to={`/incidents/${incident.id}`}
                className="btn btn-primary text-sm"
              >
                View Details
              </Link>
            </div>

            {isAdmin && (
              <select
                value={incident.status}
                onChange={handleStatusChange}
                className="input text-sm py-1"
              >
                <option value="reported">Reported</option>
                <option value="under investigation">Under Investigation</option>
                <option value="resolved">Resolved</option>
                <option value="rejected">Rejected</option>
              </select>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default IncidentCard;
