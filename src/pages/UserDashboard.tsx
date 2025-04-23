
import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useIncidents } from '@/contexts/IncidentContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import MainLayout from '@/components/layout/MainLayout';
import IncidentCard from '@/components/incident/IncidentCard';
import { toast } from 'sonner';

const UserDashboard = () => {
  const { userIncidents, deleteIncident } = useIncidents();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Redirect non-authenticated users
  if (!user) {
    navigate('/login');
    return null;
  }

  const handleDeleteIncident = (id: string) => {
    if (window.confirm('Are you sure you want to delete this incident report?')) {
      deleteIncident(id);
      toast.success('Incident deleted successfully');
    }
  };

  // Count incidents by status
  const incidentCounts = {
    total: userIncidents.length,
    reported: userIncidents.filter(inc => inc.status === 'reported').length,
    investigating: userIncidents.filter(inc => inc.status === 'investigating').length,
    resolved: userIncidents.filter(inc => inc.status === 'resolved').length,
    rejected: userIncidents.filter(inc => inc.status === 'rejected').length,
  };

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">My Dashboard</h1>
          <p className="text-gray-600">
            Manage your reported incidents and track their status
          </p>
        </div>

        {/* Status Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-2xl font-bold">{incidentCounts.total}</div>
                <div className="text-sm text-gray-500">Total Reports</div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-yellow-50">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">{incidentCounts.reported}</div>
                <div className="text-sm text-yellow-600">Reported</div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-blue-50">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{incidentCounts.investigating}</div>
                <div className="text-sm text-blue-600">Under Investigation</div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-green-50">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{incidentCounts.resolved}</div>
                <div className="text-sm text-green-600">Resolved</div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gray-50">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-600">{incidentCounts.rejected}</div>
                <div className="text-sm text-gray-600">Rejected</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Action Button */}
        <div className="flex justify-center mb-8">
          <Link to="/report">
            <Button className="bg-ajali-red hover:bg-red-700 text-white">
              Report New Incident
            </Button>
          </Link>
        </div>

        {/* User's Incidents */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-4">Your Reported Incidents</h2>
          
          {userIncidents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {userIncidents
                .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                .map((incident) => (
                  <IncidentCard 
                    key={incident.id} 
                    incident={incident} 
                    showActions={true}
                    onDelete={handleDeleteIncident}
                  />
                ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <p className="text-gray-500 mb-4">You haven't reported any incidents yet.</p>
              <Link to="/report">
                <Button>Report Your First Incident</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default UserDashboard;
