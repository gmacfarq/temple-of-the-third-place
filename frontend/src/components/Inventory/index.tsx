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
  Textarea,
  Tabs,
  Alert
} from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';
import { inventory, sacraments } from '../../services/api';

interface InventoryTransfer {
  id: number;
  sacramentId: number;
  quantity: number;
  type: 'in' | 'out';
  notes: string;
  createdAt: string;
  sacramentName: string;
  recordedByName: string;
}

interface InventoryAudit {
  id: number;
  sacramentId: number;
  actualQuantity: number;
  notes: string;
  createdAt: string;
  sacramentName: string;
  auditedByName: string;
}

interface InventoryAlert {
  id: number;
  name: string;
  numStorage: number;
  numActive: number;
}

interface TransferFormData {
  sacramentId: string;
  quantity: number;
  type: 'in' | 'out';
  notes: string;
}

interface AuditFormData {
  sacramentId: string;
  actualQuantity: number;
  notes: string;
}

interface Sacrament {
  id: number;
  name: string;
}

export default function Inventory() {
  const queryClient = useQueryClient();
  const [transferForm, setTransferForm] = useState<TransferFormData>({
    sacramentId: '',
    quantity: 0,
    type: 'in',
    notes: ''
  });

  const [auditForm, setAuditForm] = useState<AuditFormData>({
    sacramentId: '',
    actualQuantity: 0,
    notes: ''
  });

  // Fetch inventory data
  const { data: transferHistory, isLoading: isLoadingTransfers } = useQuery({
    queryKey: ['inventory', 'transfers'],
    queryFn: inventory.getHistory
  });

  const { data: auditHistory, isLoading: isLoadingAudits } = useQuery({
    queryKey: ['inventory', 'audits'],
    queryFn: inventory.getAudits
  });

  const { data: alerts, isLoading: isLoadingAlerts } = useQuery({
    queryKey: ['inventory', 'alerts'],
    queryFn: inventory.getAlerts
  });

  const { data: sacramentsList, isLoading: isLoadingSacraments } = useQuery({
    queryKey: ['sacraments'],
    queryFn: sacraments.getAll
  });

  // Mutations
  const transferMutation = useMutation({
    mutationFn: inventory.recordTransfer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      queryClient.invalidateQueries({ queryKey: ['sacraments'] });
      setTransferForm({
        sacramentId: '',
        quantity: 0,
        type: 'in',
        notes: ''
      });
    },
  });

  const auditMutation = useMutation({
    mutationFn: inventory.recordAudit,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      queryClient.invalidateQueries({ queryKey: ['sacraments'] });
      setAuditForm({
        sacramentId: '',
        actualQuantity: 0,
        notes: ''
      });
    },
  });

  const handleTransferSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    transferMutation.mutate({
      ...transferForm,
      sacramentId: parseInt(transferForm.sacramentId),
    });
  };

  const handleAuditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    auditMutation.mutate({
      ...auditForm,
      sacramentId: parseInt(auditForm.sacramentId),
    });
  };

  const isLoading = isLoadingTransfers || isLoadingAudits || isLoadingAlerts || isLoadingSacraments;

  return (
    <div style={{ position: 'relative' }}>
      <LoadingOverlay visible={isLoading} />

      {/* Inventory Alerts */}
      {alerts?.length > 0 && (
        <Alert
          icon={<IconAlertCircle size={16} />}
          title="Low Inventory Alert"
          color="red"
          mb="md"
        >
          {alerts.map((alert: InventoryAlert) => (
            <div key={alert.id}>
              {alert.name}: {alert.numStorage} in storage ({alert.numActive} active)
            </div>
          ))}
        </Alert>
      )}

      <Tabs defaultValue="transfer">
        <Tabs.List>
          <Tabs.Tab value="transfer">Transfer</Tabs.Tab>
          <Tabs.Tab value="audit">Audit</Tabs.Tab>
          <Tabs.Tab value="history">History</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="transfer" pt="xs">
          <Paper shadow="xs" p="md">
            <form onSubmit={handleTransferSubmit}>
              <Group align="flex-end">
                <Select
                  label="Sacrament"
                  value={transferForm.sacramentId}
                  onChange={(value) => setTransferForm({ ...transferForm, sacramentId: value || '' })}
                  data={sacramentsList?.map((s: Sacrament) => ({
                    value: s.id.toString(),
                    label: s.name
                  })) || []}
                  required
                  searchable
                />
                <NumberInput
                  label="Quantity"
                  value={transferForm.quantity}
                  onChange={(value) => setTransferForm({ ...transferForm, quantity: Number(value || 0) })}
                  min={1}
                  required
                />
                <Select
                  label="Type"
                  value={transferForm.type}
                  onChange={(value) => setTransferForm({ ...transferForm, type: (value as 'in' | 'out') })}
                  data={[
                    { value: 'in', label: 'Transfer In' },
                    { value: 'out', label: 'Transfer Out' }
                  ]}
                  required
                />
                <Textarea
                  label="Notes"
                  value={transferForm.notes}
                  onChange={(e) => setTransferForm({ ...transferForm, notes: e.target.value })}
                  style={{ minWidth: '300px' }}
                />
                <Button type="submit" loading={transferMutation.isPending}>
                  Record Transfer
                </Button>
              </Group>
            </form>
          </Paper>
        </Tabs.Panel>

        <Tabs.Panel value="audit" pt="xs">
          <Paper shadow="xs" p="md">
            <form onSubmit={handleAuditSubmit}>
              <Group align="flex-end">
                <Select
                  label="Sacrament"
                  value={auditForm.sacramentId}
                  onChange={(value) => setAuditForm({ ...auditForm, sacramentId: value || '' })}
                  data={sacramentsList?.map((s: Sacrament) => ({
                    value: s.id.toString(),
                    label: s.name
                  })) || []}
                  required
                  searchable
                />
                <NumberInput
                  label="Actual Quantity"
                  value={auditForm.actualQuantity}
                  onChange={(value) => setAuditForm({ ...auditForm, actualQuantity: Number(value || 0) })}
                  min={0}
                  required
                />
                <Textarea
                  label="Notes"
                  value={auditForm.notes}
                  onChange={(e) => setAuditForm({ ...auditForm, notes: e.target.value })}
                  style={{ minWidth: '300px' }}
                />
                <Button type="submit" loading={auditMutation.isPending}>
                  Record Audit
                </Button>
              </Group>
            </form>
          </Paper>
        </Tabs.Panel>

        <Tabs.Panel value="history" pt="xs">
          <Paper shadow="xs" p="md">
            <Text size="xl" mb="md">Transfer History</Text>
            <Table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Sacrament</th>
                  <th>Type</th>
                  <th>Quantity</th>
                  <th>Recorded By</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>
                {transferHistory?.map((transfer: InventoryTransfer) => (
                  <tr key={transfer.id}>
                    <td>{new Date(transfer.createdAt).toLocaleDateString()}</td>
                    <td>{transfer.sacramentName}</td>
                    <td>{transfer.type.toUpperCase()}</td>
                    <td>{transfer.quantity}</td>
                    <td>{transfer.recordedByName}</td>
                    <td>{transfer.notes}</td>
                  </tr>
                ))}
              </tbody>
            </Table>

            <Text size="xl" my="md">Audit History</Text>
            <Table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Sacrament</th>
                  <th>Actual Quantity</th>
                  <th>Audited By</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>
                {auditHistory?.map((audit: InventoryAudit) => (
                  <tr key={audit.id}>
                    <td>{new Date(audit.createdAt).toLocaleDateString()}</td>
                    <td>{audit.sacramentName}</td>
                    <td>{audit.actualQuantity}</td>
                    <td>{audit.auditedByName}</td>
                    <td>{audit.notes}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Paper>
        </Tabs.Panel>
      </Tabs>
    </div>
  );
}