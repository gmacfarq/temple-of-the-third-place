import { Container, Title, Text, Paper, Button, Stack, Group, List, ThemeIcon } from '@mantine/core';
import { useNavigate } from 'react-router-dom';
import { IconMapPin, IconClock, IconId, IconCheck } from '@tabler/icons-react';
import templeLogoImage from '../../assets/Images/temple-logo.png';

export default function PendingDashboard({ user }) {
  const navigate = useNavigate();

  return (
    <Container size="lg" py="xl">
      <Stack spacing="xl">
        <Title order={1}>Welcome, {user?.firstName}!</Title>

        <Paper p="xl" shadow="md" withBorder>
          <Stack spacing="lg">
            <Group position="apart">
              <Title order={2}>Your Membership is Pending</Title>
              <Button variant="outline" color="yellow">PENDING APPROVAL</Button>
            </Group>

            <Text>
              Thank you for joining Temple of the Third Place. Your membership application has been received,
              but requires in-person verification before it can be activated.
            </Text>

            <Title order={3}>Next Steps to Activate Your Membership:</Title>

            <List spacing="md">
              <List.Item
                icon={
                  <ThemeIcon size={24} radius="xl">
                    <IconMapPin size={16} />
                  </ThemeIcon>
                }
              >
                <Text>
                  <strong>Visit our temple in person</strong> - Bring a valid government-issued photo ID to verify your identity.
                </Text>
              </List.Item>

              <List.Item
                icon={
                  <ThemeIcon size={24} radius="xl">
                    <IconClock size={16} />
                  </ThemeIcon>
                }
              >
                <Text>
                  <strong>Meet with an advisor</strong> - A brief orientation meeting will be conducted to ensure you understand our community guidelines.
                </Text>
              </List.Item>

              <List.Item
                icon={
                  <ThemeIcon size={24} radius="xl">
                    <IconId size={16} />
                  </ThemeIcon>
                }
              >
                <Text>
                  <strong>Complete verification</strong> - Our advisor will verify your information and activate your membership.
                </Text>
              </List.Item>

              <List.Item
                icon={
                  <ThemeIcon size={24} radius="xl">
                    <IconCheck size={16} />
                  </ThemeIcon>
                }
              >
                <Text>
                  <strong>Begin your journey</strong> - Once activated, you'll have full access to our ceremonies and community events.
                </Text>
              </List.Item>
            </List>

            <Button onClick={() => navigate('/profile')}>
              VIEW MY PROFILE
            </Button>
          </Stack>
        </Paper>

        <Paper p="xl" shadow="md" withBorder>
          <Title order={3} mb="md">ABOUT OUR TEMPLE</Title>
          <Text mb="lg">
            Temple of the Third Place is a spiritual community dedicated to sacred plant medicine and personal growth.
            We provide a safe, supportive environment for members to explore their spirituality through traditional
            ceremonial practices.
          </Text>

          <Title order={4} mb="md">OUR CORE PRINCIPLES</Title>
          <List spacing="md">
            <List.Item>
              <strong>INCLUSIVE COMMUNITY</strong> - We celebrate the diversity of spiritual traditions and perspectives,
              honoring the sacredness within all paths.
            </List.Item>
            <List.Item>
              <strong>COMPASSIONATE GUIDANCE</strong> - We offer support to those who partake in sacred ceremonies,
              believing in the transformative power of these experiences.
            </List.Item>
            <List.Item>
              <strong>SELF-DISCOVERY</strong> - We encourage members to embrace their journey, reject shame,
              and seek self-awareness to navigate their spiritual path.
            </List.Item>
          </List>
        </Paper>
      </Stack>
    </Container>
  );
}