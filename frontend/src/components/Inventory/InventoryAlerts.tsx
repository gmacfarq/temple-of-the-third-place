import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Paper,
  Title,
  Text,
  Group,
  Button,
  Badge,
  Collapse,
  Card,
  Stack,
  ActionIcon
} from '@mantine/core';
import { IconChevronDown, IconChevronUp } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { sacraments } from '../../services/api';
import { Sacrament } from '../../types/sacrament';

export default function InventoryAlerts() {
  const navigate = useNavigate();
  const [showLowInventory, setShowLowInventory] = useState(false);

  // Add refetchOnMount: true to ensure it refreshes when component mounts
  const { data: sacramentsList, refetch } = useQuery({
    queryKey: ['sacraments'],
    queryFn: sacraments.getAll,
    refetchOnMount: true,
    staleTime: 0 // Consider data always stale
  });

  // Add effect to refetch on mount
  useEffect(() => {
    refetch();
  }, [refetch]);

  // Filter sacraments with low inventory
  const lowInventorySacraments = sacramentsList?.filter(
    (sacrament: Sacrament) => (sacrament.num_storage + sacrament.num_active) < sacrament.low_inventory_threshold
  ) || [];

  if (lowInventorySacraments.length === 0) {
    return null; // Don't render anything if no low inventory items
  }

  return (
    <Paper shadow="xs" p="md">
      <Group justify="space-between" mb="md">
        <Group>
          <Badge
            color="red"
            size="lg"
            rightSection={
              <ActionIcon
                size="xs"
                color="red"
                variant="transparent"
                onClick={() => setShowLowInventory(!showLowInventory)}
              >
                {showLowInventory ? <IconChevronUp size={14} /> : <IconChevronDown size={14} />}
              </ActionIcon>
            }
            style={{ cursor: 'pointer' }}
            onClick={() => setShowLowInventory(!showLowInventory)}
          >
            {lowInventorySacraments.length} Low Inventory Items
          </Badge>
        </Group>
      </Group>

      <Collapse in={showLowInventory}>
        <Card withBorder>
          <Title order={4} mb="sm">Low Inventory Sacraments</Title>
          <Stack>
            {lowInventorySacraments.map((sacrament: Sacrament) => (
              <Group key={sacrament.id} position="apart">
                <Text>
                  <strong>{sacrament.name}</strong> ({sacrament.type})
                </Text>
                <Group spacing="xs">
                  <Text size="sm">Current: {sacrament.num_storage + sacrament.num_active}</Text>
                  <Text size="sm">Threshold: {sacrament.low_inventory_threshold}</Text>
                  <Button
                    size="xs"
                    variant="outline"
                    onClick={() => navigate(`/sacraments/${sacrament.id}`)}
                  >
                    View
                  </Button>
                </Group>
              </Group>
            ))}
          </Stack>
        </Card>
      </Collapse>
    </Paper>
  );
}