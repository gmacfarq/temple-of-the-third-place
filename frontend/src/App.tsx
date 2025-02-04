import { MantineProvider } from '@mantine/core';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
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

const queryClient = new QueryClient();

// Protected Route component
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" />;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <MantineProvider>
        <AuthProvider>
          <Router>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route
                path="/*"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <Routes>
                        <Route path="/members" element={<Members />} />
                        <Route path="/members/:id" element={<MemberDetails />} />
                        <Route path="/sacraments" element={<Sacraments />} />
                        <Route path="/sacraments/new" element={<SacramentForm />} />
                        <Route path="/sacraments/:id" element={<SacramentDetail />} />
                        <Route path="/donations" element={<Donations />} />
                        <Route path="/inventory" element={<Inventory />} />
                        <Route path="/" element={<Navigate to="/members" />} />
                      </Routes>
                    </Layout>
                  </ProtectedRoute>
                }
              />
            </Routes>
          </Router>
        </AuthProvider>
      </MantineProvider>
    </QueryClientProvider>
  );
}

export default App;