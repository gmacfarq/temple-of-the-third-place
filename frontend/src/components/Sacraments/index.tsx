import { useQuery, useMutation } from '@tanstack/react-query';
import {
  Table,
  Button,
  Paper,
  Text,
  LoadingOverlay,
  Group
} from '@mantine/core';
import { sacraments } from '../../services/api';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../../hooks/useNotifications';
import { useQueryClient } from '@tanstack/react-query';

interface Sacrament {
  id: number;
  name: string;
  type: string;
  strain: string;
  description: string;
  num_storage: number;
  num_active: number;
  suggested_donation: string;
}

export default function Sacraments() {
  const navigate = useNavigate();
  const { data: sacramentsList, isLoading, error } = useQuery({
    queryKey: ['sacraments'],
    queryFn: sacraments.getAll
  });
  const { showSuccess, showError } = useNotifications();
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: sacraments.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sacraments'] });
      showSuccess('Sacrament deleted successfully');
    },
    onError: (error) => {
      showError(error.response?.data?.message || 'Failed to delete sacrament');
    }
  });

  const createMutation = useMutation({
    mutationFn: sacraments.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sacraments'] });
      showSuccess('Sacrament created successfully');
    },
    onError: (error) => {
      showError(error.response?.data?.message || 'Failed to create sacrament');
    }
  });

  return (
    <div style={{ position: 'relative' }}>
      <LoadingOverlay visible={isLoading} />

      {error && (
        <Paper shadow="xs" p="md" mb="md" style={{ backgroundColor: '#fff4f4' }}>
          <Text c="red">Error loading sacraments: {(error as Error).message}</Text>
        </Paper>
      )}

      {/* Header with Add Button */}
      <Group justify="space-between" mb="md">
        <Text size="xl">Sacraments</Text>
        <Button onClick={() => navigate('/sacraments/new')}>
          Add New Sacrament
        </Button>
      </Group>

      {/* Sacraments List */}
      <Paper shadow="xs" p="md">
        <Table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Type</th>
              <th>Strain</th>
              <th>Description</th>
              <th>Storage</th>
              <th>Active</th>
              <th>Suggested Donation</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sacramentsList?.map((sacrament: Sacrament) => (
              <tr key={sacrament.id}>
                <td>{sacrament.name}</td>
                <td>{sacrament.type}</td>
                <td>{sacrament.strain}</td>
                <td>{sacrament.description}</td>
                <td>{sacrament.num_storage}</td>
                <td>{sacrament.num_active}</td>
                <td>${parseFloat(sacrament.suggested_donation).toFixed(2)}</td>
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