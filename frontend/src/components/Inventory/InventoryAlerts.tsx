import { Alert, Group, Text, Stack } from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';
import { inventory } from '../../services/api';

interface InventoryAlert {
  id: number;
  name: string;
  type: string;
  num_storage: number;
  num_active: number;
}

export default function InventoryAlerts() {
  const { data: alerts } = useQuery({
    queryKey: ['inventory', 'alerts'],
    queryFn: inventory.getAlerts
  });

  if (!alerts?.length) {
    return null;
  }

  return (
    <Alert
      icon={<IconAlertCircle size={16} />}
      title="Low Inventory Alert"
      color="red"
      variant="light"
    >
      <Stack gap="xs">
        {alerts.map((alert: InventoryAlert) => (
          <Group key={alert.id} justify="space-between">
            <Text size="sm" fw={500}>
              {alert.name} ({alert.type})
            </Text>
            <Text size="sm" c="dimmed">
              Storage: {alert.num_storage} | Active: {alert.num_active}
            </Text>
          </Group>
        ))}
      </Stack>
    </Alert>
  );
}