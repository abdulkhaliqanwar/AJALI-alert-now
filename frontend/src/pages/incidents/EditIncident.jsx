import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { fetchIncidents } from '../../store/slices/incidentSlice';
import IncidentForm from '../../components/incident/IncidentForm';

const EditIncident = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const { incidents, isLoading, error } = useSelector(state => state.incidents);
  const { user } = useSelector(state => state.auth);
  
  const incident = incidents.find(inc => inc.id === parseInt(id));

  useEffect(() => {
    if (incidents.length === 0) {
      dispatch(fetchIncidents());
    }
  }, [dispatch, incidents.length]);

  useEffect(() => {
    if (!incident && !isLoading) {
      dispatch(fetchIncidents({ page: 1, per_page: 100 }));
    }
  }, [incident, isLoading, dispatch]);

  useEffect(() => {
    // Redirect if not authenticated
    if (!user) {
      navigate('/login', { state: { from: `/incidents/${id}/edit` } });
      return;
    }

    // Redirect if incident doesn't exist
    if (!isLoading && !incident) {
      navigate('/incidents');
      return;
    }

    // Redirect if user is not the owner or admin
    if (incident && user.id !== incident.user_id && user.role !== 'admin') {
      navigate(`/incidents/${id}`);
      return;
    }
  }, [incident, user, id, navigate, isLoading]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="alert alert-error">
            {error}
          </div>
          <button
            onClick={() => navigate(-1)}
            className="btn btn-secondary mt-4"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!incident) {
    return null; // Redirect will handle this case
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Edit Incident Report</h1>
          <p className="mt-2 text-gray-600">
            Update the incident information below. All fields marked with an asterisk (*) are required.
          </p>
        </div>

        <div className="space-y-6">
          {/* Status Badge */}
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Current Status:</span>
            <span className={`status-badge status-${incident.status.replace(' ', '-')}`}>
              {incident.status}
            </span>
          </div>

          {/* Edit Form */}
          <IncidentForm incident={incident} isEditing={true} />
        </div>
      </div>

      {/* Guidelines */}
      <div className="mt-6 bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-semibold mb-4">Editing Guidelines</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 border border-gray-200 rounded-lg">
            <div className="text-blue-600 font-semibold mb-2">What to Update</div>
            <ul className="text-sm text-gray-600 space-y-2">
              <li>• Correct any errors in the incident description</li>
              <li>• Update the location if initially marked incorrectly</li>
              <li>• Add or update media files if needed</li>
              <li>• Provide additional relevant details</li>
            </ul>
          </div>
          <div className="p-4 border border-gray-200 rounded-lg">
            <div className="text-blue-600 font-semibold mb-2">Important Notes</div>
            <ul className="text-sm text-gray-600 space-y-2">
              <li>• All updates are logged and tracked</li>
              <li>• Status changes can only be made by administrators</li>
              <li>• Original report timestamp will be preserved</li>
              <li>• Update timestamp will reflect latest changes</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditIncident;
