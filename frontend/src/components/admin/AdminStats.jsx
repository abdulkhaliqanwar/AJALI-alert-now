import { useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const AdminStats = ({ incidents }) => {
  const stats = useMemo(() => {
    const total = incidents.length;
    const byStatus = incidents.reduce((acc, incident) => {
      acc[incident.status] = (acc[incident.status] || 0) + 1;
      return acc;
    }, {});

    const byDate = incidents.reduce((acc, incident) => {
      const date = new Date(incident.created_at).toLocaleDateString();
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {});

    return {
      total,
      byStatus,
      byDate
    };
  }, [incidents]);

  const statusData = {
    labels: Object.keys(stats.byStatus).map(status => 
      status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')
    ),
    datasets: [
      {
        label: 'Incidents by Status',
        data: Object.values(stats.byStatus),
        backgroundColor: [
          'rgba(255, 206, 86, 0.6)',  // Reported
          'rgba(54, 162, 235, 0.6)',  // Under Investigation
          'rgba(75, 192, 192, 0.6)',  // Resolved
          'rgba(255, 99, 132, 0.6)',  // Rejected
        ],
        borderColor: [
          'rgba(255, 206, 86, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(255, 99, 132, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const timelineData = {
    labels: Object.keys(stats.byDate),
    datasets: [
      {
        label: 'Incidents per Day',
        data: Object.values(stats.byDate),
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-700">Total Incidents</h3>
          <p className="text-3xl font-bold text-blue-600">{stats.total}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-700">Active Investigations</h3>
          <p className="text-3xl font-bold text-yellow-600">
            {stats.byStatus['under investigation'] || 0}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-700">Resolved Cases</h3>
          <p className="text-3xl font-bold text-green-600">
            {stats.byStatus['resolved'] || 0}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Incidents by Status</h3>
          <div className="h-64">
            <Pie data={statusData} options={{ maintainAspectRatio: false }} />
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Incidents Timeline</h3>
          <div className="h-64">
            <Bar
              data={timelineData}
              options={{
                maintainAspectRatio: false,
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: {
                      stepSize: 1
                    }
                  }
                }
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminStats; 