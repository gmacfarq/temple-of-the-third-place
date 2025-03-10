import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './contexts/AuthContext';
import Layout from './components/Layout';
import Home from './components/Home';
import Login from './components/Auth/Login';
import MemberSignup from './components/MemberSignup';
import Dashboard from './components/Dashboard';
import Members from './components/Members';
import MemberDetails from './components/Members/MemberDetails';
import MemberForm from './components/Members/MemberForm';
import Sacraments from './components/Sacraments';
import SacramentDetail from './components/Sacraments/SacramentDetail';
import SacramentForm from './components/Sacraments/SacramentForm';
import Donations from './components/Donations';
import Inventory from './components/Inventory';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import ErrorBoundary from './components/common/ErrorBoundary';
import Profile from './components/Profile';
import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';
import '@mantine/dates/styles.css';
import { templeTheme } from './theme';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <MantineProvider theme={templeTheme}>
        <Notifications />
        <AuthProvider>
          <ErrorBoundary>
            <Router>
              <Routes>
                <Route path="/" element={<Layout />}>
                  {/* Public routes */}
                  <Route index element={<Home />} />
                  <Route path="login" element={<Login />} />
                  <Route path="signup" element={<MemberSignup />} />

                  {/* Protected routes */}
                  <Route element={<ProtectedRoute />}>
                    <Route path="dashboard" element={<Dashboard />} />

                    <Route path="members" element={<Members />} />
                    <Route path="members/:id" element={<MemberDetails />} />
                    <Route path="members/add" element={<MemberForm />} />
                    <Route path="members/:id/edit" element={<MemberForm />} />

                    <Route path="sacraments" element={<Sacraments />} />
                    <Route path="sacraments/:id" element={<SacramentDetail />} />
                    <Route path="sacraments/add" element={<SacramentForm />} />
                    <Route path="sacraments/:id/edit" element={<SacramentForm />} />

                    <Route path="donations" element={<Donations />} />
                    <Route path="inventory" element={<Inventory />} />

                    <Route path="profile" element={<Profile />} />
                  </Route>

                  {/* Fallback route */}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Route>
              </Routes>
            </Router>
          </ErrorBoundary>
        </AuthProvider>
      </MantineProvider>
    </QueryClientProvider>
  );
}

export default App;