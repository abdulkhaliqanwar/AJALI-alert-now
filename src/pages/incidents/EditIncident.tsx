
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useIncidents } from '@/contexts/IncidentContext';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import MainLayout from '@/components/layout/MainLayout';
import IncidentForm from '@/components/incident/IncidentForm';
import { Incident } from '@/models/Incident';

const EditIncident = () => {
  const { id } = useParams<{ id: string }>();
  const { getIncidentById, updateIncident, uploadImage, uploadVideo } = useIncidents();
  const { user, isAdmin } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  
  const incident = getIncidentById(id || '');

  if (!incident) {
    navigate('/incidents');
    toast.error('Incident not found');
    return null;
  }

  // Check if user has permission to edit this incident
  if (!user || (user.id !== incident.reportedBy && !isAdmin)) {
    navigate(`/incidents/${id}`);
    toast.error('You do not have permission to edit this incident');
    return null;
  }

  const handleSubmit = async (incidentData: Partial<Incident>) => {
    try {
      setIsLoading(true);
      
      // Update incident data
      updateIncident(incident.id, {
        title: incidentData.title,
        description: incidentData.description,
        type: incidentData.type,
        location: incidentData.location,
      });

      // Simulating some processing time
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success('Incident updated successfully');
      navigate(`/incidents/${incident.id}`);
    } catch (error) {
      toast.error('Failed to update incident');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Edit Incident</h1>
          <p className="text-gray-600">
            Update the information for this incident report
          </p>
        </div>
        
        <div className="max-w-2xl mx-auto">
          <IncidentForm 
            onSubmit={handleSubmit} 
            initialData={incident} 
            isEditing={true}
            isLoading={isLoading}
          />
        </div>
      </div>
    </MainLayout>
  );
};

export default EditIncident;
