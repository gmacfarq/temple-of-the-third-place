import { useState } from 'react';
import { TextInput, Group, Select, Stack, Paper, Text, Button, ActionIcon } from '@mantine/core';
import { IconSearch, IconChevronUp, IconChevronDown } from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';
import { sacraments } from '../../services/api';

interface Sacrament {
  id: number;
  name: string;
  type: string;
  strain: string;
  suggested_donation: string;
}

interface SacramentSearchProps {
  onSelect: (sacrament: Sacrament) => void;
}

export default function SacramentSearch({ onSelect }: SacramentSearchProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string | null>(null);

  const { data: sacramentsList } = useQuery({
    queryKey: ['sacraments'],
    queryFn: sacraments.getAll
  });

  const filteredSacraments = sacramentsList?.filter((sacrament: Sacrament) => {
    const matchesType = !typeFilter || sacrament.type === typeFilter;

    if (!searchQuery) return matchesType;

    const searchLower = searchQuery.toLowerCase();
    return matchesType && (
      sacrament.name.toLowerCase().includes(searchLower) ||
      sacrament.strain.toLowerCase().includes(searchLower)
    );
  });

  return (
    <Stack gap="md">
      <Group grow>
        <TextInput
          placeholder="Search by name or strain"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          leftSection={<IconSearch size={16} />}
        />
        <Select
          placeholder="Filter by type"
          value={typeFilter}
          onChange={setTypeFilter}
          data={[
            { value: '', label: 'All' },
            { value: 'chocolate', label: 'Chocolate' },
            { value: 'dried_fruit', label: 'Dried Fruit' },
            { value: 'capsule', label: 'Capsule' },
            { value: 'gummy', label: 'Gummy' },
            { value: 'psily_tart', label: 'Psily Tart' },
            { value: 'tincture', label: 'Tincture' },
            { value: 'other', label: 'Other' }
          ]}
          clearable
          readOnly
          rightSection={
            <Group gap={0}>
              <ActionIcon onClick={(e) => { e.stopPropagation(); /* Add type cycling here */ }}>
                <IconChevronUp size={24} />
              </ActionIcon>
              <ActionIcon onClick={(e) => { e.stopPropagation(); /* Add type cycling here */ }}>
                <IconChevronDown size={24} />
              </ActionIcon>
            </Group>
          }
        />
      </Group>

      <Paper p="xs" withBorder>
        <Stack gap="xs">
          {filteredSacraments?.map((sacrament: Sacrament) => (
            <Group key={sacrament.id} justify="apart">
              <Stack gap={2}>
                <Text fw={500} size="sm">{sacrament.name}</Text>
                <Text c="dimmed" size="xs">
                  {sacrament.type} - {sacrament.strain}
                </Text>
              </Stack>
              <Group>
                <Text size="sm">${sacrament.suggested_donation}</Text>
                <Button size="xs" onClick={() => onSelect(sacrament)}>
                  Add
                </Button>
              </Group>
            </Group>
          ))}
        </Stack>
      </Paper>
    </Stack>
  );
}