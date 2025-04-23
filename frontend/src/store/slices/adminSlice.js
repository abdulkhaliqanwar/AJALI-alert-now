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
export const fetchAllUsers = createAsyncThunk(
  'admin/fetchUsers',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/admin/users`, setAuthHeader());
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const updateIncidentStatus = createAsyncThunk(
  'admin/updateIncidentStatus',
  async ({ incidentId, status }, { rejectWithValue }) => {
    try {
      const response = await axios.put(
        `${API_URL}/admin/incidents/status/${incidentId}`,
        { status },
        setAuthHeader()
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const updateUserRole = createAsyncThunk(
  'admin/updateUserRole',
  async ({ userId, role }, { rejectWithValue }) => {
    try {
      const response = await axios.put(
        `${API_URL}/admin/users/${userId}/role`,
        { role },
        setAuthHeader()
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const fetchDashboardStats = createAsyncThunk(
  'admin/fetchDashboardStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/admin/dashboard/stats`, setAuthHeader());
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

const initialState = {
  users: [],
  dashboardStats: {
    totalIncidents: 0,
    totalUsers: 0,
    statusStats: {},
    recentIncidents: []
  },
  isLoading: false,
  error: null,
  successMessage: null
};

const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSuccessMessage: (state) => {
      state.successMessage = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch all users
      .addCase(fetchAllUsers.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAllUsers.fulfilled, (state, action) => {
        state.isLoading = false;
        state.users = action.payload;
      })
      .addCase(fetchAllUsers.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.error || 'Failed to fetch users';
      })
      // Update incident status
      .addCase(updateIncidentStatus.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateIncidentStatus.fulfilled, (state, action) => {
        state.isLoading = false;
        state.successMessage = 'Incident status updated successfully';
        // Update the incident in the dashboard stats if it exists there
        state.dashboardStats.recentIncidents = state.dashboardStats.recentIncidents.map(
          incident => incident.id === action.payload.id ? action.payload : incident
        );
      })
      .addCase(updateIncidentStatus.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.error || 'Failed to update incident status';
      })
      // Update user role
      .addCase(updateUserRole.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateUserRole.fulfilled, (state, action) => {
        state.isLoading = false;
        state.users = state.users.map(user =>
          user.id === action.payload.id ? action.payload : user
        );
        state.successMessage = 'User role updated successfully';
      })
      .addCase(updateUserRole.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.error || 'Failed to update user role';
      })
      // Fetch dashboard stats
      .addCase(fetchDashboardStats.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchDashboardStats.fulfilled, (state, action) => {
        state.isLoading = false;
        state.dashboardStats = action.payload;
      })
      .addCase(fetchDashboardStats.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.error || 'Failed to fetch dashboard stats';
      });
  }
});

export const { clearError, clearSuccessMessage } = adminSlice.actions;
export default adminSlice.reducer;
