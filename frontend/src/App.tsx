import { MantineProvider } from '@mantine/core';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { useAuth } from './hooks/useAuth';
import Layout from './components/Layout';
import Login from './components/Auth/Login';
import Members from './components/Members';
import Sacraments from './components/Sacraments';
import Donations from './components/Donations';
import Inventory from './components/Inventory';
import MemberDetails from './components/Members/MemberDetails';
import SacramentForm from './components/Sacraments/SacramentForm';
import SacramentDetail from './components/Sacraments/SacramentDetail';
import { Notifications } from '@mantine/notifications';
import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';
import ErrorBoundary from './components/common/ErrorBoundary';

const queryClient = new QueryClient();

function ProtectedRoute() {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" />;
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <QueryClientProvider client={queryClient}>
          <MantineProvider>
            <Notifications />
            <ErrorBoundary>
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route element={<ProtectedRoute />}>
                  <Route element={<Layout />}>
                    <Route path="/members" element={<Members />} />
                    <Route path="/members/:id" element={<MemberDetails />} />
                    <Route path="/sacraments" element={<Sacraments />} />
                    <Route path="/sacraments/new" element={<SacramentForm />} />
                    <Route path="/sacraments/:id" element={<SacramentDetail />} />
                    <Route path="/donations" element={<Donations />} />
                    <Route path="/inventory" element={<Inventory />} />
                    <Route path="/" element={<Navigate to="/members" />} />
                  </Route>
                </Route>
              </Routes>
            </ErrorBoundary>
          </MantineProvider>
        </QueryClientProvider>
      </AuthProvider>
    </Router>
  );
}