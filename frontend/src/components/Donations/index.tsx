import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Table,
  Button,
  NumberInput,
  Group,
  Paper,
  Text,
  LoadingOverlay,
  Select,
  Textarea
} from '@mantine/core';
import { donations, members, sacraments } from '../../services/api';

interface Donation {
  id: number;
  memberId: number;
  sacramentId: number;
  amount: number;
  notes: string;
  createdAt: string;
  memberName: string;
  sacramentName: string;
}

interface DonationFormData {
  memberId: string;
  sacramentId: string;
  amount: number;
  notes: string;
}

interface Member {
  id: number;
  firstName: string;
  lastName: string;
}

interface Sacrament {
  id: number;
  name: string;
}

export default function Donations() {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<DonationFormData>({
    memberId: '',
    sacramentId: '',
    amount: 0,
    notes: ''
  });

  // Fetch donations, members, and sacraments
  const { data: donationsList, isLoading: isLoadingDonations } = useQuery({
    queryKey: ['donations'],
    queryFn: donations.getAll
  });

  const { data: membersList, isLoading: isLoadingMembers } = useQuery({
    queryKey: ['members'],
    queryFn: members.getAll
  });

  const { data: sacramentsList, isLoading: isLoadingSacraments } = useQuery({
    queryKey: ['sacraments'],
    queryFn: sacraments.getAll
  });

  // Add donation mutation
  const addDonationMutation = useMutation({
    mutationFn: donations.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['donations'] });
      setFormData({
        memberId: '',
        sacramentId: '',
        amount: 0,
        notes: ''
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addDonationMutation.mutate({
      ...formData,
      memberId: parseInt(formData.memberId),
      sacramentId: parseInt(formData.sacramentId)
    });
  };

  const isLoading = isLoadingDonations || isLoadingMembers || isLoadingSacraments;

  return (
    <div style={{ position: 'relative' }}>
      <LoadingOverlay visible={isLoading} />

      {/* Add Donation Form */}
      <Paper shadow="xs" p="md" mb="md">
        <form onSubmit={handleSubmit}>
          <Group align="flex-end">
            <Select
              label="Member"
              value={formData.memberId}
              onChange={(value) => setFormData({ ...formData, memberId: value || '' })}
              data={membersList?.map((member: Member) => ({
                value: member.id.toString(),
                label: `${member.firstName} ${member.lastName}`
              })) || []}
              required
              searchable
            />
            <Select
              label="Sacrament"
              value={formData.sacramentId}
              onChange={(value) => setFormData({ ...formData, sacramentId: value || '' })}
              data={sacramentsList?.map((sacrament: Sacrament) => ({
                value: sacrament.id.toString(),
                label: sacrament.name
              })) || []}
              required
              searchable
            />
            <NumberInput
              label="Amount"
              value={formData.amount}
              onChange={(value) => setFormData({ ...formData, amount: Number(value || 0) })}
              min={0}
              required
            />
            <Textarea
              label="Notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              style={{ minWidth: '300px' }}
            />
            <Button type="submit" loading={addDonationMutation.isPending}>
              Record Donation
            </Button>
          </Group>
        </form>
      </Paper>

      {/* Donations List */}
      <Paper shadow="xs" p="md">
        <Text size="xl" mb="md">Donations History</Text>
        <Table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Member</th>
              <th>Sacrament</th>
              <th>Amount</th>
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