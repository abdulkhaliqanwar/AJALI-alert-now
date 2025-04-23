
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useIncidents } from '@/contexts/IncidentContext';
import { toast } from 'sonner';
import MainLayout from '@/components/layout/MainLayout';
import IncidentForm from '@/components/incident/IncidentForm';
import { Incident } from '@/models/Incident';

const ReportIncident = () => {
  const { createIncident, uploadImage, uploadVideo } = useIncidents();
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (incidentData: Partial<Incident>) => {
    try {
      setIsLoading(true);
      
      // Create new incident
      createIncident({
        title: incidentData.title || '',
        description: incidentData.description || '',
        type: incidentData.type || 'other',
        location: incidentData.location || {
          latitude: 0,
          longitude: 0
        },
        images: [],
        videos: []
      });

      // Simulating some processing time
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success('Incident reported successfully');
      navigate('/incidents');
    } catch (error) {
      toast.error('Failed to report incident');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Report New Incident</h1>
          <p className="text-gray-600">
            Provide accurate information to help responders effectively address this incident
          </p>
        </div>
        
        <div className="max-w-2xl mx-auto">
          <IncidentForm onSubmit={handleSubmit} isLoading={isLoading} />
        </div>
      </div>
    </MainLayout>
  );
};

export default ReportIncident;
