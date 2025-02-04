import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { TextInput, Button, Group, Paper, Text, LoadingOverlay, Stack } from '@mantine/core';
import { members } from '../../services/api';

interface EditableFields {
  first_name: string;
  last_name: string;
  email: string;
}

export default function MemberDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [editedFields, setEditedFields] = useState<EditableFields | null>(null);

  const { data: member, isLoading } = useQuery({
    queryKey: ['member', id],
    queryFn: () => members.getById(Number(id))
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
      navigate('/members');
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
    <Paper p="md">
      <Group justify="apart" mb="xl">
        <Text size="xl">Member Details</Text>
        <Group>
          <Button
            variant="outline"
            onClick={handleEdit}
          >
            {isEditing ? 'Cancel' : 'Edit'}
          </Button>
          <Button
            color="red"
            variant="outline"
            onClick={() => {
              if (window.confirm('Are you sure you want to delete this member?')) {
                deleteMutation.mutate(member.id);
              }
            }}
          >
            Delete
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
    </Paper>
  );
}