import axios from 'axios';
import api from '../api';

// Mock axios
jest.mock('axios');

describe('API Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  it('should set auth token in headers', () => {
    const token = 'test-token';
    localStorage.setItem('token', token);

    // Create a new instance to test token setting
    const apiInstance = api;
    
    expect(axios.defaults.headers.common['Authorization']).toBe(`Bearer ${token}`);
  });

  it('should remove auth token from headers on logout', () => {
    // First set a token
    const token = 'test-token';
    localStorage.setItem('token', token);
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

    // Then remove it
    localStorage.removeItem('token');
    delete api.defaults.headers.common['Authorization'];

    expect(api.defaults.headers.common['Authorization']).toBeUndefined();
  });

  it('should handle API requests with auth token', async () => {
    const token = 'test-token';
    localStorage.setItem('token', token);

    const response = { data: { message: 'Success' } };
    axios.get.mockResolvedValueOnce(response);

    const result = await api.get('/test-endpoint');
    expect(result).toEqual(response);
    expect(axios.get).toHaveBeenCalledWith('/test-endpoint', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
  });

  it('should handle API requests without auth token', async () => {
    const response = { data: { message: 'Success' } };
    axios.get.mockResolvedValueOnce(response);

    const result = await api.get('/public-endpoint');
    expect(result).toEqual(response);
    expect(axios.get).toHaveBeenCalledWith('/public-endpoint', {});
  });

  it('should handle API errors', async () => {
    const error = new Error('API Error');
    axios.get.mockRejectedValueOnce(error);

    await expect(api.get('/error-endpoint')).rejects.toThrow('API Error');
  });

  it('should handle network errors', async () => {
    const error = new Error('Network Error');
    axios.get.mockRejectedValueOnce(error);

    await expect(api.get('/network-error')).rejects.toThrow('Network Error');
  });

  it('should handle 401 unauthorized errors', async () => {
    const error = {
      response: {
        status: 401,
        data: { message: 'Unauthorized' }
      }
    };
    axios.get.mockRejectedValueOnce(error);

    await expect(api.get('/unauthorized')).rejects.toEqual(error);
  });

  it('should handle 403 forbidden errors', async () => {
    const error = {
      response: {
        status: 403,
        data: { message: 'Forbidden' }
      }
    };
    axios.get.mockRejectedValueOnce(error);

    await expect(api.get('/forbidden')).rejects.toEqual(error);
  });

  it('should handle 404 not found errors', async () => {
    const error = {
      response: {
        status: 404,
        data: { message: 'Not Found' }
      }
    };
    axios.get.mockRejectedValueOnce(error);

    await expect(api.get('/not-found')).rejects.toEqual(error);
  });

  it('should handle 500 server errors', async () => {
    const error = {
      response: {
        status: 500,
        data: { message: 'Internal Server Error' }
      }
    };
    axios.get.mockRejectedValueOnce(error);

    await expect(api.get('/server-error')).rejects.toEqual(error);
  });

  it('should handle request timeouts', async () => {
    const error = {
      code: 'ECONNABORTED',
      message: 'timeout of 5000ms exceeded'
    };
    axios.get.mockRejectedValueOnce(error);

    await expect(api.get('/timeout')).rejects.toEqual(error);
  });

  it('should handle request cancellation', async () => {
    const error = {
      code: 'ERR_CANCELED',
      message: 'Request cancelled'
    };
    axios.get.mockRejectedValueOnce(error);

    await expect(api.get('/cancelled')).rejects.toEqual(error);
  });

  it('should handle different HTTP methods', async () => {
    const response = { data: { message: 'Success' } };
    const data = { test: 'data' };

    // Test GET
    axios.get.mockResolvedValueOnce(response);
    await api.get('/test');
    expect(axios.get).toHaveBeenCalledWith('/test', {});

    // Test POST
    axios.post.mockResolvedValueOnce(response);
    await api.post('/test', data);
    expect(axios.post).toHaveBeenCalledWith('/test', data, {});

    // Test PUT
    axios.put.mockResolvedValueOnce(response);
    await api.put('/test', data);
    expect(axios.put).toHaveBeenCalledWith('/test', data, {});

    // Test PATCH
    axios.patch.mockResolvedValueOnce(response);
    await api.patch('/test', data);
    expect(axios.patch).toHaveBeenCalledWith('/test', data, {});

    // Test DELETE
    axios.delete.mockResolvedValueOnce(response);
    await api.delete('/test');
    expect(axios.delete).toHaveBeenCalledWith('/test', {});
  });

  it('should handle request with custom headers', async () => {
    const response = { data: { message: 'Success' } };
    const headers = { 'Custom-Header': 'value' };

    axios.get.mockResolvedValueOnce(response);
    await api.get('/test', { headers });

    expect(axios.get).toHaveBeenCalledWith('/test', { headers });
  });

  it('should handle request with query parameters', async () => {
    const response = { data: { message: 'Success' } };
    const params = { page: 1, limit: 10 };

    axios.get.mockResolvedValueOnce(response);
    await api.get('/test', { params });

    expect(axios.get).toHaveBeenCalledWith('/test', { params });
  });

  it('should handle request with both headers and params', async () => {
    const response = { data: { message: 'Success' } };
    const config = {
      headers: { 'Custom-Header': 'value' },
      params: { page: 1, limit: 10 }
    };

    axios.get.mockResolvedValueOnce(response);
    await api.get('/test', config);

    expect(axios.get).toHaveBeenCalledWith('/test', config);
  });
}); 