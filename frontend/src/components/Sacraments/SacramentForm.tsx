import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  TextInput,
  NumberInput,
  Button,
  Group,
  Paper,
  Title,
  Select,
  Textarea,
  Stack
} from '@mantine/core';
import { useNavigate } from 'react-router-dom';
import { sacraments } from '../../services/api';

type SacramentType = 'chocolate' | 'dried_fruit' | 'capsule' | 'gummy' | 'psily_tart' | 'tincture' | 'other';

interface SacramentFormData {
  name: string;
  type: SacramentType;
  strain: string;
  description: string;
  numStorage: number;
  suggestedDonation: number;
}

export default function SacramentForm() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<SacramentFormData>({
    name: '',
    type: 'chocolate',
    strain: '',
    description: '',
    numStorage: 0,
    suggestedDonation: 0,
  });

  const addSacramentMutation = useMutation({
    mutationFn: sacraments.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sacraments'] });
      navigate('/sacraments');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addSacramentMutation.mutate(formData);
  };

  return (
    <Paper shadow="xs" p="md">
      <Title order={2} mb="md">Add New Sacrament</Title>
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
            label="Initial Storage Quantity"
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

          <Group justify="flex-end">
            <Button type="submit" loading={addSacramentMutation.isPending}>
              Add Sacrament
            </Button>
          </Group>
        </Stack>
      </form>
    </Paper>
  );
}