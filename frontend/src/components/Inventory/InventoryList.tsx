import { Table, Group, Text, ActionIcon, Paper, Stack, NumberInput, Button } from '@mantine/core';
import { IconChevronUp, IconChevronDown, IconPlus, IconMinus } from '@tabler/icons-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { inventory } from '../../services/api';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useNotifications } from '../../hooks/useNotifications';
import { ApiError } from '../../types/api';
import DeleteConfirmationModal from '../common/DeleteConfirmationModal';

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
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useNotifications();
  const [transferQuantities, setTransferQuantities] = useState<TransferQuantities>({});
  const [removeModalOpen, setRemoveModalOpen] = useState(false);
  const [selectedSacrament, setSelectedSacrament] = useState<Sacrament | null>(null);
  const [removeQuantity, setRemoveQuantity] = useState<number | ''>(1);

  const transferMutation = useMutation({
    mutationFn: (data: { sacramentId: number; quantity: number; type: 'to_active' | 'to_storage' | 'add_storage' | 'remove_storage' }) =>
      inventory.recordTransfer(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sacraments'] });
      if (selectedSacrament) {
        showSuccess(`Successfully removed items from ${selectedSacrament.name}`);
        setRemoveModalOpen(false);
      }
    },
    onError: (error: ApiError) => {
      const errorMessage = error.response?.data?.message || error.message || 'An error occurred';
      showError(`Failed to update inventory: ${errorMessage}`);
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

  const openRemoveModal = (sacrament: Sacrament) => {
    setSelectedSacrament(sacrament);
    setRemoveQuantity(1);
    setRemoveModalOpen(true);
  };

  const handleRemove = () => {
    if (selectedSacrament && removeQuantity) {
      transferMutation.mutate({
        sacramentId: selectedSacrament.id,
        quantity: Number(removeQuantity),
        type: 'remove_storage'
      });
    }
  };

  return (
    <>
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
                        color="green"
                      >
                        <IconPlus size={16} />
                      </ActionIcon>
                      {user?.role === 'admin' && (
                        <ActionIcon
                          color="red"
                          variant="subtle"
                          onClick={() => openRemoveModal(sacrament)}
                          title="Remove from Inventory"
                        >
                          <IconMinus size={16} />
                        </ActionIcon>
                      )}
                    </Group>
                  </td>
                  <td>
                    <Button
                      size="xs"
                      variant="outline"
                      onClick={() => navigate(`/sacraments/${sacrament.id}`)}
                    >
                      View
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Stack>
      </Paper>

      <DeleteConfirmationModal
        isOpen={removeModalOpen}
        onClose={() => setRemoveModalOpen(false)}
        onConfirm={handleRemove}
        title="Remove from Inventory"
        message={`Are you sure you want to remove ${removeQuantity} ${selectedSacrament?.name} from storage?`}
        isLoading={transferMutation.isPending}
        confirmationInput={
          <NumberInput
            label="Quantity to Remove"
            value={removeQuantity}
            onChange={(value) => setRemoveQuantity(value)}
            min={1}
            max={selectedSacrament ? (selectedSacrament.num_storage + selectedSacrament.num_active) : 999}
            required
          />
        }
      />
    </>
  );
}