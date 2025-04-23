
import React, { createContext, useState, useContext, ReactNode, useEffect } from "react";
import { Incident, IncidentStatus, IncidentType, mockIncidents, Location } from "../models/Incident";
import { useAuth } from "./AuthContext";
import { toast } from "sonner";

interface IncidentContextProps {
  incidents: Incident[];
  userIncidents: Incident[];
  isLoading: boolean;
  createIncident: (incident: Omit<Incident, "id" | "createdAt" | "updatedAt" | "reportedBy" | "reporterName" | "status">) => void;
  updateIncident: (id: string, updates: Partial<Incident>) => void;
  deleteIncident: (id: string) => void;
  updateIncidentStatus: (id: string, status: IncidentStatus) => void;
  getIncidentById: (id: string) => Incident | undefined;
  uploadImage: (incidentId: string, file: File) => Promise<void>;
  uploadVideo: (incidentId: string, file: File) => Promise<void>;
  updateLocation: (incidentId: string, location: Location) => void;
}

const IncidentContext = createContext<IncidentContextProps | undefined>(undefined);

export const useIncidents = () => {
  const context = useContext(IncidentContext);
  if (!context) {
    throw new Error("useIncidents must be used within an IncidentProvider");
  }
  return context;
};

interface IncidentProviderProps {
  children: ReactNode;
}

export const IncidentProvider: React.FC<IncidentProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load incidents from localStorage or initialize with mock data
  useEffect(() => {
    const storedIncidents = localStorage.getItem("ajali_incidents");
    if (storedIncidents) {
      setIncidents(JSON.parse(storedIncidents));
    } else {
      setIncidents(mockIncidents);
      localStorage.setItem("ajali_incidents", JSON.stringify(mockIncidents));
    }
    setIsLoading(false);
  }, []);

  // Update localStorage whenever incidents change
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem("ajali_incidents", JSON.stringify(incidents));
    }
  }, [incidents, isLoading]);

  // Filter incidents for the current user
  const userIncidents = incidents.filter(
    (incident) => user && incident.reportedBy === user.id
  );

  const createIncident = (
    incidentData: Omit<Incident, "id" | "createdAt" | "updatedAt" | "reportedBy" | "reporterName" | "status">
  ) => {
    if (!user) {
      toast.error("You must be logged in to report an incident");
      return;
    }

    const now = new Date().toISOString();
    const newIncident: Incident = {
      ...incidentData,
      id: `inc-${Date.now()}`,
      reportedBy: user.id,
      reporterName: user.name,
      status: "reported",
      createdAt: now,
      updatedAt: now,
    };

    setIncidents((prev) => [newIncident, ...prev]);
    toast.success("Incident reported successfully");
  };

  const updateIncident = (id: string, updates: Partial<Incident>) => {
    setIncidents((prev) =>
      prev.map((incident) => {
        if (incident.id === id) {
          // Check if the user has permission to update this incident
          if (user?.id !== incident.reportedBy && user?.role !== "admin") {
            toast.error("You don't have permission to update this incident");
            return incident;
          }
          
          return {
            ...incident,
            ...updates,
            updatedAt: new Date().toISOString(),
          };
        }
        return incident;
      })
    );
    toast.success("Incident updated successfully");
  };

  const deleteIncident = (id: string) => {
    const incidentToDelete = incidents.find((inc) => inc.id === id);
    
    if (!incidentToDelete) {
      toast.error("Incident not found");
      return;
    }
    
    // Check if the user has permission to delete this incident
    if (user?.id !== incidentToDelete.reportedBy && user?.role !== "admin") {
      toast.error("You don't have permission to delete this incident");
      return;
    }
    
    setIncidents((prev) => prev.filter((incident) => incident.id !== id));
    toast.success("Incident deleted successfully");
  };

  const updateIncidentStatus = (id: string, status: IncidentStatus) => {
    // Only admins can update status
    if (user?.role !== "admin") {
      toast.error("Only administrators can update incident status");
      return;
    }

    setIncidents((prev) =>
      prev.map((incident) => {
        if (incident.id === id) {
          return {
            ...incident,
            status,
            updatedAt: new Date().toISOString(),
          };
        }
        return incident;
      })
    );
    toast.success(`Incident status updated to ${status}`);
  };

  const getIncidentById = (id: string) => {
    return incidents.find((incident) => incident.id === id);
  };

  const uploadImage = async (incidentId: string, file: File) => {
    // In a real app, this would upload to a server
    try {
      // Simulate upload delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Create a data URL for the image (in a real app, this would be a URL from your server)
      const reader = new FileReader();
      const imageUrl = await new Promise<string>((resolve) => {
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });

      // Add the image to the incident
      setIncidents((prev) =>
        prev.map((incident) => {
          if (incident.id === incidentId) {
            return {
              ...incident,
              images: [
                ...incident.images,
                {
                  id: `img-${Date.now()}`,
                  url: imageUrl,
                  caption: file.name,
                },
              ],
              updatedAt: new Date().toISOString(),
            };
          }
          return incident;
        })
      );
      
      toast.success("Image uploaded successfully");
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error("Failed to upload image");
    }
  };

  const uploadVideo = async (incidentId: string, file: File) => {
    // In a real app, this would upload to a server
    try {
      // Simulate upload delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Create a data URL for the video (in a real app, this would be a URL from your server)
      const reader = new FileReader();
      const videoUrl = await new Promise<string>((resolve) => {
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });

      // Add the video to the incident
      setIncidents((prev) =>
        prev.map((incident) => {
          if (incident.id === incidentId) {
            return {
              ...incident,
              videos: [
                ...incident.videos,
                {
                  id: `vid-${Date.now()}`,
                  url: videoUrl,
                  caption: file.name,
                },
              ],
              updatedAt: new Date().toISOString(),
            };
          }
          return incident;
        })
      );
      
      toast.success("Video uploaded successfully");
    } catch (error) {
      console.error("Error uploading video:", error);
      toast.error("Failed to upload video");
    }
  };

  const updateLocation = (incidentId: string, location: Location) => {
    setIncidents((prev) =>
      prev.map((incident) => {
        if (incident.id === incidentId) {
          return {
            ...incident,
            location,
            updatedAt: new Date().toISOString(),
          };
        }
        return incident;
      })
    );
    toast.success("Location updated successfully");
  };

  const value = {
    incidents,
    userIncidents,
    isLoading,
    createIncident,
    updateIncident,
    deleteIncident,
    updateIncidentStatus,
    getIncidentById,
    uploadImage,
    uploadVideo,
    updateLocation
  };

  return <IncidentContext.Provider value={value}>{children}</IncidentContext.Provider>;
};
