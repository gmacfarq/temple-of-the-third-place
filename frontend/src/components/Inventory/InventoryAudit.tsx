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
    activeCount: number;
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
      await auditMutation.mutateAsync({
        sacramentId: data.sacramentId,
        actualStorage: data.actualStorage,
        actualActive: data.actualActive,
        notes: data.notes
      });
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

  const updateAuditData = (sacramentId: number, storageCount: number, activeCount: number, notes: string = '') => {
    setAuditData(prev => ({
      ...prev,
      [sacramentId]: {
        storageCount,
        activeCount,
        notes: notes || globalNotes
      }
    }));
    setCurrentSacrament(sacramentId);
  };

  const submitAllAudits = async () => {
    const sacramentIds = Object.keys(auditData).map(Number);

    for (const sacramentId of sacramentIds) {
      const data = {
        sacramentId,
        actualStorage: auditData[sacramentId].storageCount,
        actualActive: auditData[sacramentId].activeCount,
        notes: auditData[sacramentId].notes || globalNotes || `Audit on ${new Date().toLocaleDateString()}`
      };

      try {
        await auditMutation.mutateAsync(data);
      } catch (error) {
        console.error(`Error submitting audit for sacrament ${sacramentId}:`, error);
      }
    }

    // Clear all audit data after submission
    setAuditData({});
  };

  return (
    <Paper shadow="xs" p="md">
      <Stack gap="md">
        <Text size="xl">Inventory Audit</Text>

        <TextInput
          label="Global Notes"
          value={globalNotes}
          onChange={(e) => setGlobalNotes(e.target.value)}
          placeholder="Notes to apply to all audits..."
        />

        <Table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Type</th>
              <th>Current Storage</th>
              <th>Current Active</th>
              <th>Actual Storage Count</th>
              <th>Actual Active Count</th>
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
                    onChange={(value) => updateAuditData(
                      sacrament.id,
                      Number(value),
                      auditData[sacrament.id]?.activeCount ?? sacrament.num_active,
                      auditData[sacrament.id]?.notes
                    )}
                    min={0}
                    style={{ width: 100 }}
                    error={currentSacrament === sacrament.id && errors.actualStorage?.message}
                  />
                </td>
                <td>
                  <NumberInput
                    value={auditData[sacrament.id]?.activeCount ?? sacrament.num_active}
                    onChange={(value) => updateAuditData(
                      sacrament.id,
                      auditData[sacrament.id]?.storageCount ?? sacrament.num_storage,
                      Number(value),
                      auditData[sacrament.id]?.notes
                    )}
                    min={0}
                    style={{ width: 100 }}
                    error={currentSacrament === sacrament.id && errors.actualActive?.message}
                  />
                </td>
                <td>
                  <TextInput
                    value={auditData[sacrament.id]?.notes ?? ''}
                    onChange={(e) => updateAuditData(
                      sacrament.id,
                      auditData[sacrament.id]?.storageCount ?? sacrament.num_storage,
                      auditData[sacrament.id]?.activeCount ?? sacrament.num_active,
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
                        actualStorage: auditData[sacrament.id]?.storageCount ?? sacrament.num_storage,
                        actualActive: auditData[sacrament.id]?.activeCount ?? sacrament.num_active,
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

        {Object.keys(auditData).length > 0 && (
          <Group justify="flex-end">
            <Button
              onClick={submitAllAudits}
              loading={auditMutation.isPending}
              color="green"
            >
              Submit All Audits ({Object.keys(auditData).length})
            </Button>
          </Group>
        )}
      </Stack>
    </Paper>
  );
}