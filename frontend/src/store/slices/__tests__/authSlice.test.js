import { configureStore } from '@reduxjs/toolkit';
import authReducer, {
  login,
  register,
  logout,
  getCurrentUser
} from '../authSlice';

// Mock axios
import axios from 'axios';
jest.mock('axios');

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn()
};
global.localStorage = localStorageMock;

describe('authSlice', () => {
  let store;

  beforeEach(() => {
    store = configureStore({
      reducer: {
        auth: authReducer
      }
    });
    jest.clearAllMocks();
  });

  const mockUser = {
    id: 1,
    username: 'testuser',
    email: 'test@example.com',
    role: 'user'
  };

  const mockToken = 'mock-jwt-token';

  it('should handle initial state', () => {
    expect(store.getState().auth).toEqual({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null
    });
  });

  it('should handle login.pending', () => {
    store.dispatch(login.pending());
    expect(store.getState().auth).toEqual({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: true,
      error: null
    });
  });

  it('should handle login.fulfilled', () => {
    const response = {
      user: mockUser,
      token: mockToken
    };

    store.dispatch(login.fulfilled(response));
    expect(store.getState().auth).toEqual({
      user: mockUser,
      token: mockToken,
      isAuthenticated: true,
      isLoading: false,
      error: null
    });
    expect(localStorage.setItem).toHaveBeenCalledWith('token', mockToken);
  });

  it('should handle login.rejected', () => {
    const error = 'Invalid credentials';
    store.dispatch(login.rejected(error));
    expect(store.getState().auth).toEqual({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: error
    });
  });

  it('should handle register.fulfilled', () => {
    const response = {
      user: mockUser,
      token: mockToken
    };

    store.dispatch(register.fulfilled(response));
    expect(store.getState().auth).toEqual({
      user: mockUser,
      token: mockToken,
      isAuthenticated: true,
      isLoading: false,
      error: null
    });
    expect(localStorage.setItem).toHaveBeenCalledWith('token', mockToken);
  });

  it('should handle logout', () => {
    // First set authenticated state
    store.dispatch(login.fulfilled({ user: mockUser, token: mockToken }));

    // Then logout
    store.dispatch(logout());
    expect(store.getState().auth).toEqual({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null
    });
    expect(localStorage.removeItem).toHaveBeenCalledWith('token');
  });

  it('should handle getCurrentUser.fulfilled', () => {
    store.dispatch(getCurrentUser.fulfilled(mockUser));
    expect(store.getState().auth).toEqual({
      user: mockUser,
      token: null,
      isAuthenticated: true,
      isLoading: false,
      error: null
    });
  });

  it('should make API call when logging in', async () => {
    const credentials = {
      email: 'test@example.com',
      password: 'password123'
    };

    axios.post.mockResolvedValueOnce({ data: { user: mockUser, token: mockToken } });

    await store.dispatch(login(credentials));
    expect(axios.post).toHaveBeenCalledWith('/api/auth/login', credentials);
  });

  it('should make API call when registering', async () => {
    const userData = {
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123'
    };

    axios.post.mockResolvedValueOnce({ data: { user: mockUser, token: mockToken } });

    await store.dispatch(register(userData));
    expect(axios.post).toHaveBeenCalledWith('/api/auth/register', userData);
  });

  it('should make API call when getting current user', async () => {
    axios.get.mockResolvedValueOnce({ data: mockUser });

    await store.dispatch(getCurrentUser());
    expect(axios.get).toHaveBeenCalledWith('/api/auth/me');
  });

  it('should handle API errors during login', async () => {
    const error = 'Invalid credentials';
    axios.post.mockRejectedValueOnce(new Error(error));

    await store.dispatch(login({ email: 'test@example.com', password: 'wrong' }));
    expect(store.getState().auth.error).toBe(error);
  });

  it('should handle API errors during registration', async () => {
    const error = 'Email already exists';
    axios.post.mockRejectedValueOnce(new Error(error));

    await store.dispatch(register({ username: 'testuser', email: 'test@example.com', password: 'password123' }));
    expect(store.getState().auth.error).toBe(error);
  });

  it('should handle token expiration', async () => {
    // First set authenticated state
    store.dispatch(login.fulfilled({ user: mockUser, token: mockToken }));

    // Then simulate token expiration
    axios.get.mockRejectedValueOnce(new Error('Token expired'));

    await store.dispatch(getCurrentUser());
    expect(store.getState().auth).toEqual({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: 'Token expired'
    });
    expect(localStorage.removeItem).toHaveBeenCalledWith('token');
  });

  it('should handle network errors', async () => {
    const error = 'Network Error';
    axios.post.mockRejectedValueOnce(new Error(error));

    await store.dispatch(login({ email: 'test@example.com', password: 'password123' }));
    expect(store.getState().auth.error).toBe(error);
  });
}); 