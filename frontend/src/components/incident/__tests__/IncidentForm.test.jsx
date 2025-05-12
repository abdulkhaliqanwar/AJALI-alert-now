/* eslint-env jest */
import React from 'react';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import IncidentForm from '../IncidentForm';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { waitFor } from '@testing-library/react';
import incidentReducer from '../../../store/slices/incidentSlice';

const mockStore = configureStore([]);

// Mock the store
const createMockStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      incidents: incidentReducer
    },
    preloadedState: {
      incidents: {
        isLoading: false,
        error: null,
        ...initialState
      }
    }
  });
};

describe('IncidentForm', () => {
  let store;
  const mockOnSubmit = vi.fn();
  const mockOnCancel = vi.fn();

  beforeEach(() => {
    store = createMockStore();
    vi.clearAllMocks();
  });

  it('renders the form with all required fields', () => {
    render(
      <Provider store={store}>
        <IncidentForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />
      </Provider>
    );

    expect(screen.getByLabelText(/title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/location/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/media/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /submit/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
  });

  it('validates required fields', async () => {
    render(
      <Provider store={store}>
        <IncidentForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />
      </Provider>
    );

    const submitButton = screen.getByRole('button', { name: /submit/i });
    userEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/title is required/i)).toBeInTheDocument();
      expect(screen.getByText(/description is required/i)).toBeInTheDocument();
      expect(screen.getByText(/location is required/i)).toBeInTheDocument();
    });

    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('submits form with valid data', async () => {
    render(
      <Provider store={store}>
        <IncidentForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />
      </Provider>
    );

    const titleInput = screen.getByLabelText(/title/i);
    const descriptionInput = screen.getByLabelText(/description/i);
    const locationInput = screen.getByLabelText(/location/i);

    await userEvent.type(titleInput, 'Test Incident');
    await userEvent.type(descriptionInput, 'Test Description');
    await userEvent.type(locationInput, 'Test Location');

    const submitButton = screen.getByRole('button', { name: /submit/i });
    userEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        title: 'Test Incident',
        description: 'Test Description',
        location: 'Test Location',
        media: null
      });
    });
  });

  it('handles file upload', async () => {
    render(
      <Provider store={store}>
        <IncidentForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />
      </Provider>
    );

    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    const fileInput = screen.getByLabelText(/media/i);

    await userEvent.upload(fileInput, file);

    expect(fileInput.files[0]).toBe(file);
    expect(fileInput.files).toHaveLength(1);
  });

  it('calls onCancel when cancel button is clicked', () => {
    render(
      <Provider store={store}>
        <IncidentForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />
      </Provider>
    );

    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    userEvent.click(cancelButton);

    expect(mockOnCancel).toHaveBeenCalled();
  });

  it('displays loading state during submission', async () => {
    store = createMockStore({ isLoading: true });

    render(
      <Provider store={store}>
        <IncidentForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />
      </Provider>
    );

    expect(screen.getByText(/submitting/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /submit/i })).toBeDisabled();
  });

  it('displays error message when submission fails', async () => {
    store = createMockStore({ error: 'Submission failed' });

    render(
      <Provider store={store}>
        <IncidentForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />
      </Provider>
    );

    expect(screen.getByText(/submission failed/i)).toBeInTheDocument();
  });
});
