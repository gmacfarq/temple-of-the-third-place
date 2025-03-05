import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Table, Button, Group, Paper, Text, ActionIcon, LoadingOverlay } from '@mantine/core';
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
  items: Array<{
    sacrament_name: string;
    quantity: number;
    amount: number;
  }>;
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
    <div>
      {/* Donation Form at the top */}
      <Paper shadow="xs" p="md" mb="md">
        <Text size="xl" mb="md">New Donation</Text>
        <DonationForm />
      </Paper>

      {/* Donations List below */}
      <Paper shadow="xs" p="md">
        <Text size="xl" mb="md">Donation History</Text>
        <div style={{ position: 'relative' }}>
          <LoadingOverlay visible={isLoading} />

          {donationsList?.length === 0 ? (
            <Text>No donations found</Text>
          ) : (
            <Table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Member</th>
                  <th>Payment</th>
                  <th>Items</th>
                  <th>Amount</th>
                  <th>Notes</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {donationsList?.map((donation: Donation) => (
                  <tr key={donation.id}>
                    <td>{new Date(donation.created_at).toLocaleDateString()}</td>
                    <td>{donation.member_name}</td>
                    <td>{donation.type}</td>
                    <td>
                      {donation.items?.map(item => (
                        <div key={`${donation.id}-${item.sacrament_name}`}>
                          {item.quantity}x {item.sacrament_name}
                        </div>
                      )) || donation.sacrament_names}
                    </td>
                    <td>${parseFloat(donation.total_amount).toFixed(2)}</td>
                    <td>{donation.notes}</td>
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
        </div>
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
    </div>
  );
}