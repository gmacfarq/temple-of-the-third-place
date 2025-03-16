import { useEffect, useState } from 'react';
import { Container, Title, Text, Grid, Paper, Group, Button, LoadingOverlay } from '@mantine/core';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../hooks/useAuth';
import { members } from '../../services/api';
import PendingDashboard from './PendingDashboard';
import ExpiredDashboard from './ExpiredDashboard';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [membershipStatus, setMembershipStatus] = useState<string | null>(null);

  const { data: memberDetails, isLoading } = useQuery({
    queryKey: ['member', user?.id],
    queryFn: () => members.getById(Number(user?.id)),
    enabled: !!user?.id
  });

  useEffect(() => {
    if (memberDetails) {
      setMembershipStatus(memberDetails.membership_status || 'Pending');
    }
  }, [memberDetails]);

  if (isLoading) {
    return <LoadingOverlay visible={true} />;
  }

  // Render different dashboards based on membership status
  if (membershipStatus === 'Pending') {
    return <PendingDashboard user={user} />;
  }

  if (membershipStatus === 'Expired') {
    return <ExpiredDashboard user={user} />;
  }

  // Active member dashboard
  const isAdmin = user?.role === 'admin' || user?.role === 'advisor';

  return (
    <Container size="lg" py="xl">
      <Title order={1} mb="xl">Welcome, {user?.firstName}!</Title>

      <Grid gutter="xl">
        <Grid.Col span={{ base: 12, md: 6 }}>
          <Paper p="xl" shadow="md" h="100%">
            <Title order={3} mb="md">MY MEMBERSHIP</Title>
            <Text mb="xl">
              View your membership details, agreements, and update your profile information.
            </Text>
            <Button onClick={() => navigate('/profile')}>
              VIEW PROFILE
            </Button>
          </Paper>
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 6 }}>
          <Paper p="xl" shadow="md" h="100%">
            <Title order={3} mb="md">UPCOMING EVENTS</Title>
            <Text mb="xl">
              Browse and register for upcoming ceremonies, workshops, and community gatherings.
            </Text>
            <Button onClick={() => navigate('/events')}>
              VIEW EVENTS
            </Button>
          </Paper>
        </Grid.Col>

        {isAdmin && (
          <>
            <Grid.Col span={{ base: 12, md: 6 }}>
              <Paper p="xl" shadow="md" h="100%">
                <Title order={3} mb="md">MEMBER MANAGEMENT</Title>
                <Text mb="xl">
                  Review and manage member applications, update membership statuses, and view member profiles.
                </Text>
                <Button onClick={() => navigate('/members')}>
                  MANAGE MEMBERS
                </Button>
              </Paper>
            </Grid.Col>

            <Grid.Col span={{ base: 12, md: 6 }}>
              <Paper p="xl" shadow="md" h="100%">
                <Title order={3} mb="md">SACRAMENT INVENTORY</Title>
                <Text mb="xl">
                  Manage the temple's sacrament inventory, track usage, and update stock levels.
                </Text>
                <Button onClick={() => navigate('/sacraments')}>
                  VIEW SACRAMENTS
                </Button>
              </Paper>
            </Grid.Col>
          </>
        )}

        <Grid.Col span={12}>
          <Paper p="xl" shadow="md" h="100%">
            <Title order={3} mb="md">OUR TEMPLE COMMUNITY</Title>
            <Text mb="xl">
              As an active member, you are part of a spiritual community dedicated to sacred plant medicine and personal growth.
              Our temple provides a safe, supportive environment for exploring consciousness and connecting with like-minded individuals.
            </Text>
            <Grid>
              <Grid.Col span={{ base: 12, md: 4 }}>
                <Title order={4} mb="sm">INCLUSIVE COMMUNITY</Title>
                <Text>
                  We celebrate the diversity of spiritual traditions and perspectives, honoring the
                  sacredness within all paths.
                </Text>
              </Grid.Col>
              <Grid.Col span={{ base: 12, md: 4 }}>
                <Title order={4} mb="sm">COMPASSIONATE GUIDANCE</Title>
                <Text>
                  We offer support to those who partake in sacred ceremonies, believing in the
                  transformative power of these experiences.
                </Text>
              </Grid.Col>
              <Grid.Col span={{ base: 12, md: 4 }}>
                <Title order={4} mb="sm">SELF-DISCOVERY</Title>
                <Text>
                  We encourage members to embrace their journey, reject shame, and seek
                  self-awareness to navigate their spiritual path.
                </Text>
              </Grid.Col>
            </Grid>
          </Paper>
        </Grid.Col>
      </Grid>
    </Container>
  );
}