import {
  getToken,
  setToken,
  removeToken,
  isAuthenticated,
  isAdmin,
  hasPermission,
  getCurrentUser,
  logout
} from '../auth';

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn()
};
global.localStorage = localStorageMock;

// Mock store
const mockStore = {
  getState: jest.fn(),
  dispatch: jest.fn()
};

jest.mock('../../store', () => ({
  store: {
    getState: () => mockStore.getState(),
    dispatch: (action) => mockStore.dispatch(action)
  }
}));

describe('Authentication Utilities', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  describe('Token Management', () => {
    it('should get token from localStorage', () => {
      const token = 'test-token';
      localStorage.getItem.mockReturnValue(token);

      expect(getToken()).toBe(token);
      expect(localStorage.getItem).toHaveBeenCalledWith('token');
    });

    it('should set token in localStorage', () => {
      const token = 'test-token';
      setToken(token);

      expect(localStorage.setItem).toHaveBeenCalledWith('token', token);
    });

    it('should remove token from localStorage', () => {
      removeToken();

      expect(localStorage.removeItem).toHaveBeenCalledWith('token');
    });
  });

  describe('Authentication Status', () => {
    it('should check if user is authenticated', () => {
      // Test when token exists
      localStorage.getItem.mockReturnValue('test-token');
      expect(isAuthenticated()).toBe(true);

      // Test when token doesn't exist
      localStorage.getItem.mockReturnValue(null);
      expect(isAuthenticated()).toBe(false);
    });

    it('should check if user is admin', () => {
      // Test when user is admin
      mockStore.getState.mockReturnValue({
        auth: {
          user: { role: 'admin' }
        }
      });
      expect(isAdmin()).toBe(true);

      // Test when user is not admin
      mockStore.getState.mockReturnValue({
        auth: {
          user: { role: 'user' }
        }
      });
      expect(isAdmin()).toBe(false);

      // Test when user is not authenticated
      mockStore.getState.mockReturnValue({
        auth: {
          user: null
        }
      });
      expect(isAdmin()).toBe(false);
    });

    it('should check if user has permission', () => {
      // Test when user has permission
      mockStore.getState.mockReturnValue({
        auth: {
          user: { role: 'admin' }
        }
      });
      expect(hasPermission('admin')).toBe(true);

      // Test when user doesn't have permission
      mockStore.getState.mockReturnValue({
        auth: {
          user: { role: 'user' }
        }
      });
      expect(hasPermission('admin')).toBe(false);

      // Test when user is not authenticated
      mockStore.getState.mockReturnValue({
        auth: {
          user: null
        }
      });
      expect(hasPermission('admin')).toBe(false);
    });
  });

  describe('User Management', () => {
    it('should get current user', () => {
      const mockUser = { id: 1, username: 'testuser' };
      mockStore.getState.mockReturnValue({
        auth: {
          user: mockUser
        }
      });

      expect(getCurrentUser()).toEqual(mockUser);
    });

    it('should handle logout', () => {
      logout();

      expect(localStorage.removeItem).toHaveBeenCalledWith('token');
      expect(mockStore.dispatch).toHaveBeenCalledWith({ type: 'auth/logout' });
    });
  });

  describe('Error Handling', () => {
    it('should handle missing token', () => {
      localStorage.getItem.mockReturnValue(null);
      expect(getToken()).toBeNull();
    });

    it('should handle invalid token', () => {
      localStorage.getItem.mockReturnValue('invalid-token');
      expect(isAuthenticated()).toBe(true); // Still returns true as we only check existence
    });

    it('should handle missing user data', () => {
      mockStore.getState.mockReturnValue({
        auth: {
          user: null
        }
      });

      expect(getCurrentUser()).toBeNull();
      expect(isAdmin()).toBe(false);
      expect(hasPermission('admin')).toBe(false);
    });
  });

  describe('Integration', () => {
    it('should handle complete authentication flow', () => {
      // Set token
      const token = 'test-token';
      setToken(token);
      expect(localStorage.setItem).toHaveBeenCalledWith('token', token);

      // Check authentication
      localStorage.getItem.mockReturnValue(token);
      expect(isAuthenticated()).toBe(true);

      // Set user data
      const mockUser = { id: 1, username: 'testuser', role: 'admin' };
      mockStore.getState.mockReturnValue({
        auth: {
          user: mockUser
        }
      });

      // Check permissions
      expect(isAdmin()).toBe(true);
      expect(hasPermission('admin')).toBe(true);

      // Logout
      logout();
      expect(localStorage.removeItem).toHaveBeenCalledWith('token');
      expect(mockStore.dispatch).toHaveBeenCalledWith({ type: 'auth/logout' });

      // Verify logout
      localStorage.getItem.mockReturnValue(null);
      expect(isAuthenticated()).toBe(false);
    });
  });
}); 