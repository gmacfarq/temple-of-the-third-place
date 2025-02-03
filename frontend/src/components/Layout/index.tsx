import { AppShell, Text, Button, Group } from '@mantine/core';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <AppShell
      padding="md"
      header={{ height: 60 }}
      navbar={{ width: 300, breakpoint: 'sm' }}
    >
      <AppShell.Header p="xs">
        <Group justify="apart">
          <Text size="xl">Temple of the Third Place</Text>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="xs">
        <Button component={Link} to="/members" fullWidth mb="sm">
          Members
        </Button>
        <Button component={Link} to="/sacraments" fullWidth mb="sm">
          Sacraments
        </Button>
        <Button component={Link} to="/donations" fullWidth mb="sm">
          Donations
        </Button>
        <Button component={Link} to="/inventory" fullWidth mb="sm">
          Inventory
        </Button>
        <Button onClick={handleLogout} color="red" fullWidth mt="auto">
          Logout
        </Button>
      </AppShell.Navbar>

      <AppShell.Main>
        {children}
      </AppShell.Main>
    </AppShell>
  );
}