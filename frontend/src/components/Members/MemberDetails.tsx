import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { TextInput, Button, Group, Paper, Text, LoadingOverlay, Stack, Table, Pagination } from '@mantine/core';
import { IconX } from '@tabler/icons-react';
import { members } from '../../services/api';
import DeleteConfirmationModal from '../common/DeleteConfirmationModal';

interface EditableFields {
  first_name: string;
  last_name: string;
  email: string;
}

interface CheckIn {
  id: number;
  timestamp: string;
}

export default function MemberDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [editedFields, setEditedFields] = useState<EditableFields | null>(null);
  const [page, setPage] = useState(1);
  const perPage = 5;
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const { data: member, isLoading } = useQuery({
    queryKey: ['member', id],
    queryFn: () => members.getById(Number(id))
  });

  const { data: checkIns } = useQuery({
    queryKey: ['member-checkins', id, page],
    queryFn: () => members.getCheckIns(Number(id), page, perPage),
    staleTime: 0, // Disable caching temporarily for testing
  });

  const updateMutation = useMutation({
    mutationFn: (data: EditableFields) =>
      members.update(Number(id), {
        firstName: data.first_name,
        lastName: data.last_name,
        email: data.email
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['member', id] });
      setIsEditing(false);
      setEditedFields(null);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: members.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members'] });
      navigate('/members');
    }
  });

  const checkInMutation = useMutation({
    mutationFn: () => members.checkIn(Number(id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['member-checkins', id] });
    }
  });

  const deleteCheckInMutation = useMutation({
    mutationFn: members.deleteCheckIn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['member-checkins', id] });
    }
  });

  const handleEdit = () => {
    if (isEditing) {
      // Cancel - reset fields
      setEditedFields(null);
    } else {
      // Start editing - initialize with current values
      setEditedFields({
        first_name: member.first_name,
        last_name: member.last_name,
        email: member.email
      });
    }
    setIsEditing(!isEditing);
  };

  const handleSave = () => {
    if (!editedFields?.first_name || !editedFields?.last_name || !editedFields?.email) {
      alert('All fields are required');
      return;
    }
    if (!editedFields.email.includes('@')) {
      alert('Please enter a valid email address');
      return;
    }
    updateMutation.mutate(editedFields);
  };

  if (isLoading) return <LoadingOverlay visible={true} />;
  if (!member) return <Text>Member not found</Text>;

  return (
    <>
      <Paper p="md">
        <Group justify="space-between" mb="xl">
          <Text size="xl">Member Details</Text>
          <Group>
            <Button
              variant="outline"
              color="green"
              onClick={() => checkInMutation.mutate()}
              loading={checkInMutation.isPending}
            >
              Check In
            </Button>
            <Button variant="outline" onClick={handleEdit}>
              {isEditing ? 'Cancel' : 'Edit'}
            </Button>
            <Button
              color="red"
              variant="outline"
              onClick={() => setDeleteModalOpen(true)}
            >
              Delete Member
            </Button>
          </Group>
        </Group>

        <Stack>
          <TextInput
            label="First Name"
            value={isEditing ? editedFields?.first_name : member.first_name}
            onChange={(e) => setEditedFields(prev => ({ ...prev!, first_name: e.target.value }))}
            error={isEditing && !editedFields?.first_name && 'First name is required'}
            readOnly={!isEditing}
            required
          />
          <TextInput
            label="Last Name"
            value={isEditing ? editedFields?.last_name : member.last_name}
            onChange={(e) => setEditedFields(prev => ({ ...prev!, last_name: e.target.value }))}
            error={isEditing && !editedFields?.last_name && 'Last name is required'}
            readOnly={!isEditing}
            required
          />
          <TextInput
            label="Email"
            value={isEditing ? editedFields?.email : member.email}
            onChange={(e) => setEditedFields(prev => ({ ...prev!, email: e.target.value }))}
            error={isEditing && (!editedFields?.email ? 'Email is required' :
              !editedFields.email.includes('@') && 'Invalid email')}
            readOnly={!isEditing}
            required
          />

          {isEditing && (
            <Group justify="flex-end" mt="md">
              <Button
                onClick={handleSave}
                loading={updateMutation.isPending}
              >
                Save Changes
              </Button>
            </Group>
          )}
        </Stack>

        <Stack mt="xl">
          <Group justify="space-between">
            <Text size="xl">Recent Check-ins</Text>
            <Text size="md">Total Check-ins: {checkIns?.totalCheckIns || 0}</Text>
          </Group>

          <Table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Time</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {checkIns?.data.map((checkIn: CheckIn) => (
                <tr key={checkIn.id}>
                  <td>{new Date(checkIn.timestamp).toLocaleDateString()}</td>
                  <td>{new Date(checkIn.timestamp).toLocaleTimeString()}</td>
                  <td>
                    <Button
                      size="xs"
                      variant="subtle"
                      color="red"
                      onClick={() => deleteCheckInMutation.mutate(checkIn.id)}
                      loading={deleteCheckInMutation.isPending}
                    >
                      <IconX size={16} />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>

          <Group justify="center">
            <Pagination
              value={page}
              onChange={setPage}
              total={Math.ceil((checkIns?.total || 0) / perPage)}
            />
          </Group>
        </Stack>
      </Paper>

      <DeleteConfirmationModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={() => deleteMutation.mutate(member.id)}
        itemType="member"
        message={`Are you sure you want to delete ${member.first_name} ${member.last_name}?`}
        isLoading={deleteMutation.isPending}
      />
    </>
  );
}