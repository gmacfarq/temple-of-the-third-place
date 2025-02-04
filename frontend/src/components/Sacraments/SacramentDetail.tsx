import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Paper,
  Title,
  Text,
  Group,
  Button,
  Stack,
  LoadingOverlay,
  Modal
} from '@mantine/core';
import { useParams, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { sacraments } from '../../services/api';

interface Sacrament {
  id: number;
  name: string;
  type: string;
  description: string;
  num_storage: number;
  num_active: number;
  suggested_donation: string;
}

export default function SacramentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const { data: sacrament, isLoading, error } = useQuery<Sacrament>({
    queryKey: ['sacrament', id],
    queryFn: () => sacraments.getById(Number(id))
  });

  const deleteMutation = useMutation({
    mutationFn: sacraments.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sacraments'] });
      navigate('/sacraments');
    },
  });

  if (isLoading) {
    return <LoadingOverlay visible={true} />;
  }

  if (error) {
    return (
      <Paper shadow="xs" p="md" style={{ backgroundColor: '#fff4f4' }}>
        <Text color="red">Error loading sacrament: {(error as Error).message}</Text>
      </Paper>
    );
  }

  if (!sacrament) {
    return <Text>Sacrament not found</Text>;
  }

  return (
    <>
      <Paper shadow="xs" p="xl">
        <Stack gap="md">
          <Group justify="space-between">
            <Title order={2}>{sacrament.name}</Title>
            <Group>
              <Button
                variant="outline"
                onClick={() => navigate(`/sacraments/${id}/edit`)}
              >
                Edit
              </Button>
              <Button
                color="red"
                variant="outline"
                onClick={() => setDeleteModalOpen(true)}
              >
                Delete
              </Button>
            </Group>
          </Group>

          <Stack gap="xs">
            <Text size="lg"><strong>Type:</strong> {sacrament.type}</Text>
            <Text size="lg"><strong>Description:</strong> {sacrament.description}</Text>
            <Text size="lg"><strong>Storage Quantity:</strong> {sacrament.num_storage}</Text>
            <Text size="lg"><strong>Active Quantity:</strong> {sacrament.num_active}</Text>
            <Text size="lg">
              <strong>Suggested Donation:</strong> ${parseFloat(sacrament.suggested_donation).toFixed(2)}
            </Text>
          </Stack>

          <Button
            variant="subtle"
            onClick={() => navigate('/sacraments')}
            mt="xl"
          >
            Back to Sacraments
          </Button>
        </Stack>
      </Paper>

      {/* Delete Confirmation Modal */}
      <Modal
        opened={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Confirm Deletion"
      >
        <Stack gap="md">
          <Text>Are you sure you want to delete {sacrament.name}?</Text>
          <Group justify="space-between">
            <Button variant="subtle" onClick={() => setDeleteModalOpen(false)}>
              Cancel
            </Button>
            <Button
              color="red"
              loading={deleteMutation.isPending}
              onClick={() => deleteMutation.mutate(sacrament.id)}
            >
              Delete
            </Button>
          </Group>
        </Stack>
      </Modal>
    </>
  );
}