import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Table,
  Button,
  TextInput,
  NumberInput,
  Group,
  Paper,
  Text,
  LoadingOverlay,
  Select
} from '@mantine/core';
import { sacraments } from '../../services/api';

interface Sacrament {
  id: number;
  name: string;
  type: string;
  description: string;
  numStorage: number;
  numActive: number;
  suggestedDonation: number;
}

interface SacramentFormData {
  name: string;
  type: string;
  description: string;
  numStorage: number;
  suggestedDonation: number;
}

export default function Sacraments() {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<SacramentFormData>({
    name: '',
    type: '',
    description: '',
    numStorage: 0,
    suggestedDonation: 0,
  });

  // Fetch sacraments
  const { data: sacramentsList, isLoading } = useQuery({
    queryKey: ['sacraments'],
    queryFn: sacraments.getAll
  });

  // Add sacrament mutation
  const addSacramentMutation = useMutation({
    mutationFn: sacraments.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sacraments'] });
      setFormData({
        name: '',
        type: '',
        description: '',
        numStorage: 0,
        suggestedDonation: 0,
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addSacramentMutation.mutate(formData);
  };

  return (
    <div style={{ position: 'relative' }}>
      <LoadingOverlay visible={isLoading} />

      {/* Add Sacrament Form */}
      <Paper shadow="xs" p="md" mb="md">
        <form onSubmit={handleSubmit}>
          <Group align="flex-end">
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
                { value: 'consumable', label: 'Consumable' },
                { value: 'equipment', label: 'Equipment' },
                { value: 'artifact', label: 'Artifact' }
              ]}
              required
            />
            <TextInput
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
            <Button type="submit" loading={addSacramentMutation.isPending}>
              Add Sacrament
            </Button>
          </Group>
        </form>
      </Paper>

      {/* Sacraments List */}
      <Paper shadow="xs" p="md">
        <Text size="xl" mb="md">Sacraments</Text>
        <Table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Type</th>
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
                <td>{sacrament.description}</td>
                <td>{sacrament.numStorage}</td>
                <td>{sacrament.numActive}</td>
                <td>${sacrament.suggestedDonation.toFixed(2)}</td>
                <td>
                  <Group>
                    <Button size="xs" variant="outline">
                      Edit
                    </Button>
                    <Button size="xs" color="red" variant="outline">
                      Delete
                    </Button>
                  </Group>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Paper>
    </div>
  );
}