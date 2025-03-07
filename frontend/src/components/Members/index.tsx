import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Table, Button, TextInput, Group, Paper, Text, LoadingOverlay, Select, Badge } from '@mantine/core';
import { members, auth } from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
import { ApiError } from '../../types/api';
import { useNavigate } from 'react-router-dom';
import MemberSearch from './MemberSearch';
import { Member } from '../../types/member';

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

  // Fetch members
  const { data: membersList, isLoading, error } = useQuery({
    queryKey: ['members'],
    queryFn: members.getAll
  });

  // Set filtered members when membersList changes
  useEffect(() => {
    if (membersList) {
      setFilteredMembers(membersList);
    }
  }, [membersList]);

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
    mutationFn: (memberId: number) => members.checkIn(memberId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members'] });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addMemberMutation.mutate(formData);
  };

  // Function to render membership status badge
  const renderStatusBadge = (status: string) => {
    let color = 'blue';

    switch (status) {
      case 'Active':
        color = 'green';
        break;
      case 'Pending':
        color = 'yellow';
        break;
      case 'Expired':
        color = 'red';
        break;
    }

    return <Badge color={color}>{status}</Badge>;
  };

  // Function to format date
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  // Only render if user is admin
  if (user?.role !== 'admin') {
    return <Text>You don't have permission to view this page.</Text>;
  }

  if (isLoading) return <LoadingOverlay visible={true} />;
  if (error) return <Text c="red">Error loading members: {(error as ApiError).message}</Text>;

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

      {/* Member Search */}
      {membersList && (
        <MemberSearch
          members={membersList}
          onFilteredMembersChange={setFilteredMembers}
        />
      )}

      {/* Members List */}
      <Paper shadow="xs" p="md">
        <Group justify="space-between" mb="md">
          <Text size="xl">Members</Text>
          {user?.role === 'admin' && (
            <Button onClick={() => navigate('/members/add')}>
              Add Member
            </Button>
          )}
        </Group>
        <Table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Membership Type</th>
              <th>Status</th>
              <th>Expiration</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredMembers.map((member: Member) => (
              <tr key={member.id}>
                <td>{member.first_name} {member.last_name}</td>
                <td>{member.email}</td>
                <td>{member.membership_type || 'Exploratory'}</td>
                <td>{renderStatusBadge(member.membership_status || 'Pending')}</td>
                <td>{formatDate(member.membership_expiration)}</td>
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