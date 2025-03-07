import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Paper,
  Title,
  TextInput,
  Button,
  Group,
  Stack,
  Select
} from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { useNavigate } from 'react-router-dom';
import { auth } from '../../services/api';
import { useNotifications } from '../../hooks/useNotifications';
import { MemberFormData } from '../../types/member';

export default function MemberForm() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useNotifications();

  const [formData, setFormData] = useState<MemberFormData>({
    firstName: '',
    lastName: '',
    email: '',
    birthDate: '',
    phoneNumber: '',
    membershipType: 'Exploratory'
  });

  const addMemberMutation = useMutation({
    mutationFn: auth.register,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members'] });
      showSuccess('Member added successfully');
      navigate('/members');
    },
    onError: (error) => {
      showError(`Failed to add member: ${(error as Error).message}`);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addMemberMutation.mutate(formData);
  };

  return (
    <Paper shadow="md" p="xl">
      <Title order={2} mb="md">Add New Member</Title>

      <form onSubmit={handleSubmit}>
        <Stack>
          <TextInput
            label="First Name"
            value={formData.firstName}
            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
            required
          />

          <TextInput
            label="Last Name"
            value={formData.lastName}
            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
            required
          />

          <TextInput
            label="Email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />

          <TextInput
            label="Birth Date"
            placeholder="YYYY-MM-DD"
            value={formData.birthDate}
            onChange={(e) => setFormData({
              ...formData,
              birthDate: e.target.value
            })}
            description="Enter date in YYYY-MM-DD format"
          />

          <TextInput
            label="Phone Number"
            value={formData.phoneNumber}
            onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
          />

          <Select
            label="Membership Type"
            value={formData.membershipType}
            onChange={(value) => setFormData({
              ...formData,
              membershipType: value as 'Exploratory' | 'Starter' | 'Lovely'
            })}
            data={[
              { value: 'Exploratory', label: 'Exploratory' },
              { value: 'Starter', label: 'Starter' },
              { value: 'Lovely', label: 'Lovely' }
            ]}
            required
          />

          <Group justify="flex-end" mt="md">
            <Button variant="outline" onClick={() => navigate('/members')}>
              Cancel
            </Button>
            <Button type="submit" loading={addMemberMutation.isPending}>
              Add Member
            </Button>
          </Group>
        </Stack>
      </form>
    </Paper>
  );
}