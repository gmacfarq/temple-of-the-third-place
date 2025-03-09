import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Paper,
  Title,
  Text,
  Group,
  Button,
  Stack,
  LoadingOverlay,
  TextInput,
  NumberInput,
  Select,
  Textarea,
  Badge,
  Box
} from '@mantine/core';
import { useParams, useNavigate } from 'react-router-dom';
import { sacraments } from '../../services/api';
import DeleteConfirmationModal from '../common/DeleteConfirmationModal';
import { useNotifications } from '../../hooks/useNotifications';
import { useAuth } from '../../hooks/useAuth';
import { formatSacramentType } from '../../utils/formatters';

type SacramentType = 'chocolate' | 'dried_fruit' | 'capsule' | 'gummy' | 'psily_tart' | 'tincture' | 'other';

interface Sacrament {
  id: number;
  name: string;
  type: SacramentType;
  strain: string;
  description: string;
  num_storage: number;
  num_active: number;
  suggested_donation: string;
  low_inventory_threshold: number;
}

export default function SacramentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [editedFields, setEditedFields] = useState<Partial<Sacrament> | null>(null);
  const { showSuccess, showError } = useNotifications();
  const { user } = useAuth();

  const { data: sacrament, isLoading, error } = useQuery<Sacrament>({
    queryKey: ['sacrament', id],
    queryFn: () => sacraments.getById(Number(id))
  });

  useEffect(() => {
    if (sacrament) {
      console.log('Sacrament data in component:', sacrament);
      console.log('Description:', sacrament.description);
    }
  }, [sacrament]);

  const updateMutation = useMutation({
    mutationFn: (data: Partial<Sacrament>) => sacraments.update(Number(id), {
      name: data.name,
      type: data.type,
      strain: data.strain,
      description: data.description,
      suggestedDonation: parseFloat(data.suggested_donation || '0'),
      lowInventoryThreshold: data.low_inventory_threshold
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sacrament', id] });
      setIsEditing(false);
      setEditedFields(null);
      showSuccess('Sacrament updated successfully');
      // No need to navigate, we're already on the detail page
    },
    onError: (error) => {
      showError('Failed to update sacrament: ' + (error as Error).message);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: sacraments.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sacraments'] });
      navigate('/sacraments');
      showSuccess('Sacrament deleted successfully');
    },
    onError: (error) => {
      showError('Failed to delete sacrament: ' + (error as Error).message);
    }
  });

  const handleEdit = () => {
    if (isEditing) {
      setEditedFields(null);
    } else {
      setEditedFields(sacrament!);
    }
    setIsEditing(!isEditing);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault(); // Prevent default form submission
    if (!editedFields) return;
    updateMutation.mutate(editedFields);
  };

  if (isLoading) return <LoadingOverlay visible={true} />;
  if (error) return <Text c="red">Error loading sacrament: {(error as Error).message}</Text>;
  if (!sacrament) return <Text>Sacrament not found</Text>;

  return (
    <div style={{ position: 'relative' }}>
      <LoadingOverlay visible={isLoading || updateMutation.isPending || deleteMutation.isPending} />

      <Paper shadow="xs" p="md">
        {isEditing ? (
          <form onSubmit={handleSave}>
            <Stack gap="md">
              <TextInput
                label="Name"
                value={editedFields?.name}
                onChange={(e) => setEditedFields({ ...editedFields!, name: e.target.value })}
                required
              />

              <Select
                label="Type"
                value={editedFields?.type}
                onChange={(value) => setEditedFields({ ...editedFields!, type: value as SacramentType })}
                data={[
                  { value: 'chocolate', label: 'Chocolate' },
                  { value: 'dried_fruit', label: 'Dried Fruit' },
                  { value: 'capsule', label: 'Capsule' },
                  { value: 'gummy', label: 'Gummy' },
                  { value: 'psily_tart', label: 'Psily Tart' },
                  { value: 'tincture', label: 'Tincture' },
                  { value: 'other', label: 'Other' }
                ]}
                required
              />

              <TextInput
                label="Strain"
                value={editedFields?.strain || ''}
                onChange={(e) => setEditedFields({ ...editedFields!, strain: e.target.value })}
              />

              <Textarea
                label="Description"
                value={editedFields?.description || ''}
                onChange={(e) => setEditedFields({ ...editedFields!, description: e.target.value })}
                minRows={3}
              />

              <NumberInput
                label="Suggested Donation"
                value={parseFloat(editedFields?.suggested_donation || '0')}
                onChange={(value) => setEditedFields({ ...editedFields!, suggested_donation: value?.toString() })}
                min={0}
                prefix="$"
              />

              <NumberInput
                label="Low Inventory Threshold"
                value={editedFields?.low_inventory_threshold || 5}
                onChange={(value) => setEditedFields({ ...editedFields!, low_inventory_threshold: typeof value === 'number' ? value : 5 })}
                min={0}
                step={1}
              />

              <Group justify="flex-end" mt="md">
                <Button variant="outline" onClick={() => setIsEditing(false)} type="button">
                  Cancel
                </Button>
                <Button type="submit">
                  Save Changes
                </Button>
              </Group>
            </Stack>
          </form>
        ) : (
          <Stack gap="md">
            <Title order={2}>{sacrament.name}</Title>

            <Group>
              <Badge>{formatSacramentType(sacrament.type)}</Badge>
              {sacrament.strain && <Badge color="grape">{sacrament.strain}</Badge>}
            </Group>

            {sacrament.description ? (
              <Box>
                <Text size="sm" color="dimmed" mb={5}>Description</Text>
                <Text>{sacrament.description}</Text>
              </Box>
            ) : (
              <Box>
                <Text size="sm" color="dimmed" mb={5}>Description</Text>
                <Text color="dimmed" fs="italic">No description available</Text>
              </Box>
            )}

            <Group>
              <Stack gap={0}>
                <Text size="sm" color="dimmed">Storage</Text>
                <Text size="lg" fw={500}>{sacrament.num_storage}</Text>
              </Stack>

              <Stack gap={0}>
                <Text size="sm" color="dimmed">Active</Text>
                <Text size="lg" fw={500}>{sacrament.num_active}</Text>
              </Stack>

              <Stack gap={0}>
                <Text size="sm" color="dimmed">Total</Text>
                <Text
                  size="lg"
                  color={(sacrament.num_storage + sacrament.num_active) < sacrament.low_inventory_threshold ? 'red' : undefined}
                >
                  {sacrament.num_storage + sacrament.num_active}
                </Text>
              </Stack>
            </Group>

            <Stack gap={0}>
              <Text size="sm" color="dimmed">Suggested Donation</Text>
              <Text size="lg" fw={500}>
                ${sacrament.suggested_donation ? Number(sacrament.suggested_donation).toFixed(2) : '0.00'}
              </Text>
            </Stack>

            <Stack gap={0}>
              <Text size="sm" color="dimmed">Low Inventory Threshold</Text>
              <Text size="lg" fw={500}>{sacrament.low_inventory_threshold}</Text>
            </Stack>

            {user?.role === 'admin' && (
              <Group>
                <Button
                  variant="outline"
                  onClick={handleEdit}
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
            )}

            <Button
              variant="subtle"
              onClick={() => navigate('/sacraments')}
              mt="xl"
            >
              Back to Sacraments
            </Button>
          </Stack>
        )}
      </Paper>

      <DeleteConfirmationModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={() => deleteMutation.mutate(sacrament.id)}
        title="Delete Sacrament"
        message={`Are you sure you want to delete ${sacrament.name}?`}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}