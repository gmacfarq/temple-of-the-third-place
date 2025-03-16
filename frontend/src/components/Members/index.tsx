import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Table, Button, Group, Paper, Text, LoadingOverlay, Badge, Title } from '@mantine/core';
import { members } from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
import { ApiError } from '../../types/api';
import { useNavigate } from 'react-router-dom';
import MemberSearch from './MemberSearch';
import { Member } from '../../types/member';
import { notifications } from '@mantine/notifications';
import { useNotifications } from '../../hooks/useNotifications';
import DeleteConfirmationModal from '../common/DeleteConfirmationModal';

export default function Members() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [filteredMembers, setFilteredMembers] = useState<Member[]>([]);
  const navigate = useNavigate();
  const [checkInId, setCheckInId] = useState<number | null>(null);
  const { showSuccess, showError } = useNotifications();
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState<number | null>(null);

  // Fetch members
  const { data: membersList, isLoading, error, refetch } = useQuery({
    queryKey: ['members'],
    queryFn: members.getAll,
    select: (data) => {
      // Sort by ID in descending order (higher ID = more recently joined)
      return [...data].sort((a, b) => b.id - a.id);
    }
  });

  // Refresh data when component mounts
  useEffect(() => {
    refetch();
  }, [refetch]);

  // Set filtered members when membersList changes
  useEffect(() => {
    if (membersList) {
      setFilteredMembers(membersList);
    }
  }, [membersList]);

  // Make sure data is an array before filtering
  const membersListArray: Member[] = Array.isArray(membersList) ? membersList : [];

  // Add a filter for pending members
  const pendingMembers = membersListArray.filter(member => member.membership_status === 'Pending');

  // Mutation for updating member status
  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) =>
      members.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members'] });
      showSuccess('Member status updated successfully');
    },
    onError: (error) => {
      showError('Failed to update member status', error.message);
    }
  });

  // Mutation for checking in a member
  const checkInMutation = useMutation({
    mutationFn: (memberId: number) => members.checkIn(memberId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members'] });
      showSuccess('Member checked in successfully');
    },
    onError: (error) => {
      showError('Failed to check in member', error.message);
    }
  });

  // Mutation for deleting a member
  const deleteMutation = useMutation({
    mutationFn: (id: number) => members.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members'] });
      showSuccess('Member deleted successfully');
      setDeleteModalOpen(false);
    },
    onError: (error) => {
      showError('Failed to delete member', error.message);
    }
  });

  const handleDeleteClick = (id: number) => {
    setMemberToDelete(id);
    setDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (memberToDelete) {
      deleteMutation.mutate(memberToDelete);
    }
  };

  const updateMemberStatus = (id: number, status: string) => {
    updateStatusMutation.mutate({ id, status });
  };

  const checkInMember = (memberId: number) => {
    setCheckInId(memberId);
    checkInMutation.mutate(memberId);
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
                        onClick={() => checkInMember(member.id)}
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

      {/* Pending Members */}
      {pendingMembers.length > 0 && (
        <Paper p="md" withBorder mb="xl">
          <Title order={3} mb="md" color="yellow">Pending Approvals ({pendingMembers.length})</Title>
          <Text mb="md">The following members require in-person verification and approval:</Text>
          <Table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {pendingMembers.map(member => (
                <tr key={member.id}>
                  <td>{member.first_name} {member.last_name}</td>
                  <td>{member.email}</td>
                  <td>{new Date(member.created_at).toLocaleDateString()}</td>
                  <td>
                    <Group spacing="xs">
                      <Button
                        size="xs"
                        onClick={() => navigate(`/members/${member.id}`)}
                      >
                        Review
                      </Button>
                      <Button
                        size="xs"
                        color="green"
                        onClick={() => updateMemberStatus(member.id, 'Active')}
                      >
                        Approve
                      </Button>
                    </Group>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Paper>
      )}

      <DeleteConfirmationModal
        opened={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Member"
        message="Are you sure you want to delete this member? This action cannot be undone."
      />
    </div>
  );
}