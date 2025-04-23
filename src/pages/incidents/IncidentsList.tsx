
import React, { useState } from 'react';
import { useIncidents } from '@/contexts/IncidentContext';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { IncidentType, IncidentStatus } from '@/models/Incident';
import MainLayout from '@/components/layout/MainLayout';
import IncidentCard from '@/components/incident/IncidentCard';
import MapComponent from '@/components/map/MapComponent';

const IncidentsList = () => {
  const { incidents, isLoading } = useIncidents();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');

  // Filter incidents based on search term and filters
  const filteredIncidents = incidents.filter((incident) => {
    // Search term filter
    const matchesSearch = searchTerm === '' || 
      incident.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
      incident.description.toLowerCase().includes(searchTerm.toLowerCase());

    // Type filter
    const matchesType = selectedType === '' || incident.type === selectedType;

    // Status filter
    const matchesStatus = selectedStatus === '' || incident.status === selectedStatus;

    return matchesSearch && matchesType && matchesStatus;
  });

  // Sort by most recent
  const sortedIncidents = [...filteredIncidents].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Reported Incidents</h1>
          <p className="text-gray-600">
            View and filter incidents reported across Kenya
          </p>
        </div>

        {/* Search and filters */}
        <div className="mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <Label htmlFor="search" className="mb-2">Search</Label>
              <Input
                id="search"
                placeholder="Search by keyword..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div>
              <Label htmlFor="type" className="mb-2">Incident Type</Label>
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger>
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="accident">Accident</SelectItem>
                  <SelectItem value="fire">Fire</SelectItem>
                  <SelectItem value="crime">Crime</SelectItem>
                  <SelectItem value="medical">Medical</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="status" className="mb-2">Status</Label>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="reported">Reported</SelectItem>
                  <SelectItem value="investigating">Under Investigation</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-between items-center mb-4">
            <p className="text-sm text-gray-600">
              {filteredIncidents.length} incidents found
            </p>
            
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-1 rounded-md ${
                  viewMode === 'list'
                    ? 'bg-ajali-red text-white'
                    : 'bg-gray-200 text-gray-700'
                }`}
              >
                List View
              </button>
              <button
                onClick={() => setViewMode('map')}
                className={`px-3 py-1 rounded-md ${
                  viewMode === 'map'
                    ? 'bg-ajali-red text-white'
                    : 'bg-gray-200 text-gray-700'
                }`}
              >
                Map View
              </button>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <p>Loading incidents...</p>
          </div>
        ) : (
          <>
            {viewMode === 'list' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sortedIncidents.length > 0 ? (
                  sortedIncidents.map((incident) => (
                    <IncidentCard key={incident.id} incident={incident} />
                  ))
                ) : (
                  <div className="col-span-full text-center py-12">
                    <p className="text-gray-500">No incidents found matching your criteria.</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="h-[600px] rounded-lg overflow-hidden border border-gray-200">
                <MapComponent incidents={filteredIncidents} height="600px" />
              </div>
            )}
          </>
        )}
      </div>
    </MainLayout>
  );
};

export default IncidentsList;
