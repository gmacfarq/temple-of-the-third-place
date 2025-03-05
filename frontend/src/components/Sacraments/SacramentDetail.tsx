import { useState } from 'react';
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
} from '@mantine/core';
import { useParams, useNavigate } from 'react-router-dom';
import { sacraments } from '../../services/api';
import DeleteConfirmationModal from '../common/DeleteConfirmationModal';
import { useNotifications } from '../../hooks/useNotifications';

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
}

export default function SacramentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [editedFields, setEditedFields] = useState<Partial<Sacrament> | null>(null);
  const { showSuccess, showError } = useNotifications();

  const { data: sacrament, isLoading, error } = useQuery<Sacrament>({
    queryKey: ['sacrament', id],
    queryFn: () => sacraments.getById(Number(id))
  });

  const updateMutation = useMutation({
    mutationFn: (data: Partial<Sacrament>) => sacraments.update(Number(id), {
      name: data.name,
      type: data.type,
      strain: data.strain,
      description: data.description,
      suggestedDonation: parseFloat(data.suggested_donation || '0')
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sacrament', id] });
      setIsEditing(false);
      setEditedFields(null);
      showSuccess('Sacrament updated successfully');
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

      <Paper shadow="xs" p="xl">
        <Stack gap="md">
          <Group justify="space-between">
            <Title order={2}>{sacrament.name}</Title>
            <Group>
              <Button
                variant="outline"
                onClick={handleEdit}
              >
                {isEditing ? 'Cancel' : 'Edit'}
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

          <Stack gap="md">
            {isEditing ? (
              <form onSubmit={handleSave}>
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
                  value={editedFields?.description}
                  onChange={(e) => setEditedFields({ ...editedFields!, description: e.target.value })}
                />

                <NumberInput
                  label="Suggested Donation"
                  value={parseFloat(editedFields?.suggested_donation || '0')}
                  onChange={(value) => setEditedFields({ ...editedFields!, suggested_donation: value?.toString() })}
                  min={0}
                />

                <Group justify="flex-end" mt="md">
                  <Button variant="outline" onClick={() => setIsEditing(false)} type="button">
                    Cancel
                  </Button>
                  <Button type="submit">
                    Save Changes
                  </Button>
                </Group>
              </form>
            ) : (
              <>
                <Text size="lg"><strong>Type:</strong> {sacrament.type}</Text>
                <Text size="lg"><strong>Strain:</strong> {sacrament.strain}</Text>
                <Text size="lg"><strong>Description:</strong> {sacrament.description}</Text>
                <Text size="lg"><strong>Storage Quantity:</strong> {sacrament.num_storage}</Text>
                <Text size="lg"><strong>Active Quantity:</strong> {sacrament.num_active}</Text>
                <Text size="lg">
                  <strong>Suggested Donation:</strong> ${parseFloat(sacrament.suggested_donation).toFixed(2)}
                </Text>
              </>
            )}
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

      <DeleteConfirmationModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={() => deleteMutation.mutate(sacrament.id)}
        itemType="sacrament"
        message={`Are you sure you want to delete ${sacrament.name}?`}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}