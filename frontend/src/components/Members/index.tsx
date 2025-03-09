import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Table, Button, Group, Paper, Text, LoadingOverlay, Badge } from '@mantine/core';
import { members } from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
import { ApiError } from '../../types/api';
import { useNavigate } from 'react-router-dom';
import MemberSearch from './MemberSearch';
import { Member } from '../../types/member';
import { notifications } from '@mantine/notifications';

export default function Members() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [filteredMembers, setFilteredMembers] = useState<Member[]>([]);
  const navigate = useNavigate();
  const [checkInId, setCheckInId] = useState<number | null>(null);

  // Fetch members
  const { data: membersList, isLoading, error } = useQuery({
    queryKey: ['members'],
    queryFn: members.getAll,
    select: (data) => {
      // Sort by ID in descending order (higher ID = more recently joined)
      return [...data].sort((a, b) => b.id - a.id);
    }
  });

  // Set filtered members when membersList changes
  useEffect(() => {
    if (membersList) {
      setFilteredMembers(membersList);
    }
  }, [membersList]);


  const checkInMutation = useMutation({
    mutationFn: (memberId: number) => members.checkIn(memberId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members'] });
      notifications.show({
        title: 'Member checked in successfully',
        message: 'Member checked in successfully',
        color: 'green'
      });
      setCheckInId(null);
    },
    onError: (error: ApiError) => {
      const errorMessage = error.response?.data?.message || 'Failed to check in member';
      notifications.show({
        title: 'Error',
        message: errorMessage,
        color: 'red'
      });
      setCheckInId(null);
    }
  });

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

  // Add a handler function for check-ins
  const handleCheckIn = (memberId: number) => {
    setCheckInId(memberId);
    checkInMutation.mutate(memberId);
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
                    {member.membership_status === 'Active' && (
                      <Button
                        size="xs"
                        variant="outline"
                        color="green"
                        onClick={() => handleCheckIn(member.id)}
                        loading={checkInMutation.isPending && checkInId === member.id}
                      >
                        Check In
                      </Button>
                    )}
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