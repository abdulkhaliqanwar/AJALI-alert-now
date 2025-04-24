/* eslint-env jest */
import React from 'react';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import IncidentForm from '../IncidentForm';

const mockStore = configureStore([]);

describe('IncidentForm', () => {
  let store;

  beforeEach(() => {
    store = mockStore({
      incidents: {
        isLoading: false,
        error: null,
      },
    });
  });

  test('renders form fields', () => {
    render(
      <Provider store={store}>
        <IncidentForm />
      </Provider>
    );

    expect(screen.getByLabelText(/Title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Description/i)).toBeInTheDocument();
    expect(screen.getByText(/Location/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Media/i)).toBeInTheDocument();
  });

  test('submit button is disabled when no location selected', () => {
    render(
      <Provider store={store}>
        <IncidentForm />
      </Provider>
    );

    const submitButton = screen.getByRole('button', { name: /Report Incident/i });
    expect(submitButton).toBeDisabled();
  });
});
