import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Table, Button, Group, Paper, Text, ActionIcon } from '@mantine/core';
import { IconTrash } from '@tabler/icons-react';
import { donations } from '../../services/api';
import DeleteConfirmationModal from '../common/DeleteConfirmationModal';
import DonationForm from './DonationForm';

interface Donation {
  id: number;
  member_id: number;
  type: string;
  total_amount: string;
  notes: string;
  created_at: string;
  member_name: string;
  sacrament_names: string;
}

export default function Donations() {
  const queryClient = useQueryClient();
  const [selectedDonation, setSelectedDonation] = useState<Donation | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const { data: donationsList, isLoading, error } = useQuery({
    queryKey: ['donations'],
    queryFn: donations.getAll
  });

  const deleteMutation = useMutation({
    mutationFn: donations.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['donations'] });
      setDeleteModalOpen(false);
      setSelectedDonation(null);
    }
  });

  const handleDeleteClick = (donation: Donation) => {
    setSelectedDonation(donation);
    setDeleteModalOpen(true);
  };

  if (error) {
    return <Text color="red">Error loading donations: {(error as Error).message}</Text>;
  }

  return (
    <div style={{ position: 'relative' }}>
      <Paper shadow="xs" p="md">
        <Text size="xl" mb="md">Donations</Text>

        {isLoading ? (
          <Text>Loading donations...</Text>
        ) : (
          <Table>
            <thead>
              <tr>
                <th>Member</th>
                <th>Amount</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {donationsList?.map((donation: Donation) => (
                <tr key={donation.id}>
                  <td>{donation.member_name}</td>
                  <td>${donation.total_amount}</td>
                  <td>{new Date(donation.created_at).toLocaleDateString()}</td>
                  <td>
                    <ActionIcon color="red" onClick={() => handleDeleteClick(donation)}>
                      <IconTrash size={16} />
                    </ActionIcon>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Paper>

      {selectedDonation && (
        <DeleteConfirmationModal
          isOpen={deleteModalOpen}
          onClose={() => setDeleteModalOpen(false)}
          onConfirm={() => deleteMutation.mutate(selectedDonation.id)}
          itemType="donation"
          message={`Are you sure you want to delete the $${selectedDonation.total_amount} donation from ${selectedDonation.member_name}?`}
          isLoading={deleteMutation.isPending}
        />
      )}

      <DonationForm />
    </div>
  );
}