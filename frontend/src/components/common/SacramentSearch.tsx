import { Select, Text } from '@mantine/core';
import { useQuery } from '@tanstack/react-query';
import { sacraments } from '../../services/api';
import { Sacrament } from '../../types/sacrament';

interface SacramentSearchProps {
  value: number | null;
  onChange: (sacramentId: number | null) => void;
  label?: string;
  placeholder?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
}

export default function SacramentSearch({
  value,
  onChange,
  label = 'Sacrament',
  placeholder = 'Search sacraments...',
  error,
  required = false,
  disabled = false
}: SacramentSearchProps) {
  const { data: sacramentsList, isLoading } = useQuery({
    queryKey: ['sacraments'],
    queryFn: sacraments.getAll
  });

  const handleChange = (value: string | null) => {
    onChange(value ? parseInt(value) : null);
  };

  // Simple data format without custom rendering
  const selectData = sacramentsList?.map((sacrament: Sacrament) => ({
    value: sacrament.id.toString(),
    label: `${sacrament.name} (${sacrament.type}) - ${sacrament.num_active} available`
  })) || [];

  return (
    <div>
      {label && <Text fw={500} size="sm" mb={5}>{label}</Text>}
      <Select
        placeholder={placeholder}
        data={selectData}
        value={value?.toString() || ''}
        onChange={handleChange}
        searchable
        clearable
        required={required}
        error={error}
        disabled={disabled || isLoading}
      />
    </div>
  );
}