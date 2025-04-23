
import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useIncidents } from '@/contexts/IncidentContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { format } from 'date-fns';
import { toast } from 'sonner';
import MainLayout from '@/components/layout/MainLayout';
import MapComponent from '@/components/map/MapComponent';

const IncidentDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { getIncidentById, updateIncidentStatus, deleteIncident } = useIncidents();
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  
  const incident = getIncidentById(id || '');

  if (!incident) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold mb-4">Incident Not Found</h1>
          <p className="mb-6">The incident you're looking for doesn't exist or has been removed.</p>
          <Link to="/incidents">
            <Button>Back to Incidents</Button>
          </Link>
        </div>
      </MainLayout>
    );
  }

  const canManageIncident = user && (user.id === incident.reportedBy || isAdmin);
  
  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this incident report?')) {
      deleteIncident(incident.id);
      toast.success('Incident deleted successfully');
      navigate('/incidents');
    }
  };

  const handleStatusChange = (status: string) => {
    updateIncidentStatus(incident.id, status as any);
  };

  const formatDateTime = (dateString: string) => {
    try {
      return format(new Date(dateString), 'PPP p');
    } catch (e) {
      return 'Invalid date';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'reported':
        return <Badge className="bg-yellow-500">Reported</Badge>;
      case 'investigating':
        return <Badge className="bg-blue-500">Under Investigation</Badge>;
      case 'resolved':
        return <Badge className="bg-green-500">Resolved</Badge>;
      case 'rejected':
        return <Badge className="bg-gray-500">Rejected</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'accident':
        return <Badge className="bg-ajali-red">Accident</Badge>;
      case 'fire':
        return <Badge className="bg-orange-500">Fire</Badge>;
      case 'crime':
        return <Badge className="bg-purple-500">Crime</Badge>;
      case 'medical':
        return <Badge className="bg-blue-500">Medical</Badge>;
      case 'other':
        return <Badge>Other</Badge>;
      default:
        return <Badge>{type}</Badge>;
    }
  };

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <div className="flex flex-wrap items-center gap-4 mb-4">
            <Link to="/incidents">
              <Button variant="outline" size="sm">
                Back to Incidents
              </Button>
            </Link>
            
            {canManageIncident && (
              <>
                <Link to={`/edit-incident/${incident.id}`}>
                  <Button variant="outline" size="sm">
                    Edit
                  </Button>
                </Link>
                <Button variant="destructive" size="sm" onClick={handleDelete}>
                  Delete
                </Button>
              </>
            )}
          </div>
          
          <div className="flex flex-wrap items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">{incident.title}</h1>
              <div className="flex flex-wrap gap-2 mt-2">
                {getTypeBadge(incident.type)}
                {getStatusBadge(incident.status)}
              </div>
            </div>
            
            {isAdmin && (
              <Card className="mt-4 md:mt-0 p-4">
                <div className="text-sm font-medium mb-2">Update Status:</div>
                <div className="flex flex-wrap gap-2">
                  <Button 
                    size="sm" 
                    variant={incident.status === 'reported' ? 'default' : 'outline'} 
                    onClick={() => handleStatusChange('reported')}
                    className={incident.status === 'reported' ? 'bg-yellow-500' : ''}
                  >
                    Reported
                  </Button>
                  <Button 
                    size="sm" 
                    variant={incident.status === 'investigating' ? 'default' : 'outline'} 
                    onClick={() => handleStatusChange('investigating')}
                    className={incident.status === 'investigating' ? 'bg-blue-500' : ''}
                  >
                    Investigating
                  </Button>
                  <Button 
                    size="sm" 
                    variant={incident.status === 'resolved' ? 'default' : 'outline'} 
                    onClick={() => handleStatusChange('resolved')}
                    className={incident.status === 'resolved' ? 'bg-green-500' : ''}
                  >
                    Resolved
                  </Button>
                  <Button 
                    size="sm" 
                    variant={incident.status === 'rejected' ? 'default' : 'outline'} 
                    onClick={() => handleStatusChange('rejected')}
                    className={incident.status === 'rejected' ? 'bg-gray-500' : ''}
                  >
                    Rejected
                  </Button>
                </div>
              </Card>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Description Card */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-4">Description</h2>
                <p className="whitespace-pre-line">{incident.description}</p>
              </CardContent>
            </Card>
            
            {/* Media Evidence Cards */}
            {(incident.images.length > 0 || incident.videos.length > 0) && (
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-xl font-semibold mb-4">Media Evidence</h2>
                  
                  {incident.images.length > 0 && (
                    <div className="mb-6">
                      <h3 className="text-lg font-medium mb-3">Images ({incident.images.length})</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {incident.images.map((image) => (
                          <div key={image.id} className="border rounded-lg overflow-hidden">
                            <img 
                              src={image.url} 
                              alt={image.caption || 'Incident image'} 
                              className="w-full h-48 object-cover"
                            />
                            {image.caption && (
                              <div className="p-2 text-sm text-gray-600">
                                {image.caption}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {incident.videos.length > 0 && (
                    <div>
                      <h3 className="text-lg font-medium mb-3">Videos ({incident.videos.length})</h3>
                      <div className="grid grid-cols-1 gap-3">
                        {incident.videos.map((video) => (
                          <div key={video.id} className="border rounded-lg overflow-hidden">
                            <video 
                              src={video.url} 
                              controls
                              className="w-full"
                            />
                            {video.caption && (
                              <div className="p-2 text-sm text-gray-600">
                                {video.caption}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
          
          <div className="space-y-6">
            {/* Location Card */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-4">Location</h2>
                <div className="h-[250px] mb-4">
                  <MapComponent 
                    incidents={[incident]}
                    height="250px"
                    interactive={false}
                  />
                </div>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-medium">Latitude: </span>
                    {incident.location.latitude}
                  </div>
                  <div>
                    <span className="font-medium">Longitude: </span>
                    {incident.location.longitude}
                  </div>
                  {incident.location.address && (
                    <div>
                      <span className="font-medium">Address: </span>
                      {incident.location.address}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
            
            {/* Report Info Card */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-4">Report Information</h2>
                <div className="space-y-3 text-sm">
                  <div>
                    <span className="font-medium">Reported By: </span>
                    {incident.reporterName}
                  </div>
                  <div>
                    <span className="font-medium">Reported On: </span>
                    {formatDateTime(incident.createdAt)}
                  </div>
                  {incident.updatedAt !== incident.createdAt && (
                    <div>
                      <span className="font-medium">Last Updated: </span>
                      {formatDateTime(incident.updatedAt)}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default IncidentDetail;
