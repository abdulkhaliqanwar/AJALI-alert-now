
export type IncidentStatus = "reported" | "investigating" | "rejected" | "resolved";

export type IncidentType = "accident" | "fire" | "crime" | "medical" | "other";

export interface Location {
  latitude: number;
  longitude: number;
  address?: string;
}

export interface IncidentImage {
  id: string;
  url: string;
  caption?: string;
}

export interface IncidentVideo {
  id: string;
  url: string;
  caption?: string;
}

export interface Incident {
  id: string;
  title: string;
  description: string;
  type: IncidentType;
  status: IncidentStatus;
  location: Location;
  reportedBy: string; // User ID
  reporterName: string; // User name
  createdAt: string;
  updatedAt: string;
  images: IncidentImage[];
  videos: IncidentVideo[];
}

// Mock data for incidents
export const mockIncidents: Incident[] = [
  {
    id: "inc-1",
    title: "Traffic accident on Uhuru Highway",
    description: "Multiple vehicles involved in a collision near Nyayo Stadium. Ambulance needed.",
    type: "accident",
    status: "investigating",
    location: {
      latitude: -1.2921,
      longitude: 36.8219,
      address: "Uhuru Highway, near Nyayo Stadium, Nairobi"
    },
    reportedBy: "user-1",
    reporterName: "John Kamau",
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
    images: [
      {
        id: "img-1",
        url: "https://images.unsplash.com/photo-1469041797191-50ace28483c3",
        caption: "Scene of the accident"
      }
    ],
    videos: []
  },
  {
    id: "inc-2",
    title: "Building fire in Westlands",
    description: "Commercial building on fire. Fire department already on scene but additional support needed.",
    type: "fire",
    status: "investigating",
    location: {
      latitude: -1.2673,
      longitude: 36.8063,
      address: "Westlands, Nairobi"
    },
    reportedBy: "user-2",
    reporterName: "Sarah Odhiambo",
    createdAt: new Date(Date.now() - 43200000).toISOString(),
    updatedAt: new Date(Date.now() - 43200000).toISOString(),
    images: [
      {
        id: "img-2",
        url: "https://images.unsplash.com/photo-1441057206919-63d19fac2369",
        caption: "Fire spreading to adjacent buildings"
      }
    ],
    videos: []
  },
  {
    id: "inc-3",
    title: "Medical emergency at City Park",
    description: "Elderly person collapsed near the main entrance. Requires immediate medical attention.",
    type: "medical",
    status: "reported",
    location: {
      latitude: -1.2603,
      longitude: 36.8358,
      address: "City Park, Nairobi"
    },
    reportedBy: "user-1",
    reporterName: "John Kamau",
    createdAt: new Date(Date.now() - 7200000).toISOString(),
    updatedAt: new Date(Date.now() - 7200000).toISOString(),
    images: [],
    videos: []
  }
];
