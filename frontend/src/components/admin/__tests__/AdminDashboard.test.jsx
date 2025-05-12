import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import AdminDashboard from '../AdminDashboard';
import incidentReducer from '../../../store/slices/incidentSlice';
import userReducer from '../../../store/slices/userSlice';

// Mock the store
const createMockStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      incidents: incidentReducer,
      users: userReducer
    },
    preloadedState: {
      incidents: {
        incidents: [],
        isLoading: false,
        error: null,
        ...initialState.incidents
      },
      users: {
        users: [],
        isLoading: false,
        error: null,
        ...initialState.users
      }
    }
  });
};

describe('AdminDashboard', () => {
  let store;
  const mockIncidents = [
    {
      id: 1,
      title: 'Test Incident 1',
      description: 'Test Description 1',
      status: 'reported',
      created_at: '2024-02-20T10:00:00Z'
    },
    {
      id: 2,
      title: 'Test Incident 2',
      description: 'Test Description 2',
      status: 'under_investigation',
      created_at: '2024-02-20T11:00:00Z'
    }
  ];

  const mockUsers = [
    {
      id: 1,
      username: 'user1',
      email: 'user1@test.com',
      role: 'user'
    },
    {
      id: 2,
      username: 'user2',
      email: 'user2@test.com',
      role: 'admin'
    }
  ];

  beforeEach(() => {
    store = createMockStore({
      incidents: { incidents: mockIncidents },
      users: { users: mockUsers }
    });
  });

  it('renders the dashboard with navigation tabs', () => {
    render(
      <Provider store={store}>
        <AdminDashboard />
      </Provider>
    );

    expect(screen.getByRole('tab', { name: /incidents/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /statistics/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /user management/i })).toBeInTheDocument();
  });

  it('displays incidents tab by default', () => {
    render(
      <Provider store={store}>
        <AdminDashboard />
      </Provider>
    );

    expect(screen.getByText('Test Incident 1')).toBeInTheDocument();
    expect(screen.getByText('Test Incident 2')).toBeInTheDocument();
  });

  it('switches to statistics tab when clicked', async () => {
    render(
      <Provider store={store}>
        <AdminDashboard />
      </Provider>
    );

    const statsTab = screen.getByRole('tab', { name: /statistics/i });
    fireEvent.click(statsTab);

    await waitFor(() => {
      expect(screen.getByText(/total incidents/i)).toBeInTheDocument();
      expect(screen.getByText(/incidents by status/i)).toBeInTheDocument();
    });
  });

  it('switches to user management tab when clicked', async () => {
    render(
      <Provider store={store}>
        <AdminDashboard />
      </Provider>
    );

    const usersTab = screen.getByRole('tab', { name: /user management/i });
    fireEvent.click(usersTab);

    await waitFor(() => {
      expect(screen.getByText('user1@test.com')).toBeInTheDocument();
      expect(screen.getByText('user2@test.com')).toBeInTheDocument();
    });
  });

  it('displays loading state', () => {
    store = createMockStore({
      incidents: { isLoading: true }
    });

    render(
      <Provider store={store}>
        <AdminDashboard />
      </Provider>
    );

    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it('displays error message when incidents fail to load', () => {
    store = createMockStore({
      incidents: { error: 'Failed to load incidents' }
    });

    render(
      <Provider store={store}>
        <AdminDashboard />
      </Provider>
    );

    expect(screen.getByText(/failed to load incidents/i)).toBeInTheDocument();
  });

  it('updates incident status when status is changed', async () => {
    const mockUpdateStatus = vi.fn();
    store = createMockStore({
      incidents: {
        incidents: mockIncidents,
        updateIncidentStatus: mockUpdateStatus
      }
    });

    render(
      <Provider store={store}>
        <AdminDashboard />
      </Provider>
    );

    const statusSelect = screen.getAllByRole('combobox')[0];
    fireEvent.change(statusSelect, { target: { value: 'resolved' } });

    await waitFor(() => {
      expect(mockUpdateStatus).toHaveBeenCalledWith(1, 'resolved');
    });
  });

  it('filters incidents by status', async () => {
    render(
      <Provider store={store}>
        <AdminDashboard />
      </Provider>
    );

    const filterSelect = screen.getByRole('combobox', { name: /filter/i });
    fireEvent.change(filterSelect, { target: { value: 'under_investigation' } });

    await waitFor(() => {
      expect(screen.getByText('Test Incident 2')).toBeInTheDocument();
      expect(screen.queryByText('Test Incident 1')).not.toBeInTheDocument();
    });
  });
}); 