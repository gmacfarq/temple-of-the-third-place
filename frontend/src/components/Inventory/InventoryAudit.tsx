import { useState } from 'react';
import { Paper, Text, Table, NumberInput, Button, Group, Stack, TextInput } from '@mantine/core';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { inventory } from '../../services/api';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, Controller } from 'react-hook-form';
import { auditSchema, AuditFormData } from '../../schemas/inventorySchemas';
import { notifications } from '@mantine/notifications';

interface Sacrament {
  id: number;
  name: string;
  type: string;
  num_storage: number;
  num_active: number;
}

interface AuditData {
  [key: number]: {
    storageCount: number;
    notes: string;
  };
}

export default function InventoryAudit({ sacraments }: { sacraments: Sacrament[] }) {
  const queryClient = useQueryClient();
  const [auditData, setAuditData] = useState<AuditData>({});
  const [globalNotes, setGlobalNotes] = useState('');
  const [currentSacrament, setCurrentSacrament] = useState<number | null>(null);

  const { control, handleSubmit, reset, formState: { errors } } = useForm<AuditFormData>({
    resolver: zodResolver(auditSchema)
  });

  const auditMutation = useMutation({
    mutationFn: inventory.recordAudit,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sacraments'] });
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      notifications.show({
        title: 'Success',
        message: 'Audit recorded successfully',
        color: 'green'
      });
    },
    onError: (error) => {
      notifications.show({
        title: 'Error',
        message: `Failed to record audit: ${error.message}`,
        color: 'red'
      });
    }
  });

  const handleAuditSubmit = async (data: AuditFormData) => {
    try {
      await auditMutation.mutateAsync(data);
      // Update local state to reflect the change
      setAuditData(prev => {
        const newData = { ...prev };
        delete newData[data.sacramentId];
        return newData;
      });
      setCurrentSacrament(null);
      reset();
    } catch (error) {
      console.error('Error submitting audit:', error);
    }
  };

  const updateAuditData = (sacramentId: number, storageCount: number, notes: string = '') => {
    setAuditData(prev => ({
      ...prev,
      [sacramentId]: { storageCount, notes: notes || globalNotes }
    }));
    setCurrentSacrament(sacramentId);
  };

  return (
    <Paper shadow="xs" p="md">
      <Stack gap="md">
        <Text size="xl">Inventory Audit</Text>

        <TextInput
          label="Global Audit Notes"
          value={globalNotes}
          onChange={(e) => setGlobalNotes(e.target.value)}
          placeholder="Notes for all items being audited..."
        />

        <Table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Type</th>
              <th>Current Storage</th>
              <th>Current Active</th>
              <th>Actual Storage Count</th>
              <th>Notes</th>
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
                <td>
                  <NumberInput
                    value={auditData[sacrament.id]?.storageCount ?? sacrament.num_storage}
                    onChange={(value) => updateAuditData(sacrament.id, Number(value))}
                    min={0}
                    style={{ width: 100 }}
                    error={currentSacrament === sacrament.id && errors.actualQuantity?.message}
                  />
                </td>
                <td>
                  <TextInput
                    value={auditData[sacrament.id]?.notes ?? ''}
                    onChange={(e) => updateAuditData(
                      sacrament.id,
                      auditData[sacrament.id]?.storageCount ?? sacrament.num_storage,
                      e.target.value
                    )}
                    placeholder="Item-specific notes..."
                  />
                </td>
                <td>
                  <Button
                    size="xs"
                    onClick={() => {
                      const data = {
                        sacramentId: sacrament.id,
                        actualQuantity: auditData[sacrament.id]?.storageCount ?? sacrament.num_storage,
                        notes: auditData[sacrament.id]?.notes || globalNotes || `Audit on ${new Date().toLocaleDateString()}`
                      };
                      handleAuditSubmit(data);
                    }}
                    disabled={!auditData[sacrament.id]}
                    loading={auditMutation.isPending && currentSacrament === sacrament.id}
                  >
                    Submit
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Stack>
    </Paper>
  );
}