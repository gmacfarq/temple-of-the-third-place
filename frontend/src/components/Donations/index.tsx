import { useQuery } from '@tanstack/react-query';
import { Table, Button, Group, Paper, Text, LoadingOverlay } from '@mantine/core';
import { donations } from '../../services/api';
import DonationForm from './DonationForm';

interface Donation {
  id: number;
  memberId: number;
  sacramentId: number;
  amount: number;
  notes: string;
  createdAt: string;
  memberName: string;
  sacramentName: string;
  type: string;
}

export default function Donations() {
  const { data: donationsList, isLoading } = useQuery({
    queryKey: ['donations'],
    queryFn: donations.getAll
  });

  return (
    <div style={{ position: 'relative' }}>
      <LoadingOverlay visible={isLoading} />

      <DonationForm />

      <Paper shadow="xs" p="md" mt="md">
        <Text size="xl" mb="md">Donations History</Text>
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
                <td>{new Date(donation.createdAt).toLocaleDateString()}</td>
                <td>{donation.memberName}</td>
                <td>{donation.sacramentName}</td>
                <td>${donation.amount.toFixed(2)}</td>
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
      </Paper>
    </div>
  );
}