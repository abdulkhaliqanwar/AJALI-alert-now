
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { IncidentType, Location, Incident } from '@/models/Incident';
import MapComponent from '@/components/map/MapComponent';

interface IncidentFormProps {
  onSubmit: (incidentData: Partial<Incident>) => void;
  initialData?: Partial<Incident>;
  isEditing?: boolean;
  isLoading?: boolean;
}

const IncidentForm: React.FC<IncidentFormProps> = ({
  onSubmit,
  initialData,
  isEditing = false,
  isLoading = false,
}) => {
  const [title, setTitle] = useState(initialData?.title || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [type, setType] = useState<IncidentType>(initialData?.type || 'accident');
  const [location, setLocation] = useState<Location>(
    initialData?.location || {
      latitude: -1.2921,
      longitude: 36.8219,
      address: ''
    }
  );
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);

  const handleLocationSelect = (latitude: number, longitude: number) => {
    setLocation({
      ...location,
      latitude,
      longitude,
    });
  };

  const handleAddressChange = (address: string) => {
    setLocation({
      ...location,
      address,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      title,
      description,
      type,
      location,
      // The image/video files will be handled separately by the parent component
    });
  };

  return (
    <Card className="p-6">
      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Incident Title*</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Brief title describing the incident"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description*</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide detailed information about the incident"
              rows={4}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Incident Type*</Label>
            <Select value={type} onValueChange={(value: IncidentType) => setType(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select incident type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="accident">Accident</SelectItem>
                <SelectItem value="fire">Fire</SelectItem>
                <SelectItem value="crime">Crime</SelectItem>
                <SelectItem value="medical">Medical Emergency</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Location*</Label>
            <div className="h-[300px]">
              <MapComponent
                currentLocation={location}
                onLocationSelect={handleLocationSelect}
                height="300px"
              />
            </div>
            <div className="mt-2 grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="latitude">Latitude</Label>
                <Input
                  id="latitude"
                  value={location.latitude}
                  onChange={(e) => handleLocationSelect(parseFloat(e.target.value), location.longitude)}
                  type="number"
                  step="0.0001"
                />
              </div>
              <div>
                <Label htmlFor="longitude">Longitude</Label>
                <Input
                  id="longitude"
                  value={location.longitude}
                  onChange={(e) => handleLocationSelect(location.latitude, parseFloat(e.target.value))}
                  type="number"
                  step="0.0001"
                />
              </div>
            </div>
            <div className="mt-2">
              <Label htmlFor="address">Address (Optional)</Label>
              <Input
                id="address"
                value={location.address || ''}
                onChange={(e) => handleAddressChange(e.target.value)}
                placeholder="Physical address or landmark"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="image">Add Image Evidence (Optional)</Label>
            <Input
              id="image"
              type="file"
              accept="image/*"
              onChange={(e) => setImageFile(e.target.files ? e.target.files[0] : null)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="video">Add Video Evidence (Optional)</Label>
            <Input
              id="video"
              type="file"
              accept="video/*"
              onChange={(e) => setVideoFile(e.target.files ? e.target.files[0] : null)}
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-ajali-red hover:bg-red-700 text-white"
            disabled={isLoading}
          >
            {isLoading
              ? 'Submitting...'
              : isEditing
                ? 'Update Incident'
                : 'Report Incident'}
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default IncidentForm;
