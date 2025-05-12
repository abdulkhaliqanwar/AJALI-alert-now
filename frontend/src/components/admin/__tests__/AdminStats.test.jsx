import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import AdminStats from '../AdminStats';

describe('AdminStats', () => {
  const mockIncidents = [
    {
      id: 1,
      title: 'Test Incident 1',
      status: 'reported',
      created_at: '2024-02-20T10:00:00Z'
    },
    {
      id: 2,
      title: 'Test Incident 2',
      status: 'under_investigation',
      created_at: '2024-02-20T11:00:00Z'
    },
    {
      id: 3,
      title: 'Test Incident 3',
      status: 'resolved',
      created_at: '2024-02-20T12:00:00Z'
    },
    {
      id: 4,
      title: 'Test Incident 4',
      status: 'rejected',
      created_at: '2024-02-20T13:00:00Z'
    }
  ];

  it('renders statistics cards with correct totals', () => {
    render(<AdminStats incidents={mockIncidents} />);

    expect(screen.getByText(/total incidents/i)).toBeInTheDocument();
    expect(screen.getByText('4')).toBeInTheDocument(); // Total incidents

    expect(screen.getByText(/active investigations/i)).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument(); // Under investigation

    expect(screen.getByText(/resolved cases/i)).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument(); // Resolved
  });

  it('renders status distribution chart', () => {
    render(<AdminStats incidents={mockIncidents} />);

    expect(screen.getByText(/incidents by status/i)).toBeInTheDocument();
    expect(screen.getByRole('img', { name: /status distribution/i })).toBeInTheDocument();
  });

  it('renders timeline chart', () => {
    render(<AdminStats incidents={mockIncidents} />);

    expect(screen.getByText(/incidents over time/i)).toBeInTheDocument();
    expect(screen.getByRole('img', { name: /timeline/i })).toBeInTheDocument();
  });

  it('handles empty incidents array', () => {
    render(<AdminStats incidents={[]} />);

    expect(screen.getByText('0')).toBeInTheDocument(); // Total incidents
    expect(screen.getByText('0')).toBeInTheDocument(); // Active investigations
    expect(screen.getByText('0')).toBeInTheDocument(); // Resolved cases
  });

  it('calculates correct percentages for status distribution', () => {
    render(<AdminStats incidents={mockIncidents} />);

    const reportedCount = screen.getByText(/reported/i).closest('div');
    const underInvestigationCount = screen.getByText(/under investigation/i).closest('div');
    const resolvedCount = screen.getByText(/resolved/i).closest('div');
    const rejectedCount = screen.getByText(/rejected/i).closest('div');

    expect(reportedCount).toHaveTextContent('25%');
    expect(underInvestigationCount).toHaveTextContent('25%');
    expect(resolvedCount).toHaveTextContent('25%');
    expect(rejectedCount).toHaveTextContent('25%');
  });

  it('displays correct date format in timeline', () => {
    render(<AdminStats incidents={mockIncidents} />);

    const timelineLabels = screen.getAllByText(/feb 20/i);
    expect(timelineLabels).toHaveLength(4); // One for each incident
  });

  it('updates statistics when incidents change', () => {
    const { rerender } = render(<AdminStats incidents={mockIncidents} />);
    
    const newIncidents = [
      ...mockIncidents,
      {
        id: 5,
        title: 'Test Incident 5',
        status: 'resolved',
        created_at: '2024-02-20T14:00:00Z'
      }
    ];

    rerender(<AdminStats incidents={newIncidents} />);

    expect(screen.getByText('5')).toBeInTheDocument(); // Updated total
    expect(screen.getByText('2')).toBeInTheDocument(); // Updated resolved count
  });
}); 