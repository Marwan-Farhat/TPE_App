import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";

import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AddNewClient from "./pages/admin/AddNewClient";
import AllClients from "./pages/admin/AllClients";
import ClientProfile from "./pages/admin/ClientProfile";
import EditClient from "./pages/admin/EditClient";
import TaskDetail from "./pages/admin/TaskDetail";
import TeacherDashboard from "./pages/teacher/TeacherDashboard";
import ClientDashboard from "./pages/client/ClientDashboard";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem={false}
      storageKey="proenglish-theme"
      disableTransitionOnChange={false}
    >
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              
              {/* Protected Admin Routes */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute requiredInterface="Admin">
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/clients"
                element={
                  <ProtectedRoute requiredInterface="Admin">
                    <AllClients />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/clients/add"
                element={
                  <ProtectedRoute requiredInterface="Admin">
                    <AddNewClient />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/clients/:id"
                element={
                  <ProtectedRoute requiredInterface="Admin">
                    <ClientProfile />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/clients/:id/edit"
                element={
                  <ProtectedRoute requiredInterface="Admin">
                    <EditClient />
                  </ProtectedRoute>
                }
              />
              <Route
               path="/admin/tasks/:id"
               element={
                 <ProtectedRoute requiredInterface="Admin">
                   <TaskDetail />
                 </ProtectedRoute>
               }
             />
              {/* Protected Teacher Routes */}
              <Route
                path="/teacher/*"
                element={
                  <ProtectedRoute requiredInterface="Teacher">
                    <TeacherDashboard />
                  </ProtectedRoute>
                }
              />
              
              {/* Protected Client Routes */}
              <Route
                path="/client/*"
                element={
                  <ProtectedRoute requiredInterface="Client">
                    <ClientDashboard />
                  </ProtectedRoute>
                }
              />
              
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;