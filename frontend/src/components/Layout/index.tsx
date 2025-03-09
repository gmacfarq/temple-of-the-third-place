import { AppShell, Button, Group } from '@mantine/core';
import { Link, Outlet } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import Navbar from './Navbar';

export default function Layout() {
  const { user, isAuthenticated } = useAuth();
  const isAdminOrAdvisor = user?.role === 'admin' || user?.role === 'advisor';

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={isAuthenticated && isAdminOrAdvisor ? { width: 250, breakpoint: 'sm' } : undefined}
      padding="md"
    >
      <AppShell.Header>
        <Navbar />
      </AppShell.Header>

      {isAuthenticated && isAdminOrAdvisor && (
        <AppShell.Navbar p="md">
          <Group gap="sm" flex="column">
            <Button component={Link} to="/members" fullWidth variant="subtle">
              Members
            </Button>
            <Button component={Link} to="/sacraments" fullWidth variant="subtle">
              Sacraments
            </Button>
            <Button component={Link} to="/donations" fullWidth variant="subtle">
              Donations
            </Button>
            <Button component={Link} to="/inventory" fullWidth variant="subtle">
              Inventory
            </Button>
          </Group>
        </AppShell.Navbar>
      )}

      <AppShell.Main>
        <Outlet />
      </AppShell.Main>
    </AppShell>
  );
}