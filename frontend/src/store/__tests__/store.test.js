import { store } from '../store';
import authReducer from '../slices/authSlice';
import incidentReducer from '../slices/incidentSlice';
import userReducer from '../slices/userSlice';

describe('Redux Store', () => {
  it('should have the correct initial state', () => {
    const state = store.getState();
    
    expect(state).toHaveProperty('auth');
    expect(state).toHaveProperty('incidents');
    expect(state).toHaveProperty('users');
  });

  it('should have the correct reducers', () => {
    const state = store.getState();
    
    // Test auth reducer
    expect(state.auth).toEqual({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null
    });

    // Test incidents reducer
    expect(state.incidents).toEqual({
      incidents: [],
      currentIncident: null,
      isLoading: false,
      error: null,
      successMessage: null
    });

    // Test users reducer
    expect(state.users).toEqual({
      users: [],
      isLoading: false,
      error: null,
      successMessage: null
    });
  });

  it('should handle state updates correctly', () => {
    // Test auth state update
    store.dispatch({
      type: 'auth/login/fulfilled',
      payload: {
        user: { id: 1, username: 'testuser' },
        token: 'test-token'
      }
    });

    expect(store.getState().auth).toEqual({
      user: { id: 1, username: 'testuser' },
      token: 'test-token',
      isAuthenticated: true,
      isLoading: false,
      error: null
    });

    // Test incidents state update
    store.dispatch({
      type: 'incidents/fetchIncidents/fulfilled',
      payload: [{ id: 1, title: 'Test Incident' }]
    });

    expect(store.getState().incidents).toEqual({
      incidents: [{ id: 1, title: 'Test Incident' }],
      currentIncident: null,
      isLoading: false,
      error: null,
      successMessage: null
    });

    // Test users state update
    store.dispatch({
      type: 'users/fetchUsers/fulfilled',
      payload: [{ id: 1, username: 'testuser', role: 'user' }]
    });

    expect(store.getState().users).toEqual({
      users: [{ id: 1, username: 'testuser', role: 'user' }],
      isLoading: false,
      error: null,
      successMessage: null
    });
  });

  it('should handle error states correctly', () => {
    // Test auth error
    store.dispatch({
      type: 'auth/login/rejected',
      error: { message: 'Invalid credentials' }
    });

    expect(store.getState().auth.error).toBe('Invalid credentials');

    // Test incidents error
    store.dispatch({
      type: 'incidents/fetchIncidents/rejected',
      error: { message: 'Failed to fetch incidents' }
    });

    expect(store.getState().incidents.error).toBe('Failed to fetch incidents');

    // Test users error
    store.dispatch({
      type: 'users/fetchUsers/rejected',
      error: { message: 'Failed to fetch users' }
    });

    expect(store.getState().users.error).toBe('Failed to fetch users');
  });

  it('should handle loading states correctly', () => {
    // Test auth loading
    store.dispatch({
      type: 'auth/login/pending'
    });

    expect(store.getState().auth.isLoading).toBe(true);

    // Test incidents loading
    store.dispatch({
      type: 'incidents/fetchIncidents/pending'
    });

    expect(store.getState().incidents.isLoading).toBe(true);

    // Test users loading
    store.dispatch({
      type: 'users/fetchUsers/pending'
    });

    expect(store.getState().users.isLoading).toBe(true);
  });

  it('should handle success messages correctly', () => {
    // Test incidents success message
    store.dispatch({
      type: 'incidents/createIncident/fulfilled',
      payload: { id: 1, title: 'Test Incident' }
    });

    expect(store.getState().incidents.successMessage).toBe('Incident created successfully');

    // Test users success message
    store.dispatch({
      type: 'users/updateUserRole/fulfilled',
      payload: { id: 1, role: 'admin' }
    });

    expect(store.getState().users.successMessage).toBe('User role updated successfully');
  });

  it('should handle clearing messages correctly', () => {
    // First set some messages
    store.dispatch({
      type: 'incidents/createIncident/fulfilled',
      payload: { id: 1, title: 'Test Incident' }
    });

    store.dispatch({
      type: 'users/updateUserRole/fulfilled',
      payload: { id: 1, role: 'admin' }
    });

    // Then clear them
    store.dispatch({ type: 'incidents/clearSuccessMessage' });
    store.dispatch({ type: 'users/clearSuccessMessage' });

    expect(store.getState().incidents.successMessage).toBeNull();
    expect(store.getState().users.successMessage).toBeNull();
  });
}); 