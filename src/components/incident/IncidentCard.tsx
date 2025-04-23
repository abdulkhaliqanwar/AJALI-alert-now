
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Incident } from '@/models/Incident';
import { formatDistanceToNow } from 'date-fns';

interface IncidentCardProps {
  incident: Incident;
  showActions?: boolean;
  onDelete?: (id: string) => void;
}

const IncidentCard: React.FC<IncidentCardProps> = ({
  incident,
  showActions = false,
  onDelete,
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'reported':
        return 'bg-yellow-500 hover:bg-yellow-600';
      case 'investigating':
        return 'bg-blue-500 hover:bg-blue-600';
      case 'resolved':
        return 'bg-green-500 hover:bg-green-600';
      case 'rejected':
        return 'bg-gray-500 hover:bg-gray-600';
      default:
        return 'bg-yellow-500 hover:bg-yellow-600';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'accident':
        return 'bg-ajali-red text-white';
      case 'fire':
        return 'bg-orange-500 text-white';
      case 'crime':
        return 'bg-purple-500 text-white';
      case 'medical':
        return 'bg-blue-500 text-white';
      case 'other':
        return 'bg-gray-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const getFormattedDate = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch (e) {
      return 'Invalid date';
    }
  };

  return (
    <Card className="overflow-hidden transition-shadow hover:shadow-md">
      {incident.images && incident.images.length > 0 ? (
        <div className="relative h-48 overflow-hidden">
          <img
            src={incident.images[0].url}
            alt={incident.title}
            className="w-full h-full object-cover"
          />
          <Badge className={`absolute top-2 right-2 ${getTypeColor(incident.type)}`}>
            {incident.type.charAt(0).toUpperCase() + incident.type.slice(1)}
          </Badge>
        </div>
      ) : (
        <div className="relative h-20 bg-gray-100 flex items-center justify-center">
          <div className="text-gray-400">No image available</div>
          <Badge className={`absolute top-2 right-2 ${getTypeColor(incident.type)}`}>
            {incident.type.charAt(0).toUpperCase() + incident.type.slice(1)}
          </Badge>
        </div>
      )}
      
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-semibold text-lg line-clamp-1">{incident.title}</h3>
          <Badge 
            className={`${getStatusColor(incident.status)} text-white`}
          >
            {incident.status.charAt(0).toUpperCase() + incident.status.slice(1)}
          </Badge>
        </div>
        
        <p className="text-gray-600 text-sm line-clamp-2 mb-2">
          {incident.description}
        </p>
        
        <div className="text-xs text-gray-500 mt-2">
          <div>Reported by: {incident.reporterName}</div>
          <div>{getFormattedDate(incident.createdAt)}</div>
        </div>
      </CardContent>
      
      <CardFooter className="p-4 pt-0 flex justify-between items-center">
        <Link to={`/incidents/${incident.id}`}>
          <Button variant="outline" size="sm">
            View Details
          </Button>
        </Link>
        
        {showActions && (
          <div className="flex gap-2">
            <Link to={`/edit-incident/${incident.id}`}>
              <Button variant="outline" size="sm">
                Edit
              </Button>
            </Link>
            {onDelete && (
              <Button 
                variant="destructive" 
                size="sm"
                onClick={() => onDelete(incident.id)}
              >
                Delete
              </Button>
            )}
          </div>
        )}
      </CardFooter>
    </Card>
  );
};

export default IncidentCard;
