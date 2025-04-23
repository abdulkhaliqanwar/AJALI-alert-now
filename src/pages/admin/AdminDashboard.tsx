
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useIncidents } from '@/contexts/IncidentContext';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { formatDistanceToNow } from 'date-fns';
import MainLayout from '@/components/layout/MainLayout';
import MapComponent from '@/components/map/MapComponent';
import { IncidentStatus } from '@/models/Incident';

const AdminDashboard = () => {
  const { incidents, updateIncidentStatus } = useIncidents();
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();

  const [statusFilter, setStatusFilter] = useState<string>('');
  
  // Redirect non-admins
  if (!user || !isAdmin) {
    navigate('/');
    return null;
  }

  // Count incidents by status
  const incidentCounts = {
    total: incidents.length,
    reported: incidents.filter(inc => inc.status === 'reported').length,
    investigating: incidents.filter(inc => inc.status === 'investigating').length,
    resolved: incidents.filter(inc => inc.status === 'resolved').length,
    rejected: incidents.filter(inc => inc.status === 'rejected').length,
  };

  // Count incidents by type
  const incidentTypeData = {
    accident: incidents.filter(inc => inc.type === 'accident').length,
    fire: incidents.filter(inc => inc.type === 'fire').length,
    crime: incidents.filter(inc => inc.type === 'crime').length,
    medical: incidents.filter(inc => inc.type === 'medical').length,
    other: incidents.filter(inc => inc.type === 'other').length,
  };

  // Filter incidents
  const filteredIncidents = statusFilter 
    ? incidents.filter(inc => inc.status === statusFilter)
    : incidents;

  // Sort by most recent
  const sortedIncidents = [...filteredIncidents].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const handleStatusChange = (incidentId: string, newStatus: IncidentStatus) => {
    updateIncidentStatus(incidentId, newStatus);
  };

  const getTimeAgo = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch (e) {
      return 'Invalid date';
    }
  };

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-gray-600">
            Manage and monitor all incident reports
          </p>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-2xl font-bold">{incidentCounts.total}</div>
                <div className="text-sm text-gray-500">Total Incidents</div>
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
                <div className="text-sm text-blue-600">Investigating</div>
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

        {/* Map and Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card className="lg:col-span-2">
            <CardContent className="p-4">
              <h2 className="text-xl font-semibold mb-2">Incident Map</h2>
              <div className="h-[300px]">
                <MapComponent incidents={incidents} height="300px" interactive={false} />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <h2 className="text-xl font-semibold mb-4">Incident Types</h2>
              <div className="space-y-3">
                {Object.entries(incidentTypeData).map(([type, count]) => (
                  <div key={type} className="flex items-center">
                    <div className="w-32 capitalize">{type}</div>
                    <div className="flex-grow h-4 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-ajali-red"
                        style={{ 
                          width: `${(count / incidentCounts.total) * 100}%` 
                        }}
                      ></div>
                    </div>
                    <div className="w-10 text-right">{count}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Incidents Table */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Manage Incidents</h2>
            <div className="w-48">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="reported">Reported</SelectItem>
                  <SelectItem value="investigating">Investigating</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Reporter</TableHead>
                  <TableHead>Reported</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedIncidents.length > 0 ? (
                  sortedIncidents.map((incident) => (
                    <TableRow key={incident.id}>
                      <TableCell className="font-medium">{incident.title}</TableCell>
                      <TableCell>
                        <Badge className={
                          incident.type === 'accident' ? 'bg-ajali-red' :
                          incident.type === 'fire' ? 'bg-orange-500' :
                          incident.type === 'crime' ? 'bg-purple-500' :
                          incident.type === 'medical' ? 'bg-blue-500' :
                          'bg-gray-500'
                        }>
                          {incident.type.charAt(0).toUpperCase() + incident.type.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>{incident.reporterName}</TableCell>
                      <TableCell>{getTimeAgo(incident.createdAt)}</TableCell>
                      <TableCell>
                        <Select 
                          defaultValue={incident.status} 
                          onValueChange={(value) => handleStatusChange(incident.id, value as IncidentStatus)}
                        >
                          <SelectTrigger className={
                            incident.status === 'reported' ? 'bg-yellow-100 border-yellow-300' :
                            incident.status === 'investigating' ? 'bg-blue-100 border-blue-300' :
                            incident.status === 'resolved' ? 'bg-green-100 border-green-300' :
                            'bg-gray-100 border-gray-300'
                          }>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="reported">Reported</SelectItem>
                            <SelectItem value="investigating">Investigating</SelectItem>
                            <SelectItem value="resolved">Resolved</SelectItem>
                            <SelectItem value="rejected">Rejected</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => navigate(`/incidents/${incident.id}`)}
                        >
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-4">
                      No incidents found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default AdminDashboard;
