import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

// Helper function to set auth header
const setAuthHeader = () => {
  const token = localStorage.getItem('token');
  return {
    headers: { Authorization: `Bearer ${token}` }
  };
};

// Async thunks
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
      return rejectWithValue(error.response.data);
    }
  }
);

export const fetchUserIncidents = createAsyncThunk(
  'incidents/fetchUserIncidents',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/incidents/user/incidents`, setAuthHeader());
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const createIncident = createAsyncThunk(
  'incidents/create',
  async (incidentData, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      Object.keys(incidentData).forEach(key => {
        if (key === 'media' && incidentData[key]) {
          formData.append('media', incidentData[key]);
        } else {
          formData.append(key, incidentData[key]);
        }
      });

      const response = await axios.post(
        `${API_URL}/incidents`,
        formData,
        {
          ...setAuthHeader(),
          headers: {
            ...setAuthHeader().headers,
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const updateIncident = createAsyncThunk(
  'incidents/update',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      Object.keys(data).forEach(key => {
        if (key === 'media' && data[key]) {
          formData.append('media', data[key]);
        } else {
          formData.append(key, data[key]);
        }
      });

      const response = await axios.put(
        `${API_URL}/incidents/${id}`,
        formData,
        {
          ...setAuthHeader(),
          headers: {
            ...setAuthHeader().headers,
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
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
      return rejectWithValue(error.response.data);
    }
  }
);

const initialState = {
  incidents: [],
  userIncidents: [],
  currentIncident: null,
  isLoading: false,
  error: null,
  successMessage: null
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
      // Fetch all incidents
      .addCase(fetchIncidents.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchIncidents.fulfilled, (state, action) => {
        state.isLoading = false;
        state.incidents = action.payload;
      })
      .addCase(fetchIncidents.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.error || 'Failed to fetch incidents';
      })
      // Fetch user incidents
      .addCase(fetchUserIncidents.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUserIncidents.fulfilled, (state, action) => {
        state.isLoading = false;
        state.userIncidents = action.payload;
      })
      .addCase(fetchUserIncidents.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.error || 'Failed to fetch user incidents';
      })
      // Create incident
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
      // Update incident
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
      // Delete incident
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
      });
  }
});

export const { clearError, clearSuccessMessage, setCurrentIncident } = incidentSlice.actions;
export default incidentSlice.reducer;
