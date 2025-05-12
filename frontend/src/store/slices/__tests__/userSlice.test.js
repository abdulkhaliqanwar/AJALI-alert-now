import { configureStore } from '@reduxjs/toolkit';
import userReducer, {
  fetchUsers,
  updateUserRole,
  deleteUser,
  updateUserStatus
} from '../userSlice';

// Mock axios
import axios from 'axios';
jest.mock('axios');

describe('userSlice', () => {
  let store;

  beforeEach(() => {
    store = configureStore({
      reducer: {
        users: userReducer
      }
    });
    jest.clearAllMocks();
  });

  const mockUsers = [
    {
      id: 1,
      username: 'user1',
      email: 'user1@example.com',
      role: 'user',
      is_active: true
    },
    {
      id: 2,
      username: 'user2',
      email: 'user2@example.com',
      role: 'admin',
      is_active: true
    }
  ];

  it('should handle initial state', () => {
    expect(store.getState().users).toEqual({
      users: [],
      isLoading: false,
      error: null,
      successMessage: null
    });
  });

  it('should handle fetchUsers.pending', () => {
    store.dispatch(fetchUsers.pending());
    expect(store.getState().users).toEqual({
      users: [],
      isLoading: true,
      error: null,
      successMessage: null
    });
  });

  it('should handle fetchUsers.fulfilled', () => {
    store.dispatch(fetchUsers.fulfilled(mockUsers));
    expect(store.getState().users).toEqual({
      users: mockUsers,
      isLoading: false,
      error: null,
      successMessage: null
    });
  });

  it('should handle fetchUsers.rejected', () => {
    const error = 'Failed to fetch users';
    store.dispatch(fetchUsers.rejected(error));
    expect(store.getState().users).toEqual({
      users: [],
      isLoading: false,
      error: error,
      successMessage: null
    });
  });

  it('should handle updateUserRole.fulfilled', () => {
    // First add users
    store.dispatch(fetchUsers.fulfilled(mockUsers));

    // Then update role
    const updatedUser = {
      ...mockUsers[0],
      role: 'admin'
    };

    store.dispatch(updateUserRole.fulfilled(updatedUser));
    expect(store.getState().users.users).toContainEqual(updatedUser);
    expect(store.getState().users.successMessage).toBe('User role updated successfully');
  });

  it('should handle deleteUser.fulfilled', () => {
    // First add users
    store.dispatch(fetchUsers.fulfilled(mockUsers));

    // Then delete one
    store.dispatch(deleteUser.fulfilled(1));
    expect(store.getState().users.users).not.toContainEqual(mockUsers[0]);
    expect(store.getState().users.successMessage).toBe('User deleted successfully');
  });

  it('should handle updateUserStatus.fulfilled', () => {
    // First add users
    store.dispatch(fetchUsers.fulfilled(mockUsers));

    // Then update status
    const updatedUser = {
      ...mockUsers[0],
      is_active: false
    };

    store.dispatch(updateUserStatus.fulfilled(updatedUser));
    expect(store.getState().users.users).toContainEqual(updatedUser);
    expect(store.getState().users.successMessage).toBe('User status updated successfully');
  });

  it('should make API call when fetching users', async () => {
    axios.get.mockResolvedValueOnce({ data: mockUsers });

    await store.dispatch(fetchUsers());
    expect(axios.get).toHaveBeenCalledWith('/api/users');
  });

  it('should make API call when updating user role', async () => {
    const roleUpdate = {
      id: 1,
      role: 'admin'
    };

    axios.patch.mockResolvedValueOnce({ data: { ...mockUsers[0], role: 'admin' } });

    await store.dispatch(updateUserRole(roleUpdate));
    expect(axios.patch).toHaveBeenCalledWith(`/api/users/${roleUpdate.id}/role`, { role: 'admin' });
  });

  it('should make API call when deleting user', async () => {
    axios.delete.mockResolvedValueOnce({ data: { message: 'User deleted' } });

    await store.dispatch(deleteUser(1));
    expect(axios.delete).toHaveBeenCalledWith('/api/users/1');
  });

  it('should make API call when updating user status', async () => {
    const statusUpdate = {
      id: 1,
      is_active: false
    };

    axios.patch.mockResolvedValueOnce({ data: { ...mockUsers[0], is_active: false } });

    await store.dispatch(updateUserStatus(statusUpdate));
    expect(axios.patch).toHaveBeenCalledWith(`/api/users/${statusUpdate.id}/status`, { is_active: false });
  });

  it('should handle API errors', async () => {
    const error = 'API Error';
    axios.get.mockRejectedValueOnce(new Error(error));

    await store.dispatch(fetchUsers());
    expect(store.getState().users.error).toBe(error);
  });

  it('should clear success message', () => {
    // First set a success message
    store.dispatch(updateUserRole.fulfilled({ ...mockUsers[0], role: 'admin' }));
    expect(store.getState().users.successMessage).not.toBeNull();

    // Then clear it
    store.dispatch({ type: 'users/clearSuccessMessage' });
    expect(store.getState().users.successMessage).toBeNull();
  });

  it('should clear error message', () => {
    // First set an error
    store.dispatch(fetchUsers.rejected('Error'));
    expect(store.getState().users.error).not.toBeNull();

    // Then clear it
    store.dispatch({ type: 'users/clearError' });
    expect(store.getState().users.error).toBeNull();
  });

  it('should handle self-deletion prevention', async () => {
    // First add users
    store.dispatch(fetchUsers.fulfilled(mockUsers));

    // Try to delete own account
    const error = 'Cannot delete your own account';
    axios.delete.mockRejectedValueOnce(new Error(error));

    await store.dispatch(deleteUser(1));
    expect(store.getState().users.error).toBe(error);
  });

  it('should handle self-role-update prevention', async () => {
    // First add users
    store.dispatch(fetchUsers.fulfilled(mockUsers));

    // Try to update own role
    const error = 'Cannot update your own role';
    axios.patch.mockRejectedValueOnce(new Error(error));

    await store.dispatch(updateUserRole({ id: 1, role: 'admin' }));
    expect(store.getState().users.error).toBe(error);
  });
}); 