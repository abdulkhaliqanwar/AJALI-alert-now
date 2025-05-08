import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchIncidents } from '../../store/slices/incidentSlice';
import { updateIncidentStatus } from '../../store/slices/adminSlice';
import IncidentCard from '../../components/incident/IncidentCard';
import MapComponent from '../../components/map/MapComponent';
import { useLocation } from 'react-router-dom';

const IncidentsList = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const { incidents, isLoading, error, totalIncidents, currentPage, totalPages, perPage } = useSelector(state => state.incidents);
  const { user } = useSelector(state => state.auth);

  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'map'
  const [filters, setFilters] = useState({
    status: '',
    searchTerm: '',
    sortBy: 'newest'
  });

  useEffect(() => {
    if (user) {
      dispatch(fetchIncidents({ page: currentPage, per_page: perPage }));
    }
  }, [dispatch, user, currentPage, perPage]);

  useEffect(() => {
    if (location.state?.refresh) {
      dispatch(fetchIncidents({ page: currentPage, per_page: perPage }));
      // Clear the refresh flag in location state
      window.history.replaceState({}, document.title);
    }
  }, [location.state, dispatch, currentPage, perPage]);

  const handleStatusChange = async (incidentId, newStatus) => {
    if (user?.role === 'admin') {
      try {
        await dispatch(updateIncidentStatus({ incidentId, status: newStatus })).unwrap();
        // Refresh incidents after status update
        dispatch(fetchIncidents({ page: currentPage, per_page: perPage }));
      } catch (err) {
        console.error('Failed to update status:', err);
      }
    }
  };

  const filteredIncidents = incidents.filter(incident => {
    const matchesStatus = !filters.status || incident.status === filters.status;
    const matchesSearch = !filters.searchTerm || 
      incident.title.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
      incident.description.toLowerCase().includes(filters.searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const sortedIncidents = [...filteredIncidents].sort((a, b) => {
    switch (filters.sortBy) {
      case 'newest':
        return new Date(b.created_at) - new Date(a.created_at);
      case 'oldest':
        return new Date(a.created_at) - new Date(b.created_at);
      default:
        return 0;
    }
  });

  // Pagination handlers
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      dispatch(fetchIncidents({ page: newPage, per_page: perPage }));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Incident Reports</h1>
        <div className="flex space-x-2">
          <button
            onClick={() => setViewMode('grid')}
            className={`btn ${viewMode === 'grid' ? 'btn-primary' : 'btn-secondary'}`}
          >
            Grid View
          </button>
          <button
            onClick={() => setViewMode('map')}
            className={`btn ${viewMode === 'map' ? 'btn-primary' : 'btn-secondary'}`}
          >
            Map View
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm space-y-4 sm:space-y-0 sm:flex sm:items-center sm:space-x-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search incidents..."
            className="input"
            value={filters.searchTerm}
            onChange={(e) => setFilters(prev => ({ ...prev, searchTerm: e.target.value }))}
          />
        </div>
        <div className="flex space-x-4">
          <select
            className="input"
            value={filters.status}
            onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
          >
            <option value="">All Statuses</option>
            <option value="reported">Reported</option>
            <option value="under investigation">Under Investigation</option>
            <option value="resolved">Resolved</option>
            <option value="rejected">Rejected</option>
          </select>
          <select
            className="input"
            value={filters.sortBy}
            onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value }))}
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="alert alert-error">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      ) : viewMode === 'grid' ? (
        sortedIncidents.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedIncidents.map(incident => (
                <IncidentCard
                  key={incident.id}
                  incident={incident}
                  onStatusChange={handleStatusChange}
                />
              ))}
            </div>
            {/* Pagination Controls */}
            <div className="flex justify-center space-x-4 mt-6">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="btn btn-secondary"
              >
                Previous
              </button>
              <span className="flex items-center">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="btn btn-secondary"
              >
                Next
              </button>
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500">No incidents found matching your criteria.</p>
          </div>
        )
      ) : (
        <div className="h-[600px] bg-white rounded-lg shadow-sm overflow-hidden">
          <MapComponent
            markers={sortedIncidents.map(incident => ({
              position: { lat: incident.latitude, lng: incident.longitude },
              title: incident.title,
            }))}
            readOnly={true}
            zoom={10}
          />
        </div>
      )}
    </div>
  );
};

export default IncidentsList;
