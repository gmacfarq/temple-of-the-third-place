import { useQuery } from '@tanstack/react-query';
import { Stack, LoadingOverlay, Tabs } from '@mantine/core';
import { sacraments } from '../../services/api';
import InventoryList from './InventoryList';
import InventoryAlerts from './InventoryAlerts';
import InventoryAudit from './InventoryAudit';
import AuditHistory from './AuditHistory';

interface Sacrament {
  id: number;
  name: string;
  type: string;
  strain: string;
  num_storage: number;
  num_active: number;
}

export default function Inventory() {
  const { data: sacramentsList, isLoading } = useQuery<Sacrament[]>({
    queryKey: ['sacraments'],
    queryFn: sacraments.getAll
  });

  const uniqueSacraments = sacramentsList ?
    Array.from(new Map(sacramentsList.map(item => [item.id, item])).values()) as Sacrament[] :
    [];

  return (
    <div style={{ position: 'relative' }}>
      <LoadingOverlay visible={isLoading} />
      <Stack gap="md">
        <InventoryAlerts />
        <Tabs defaultValue="manage">
          <Tabs.List>
            <Tabs.Tab value="manage">Manage Inventory</Tabs.Tab>
            <Tabs.Tab value="audit">Audit</Tabs.Tab>
            <Tabs.Tab value="history">Audit History</Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="manage" pt="xs">
            <InventoryList sacraments={uniqueSacraments} />
          </Tabs.Panel>

          <Tabs.Panel value="audit" pt="xs">
            <InventoryAudit sacraments={uniqueSacraments} />
          </Tabs.Panel>

          <Tabs.Panel value="history" pt="xs">
            <AuditHistory />
          </Tabs.Panel>
        </Tabs>
      </Stack>
    </div>
  );
}