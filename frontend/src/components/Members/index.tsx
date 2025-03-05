import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Table, Button, TextInput, Group, Paper, Text, LoadingOverlay, Select, ActionIcon } from '@mantine/core';
import { members, auth } from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
import { ApiError } from '../../types/api';
import styles from './Members.module.css';
import { IconChevronUp, IconChevronDown } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import MemberSearch from '../Members/MemberSearch';
import { useNotifications } from '../../hooks/useNotifications';

interface Member {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
}

// Add role type
type UserRole = 'member' | 'advisor' | 'admin';

// Update form data interface
interface MemberFormData {
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
}

export default function Members() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<MemberFormData>({
    firstName: '',
    lastName: '',
    email: '',
    role: 'member'
  });
  const [filteredMembers, setFilteredMembers] = useState<Member[]>([]);
  const navigate = useNavigate();
  const { showSuccess, showError } = useNotifications();
  // Fetch members
  const { data: membersList, isLoading } = useQuery({
    queryKey: ['members'],
    queryFn: members.getAll
  });

  // Add member mutation
  const addMemberMutation = useMutation({
    mutationFn: async (data: MemberFormData) => {
      if (data.role === 'member') {
        return auth.register(data);
      } else {
        return auth.registerPrivileged(data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members'] });
      setFormData({ firstName: '', lastName: '', email: '', role: 'member' });
    },
    onError: (error: ApiError) => {
      console.error('Failed to create member:', {
        error,
        response: error.response?.data
      });
      // Add error notification here
    }
  });

  const checkInMutation = useMutation({
    mutationFn: members.checkIn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members'] });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: members.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members'] });
      showSuccess('Member deleted successfully');
    },
    onError: (error: any) => {
      showError(error.response?.data?.message || 'Failed to delete member');
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addMemberMutation.mutate(formData);
  };

  // Function to cycle through roles
  const roles = ['member', 'advisor', 'admin'];
  const cycleRole = (direction: 'up' | 'down') => {
    const currentIndex = roles.indexOf(formData.role);
    let newIndex;
    if (direction === 'up') {
      newIndex = currentIndex === 0 ? roles.length - 1 : currentIndex - 1;
    } else {
      newIndex = currentIndex === roles.length - 1 ? 0 : currentIndex + 1;
    }
    setFormData({ ...formData, role: roles[newIndex] as UserRole });
  };

  // Only render if user is admin
  if (user?.role !== 'admin') {
    return <Text>You don't have permission to view this page.</Text>;
  }

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
            <Select
              label="Role"
              value={formData.role}
              onChange={(value) => setFormData({ ...formData, role: value as UserRole })}
              data={[
                { value: 'member', label: 'Member' },
                { value: 'advisor', label: 'Advisor' },
                { value: 'admin', label: 'Admin' }
              ]}
              required
              defaultValue="member"
            />
            <Button type="submit" loading={addMemberMutation.isPending}>
              Add Member
            </Button>
          </Group>
        </form>
      </Paper>

      {/* Search Component */}
      <MemberSearch
        members={membersList || []}
        onFilteredMembersChange={setFilteredMembers}
      />

      {/* Members List */}
      <Paper shadow="xs" p="md">
        <Group justify="apart" mb="md">
          <Text size="xl">Members</Text>
        </Group>
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
            {filteredMembers.map((member: Member) => (
              <tr key={member.id}>
                <td>{member.first_name} {member.last_name}</td>
                <td>{member.email}</td>
                <td>{member.role}</td>
                <td>
                  <Group>
                    <Button
                      size="xs"
                      variant="outline"
                      onClick={() => navigate(`/members/${member.id}`)}
                    >
                      View
                    </Button>
                    <Button
                      size="xs"
                      variant="outline"
                      color="green"
                      onClick={() => checkInMutation.mutate(member.id)}
                      loading={checkInMutation.isPending}
                    >
                      Check In
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