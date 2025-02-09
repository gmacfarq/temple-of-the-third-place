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
  Stack,
  ActionIcon
} from '@mantine/core';
import { useNavigate } from 'react-router-dom';
import { sacraments } from '../../services/api';
import { IconChevronUp, IconChevronDown } from '@tabler/icons-react';
import styles from '../Members/Members.module.css'; // You might want to move this to a shared location

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

  const types: SacramentType[] = ['chocolate', 'dried_fruit', 'capsule', 'gummy', 'psily_tart', 'tincture', 'other'];

  const cycleType = (direction: 'up' | 'down') => {
    const currentIndex = types.indexOf(formData.type);
    let newIndex;
    if (direction === 'up') {
      newIndex = currentIndex === 0 ? types.length - 1 : currentIndex - 1;
    } else {
      newIndex = currentIndex === types.length - 1 ? 0 : currentIndex + 1;
    }
    setFormData({ ...formData, type: types[newIndex] });
  };

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
              className={styles.selectWrapper}
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