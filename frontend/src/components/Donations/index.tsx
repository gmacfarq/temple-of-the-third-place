import { useQuery } from '@tanstack/react-query';
import { Table, Button, Group, Paper, Text, LoadingOverlay } from '@mantine/core';
import { donations } from '../../services/api';
import DonationForm from './DonationForm';
import { useEffect } from 'react';

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
  const { data: donationsList, isLoading, error } = useQuery({
    queryKey: ['donations'],
    queryFn: donations.getAll
  });

  useEffect(() => {
    if (error) {
      console.error('Error fetching donations:', error);
    }
  }, [error]);

  if (error) {
    return <Text color="red">Error loading donations: {(error as Error).message}</Text>;
  }

  return (
    <div style={{ position: 'relative' }}>
      <LoadingOverlay visible={isLoading} />

      <DonationForm />

      <Paper shadow="xs" p="md" mt="md">
        <Text size="xl" mb="md">Donations History</Text>
        {donationsList?.length === 0 ? (
          <Text>No donations found</Text>
        ) : (
          <Table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Member</th>
                <th>Sacraments</th>
                <th>Amount</th>
                <th>Type</th>
                <th>Notes</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {donationsList?.map((donation: Donation) => (
                <tr key={donation.id}>
                  <td>{new Date(donation.created_at).toLocaleDateString()}</td>
                  <td>{donation.member_name}</td>
                  <td>{donation.sacrament_names}</td>
                  <td>${Number(donation.total_amount).toFixed(2)}</td>
                  <td>{donation.type}</td>
                  <td>{donation.notes}</td>
                  <td>
                    <Group>
                      <Button size="xs" variant="outline">
                        View
                      </Button>
                      {/* Only show delete for admin */}
                      <Button size="xs" color="red" variant="outline">
                        Delete
                      </Button>
                    </Group>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Paper>
    </div>
  );
}