import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { createIncident, updateIncident } from '../../store/slices/incidentSlice';
import MapComponent from '../map/MapComponent';

const IncidentForm = ({ incident = null, isEditing = false }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoading, error } = useSelector(state => state.incidents);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    latitude: null,
    longitude: null,
    media: null
  });
  const [mediaPreview, setMediaPreview] = useState(null);
  const [markerPosition, setMarkerPosition] = useState(null);
  const [localError, setLocalError] = useState(null);

  useEffect(() => {
    if (isEditing && incident) {
      setFormData({
        title: incident.title,
        description: incident.description,
        latitude: incident.latitude,
        longitude: incident.longitude,
        media: null
      });
      setMarkerPosition({
        lat: incident.latitude,
        lng: incident.longitude
      });
      if (incident.media_urls && incident.media_urls.length > 0) {
        // Show preview of first media item
        setMediaPreview(incident.media_urls[0]);
      }
    }
  }, [isEditing, incident]);

  useEffect(() => {
    if (error) {
      setLocalError(error);
      console.error('Incident submission error:', error);
    } else {
      setLocalError(null);
    }
  }, [error]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleMediaChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setLocalError('File size must be less than 5MB');
        return;
      }

      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'video/mp4', 'video/quicktime'];
      if (!allowedTypes.includes(file.type)) {
        setLocalError('Invalid file type. Please upload an image (JPEG, PNG, GIF) or video (MP4, MOV)');
        return;
      }

      setFormData(prev => ({
        ...prev,
        media: file
      }));

      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setMediaPreview(previewUrl);

      // Cleanup preview URL when component unmounts
      return () => URL.revokeObjectURL(previewUrl);
    }
  };

  const handleMarkerPositionChange = (position) => {
    if (position && typeof position.lat === 'number' && typeof position.lng === 'number') {
      setMarkerPosition(position);
      setFormData(prev => ({
        ...prev,
        latitude: position.lat,
        longitude: position.lng
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError(null);

    // Validate required fields
    if (!formData.title || !formData.description || formData.latitude === null || formData.longitude === null) {
      setLocalError('Please fill in all required fields including location.');
      return;
    }

    try {
      const submitData = new FormData();
      submitData.append('title', formData.title);
      submitData.append('description', formData.description);
      submitData.append('latitude', formData.latitude.toString());
      submitData.append('longitude', formData.longitude.toString());
      
      if (formData.media) {
        submitData.append('media', formData.media);
      }

      if (isEditing) {
        await dispatch(updateIncident({ id: incident.id, data: submitData })).unwrap();
        navigate(`/incidents/${incident.id}`);
      } else {
        await dispatch(createIncident(submitData)).unwrap();
        navigate('/incidents');
      }
    } catch (err) {
      console.error('Failed to submit incident:', err);
      setLocalError(err.message || 'Failed to submit incident. Please try again.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {localError && (
        <div className="alert alert-error">
          {localError}
        </div>
      )}

      <div className="form-group">
        <label htmlFor="title" className="form-label">Title</label>
        <input
          type="text"
          id="title"
          name="title"
          value={formData.title}
          onChange={handleInputChange}
          className="input"
          required
          placeholder="Enter incident title"
        />
      </div>

      <div className="form-group">
        <label htmlFor="description" className="form-label">Description</label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          className="input min-h-[100px]"
          required
          placeholder="Describe the incident"
        />
      </div>

      <div className="form-group">
        <label className="form-label">Location</label>
        <p className="text-sm text-gray-500 mb-2">
          Click on the map or drag the marker to set the incident location
        </p>
        <MapComponent
          markerPosition={markerPosition}
          onMarkerPositionChange={handleMarkerPositionChange}
        />
        {markerPosition && (
          <p className="mt-2 text-sm text-gray-600">
            Selected coordinates: {markerPosition.lat.toFixed(6)}, {markerPosition.lng.toFixed(6)}
          </p>
        )}
      </div>

      <div className="form-group">
        <label htmlFor="media" className="form-label">
          Media (Image/Video)
        </label>
        <input
          type="file"
          id="media"
          name="media"
          onChange={handleMediaChange}
          accept="image/*,video/*"
          className="input"
        />
        <p className="text-sm text-gray-500 mt-1">
          Supported formats: JPEG, PNG, GIF, MP4, MOV (max 5MB)
        </p>
        {mediaPreview && (
          <div className="media-preview mt-4">
            {formData.media?.type.startsWith('image/') ? (
              <img
                src={mediaPreview}
                alt="Preview"
                className="max-w-full h-auto rounded-lg"
              />
            ) : formData.media?.type.startsWith('video/') ? (
              <video
                src={mediaPreview}
                controls
                className="max-w-full h-auto rounded-lg"
              />
            ) : mediaPreview.startsWith('http') ? (
              mediaPreview.endsWith('.mp4') ? (
                <video
                  src={mediaPreview}
                  controls
                  className="max-w-full h-auto rounded-lg"
                />
              ) : (
                <img
                  src={mediaPreview}
                  alt="Current media"
                  className="max-w-full h-auto rounded-lg"
                />
              )
            ) : null}
          </div>
        )}
      </div>

      <div className="flex gap-4">
        <button
          type="submit"
          className="btn btn-primary"
          disabled={isLoading || !markerPosition}
        >
          {isLoading ? (
            <span className="flex items-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing...
            </span>
          ) : (
            isEditing ? 'Update Incident' : 'Report Incident'
          )}
        </button>
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="btn btn-secondary"
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

export default IncidentForm;
