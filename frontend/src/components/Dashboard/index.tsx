import { Container, Title, Text, Grid, Paper, Group, Button } from '@mantine/core';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const isAdmin = user?.role === 'admin' || user?.role === 'advisor';

  return (
    <Container size="lg" py="xl">
      <Title order={1} mb="xl">Welcome, {user?.firstName}!</Title>

      <Grid gutter="xl">
        <Grid.Col span={{ base: 12, md: 6 }}>
          <Paper p="xl" shadow="md" h="100%">
            <Title order={3} mb="md">My Membership</Title>
            <Text mb="xl">
              View your membership details, agreements, and update your profile information.
            </Text>
            <Button onClick={() => navigate('/profile')}>
              View Profile
            </Button>
          </Paper>
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 6 }}>
          <Paper p="xl" shadow="md" h="100%">
            <Title order={3} mb="md">Upcoming Events</Title>
            <Text mb="xl">
              Browse and register for upcoming ceremonies, workshops, and community gatherings.
            </Text>
            <Button onClick={() => navigate('/events')}>
              View Events
            </Button>
          </Paper>
        </Grid.Col>

        {isAdmin && (
          <>
            <Grid.Col span={{ base: 12, md: 6 }}>
              <Paper p="xl" shadow="md" h="100%">
                <Title order={3} mb="md">Sacrament Management</Title>
                <Text mb="xl">
                  Manage sacrament inventory, view low stock alerts, and update sacrament details.
                </Text>
                <Group>
                  <Button onClick={() => navigate('/sacraments')}>
                    View Sacraments
                  </Button>
                  <Button variant="outline" onClick={() => navigate('/inventory')}>
                    Inventory
                  </Button>
                </Group>
              </Paper>
            </Grid.Col>

            <Grid.Col span={{ base: 12, md: 6 }}>
              <Paper p="xl" shadow="md" h="100%">
                <Title order={3} mb="md">Member Management</Title>
                <Text mb="xl">
                  View and manage temple members, check-ins, and donation history.
                </Text>
                <Group>
                  <Button onClick={() => navigate('/members')}>
                    View Members
                  </Button>
                  <Button variant="outline" onClick={() => navigate('/donations')}>
                    Donations
                  </Button>
                </Group>
              </Paper>
            </Grid.Col>
          </>
        )}
      </Grid>
    </Container>
  );
}