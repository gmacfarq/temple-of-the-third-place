import { Container, Title, Text, Button, Group, Stack, Paper, Image, Grid } from '@mantine/core';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export default function Home() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  return (
    <Container size="lg" py="xl">
      <Grid gutter="xl" align="center">
        <Grid.Col span={{ base: 12, md: 6 }}>
          <Stack gap="xl">
            <div>
              <Title order={1} size="h1">Temple of the Third Place</Title>
              <Text size="lg" mt="md" c="dimmed">
                A spiritual community dedicated to sacred plant medicine and personal growth
              </Text>
            </div>

            <Text>
              Welcome to the Temple of the Third Place, where we embrace a profound and inclusive
              spiritual path that cherishes the wisdom of ancestral knowledge while remaining open
              to modern insights. Our purpose is to offer education, safe access, and a nurturing
              environment for individuals seeking to explore the divine within.
            </Text>

            <Group>
              {!isAuthenticated ? (
                <>
                  <Button size="lg" onClick={() => navigate('/signup')}>
                    Join Our Community
                  </Button>
                  <Button size="lg" variant="outline" onClick={() => navigate('/login')}>
                    Member Login
                  </Button>
                </>
              ) : (
                <Button size="lg" onClick={() => navigate('/dashboard')}>
                  Go to Dashboard
                </Button>
              )}
            </Group>
          </Stack>
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 6 }}>
          <Paper shadow="md" p="md" radius="md">
            <Image
              src="/images/temple-logo.png"
              alt="Temple of the Third Place"
              fallbackSrc="https://placehold.co/600x400?text=Temple+of+the+Third+Place"
            />
          </Paper>
        </Grid.Col>
      </Grid>

      <Grid mt={50}>
        <Grid.Col span={12}>
          <Title order={2} ta="center" mb="xl">Our Core Principles</Title>
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 4 }}>
          <Paper p="xl" shadow="md" h="100%">
            <Title order={3} mb="md">Inclusive Community</Title>
            <Text>
              We celebrate the diversity of spiritual traditions and perspectives, honoring the
              sacredness within all paths.
            </Text>
          </Paper>
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 4 }}>
          <Paper p="xl" shadow="md" h="100%">
            <Title order={3} mb="md">Compassionate Guidance</Title>
            <Text>
              We offer support to those who partake in sacred ceremonies, believing in the
              transformative power of these experiences.
            </Text>
          </Paper>
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 4 }}>
          <Paper p="xl" shadow="md" h="100%">
            <Title order={3} mb="md">Self-Discovery</Title>
            <Text>
              We encourage members to embrace their journey, reject shame, and seek
              self-awareness to navigate their spiritual path.
            </Text>
          </Paper>
        </Grid.Col>
      </Grid>
    </Container>
  );
}