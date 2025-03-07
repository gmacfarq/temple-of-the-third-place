import { useQuery } from '@tanstack/react-query';
import {
  Paper,
  Title,
  Group,
  Button,
  Table,
  Text
} from '@mantine/core';
import { useNavigate } from 'react-router-dom';
import { sacraments } from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
import { Sacrament } from '../../types/sacrament';

export default function Sacraments() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data: sacramentsList, isLoading, error } = useQuery({
    queryKey: ['sacraments'],
    queryFn: sacraments.getAll
  });

  return (
    <div>
      <Paper shadow="xs" p="md" mb="md">
        <Group justify="space-between" mb="md">
          <Title order={2}>Sacraments</Title>
          <Group>
            {user?.role === 'admin' && (
              <Button onClick={() => navigate('/sacraments/add')}>
                Add Sacrament
              </Button>
            )}
          </Group>
        </Group>

        <Table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Type</th>
              <th>Strain</th>
              <th>Storage</th>
              <th>Active</th>
              <th>Total</th>
              <th>Suggested Donation</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sacramentsList?.map((sacrament: Sacrament) => (
              <tr key={sacrament.id}>
                <td>{sacrament.name}</td>
                <td>{sacrament.type}</td>
                <td>{sacrament.strain || 'N/A'}</td>
                <td>{sacrament.num_storage}</td>
                <td>{sacrament.num_active}</td>
                <td>
                  <Text
                    color={(sacrament.num_storage + sacrament.num_active) < sacrament.low_inventory_threshold ? 'red' : undefined}
                    weight={(sacrament.num_storage + sacrament.num_active) < sacrament.low_inventory_threshold ? 'bold' : undefined}
                  >
                    {sacrament.num_storage + sacrament.num_active}
                  </Text>
                </td>
                <td>${sacrament.suggested_donation ? Number(sacrament.suggested_donation).toFixed(2) : '0.00'}</td>
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
      </Paper>
    </div>
  );
}