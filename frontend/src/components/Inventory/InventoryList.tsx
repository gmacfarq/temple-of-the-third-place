import { Table, Group, Text, ActionIcon, Paper, Stack } from '@mantine/core';
import { IconChevronUp, IconChevronDown } from '@tabler/icons-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { inventory } from '../../services/api';

interface Sacrament {
  id: number;
  name: string;
  type: string;
  strain: string;
  num_storage: number;
  num_active: number;
}

export default function InventoryList({ sacraments }: { sacraments: Sacrament[] }) {
  const queryClient = useQueryClient();

  const transferMutation = useMutation({
    mutationFn: (data: { sacramentId: number; quantity: number; type: 'in' | 'out' }) =>
      inventory.recordTransfer(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sacraments'] });
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
    }
  });

  const handleTransfer = (sacramentId: number, type: 'in' | 'out') => {
    transferMutation.mutate({
      sacramentId,
      quantity: 1, // Transfer one at a time for now
      type
    });
  };

  return (
    <Paper shadow="xs" p="md">
      <Stack gap="md">
        <Text size="xl">Inventory Management</Text>
        <Table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Type</th>
              <th>Strain</th>
              <th>Storage</th>
              <th>Active</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sacraments.map((sacrament) => (
              <tr key={sacrament.id}>
                <td>{sacrament.name}</td>
                <td>{sacrament.type}</td>
                <td>{sacrament.strain}</td>
                <td>{sacrament.num_storage}</td>
                <td>{sacrament.num_active}</td>
                <td>
                  <Group gap={0}>
                    <ActionIcon
                      onClick={() => handleTransfer(sacrament.id, 'out')}
                      disabled={sacrament.num_storage <= 0}
                      title="Move to Active"
                    >
                      <IconChevronUp size={24} />
                    </ActionIcon>
                    <ActionIcon
                      onClick={() => handleTransfer(sacrament.id, 'in')}
                      disabled={sacrament.num_active <= 0}
                      title="Return to Storage"
                    >
                      <IconChevronDown size={24} />
                    </ActionIcon>
                  </Group>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Stack>
    </Paper>
  );
}