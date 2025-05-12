import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const setAuthHeader = () => {
  const token = localStorage.getItem('token');
  return {
    headers: { Authorization: `Bearer ${token}` }
  };
};

// Async Thunks
export const fetchIncidents = createAsyncThunk(
  'incidents/fetchAll',
  async ({ page = 1, per_page = 10 } = {}, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/incidents`, {
        ...setAuthHeader(),
        params: { page, per_page }
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { error: 'Failed to fetch incidents' });
    }
  }
);

export const fetchUserIncidents = createAsyncThunk(
  'incidents/fetchUserIncidents',
  async ({ page = 1, per_page = 10 } = {}, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/incidents`, {
        ...setAuthHeader(),
        params: { page, per_page }
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { error: 'Failed to fetch user incidents' });
    }
  }
);

export const createIncident = createAsyncThunk(
  'incidents/create',
  async (formData, { rejectWithValue }) => {
    try {
      // Ensure FormData is properly constructed
      const submitData = new FormData();
      for (const [key, value] of formData.entries()) {
        if (value !== null && value !== undefined && value !== '') {
          submitData.append(key, value);
        }
      }

      const response = await axios.post(`${API_URL}/incidents`, submitData, {
        headers: {
          ...setAuthHeader().headers,
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Incident upload error:', error);
      return rejectWithValue(error.response?.data || { error: 'Failed to create incident' });
    }
  }
);

export const updateIncident = createAsyncThunk(
  'incidents/update',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      // Ensure FormData is properly constructed
      const submitData = new FormData();
      for (const [key, value] of data.entries()) {
        if (value !== null && value !== undefined && value !== '') {
          submitData.append(key, value);
        }
      }

      const response = await axios.put(`${API_URL}/incidents/${id}`, submitData, {
        headers: {
          ...setAuthHeader().headers,
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Incident update error:', error);
      return rejectWithValue(error.response?.data || { error: 'Failed to update incident' });
    }
  }
);

export const deleteIncident = createAsyncThunk(
  'incidents/delete',
  async (id, { rejectWithValue }) => {
    try {
      await axios.delete(`${API_URL}/incidents/${id}`, setAuthHeader());
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data || { error: 'Failed to delete incident' });
    }
  }
);

export const updateIncidentStatus = createAsyncThunk(
  'incidents/updateStatus',
  async ({ id, status }, { rejectWithValue }) => {
    try {
      const response = await axios.patch(
        `${API_URL}/incidents/${id}/status`,
        { status },
        {
          headers: {
            ...setAuthHeader().headers,
            'Content-Type': 'application/json',
          }
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { error: 'Failed to update status' });
    }
  }
);

const initialState = {
  incidents: [],
  userIncidents: [],
  currentIncident: null,
  isLoading: false,
  error: null,
  successMessage: null,
  pagination: {
    total: 0,
    page: 1,
    perPage: 10,
    totalPages: 1
  }
};

const incidentSlice = createSlice({
  name: 'incidents',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSuccessMessage: (state) => {
      state.successMessage = null;
    },
    setCurrentIncident: (state, action) => {
      state.currentIncident = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchIncidents.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchIncidents.fulfilled, (state, action) => {
        state.isLoading = false;
        state.incidents = action.payload.incidents || [];
        state.pagination = {
          total: action.payload.total || 0,
          page: action.payload.page || 1,
          perPage: action.payload.per_page || 10,
          totalPages: action.payload.pages || 1
        };
      })
      .addCase(fetchIncidents.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.error || 'Failed to fetch incidents';
      })

      .addCase(fetchUserIncidents.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUserIncidents.fulfilled, (state, action) => {
        state.isLoading = false;
        state.userIncidents = action.payload.incidents || [];
        state.pagination = {
          total: action.payload.total || 0,
          page: action.payload.page || 1,
          perPage: action.payload.per_page || 10,
          totalPages: action.payload.pages || 1
        };
      })
      .addCase(fetchUserIncidents.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.error || 'Failed to fetch user incidents';
      })

      .addCase(createIncident.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createIncident.fulfilled, (state, action) => {
        state.isLoading = false;
        state.incidents.unshift(action.payload);
        state.userIncidents.unshift(action.payload);
        state.successMessage = 'Incident reported successfully';
      })
      .addCase(createIncident.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.error || 'Failed to create incident';
      })

      .addCase(updateIncident.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateIncident.fulfilled, (state, action) => {
        state.isLoading = false;
        state.incidents = state.incidents.map(incident =>
          incident.id === action.payload.id ? action.payload : incident
        );
        state.userIncidents = state.userIncidents.map(incident =>
          incident.id === action.payload.id ? action.payload : incident
        );
        state.successMessage = 'Incident updated successfully';
      })
      .addCase(updateIncident.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.error || 'Failed to update incident';
      })

      .addCase(deleteIncident.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteIncident.fulfilled, (state, action) => {
        state.isLoading = false;
        state.incidents = state.incidents.filter(incident => incident.id !== action.payload);
        state.userIncidents = state.userIncidents.filter(incident => incident.id !== action.payload);
        state.successMessage = 'Incident deleted successfully';
      })
      .addCase(deleteIncident.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.error || 'Failed to delete incident';
      })

      .addCase(updateIncidentStatus.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateIncidentStatus.fulfilled, (state, action) => {
        state.isLoading = false;
        state.incidents = state.incidents.map(incident =>
          incident.id === action.payload.id ? action.payload : incident
        );
        state.userIncidents = state.userIncidents.map(incident =>
          incident.id === action.payload.id ? action.payload : incident
        );
        state.successMessage = 'Incident status updated';
      })
      .addCase(updateIncidentStatus.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.error || 'Failed to update incident status';
      });
  }
});

export const { clearError, clearSuccessMessage, setCurrentIncident } = incidentSlice.actions;
export default incidentSlice.reducer;
