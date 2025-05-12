import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import AdminUserManagement from '../AdminUserManagement';
import userReducer from '../../../store/slices/userSlice';

// Mock the store
const createMockStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      users: userReducer
    },
    preloadedState: {
      users: {
        users: [],
        isLoading: false,
        error: null,
        ...initialState
      }
    }
  });
};

describe('AdminUserManagement', () => {
  let store;
  const mockUsers = [
    {
      id: 1,
      username: 'user1',
      email: 'user1@test.com',
      role: 'user',
      is_active: true
    },
    {
      id: 2,
      username: 'user2',
      email: 'user2@test.com',
      role: 'admin',
      is_active: true
    },
    {
      id: 3,
      username: 'user3',
      email: 'user3@test.com',
      role: 'user',
      is_active: false
    }
  ];

  beforeEach(() => {
    store = createMockStore({ users: mockUsers });
  });

  it('renders the user management interface', () => {
    render(
      <Provider store={store}>
        <AdminUserManagement />
      </Provider>
    );

    expect(screen.getByPlaceholderText(/search users/i)).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: /role filter/i })).toBeInTheDocument();
    expect(screen.getByRole('table')).toBeInTheDocument();
  });

  it('displays all users in the table', () => {
    render(
      <Provider store={store}>
        <AdminUserManagement />
      </Provider>
    );

    expect(screen.getByText('user1@test.com')).toBeInTheDocument();
    expect(screen.getByText('user2@test.com')).toBeInTheDocument();
    expect(screen.getByText('user3@test.com')).toBeInTheDocument();
  });

  it('filters users by search term', async () => {
    render(
      <Provider store={store}>
        <AdminUserManagement />
      </Provider>
    );

    const searchInput = screen.getByPlaceholderText(/search users/i);
    await userEvent.type(searchInput, 'user1');

    expect(screen.getByText('user1@test.com')).toBeInTheDocument();
    expect(screen.queryByText('user2@test.com')).not.toBeInTheDocument();
    expect(screen.queryByText('user3@test.com')).not.toBeInTheDocument();
  });

  it('filters users by role', async () => {
    render(
      <Provider store={store}>
        <AdminUserManagement />
      </Provider>
    );

    const roleFilter = screen.getByRole('combobox', { name: /role filter/i });
    fireEvent.change(roleFilter, { target: { value: 'admin' } });

    expect(screen.getByText('user2@test.com')).toBeInTheDocument();
    expect(screen.queryByText('user1@test.com')).not.toBeInTheDocument();
    expect(screen.queryByText('user3@test.com')).not.toBeInTheDocument();
  });

  it('updates user role', async () => {
    const mockUpdateRole = vi.fn();
    store = createMockStore({
      users: mockUsers,
      updateUserRole: mockUpdateRole
    });

    render(
      <Provider store={store}>
        <AdminUserManagement />
      </Provider>
    );

    const roleSelect = screen.getAllByRole('combobox')[1]; // First user's role select
    fireEvent.change(roleSelect, { target: { value: 'admin' } });

    await waitFor(() => {
      expect(mockUpdateRole).toHaveBeenCalledWith(1, 'admin');
    });
  });

  it('deletes user', async () => {
    const mockDeleteUser = vi.fn();
    store = createMockStore({
      users: mockUsers,
      deleteUser: mockDeleteUser
    });

    render(
      <Provider store={store}>
        <AdminUserManagement />
      </Provider>
    );

    const deleteButton = screen.getAllByRole('button', { name: /delete/i })[0];
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(mockDeleteUser).toHaveBeenCalledWith(1);
    });
  });

  it('displays loading state', () => {
    store = createMockStore({ isLoading: true });

    render(
      <Provider store={store}>
        <AdminUserManagement />
      </Provider>
    );

    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it('displays error message when users fail to load', () => {
    store = createMockStore({ error: 'Failed to load users' });

    render(
      <Provider store={store}>
        <AdminUserManagement />
      </Provider>
    );

    expect(screen.getByText(/failed to load users/i)).toBeInTheDocument();
  });

  it('shows success message after role update', async () => {
    store = createMockStore({
      users: mockUsers,
      successMessage: 'User role updated successfully'
    });

    render(
      <Provider store={store}>
        <AdminUserManagement />
      </Provider>
    );

    expect(screen.getByText(/user role updated successfully/i)).toBeInTheDocument();
  });

  it('prevents self-deletion', async () => {
    const mockDeleteUser = vi.fn();
    store = createMockStore({
      users: mockUsers,
      deleteUser: mockDeleteUser,
      currentUser: { id: 1 }
    });

    render(
      <Provider store={store}>
        <AdminUserManagement />
      </Provider>
    );

    const deleteButton = screen.getAllByRole('button', { name: /delete/i })[0];
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(mockDeleteUser).not.toHaveBeenCalled();
      expect(screen.getByText(/cannot delete your own account/i)).toBeInTheDocument();
    });
  });
}); 