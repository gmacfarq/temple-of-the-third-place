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
  Modal,
  TextInput,
  NumberInput,
  Select,
  Textarea,
  ActionIcon
} from '@mantine/core';
import { useParams, useNavigate } from 'react-router-dom';
import { sacraments } from '../../services/api';
import { IconChevronUp, IconChevronDown } from '@tabler/icons-react';
import styles from '../Members/Members.module.css';

type SacramentType = 'chocolate' | 'dried_fruit' | 'capsule' | 'gummy' | 'psily_tart' | 'tincture' | 'other';

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

export default function SacramentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [editedFields, setEditedFields] = useState<Partial<Sacrament> | null>(null);

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
    },
  });

  const deleteMutation = useMutation({
    mutationFn: sacraments.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sacraments'] });
      navigate('/sacraments');
    },
  });

  const types: SacramentType[] = ['chocolate', 'dried_fruit', 'capsule', 'gummy', 'psily_tart', 'tincture', 'other'];

  const cycleType = (direction: 'up' | 'down') => {
    if (!editedFields) return;
    const currentIndex = types.indexOf(editedFields.type as SacramentType);
    let newIndex;
    if (direction === 'up') {
      newIndex = currentIndex === 0 ? types.length - 1 : currentIndex - 1;
    } else {
      newIndex = currentIndex === types.length - 1 ? 0 : currentIndex + 1;
    }
    setEditedFields({ ...editedFields, type: types[newIndex] });
  };

  const handleEdit = () => {
    if (isEditing) {
      setEditedFields(null);
    } else {
      setEditedFields(sacrament!);
    }
    setIsEditing(!isEditing);
  };

  const handleSave = () => {
    if (!editedFields) return;
    updateMutation.mutate(editedFields);
  };

  if (isLoading) return <LoadingOverlay visible={true} />;
  if (error) return <Text c="red">Error loading sacrament: {(error as Error).message}</Text>;
  if (!sacrament) return <Text>Sacrament not found</Text>;

  return (
    <>
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
              <>
                <TextInput
                  label="Name"
                  value={editedFields?.name}
                  onChange={(e) => setEditedFields({ ...editedFields!, name: e.target.value })}
                />

                <Select
                  className={styles.selectWrapper}
                  label="Type"
                  value={editedFields?.type}
                  onChange={(value) => setEditedFields({ ...editedFields!, type: value as string })}
                  data={types.map(type => ({ value: type, label: type.replace('_', ' ') }))}
                  rightSectionWidth={80}
                  rightSection={
                    <Group gap={0}>
                      <ActionIcon onClick={(e) => { e.stopPropagation(); cycleType('up'); }}>
                        <IconChevronUp size={24} />
                      </ActionIcon>
                      <ActionIcon onClick={(e) => { e.stopPropagation(); cycleType('down'); }}>
                        <IconChevronDown size={24} />
                      </ActionIcon>
                    </Group>
                  }
                  styles={{ input: { cursor: 'default' } }}
                  readOnly
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

                <Group justify="flex-end" mt="xl">
                  <Button onClick={handleSave} loading={updateMutation.isPending}>
                    Save Changes
                  </Button>
                </Group>
              </>
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