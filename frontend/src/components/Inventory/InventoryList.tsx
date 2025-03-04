import { Table, Group, Text, ActionIcon, Paper, Stack, NumberInput, Button } from '@mantine/core';
import { IconChevronUp, IconChevronDown, IconPlus } from '@tabler/icons-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { inventory } from '../../services/api';
import { useState } from 'react';

interface Sacrament {
  id: number;
  name: string;
  type: string;
  strain: string;
  num_storage: number;
  num_active: number;
}

interface TransferQuantities {
  [key: number]: number;
}

export default function InventoryList({ sacraments }: { sacraments: Sacrament[] }) {
  const queryClient = useQueryClient();
  const [transferQuantities, setTransferQuantities] = useState<TransferQuantities>({});

  const transferMutation = useMutation({
    mutationFn: (data: { sacramentId: number; quantity: number; type: 'to_active' | 'to_storage' | 'add_storage' }) =>
      inventory.recordTransfer(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sacraments'] });
    }
  });

  const handleTransfer = (sacramentId: number, type: 'to_active' | 'to_storage' | 'add_storage') => {
    const quantity = transferQuantities[sacramentId] || 1;
    transferMutation.mutate({
      sacramentId,
      quantity,
      type
    });
    setTransferQuantities(prev => ({ ...prev, [sacramentId]: 1 }));
  };

  const getQuantity = (sacramentId: number) => transferQuantities[sacramentId] || 1;

  const setQuantity = (sacramentId: number, value: number) => {
    setTransferQuantities(prev => ({ ...prev, [sacramentId]: value }));
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
              <th>Storage</th>
              <th>Active</th>
              <th>Transfer Quantity</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sacraments.map((sacrament) => (
              <tr key={sacrament.id}>
                <td>{sacrament.name}</td>
                <td>{sacrament.type}</td>
                <td>{sacrament.num_storage}</td>
                <td>{sacrament.num_active}</td>
                <td style={{ width: '120px' }}>
                  <NumberInput
                    value={getQuantity(sacrament.id)}
                    onChange={(value) => setQuantity(sacrament.id, Number(value))}
                    min={1}
                    max={Math.max(sacrament.num_storage, sacrament.num_active, 100)}
                    size="xs"
                  />
                </td>
                <td>
                  <Group gap={5}>
                    <ActionIcon
                      variant="subtle"
                      onClick={() => handleTransfer(sacrament.id, 'to_active')}
                      disabled={sacrament.num_storage < getQuantity(sacrament.id)}
                      title="Move to Active"
                    >
                      <IconChevronUp size={16} />
                    </ActionIcon>
                    <ActionIcon
                      variant="subtle"
                      onClick={() => handleTransfer(sacrament.id, 'to_storage')}
                      disabled={sacrament.num_active < getQuantity(sacrament.id)}
                      title="Return to Storage"
                    >
                      <IconChevronDown size={16} />
                    </ActionIcon>
                    <ActionIcon
                      variant="subtle"
                      onClick={() => handleTransfer(sacrament.id, 'add_storage')}
                      title="Add to Storage"
                    >
                      <IconPlus size={16} />
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