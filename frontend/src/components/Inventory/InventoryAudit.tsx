import { useState } from 'react';
import { Paper, Text, Table, NumberInput, Button, Group, Stack, TextInput } from '@mantine/core';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { inventory } from '../../services/api';

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

  const auditMutation = useMutation({
    mutationFn: async (data: { sacramentId: number; actualQuantity: number; notes: string }) => {
      return inventory.recordAudit(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sacraments'] });
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
    }
  });

  const handleAuditSubmit = async () => {
    for (const [sacramentId, data] of Object.entries(auditData)) {
      const notes = data.notes || globalNotes;
      await auditMutation.mutateAsync({
        sacramentId: Number(sacramentId),
        actualQuantity: data.storageCount,
        notes: notes || `Weekly audit ${new Date().toLocaleDateString()}`
      });
    }
    setAuditData({});
    setGlobalNotes('');
  };

  const updateAuditData = (sacramentId: number, storageCount: number, notes: string = '') => {
    setAuditData(prev => ({
      ...prev,
      [sacramentId]: { storageCount, notes }
    }));
  };

  const hasChanges = Object.keys(auditData).length > 0;

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
              </tr>
            ))}
          </tbody>
        </Table>

        <Group justify="flex-end">
          <Button
            onClick={handleAuditSubmit}
            disabled={!hasChanges}
            loading={auditMutation.isPending}
          >
            Submit Audit
          </Button>
        </Group>
      </Stack>
    </Paper>
  );
}