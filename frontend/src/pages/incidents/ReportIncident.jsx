import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { clearSuccessMessage } from '../../store/slices/incidentSlice';
import IncidentForm from '../../components/incident/IncidentForm';

const ReportIncident = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector(state => state.auth);
  const { successMessage } = useSelector(state => state.incidents);

  useEffect(() => {
    // Clear successMessage on mount to avoid stale state
    dispatch(clearSuccessMessage());
  }, [dispatch]);

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/report-incident' } });
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    // Redirect to incidents list after successful submission
    if (successMessage) {
      navigate('/incidents');
    }
  }, [successMessage, navigate]);

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Report an Incident</h1>
          <p className="mt-2 text-gray-600">
            Please provide accurate information about the incident. Include as much detail as possible
            to help authorities respond effectively.
          </p>
        </div>

        <div className="space-y-4">
          <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">
                  Important Information
                </h3>
                <div className="mt-2 text-sm text-blue-700">
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Provide a clear and descriptive title</li>
                    <li>Include the exact location of the incident</li>
                    <li>Upload relevant photos or videos if available</li>
                    <li>Be as detailed as possible in your description</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <IncidentForm />
        </div>
      </div>

      <div className="mt-6 bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-semibold mb-4">What happens next?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 border border-gray-200 rounded-lg">
            <div className="text-blue-600 font-semibold mb-2">1. Verification</div>
            <p className="text-sm text-gray-600">
              Your report will be reviewed and verified by our team.
            </p>
          </div>
          <div className="p-4 border border-gray-200 rounded-lg">
            <div className="text-blue-600 font-semibold mb-2">2. Investigation</div>
            <p className="text-sm text-gray-600">
              Relevant authorities will be notified and begin their investigation.
            </p>
          </div>
          <div className="p-4 border border-gray-200 rounded-lg">
            <div className="text-blue-600 font-semibold mb-2">3. Updates</div>
            <p className="text-sm text-gray-600">
              You'll receive updates as the status of your report changes.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportIncident;
