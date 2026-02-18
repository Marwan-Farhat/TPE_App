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
import TimeSlotsList from "./pages/admin/coordination/TimeSlotsList";
import TimeSlotForm from "./pages/admin/coordination/TimeSlotForm";
import TimeSlotDetail from "./pages/admin/coordination/TimeSlotDetail";
import TestTemplatesList from "./pages/admin/placementTests/TestTemplatesList";
import QuizzesList from "./pages/admin/testingCenter/QuizzesList";
import QuestionsList from "./pages/admin/testingCenter/QuestionsList";
import QuizQuestionsPage from "./pages/admin/testingCenter/QuizQuestionsPage";
import OralTestTypesList from "./pages/admin/oralExams/OralTestTypesList";
import ExamSlotsList from "./pages/admin/oralExams/ExamSlotsList";
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

              {/* Coordination - Time Slots */}
              <Route
                path="/admin/coordination/time-slots"
                element={
                  <ProtectedRoute requiredInterface="Admin">
                    <TimeSlotsList />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/coordination/time-slots/add"
                element={
                  <ProtectedRoute requiredInterface="Admin">
                    <TimeSlotForm />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/coordination/time-slots/:id"
                element={
                  <ProtectedRoute requiredInterface="Admin">
                    <TimeSlotDetail />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/coordination/time-slots/:id/edit"
                element={
                  <ProtectedRoute requiredInterface="Admin">
                    <TimeSlotForm editMode />
                  </ProtectedRoute>
                }
              />

              {/* Placement Tests */}
              <Route
                path="/admin/placement-tests/templates"
                element={
                  <ProtectedRoute requiredInterface="Admin">
                    <TestTemplatesList />
                  </ProtectedRoute>
                }
              />

              {/* Testing Center */}
              <Route
                path="/admin/testing-center/quizzes"
                element={
                  <ProtectedRoute requiredInterface="Admin">
                    <QuizzesList />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/testing-center/quizzes/:id/questions"
                element={
                  <ProtectedRoute requiredInterface="Admin">
                    <QuizQuestionsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/testing-center/questions"
                element={
                  <ProtectedRoute requiredInterface="Admin">
                    <QuestionsList />
                  </ProtectedRoute>
                }
              />

              {/* Oral Exams */}
              <Route
                path="/admin/oral-exams/test-types"
                element={
                  <ProtectedRoute requiredInterface="Admin">
                    <OralTestTypesList />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/oral-exams/slots"
                element={
                  <ProtectedRoute requiredInterface="Admin">
                    <ExamSlotsList />
                  </ProtectedRoute>
                }
              />

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
