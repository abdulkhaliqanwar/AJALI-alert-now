
import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useIncidents } from '@/contexts/IncidentContext';
import MainLayout from '@/components/layout/MainLayout';
import IncidentCard from '@/components/incident/IncidentCard';
import MapComponent from '@/components/map/MapComponent';

const Home = () => {
  const { isAuthenticated } = useAuth();
  const { incidents } = useIncidents();
  
  // Get the 3 most recent incidents
  const recentIncidents = [...incidents].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  ).slice(0, 3);

  return (
    <MainLayout>
      {/* Hero Section */}
      <section className="bg-ajali-red text-white py-12 md:py-20">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 mb-8 md:mb-0">
              <div className="max-w-lg">
                <h1 className="text-4xl md:text-5xl font-bold mb-4">
                  Report emergencies in real-time
                </h1>
                <p className="text-lg mb-6">
                  Ajali! connects citizens with emergency responders across Kenya. 
                  Report accidents, fires, medical emergencies and more to get help fast.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  {isAuthenticated ? (
                    <Link to="/report">
                      <Button size="lg" className="bg-white text-ajali-red hover:bg-ajali-yellow hover:text-black">
                        Report an Incident
                      </Button>
                    </Link>
                  ) : (
                    <Link to="/login">
                      <Button size="lg" className="bg-white text-ajali-red hover:bg-ajali-yellow hover:text-black">
                        Log in to Report
                      </Button>
                    </Link>
                  )}
                  <Link to="/incidents">
                    <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/20">
                      View Incidents
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
            
            <div className="md:w-1/2">
              <div className="bg-white p-2 rounded-lg shadow-lg">
                <div className="aspect-w-16 aspect-h-9 h-64">
                  <MapComponent incidents={incidents} height="100%" interactive={false} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Recent Incidents Section */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="mb-8 flex justify-between items-center">
            <h2 className="text-2xl md:text-3xl font-bold">Recent Incidents</h2>
            <Link to="/incidents">
              <Button variant="outline">View All</Button>
            </Link>
          </div>
          
          {recentIncidents.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No incidents reported yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recentIncidents.map((incident) => (
                <IncidentCard key={incident.id} incident={incident} />
              ))}
            </div>
          )}
        </div>
      </section>
      
      {/* How It Works Section */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold mb-8 text-center">How Ajali! Works</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-sm text-center">
              <div className="bg-ajali-red text-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">Report an Incident</h3>
              <p className="text-gray-600">
                Quickly report emergencies with location, details, and supporting evidence.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm text-center">
              <div className="bg-ajali-yellow text-ajali-dark w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">Authorities Respond</h3>
              <p className="text-gray-600">
                Emergency services are notified and can coordinate their response efficiently.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm text-center">
              <div className="bg-ajali-orange text-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">Track Progress</h3>
              <p className="text-gray-600">
                Follow the status of your reported incidents and receive updates.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Call to Action Section */}
      <section className="py-16 bg-ajali-dark text-white text-center">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Be part of making Kenya safer
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Join our community of responsible citizens working together to improve emergency response times.
          </p>
          {!isAuthenticated && (
            <Link to="/register">
              <Button size="lg" className="bg-ajali-red hover:bg-red-700 text-white">
                Sign Up Now
              </Button>
            </Link>
          )}
        </div>
      </section>
    </MainLayout>
  );
};

export default Home;
