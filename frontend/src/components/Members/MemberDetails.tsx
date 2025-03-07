import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Paper,
  Title,
  Text,
  Group,
  Button,
  TextInput,
  Stack,
  LoadingOverlay,
  Select,
  Badge,
  Divider,
} from '@mantine/core';
import { members } from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
import DeleteConfirmationModal from '../common/DeleteConfirmationModal';
import { useNotifications } from '../../hooks/useNotifications';
import { MemberFormData } from '../../types/member';

export default function MemberDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useNotifications();

  const [isEditing, setIsEditing] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [formData, setFormData] = useState<MemberFormData>({
    firstName: '',
    lastName: '',
    email: '',
    birthDate: '',
    phoneNumber: '',
    membershipType: 'Exploratory'
  });

  const { data: member, isLoading } = useQuery({
    queryKey: ['member', id],
    queryFn: () => members.getById(Number(id))
  });

  useEffect(() => {
    if (member) {
      const birthDate = member.birth_date || '';
      let formattedDate = '';

      if (birthDate) {
        // Handle ISO date format (1999-05-24T00:00:00.000Z)
        const dateObj = new Date(birthDate);
        const year = dateObj.getUTCFullYear().toString();
        const month = (dateObj.getUTCMonth() + 1).toString().padStart(2, '0');
        const day = dateObj.getUTCDate().toString().padStart(2, '0');

        // Format as YYYY-MM-DD for the form
        formattedDate = `${year}-${month}-${day}`;
      }

      setFormData({
        firstName: member.first_name,
        lastName: member.last_name,
        email: member.email,
        birthDate: formattedDate,
        phoneNumber: member.phone_number || '',
        membershipType: member.membership_type || 'Exploratory'
      });
    }
  }, [member]);

  const updateMutation = useMutation({
    mutationFn: (data: MemberFormData) => members.updateProfile(Number(id), data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['member', id] });
      setIsEditing(false);
      showSuccess('Member updated successfully');
    },
    onError: (error) => {
      showError(`Failed to update member: ${(error as Error).message}`);
    }
  });

  const membershipMutation = useMutation({
    mutationFn: (data: {
      membershipType: 'Exploratory' | 'Starter' | 'Lovely';
      membershipStatus: 'Pending' | 'Active' | 'Expired';
      expirationDate?: string;
    }) => members.updateMembership(Number(id), data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['member', id] });
      showSuccess('Membership updated successfully');
    },
    onError: (error) => {
      showError(`Failed to update membership: ${(error as Error).message}`);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: () => members.delete(Number(id)),
    onSuccess: () => {
      navigate('/members');
      showSuccess('Member deleted successfully');
    },
    onError: (error) => {
      showError(`Failed to delete member: ${(error as Error).message}`);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate(formData);
  };

  const updateMembershipStatus = (status: 'Pending' | 'Active' | 'Expired') => {
    if (!member) return;

    membershipMutation.mutate({
      membershipType: member.membership_type || 'Exploratory',
      membershipStatus: status,
      expirationDate: status === 'Active'
        ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        : undefined
    });
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';

    // Handle timezone offset properly
    const date = new Date(dateString);

    // Use UTC methods to avoid timezone issues
    const year = date.getUTCFullYear();
    const month = (date.getUTCMonth() + 1).toString().padStart(2, '0');
    const day = date.getUTCDate().toString().padStart(2, '0');

    return `${year}-${month}-${day}`;
  };

  if (isLoading) return <LoadingOverlay visible={true} />;
  if (!member) return <Text>Member not found</Text>;

  return (
    <div style={{ position: 'relative' }}>
      <LoadingOverlay visible={updateMutation.isPending || deleteMutation.isPending} />

      <Paper shadow="xs" p="xl">
        <Group justify="space-between" mb="md">
          <Title order={2}>{member.first_name} {member.last_name}</Title>
          <Group>
            <Button
              variant="outline"
              onClick={() => setIsEditing(!isEditing)}
            >
              {isEditing ? 'Cancel' : 'Edit'}
            </Button>
            {user?.role === 'admin' && (
              <Button
                color="red"
                variant="outline"
                onClick={() => setDeleteModalOpen(true)}
              >
                Delete
              </Button>
            )}
          </Group>
        </Group>

        {isEditing ? (
          <form onSubmit={handleSubmit}>
            <Stack gap="md">
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
                placeholder="Optional"
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
              />

              <Group justify="flex-end" mt="md">
                <Button type="submit" loading={updateMutation.isPending}>
                  Save Changes
                </Button>
              </Group>
            </Stack>
          </form>
        ) : (
          <Stack gap="md">
            <Text><strong>Email:</strong> {member.email}</Text>
            <Text><strong>Birth Date:</strong> {formatDate(member.birth_date)}</Text>
            <Text><strong>Phone:</strong> {member.phone_number || 'Not provided'}</Text>
            <Text><strong>Last Check-in:</strong> {formatDate(member.last_check_in)}</Text>

            <Divider my="sm" />

            <Group>
              <Text><strong>Membership Type:</strong> {member.membership_type || 'Exploratory'}</Text>
              <Badge color={
                member.membership_status === 'Active' ? 'green' :
                member.membership_status === 'Pending' ? 'yellow' : 'red'
              }>
                {member.membership_status || 'Pending'}
              </Badge>
            </Group>

            <Text><strong>Expiration Date:</strong> {formatDate(member.membership_expiration)}</Text>

            {user?.role === 'admin' && (
              <Group mt="md">
                <Button
                  size="sm"
                  color="yellow"
                  onClick={() => updateMembershipStatus('Pending')}
                  disabled={member.membership_status === 'Pending'}
                >
                  Set Pending
                </Button>
                <Button
                  size="sm"
                  color="green"
                  onClick={() => updateMembershipStatus('Active')}
                  disabled={member.membership_status === 'Active'}
                >
                  Activate Membership
                </Button>
                <Button
                  size="sm"
                  color="red"
                  onClick={() => updateMembershipStatus('Expired')}
                  disabled={member.membership_status === 'Expired'}
                >
                  Set Expired
                </Button>
              </Group>
            )}
          </Stack>
        )}

        <Button
          variant="subtle"
          onClick={() => navigate('/members')}
          mt="xl"
        >
          Back to Members
        </Button>
      </Paper>

      <DeleteConfirmationModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={() => deleteMutation.mutate()}
        title="Delete Member"
        message={`Are you sure you want to delete ${member.first_name} ${member.last_name}?`}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}