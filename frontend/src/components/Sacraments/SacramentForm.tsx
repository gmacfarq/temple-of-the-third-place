import { useState, useEffect } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import {
  TextInput,
  NumberInput,
  Button,
  Group,
  Paper,
  Title,
  Select,
  Textarea,
  Stack,
  LoadingOverlay
} from '@mantine/core';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { sacraments } from '../../services/api';
import { useNotifications } from '../../hooks/useNotifications';

type SacramentType = 'chocolate' | 'dried_fruit' | 'capsule' | 'gummy' | 'psily_tart' | 'tincture' | 'other';

interface SacramentFormData {
  name: string;
  type: SacramentType;
  strain: string;
  description: string;
  numStorage: number;
  suggestedDonation: number;
  lowInventoryThreshold: number;
}

export default function SacramentForm() {
  const { id } = useParams();
  const location = useLocation();
  const isAddMode = location.pathname === '/sacraments/add';
  const isEditMode = !isAddMode && id && !isNaN(Number(id));

  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useNotifications();

  const [formData, setFormData] = useState<SacramentFormData>({
    name: '',
    type: 'chocolate',
    strain: '',
    description: '',
    numStorage: 0,
    suggestedDonation: 0,
    lowInventoryThreshold: 5,
  });

  // Only fetch sacrament data if we're in edit mode
  const { data: sacramentData, isLoading: isLoadingSacrament } = useQuery({
    queryKey: ['sacrament', id],
    queryFn: () => sacraments.getById(Number(id)),
    enabled: isEditMode,
    onError: () => {
      showError('Failed to load sacrament data');
      navigate('/sacraments');
    }
  });

  // Update form data when sacrament data is loaded (for edit mode)
  useEffect(() => {
    if (sacramentData && isEditMode) {
      setFormData({
        name: sacramentData.name,
        type: sacramentData.type as SacramentType,
        strain: sacramentData.strain || '',
        description: sacramentData.description || '',
        numStorage: sacramentData.num_storage,
        suggestedDonation: sacramentData.suggested_donation,
        lowInventoryThreshold: sacramentData.low_inventory_threshold,
      });
    }
  }, [sacramentData, isEditMode]);

  const mutation = useMutation({
    mutationFn: isEditMode
      ? (data: SacramentFormData) => sacraments.update(Number(id), data)
      : sacraments.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sacraments'] });
      showSuccess(`Sacrament ${isEditMode ? 'updated' : 'added'} successfully`);
      navigate('/sacraments');
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || error.message || 'An error occurred';
      showError(`Failed to ${isEditMode ? 'update' : 'add'} sacrament: ${errorMessage}`);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  return (
    <Paper shadow="xs" p="md" pos="relative">
      <LoadingOverlay visible={isLoadingSacrament} />
      <Title order={2} mb="md">{isEditMode ? 'Edit' : 'Add New'} Sacrament</Title>
      <form onSubmit={handleSubmit}>
        <Stack gap="md">
          <TextInput
            label="Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />

          <Select
            label="Type"
            value={formData.type}
            onChange={(value) => setFormData({ ...formData, type: value as SacramentType })}
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
            value={formData.strain}
            onChange={(e) => setFormData({ ...formData, strain: e.target.value })}
          />

          <Textarea
            label="Description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />

          <NumberInput
            label={isEditMode ? "Storage Quantity" : "Initial Storage Quantity"}
            value={formData.numStorage}
            onChange={(value) => setFormData({ ...formData, numStorage: Number(value || 0) })}
            min={0}
            required
          />

          <NumberInput
            label="Suggested Donation"
            value={formData.suggestedDonation}
            onChange={(value) => setFormData({ ...formData, suggestedDonation: Number(value || 0) })}
            min={0}
            required
          />

          <NumberInput
            label="Low Inventory Threshold"
            description="Alert when total inventory falls below this number"
            value={formData.lowInventoryThreshold}
            onChange={(value) => setFormData({ ...formData, lowInventoryThreshold: value || 5 })}
            min={0}
            step={1}
            required
          />

          <Group justify="flex-end">
            <Button variant="outline" onClick={() => navigate('/sacraments')}>
              Cancel
            </Button>
            <Button type="submit" loading={mutation.isPending}>
              {isEditMode ? 'Update' : 'Add'} Sacrament
            </Button>
          </Group>
        </Stack>
      </form>
    </Paper>
  );
}