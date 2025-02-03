import { MantineProvider } from '@mantine/core';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Members from './components/Members';
import Sacraments from './components/Sacraments';
import Donations from './components/Donations';
import Inventory from './components/Inventory';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <MantineProvider>
        <Router>
          <Layout>
            <Routes>
              <Route path="/members" element={<Members />} />
              <Route path="/sacraments" element={<Sacraments />} />
              <Route path="/donations" element={<Donations />} />
              <Route path="/inventory" element={<Inventory />} />
            </Routes>
          </Layout>
        </Router>
      </MantineProvider>
    </QueryClientProvider>
  );
}

export default App;