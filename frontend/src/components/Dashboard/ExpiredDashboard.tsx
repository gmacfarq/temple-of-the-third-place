import { Container, Title, Text, Paper, Button, Stack, Group, List, ThemeIcon } from '@mantine/core';
import { useNavigate } from 'react-router-dom';
import { IconCalendarDue, IconCreditCard, IconMapPin, IconCheck } from '@tabler/icons-react';

export default function ExpiredDashboard({ user }) {
  const navigate = useNavigate();

  return (
    <Container size="lg" py="xl">
      <Stack spacing="xl">
        <Title order={1}>Welcome Back, {user?.firstName}!</Title>

        <Paper p="xl" shadow="md" withBorder>
          <Stack spacing="lg">
            <Group position="apart">
              <Title order={2}>Your Membership has Expired</Title>
              <Button variant="outline" color="red">EXPIRED</Button>
            </Group>

            <Text>
              Your membership with Temple of the Third Place has expired. To regain access to our ceremonies
              and community events, please renew your membership.
            </Text>

            <Title order={3}>Steps to Renew Your Membership:</Title>

            <List spacing="md">
              <List.Item
                icon={
                  <ThemeIcon size={24} radius="xl">
                    <IconMapPin size={16} />
                  </ThemeIcon>
                }
              >
                <Text>
                  <strong>Visit our temple in person</strong> - Speak with an advisor about renewing your membership.
                </Text>
              </List.Item>

              <List.Item
                icon={
                  <ThemeIcon size={24} radius="xl">
                    <IconCalendarDue size={16} />
                  </ThemeIcon>
                }
              >
                <Text>
                  <strong>Update your information</strong> - Ensure all your personal information is current.
                </Text>
              </List.Item>

              <List.Item
                icon={
                  <ThemeIcon size={24} radius="xl">
                    <IconCreditCard size={16} />
                  </ThemeIcon>
                }
              >
                <Text>
                  <strong>Process renewal</strong> - Complete any necessary paperwork and contributions.
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
                  <strong>Resume your journey</strong> - Once renewed, you'll regain full access to our community.
                </Text>
              </List.Item>
            </List>

            <Button onClick={() => navigate('/profile')}>
              VIEW MY PROFILE
            </Button>
          </Stack>
        </Paper>

        <Paper p="xl" shadow="md" withBorder>
          <Title order={3} mb="md">WHILE YOUR MEMBERSHIP IS EXPIRED</Title>
          <Text mb="lg">
            Even with an expired membership, you can still access our educational resources and learn about our
            community. However, participation in ceremonies and certain events requires an active membership status.
          </Text>

          <Title order={4} mb="md">BENEFITS OF RENEWING</Title>
          <List spacing="md">
            <List.Item>
              <strong>CEREMONY ACCESS</strong> - Participate in our sacred plant medicine ceremonies.
            </List.Item>
            <List.Item>
              <strong>COMMUNITY SUPPORT</strong> - Connect with like-minded individuals on similar spiritual paths.
            </List.Item>
            <List.Item>
              <strong>SPIRITUAL GUIDANCE</strong> - Receive guidance from experienced advisors.
            </List.Item>
          </List>
        </Paper>
      </Stack>
    </Container>
  );
}