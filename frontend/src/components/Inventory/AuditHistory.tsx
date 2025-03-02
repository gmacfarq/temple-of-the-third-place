import { useQuery } from '@tanstack/react-query';
import { Paper, Text, Table, Stack } from '@mantine/core';
import { inventory } from '../../services/api';

interface AuditRecord {
  id: number;
  sacrament_id: number;
  sacrament_name: string;
  actual_quantity: number;
  notes: string;
  created_at: string;
  audited_by_name: string;
}

export default function AuditHistory() {
  const { data: auditHistory, isLoading } = useQuery({
    queryKey: ['inventory', 'audits'],
    queryFn: inventory.getAudits
  });

  if (isLoading) {
    return <Text>Loading audit history...</Text>;
  }

  if (!auditHistory?.length) {
    return <Text>No audit records found.</Text>;
  }

  return (
    <Paper shadow="xs" p="md">
      <Stack gap="md">
        <Text size="xl">Audit History</Text>
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
            {auditHistory.map((audit: AuditRecord) => (
              <tr key={audit.id}>
                <td>{new Date(audit.created_at).toLocaleString()}</td>
                <td>{audit.sacrament_name}</td>
                <td>{audit.actual_quantity}</td>
                <td>{audit.audited_by_name}</td>
                <td>{audit.notes}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Stack>
    </Paper>
  );
}