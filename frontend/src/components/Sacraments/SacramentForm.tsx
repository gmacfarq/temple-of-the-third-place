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

interface SacramentFormData {
  name: string;
  type: string;
  description: string;
  numStorage: number;
  suggestedDonation: number;
}

export default function SacramentForm() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<SacramentFormData>({
    name: '',
    type: '',
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
    <Paper shadow="xs" p="xl">
      <Stack gap="md">
        <Title order={2}>Add New Sacrament</Title>

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
              onChange={(value) => setFormData({ ...formData, type: value || '' })}
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

            <Group justify="space-between" mt="xl">
              <Button variant="subtle" onClick={() => navigate('/sacraments')}>
                Cancel
              </Button>
              <Button type="submit" loading={addSacramentMutation.isPending}>
                Add Sacrament
              </Button>
            </Group>
          </Stack>
        </form>
      </Stack>
    </Paper>
  );
}