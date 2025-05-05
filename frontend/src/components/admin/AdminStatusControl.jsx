import React from 'react';

/**
 * A reusable component for admin users to update incident status
 * 
 * @param {Object} incident - The incident object
 * @param {Function} onStatusChange - Callback function when status changes (receives incidentId and newStatus)
 * @param {Boolean} isLoading - Whether the status update is in progress
 */
const AdminStatusControl = ({ 
  incident, 
  onStatusChange, 
  isLoading = false 
}) => {
  const handleChange = (e) => {
    e.preventDefault();
    onStatusChange(incident.id, e.target.value);
  };

  return (
    <div className="relative">
      <select
        value={incident.status}
        onChange={handleChange}
        className="input w-full"
        disabled={isLoading}
      >
        <option value="reported">Reported</option>
        <option value="under investigation">Under Investigation</option>
        <option value="resolved">Resolved</option>
        <option value="rejected">Rejected</option>
      </select>
      
      {isLoading && (
        <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
        </div>
      )}
    </div>
  );
};

export default AdminStatusControl;