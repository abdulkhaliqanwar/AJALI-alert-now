import { configureStore } from '@reduxjs/toolkit';
import incidentReducer, {
  fetchIncidents,
  createIncident,
  updateIncident,
  deleteIncident,
  updateIncidentStatus
} from '../incidentSlice';

// Mock axios
import axios from 'axios';
jest.mock('axios');

describe('incidentSlice', () => {
  let store;

  beforeEach(() => {
    store = configureStore({
      reducer: {
        incidents: incidentReducer
      }
    });
    jest.clearAllMocks();
  });

  const mockIncidents = [
    {
      id: 1,
      title: 'Test Incident 1',
      description: 'Test Description 1',
      status: 'reported'
    },
    {
      id: 2,
      title: 'Test Incident 2',
      description: 'Test Description 2',
      status: 'under_investigation'
    }
  ];

  it('should handle initial state', () => {
    expect(store.getState().incidents).toEqual({
      incidents: [],
      isLoading: false,
      error: null
    });
  });

  it('should handle fetchIncidents.pending', () => {
    store.dispatch(fetchIncidents.pending());
    expect(store.getState().incidents).toEqual({
      incidents: [],
      isLoading: true,
      error: null
    });
  });

  it('should handle fetchIncidents.fulfilled', () => {
    store.dispatch(fetchIncidents.fulfilled(mockIncidents));
    expect(store.getState().incidents).toEqual({
      incidents: mockIncidents,
      isLoading: false,
      error: null
    });
  });

  it('should handle fetchIncidents.rejected', () => {
    const error = 'Failed to fetch incidents';
    store.dispatch(fetchIncidents.rejected(error));
    expect(store.getState().incidents).toEqual({
      incidents: [],
      isLoading: false,
      error: error
    });
  });

  it('should handle createIncident.fulfilled', () => {
    const newIncident = {
      id: 3,
      title: 'New Incident',
      description: 'New Description',
      status: 'reported'
    };

    store.dispatch(createIncident.fulfilled(newIncident));
    expect(store.getState().incidents.incidents).toContainEqual(newIncident);
  });

  it('should handle updateIncident.fulfilled', () => {
    // First add an incident
    store.dispatch(fetchIncidents.fulfilled(mockIncidents));

    // Then update it
    const updatedIncident = {
      ...mockIncidents[0],
      title: 'Updated Title'
    };

    store.dispatch(updateIncident.fulfilled(updatedIncident));
    expect(store.getState().incidents.incidents).toContainEqual(updatedIncident);
  });

  it('should handle deleteIncident.fulfilled', () => {
    // First add incidents
    store.dispatch(fetchIncidents.fulfilled(mockIncidents));

    // Then delete one
    store.dispatch(deleteIncident.fulfilled(1));
    expect(store.getState().incidents.incidents).not.toContainEqual(mockIncidents[0]);
  });

  it('should handle updateIncidentStatus.fulfilled', () => {
    // First add an incident
    store.dispatch(fetchIncidents.fulfilled(mockIncidents));

    // Then update its status
    const updatedIncident = {
      ...mockIncidents[0],
      status: 'resolved'
    };

    store.dispatch(updateIncidentStatus.fulfilled(updatedIncident));
    expect(store.getState().incidents.incidents).toContainEqual(updatedIncident);
  });

  it('should make API call when fetching incidents', async () => {
    axios.get.mockResolvedValueOnce({ data: mockIncidents });

    await store.dispatch(fetchIncidents());
    expect(axios.get).toHaveBeenCalledWith('/api/incidents');
  });

  it('should make API call when creating incident', async () => {
    const newIncident = {
      title: 'New Incident',
      description: 'New Description',
      location: 'New Location'
    };

    axios.post.mockResolvedValueOnce({ data: { ...newIncident, id: 3 } });

    await store.dispatch(createIncident(newIncident));
    expect(axios.post).toHaveBeenCalledWith('/api/incidents', newIncident);
  });

  it('should make API call when updating incident', async () => {
    const updatedIncident = {
      id: 1,
      title: 'Updated Title',
      description: 'Updated Description'
    };

    axios.patch.mockResolvedValueOnce({ data: updatedIncident });

    await store.dispatch(updateIncident(updatedIncident));
    expect(axios.patch).toHaveBeenCalledWith(`/api/incidents/${updatedIncident.id}`, updatedIncident);
  });

  it('should make API call when deleting incident', async () => {
    axios.delete.mockResolvedValueOnce({ data: { message: 'Incident deleted' } });

    await store.dispatch(deleteIncident(1));
    expect(axios.delete).toHaveBeenCalledWith('/api/incidents/1');
  });

  it('should make API call when updating incident status', async () => {
    const statusUpdate = {
      id: 1,
      status: 'resolved'
    };

    axios.patch.mockResolvedValueOnce({ data: { ...mockIncidents[0], status: 'resolved' } });

    await store.dispatch(updateIncidentStatus(statusUpdate));
    expect(axios.patch).toHaveBeenCalledWith(`/api/incidents/${statusUpdate.id}/status`, { status: 'resolved' });
  });

  it('should handle API errors', async () => {
    const error = 'API Error';
    axios.get.mockRejectedValueOnce(new Error(error));

    await store.dispatch(fetchIncidents());
    expect(store.getState().incidents.error).toBe(error);
  });
}); 