import { AppShell } from '@mantine/core';
import { Link } from 'react-router-dom';
import { Text, Button } from '@mantine/core';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <AppShell
      padding="md"
      navbar={{
        width: 300,
        breakpoint: 'sm'
      }}
      header={{
        height: 60
      }}
    >
      <AppShell.Header p="xs">
        <Text size="xl">Temple of the Third Place</Text>
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
      </AppShell.Navbar>

      <AppShell.Main>
        {children}
      </AppShell.Main>
    </AppShell>
  );
}