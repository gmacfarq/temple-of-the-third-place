import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import {
  Paper,
  Title,
  TextInput,
  Button,
  Group,
  Stack,
  PasswordInput,
  Checkbox,
  Text,
  Divider,
  Box,
  LoadingOverlay
} from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { auth } from '../../services/api';
import { useNotifications } from '../../hooks/useNotifications';
import DoctrineAgreement from './DoctrineAgreement';
import MembershipAgreement from './MembershipAgreement';
import MedicalWaiver from './MedicalWaiver';
import { ApiError } from '../../types/api';

export default function MemberSignup() {
  const navigate = useNavigate();
  const { showSuccess, showError } = useNotifications();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    birthDate: null as Date | null,
    phoneNumber: '',
    membershipType: 'Exploratory'
  });

  const [agreements, setAgreements] = useState({
    doctrine: false,
    membership: false,
    medical: false
  });

  const [activeDocument, setActiveDocument] = useState<string | null>(null);

  const signupMutation = useMutation({
    mutationFn: auth.register,
    onSuccess: () => {
      showSuccess(
        'Application submitted successfully',
        'Your membership is pending approval. Please visit our temple in person to complete the process.'
      );
      navigate('/login');
    },
    onError: (error: ApiError | unknown) => {
      const message = error instanceof Error ? error.message : 'An error occurred';
      showError('Error creating account', message);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!agreements.doctrine || !agreements.membership || !agreements.medical) {
      showError('Agreement Required', 'You must agree to all terms to join');
      return;
    }

    if (!formData.birthDate) {
      showError('Date of Birth Required', 'Please enter your date of birth');
      return;
    }

    // Calculate age
    const today = new Date();
    const birthDate = new Date(formData.birthDate);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    if (age < 21) {
      showError('Age Requirement', 'You must be at least 21 years old to join');
      return;
    }

    // Format the agreement timestamp for MySQL compatibility
    const now = new Date();
    const formattedTimestamp = now.toISOString().replace('T', ' ').replace(/\.\d+Z$/, '');

    signupMutation.mutate({
      ...formData,
      birthDate: formData.birthDate?.toISOString().split('T')[0],
      agreementTimestamp: formattedTimestamp,
      doctrineAgreed: agreements.doctrine,
      membershipAgreed: agreements.membership,
      medicalAgreed: agreements.medical,
      membershipStatus: 'Pending'
    });
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

  return (
    <Paper p="xl" shadow="md" radius="md" withBorder>
      <LoadingOverlay visible={signupMutation.isPending} />
      <Title order={2} mb="md">Join Temple of the Third Place</Title>
      <Text color="dimmed" mb="xl">
        Complete this form to become a member of our spiritual community
      </Text>

      <form onSubmit={handleSubmit}>
        <Stack>
          <Group grow>
            <TextInput
              label="First Name"
              placeholder="Enter your first name"
              required
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
            />

            <TextInput
              label="Last Name"
              placeholder="Enter your last name"
              required
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
            />
          </Group>

          <Group grow>
            <TextInput
              label="Email"
              placeholder="Enter your email"
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />

            <PasswordInput
              label="Password"
              placeholder="Choose a password"
              required
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
          </Group>

          <Group grow>
            <DateInput
              label="Date of Birth"
              placeholder="YYYY-MM-DD"
              required
              value={formData.birthDate}
              onChange={(value) => setFormData({ ...formData, birthDate: value })}
              maxDate={new Date()}
            />

            <TextInput
              label="Phone Number"
              placeholder="Enter your phone number"
              required
              value={formData.phoneNumber}
              onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
            />
          </Group>

          <Divider my="md" label="Required Agreements" labelPosition="center" />

          <Box>
            <Group mb="xs">
              <Checkbox
                checked={agreements.doctrine}
                onChange={(e) => setAgreements({ ...agreements, doctrine: e.currentTarget.checked })}
                required
              />
              <Text>
                I have read and agree to the{' '}
                <Text span c="blue" style={{ cursor: 'pointer' }} onClick={() => setActiveDocument('doctrine')}>
                  Temple of the Third Place Doctrine
                </Text>
              </Text>
            </Group>

            <Group mb="xs">
              <Checkbox
                checked={agreements.membership}
                onChange={(e) => setAgreements({ ...agreements, membership: e.currentTarget.checked })}
                required
              />
              <Text>
                I have read and agree to the{' '}
                <Text span c="blue" style={{ cursor: 'pointer' }} onClick={() => setActiveDocument('membership')}>
                  Temple of the Third Place Membership Agreement
                </Text>
              </Text>
            </Group>

            <Group mb="xs">
              <Checkbox
                checked={agreements.medical}
                onChange={(e) => setAgreements({ ...agreements, medical: e.currentTarget.checked })}
                required
              />
              <Text>
                I have read and agree to the{' '}
                <Text span c="blue" style={{ cursor: 'pointer' }} onClick={() => setActiveDocument('medical')}>
                  Medical and Liability Release Waiver
                </Text>
              </Text>
            </Group>
          </Box>

          <Group justify="flex-end" mt="xl">
            <Button variant="outline" onClick={() => navigate('/')}>
              Cancel
            </Button>
            <Button type="submit" disabled={!agreements.doctrine || !agreements.membership || !agreements.medical}>
              Join
            </Button>
          </Group>
        </Stack>
      </form>
    </Paper>
  );
}