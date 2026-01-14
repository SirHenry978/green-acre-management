import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Branches from "./pages/Branches";
import Users from "./pages/Users";
import Inventory from "./pages/Inventory";
import Finance from "./pages/Finance";
import Attendance from "./pages/Attendance";
import Suppliers from "./pages/Suppliers";
import Customers from "./pages/Customers";
import Assets from "./pages/Assets";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<Login />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/branches" element={<Branches />} />
            <Route path="/users" element={<Users />} />
            <Route path="/inventory" element={<Inventory />} />
            <Route path="/finance" element={<Finance />} />
            <Route path="/attendance" element={<Attendance />} />
            <Route path="/suppliers" element={<Suppliers />} />
            <Route path="/customers" element={<Customers />} />
            <Route path="/assets" element={<Assets />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
