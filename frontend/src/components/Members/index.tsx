import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Table, Button, TextInput, Group, Paper, Text, LoadingOverlay } from '@mantine/core';
import { members } from '../../services/api';

interface Member {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
}

interface MemberFormData {
  firstName: string;
  lastName: string;
  email: string;
}

export default function Members() {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<MemberFormData>({
    firstName: '',
    lastName: '',
    email: '',
  });

  // Fetch members
  const { data: membersList, isLoading } = useQuery({
    queryKey: ['members'],
    queryFn: members.getAll
  });

  // Add member mutation
  const addMemberMutation = useMutation({
    mutationFn: members.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members'] });
      setFormData({ firstName: '', lastName: '', email: '' });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addMemberMutation.mutate(formData);
  };

  return (
    <div style={{ position: 'relative' }}>
      <LoadingOverlay visible={isLoading} />

      {/* Add Member Form */}
      <Paper shadow="xs" p="md" mb="md">
        <form onSubmit={handleSubmit}>
          <Group>
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
            <Button type="submit" loading={addMemberMutation.isPending}>
              Add Member
            </Button>
          </Group>
        </form>
      </Paper>

      {/* Members List */}
      <Paper shadow="xs" p="md">
        <Text size="xl" mb="md">Members</Text>
        <Table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {membersList?.map((member: Member) => (
              <tr key={member.id}>
                <td>{member.firstName} {member.lastName}</td>
                <td>{member.email}</td>
                <td>{member.role}</td>
                <td>
                  <Group>
                    <Button size="xs" variant="outline">
                      Edit
                    </Button>
                    <Button size="xs" color="red" variant="outline">
                      Delete
                    </Button>
                  </Group>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Paper>
    </div>
  );
}