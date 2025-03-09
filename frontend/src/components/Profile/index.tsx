import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Container,
  Title,
  Text,
  Paper,
  Group,
  Stack,
  Button,
  Badge,
  Grid,
  Box,
  Divider
} from '@mantine/core';
import { useAuth } from '../../hooks/useAuth';
import { members } from '../../services/api';
import DoctrineAgreement from '../MemberSignup/DoctrineAgreement';
import MembershipAgreement from '../MemberSignup/MembershipAgreement';
import MedicalWaiver from '../MemberSignup/MedicalWaiver';

export default function Profile() {
  const { user } = useAuth();
  const [activeDocument, setActiveDocument] = useState<string | null>(null);

  const { data: memberDetails, isLoading } = useQuery({
    queryKey: ['member', user?.id],
    queryFn: () => members.getById(Number(user?.id)),
    enabled: !!user?.id
  });

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  const renderDocument = () => {
    switch (activeDocument) {
      case 'doctrine':
        return <DoctrineAgreement onClose={() => setActiveDocument(null)} />;
      case 'membership':
        return <MembershipAgreement onClose={() => setActiveDocument(null)} />;
      case 'medical':
        return <MedicalWaiver onClose={() => setActiveDocument(null)} />;
      default:
        return null;
    }
  };

  if (activeDocument) {
    return renderDocument();
  }

  if (isLoading) {
    return <Text>Loading profile...</Text>;
  }

  return (
    <Container size="md" py="xl">
      <Paper p="xl" shadow="md" radius="md" withBorder>
        <Title order={2} mb="xl">My Profile</Title>

        <Grid>
          <Grid.Col span={12}>
            <Stack gap="md">
              <Box>
                <Text size="sm" color="dimmed">Name</Text>
                <Text>{user?.firstName} {user?.lastName}</Text>
              </Box>

              <Box>
                <Text size="sm" color="dimmed">Email</Text>
                <Text>{user?.email}</Text>
              </Box>

              {memberDetails && (
                <>
                  <Box>
                    <Text size="sm" color="dimmed">Phone</Text>
                    <Text>{memberDetails.phone_number || 'N/A'}</Text>
                  </Box>

                  <Box>
                    <Text size="sm" color="dimmed">Date of Birth</Text>
                    <Text>{formatDate(memberDetails.birth_date)}</Text>
                  </Box>

                  <Box>
                    <Text size="sm" color="dimmed">Membership Type</Text>
                    <Badge>{memberDetails.membership_type}</Badge>
                  </Box>

                  <Box>
                    <Text size="sm" color="dimmed">Membership Status</Text>
                    <Badge color={memberDetails.status === 'Active' ? 'green' : memberDetails.status === 'Pending' ? 'yellow' : 'red'}>
                      {memberDetails.status}
                    </Badge>
                  </Box>
                </>
              )}
            </Stack>
          </Grid.Col>

          <Grid.Col span={12}>
            <Divider my="xl" label="Agreements" labelPosition="center" />

            <Stack gap="md">
              <Box>
                <Group position="apart">
                  <Text>Temple Doctrine</Text>
                  <Group>
                    <Badge color="green">Agreed</Badge>
                    <Button variant="subtle" compact onClick={() => setActiveDocument('doctrine')}>
                      View Document
                    </Button>
                  </Group>
                </Group>
              </Box>

              <Box>
                <Group position="apart">
                  <Text>Membership Agreement</Text>
                  <Group>
                    <Badge color="green">Agreed</Badge>
                    <Button variant="subtle" compact onClick={() => setActiveDocument('membership')}>
                      View Document
                    </Button>
                  </Group>
                </Group>
              </Box>

              <Box>
                <Group position="apart">
                  <Text>Medical Waiver</Text>
                  <Group>
                    <Badge color="green">Agreed</Badge>
                    <Button variant="subtle" compact onClick={() => setActiveDocument('medical')}>
                      View Document
                    </Button>
                  </Group>
                </Group>
              </Box>

              {memberDetails?.agreement_timestamp && (
                <Text size="sm" color="dimmed" ta="right">
                  Agreements signed on {formatDate(memberDetails.agreement_timestamp)}
                </Text>
              )}
            </Stack>
          </Grid.Col>
        </Grid>
      </Paper>
    </Container>
  );
}