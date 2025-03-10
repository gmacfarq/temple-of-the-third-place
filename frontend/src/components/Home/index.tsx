import { Container, Title, Text, Button, Group, Stack, Paper, Image, Grid } from '@mantine/core';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import templeLogoImage from '../../assets/Images/temple-logo.png';

export default function Home() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  return (
    <Container size="lg" py="xl">
      <Stack align="center" spacing={50} mb={80}>
        <Image
          src={templeLogoImage}
          alt="Temple of the Third Place"
          width={400}
          mx="auto"
        />

        <Text size="lg" ta="center" maw={700} mx="auto">
          A spiritual community dedicated to sacred plant medicine and personal growth
        </Text>

        <Group>
          {!isAuthenticated ? (
            <>
              <Button size="lg" onClick={() => navigate('/signup')}>
                JOIN OUR COMMUNITY
              </Button>
              <Button size="lg" variant="outline" onClick={() => navigate('/login')}>
                MEMBER LOGIN
              </Button>
            </>
          ) : (
            <Button size="lg" onClick={() => navigate('/dashboard')}>
              GO TO DASHBOARD
            </Button>
          )}
        </Group>
      </Stack>

      <Grid mt={80}>
        <Grid.Col span={12}>
          <Title order={2} ta="center" mb="xl">OUR CORE PRINCIPLES</Title>
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 4 }}>
          <Paper p="xl" shadow="md" h="100%">
            <Title order={3} mb="md">INCLUSIVE COMMUNITY</Title>
            <Text>
              We celebrate the diversity of spiritual traditions and perspectives, honoring the
              sacredness within all paths.
            </Text>
          </Paper>
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 4 }}>
          <Paper p="xl" shadow="md" h="100%">
            <Title order={3} mb="md">COMPASSIONATE GUIDANCE</Title>
            <Text>
              We offer support to those who partake in sacred ceremonies, believing in the
              transformative power of these experiences.
            </Text>
          </Paper>
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 4 }}>
          <Paper p="xl" shadow="md" h="100%">
            <Title order={3} mb="md">SELF-DISCOVERY</Title>
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