
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { IncidentProvider } from "./contexts/IncidentContext";
import Home from "./pages/Home";
import IncidentsList from "./pages/incidents/IncidentsList";
import IncidentDetail from "./pages/incidents/IncidentDetail";
import ReportIncident from "./pages/incidents/ReportIncident";
import EditIncident from "./pages/incidents/EditIncident";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import UserDashboard from "./pages/UserDashboard";
import AdminDashboard from "./pages/admin/AdminDashboard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <IncidentProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/incidents" element={<IncidentsList />} />
              <Route path="/incidents/:id" element={<IncidentDetail />} />
              <Route path="/report" element={<ReportIncident />} />
              <Route path="/edit-incident/:id" element={<EditIncident />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/dashboard" element={<UserDashboard />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </IncidentProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
