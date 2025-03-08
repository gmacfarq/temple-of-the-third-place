import React, { useState } from 'react';
import { NumberInput, Text, Badge, Button } from '@mantine/core';
import { useNavigate } from 'react-router-dom';

const SacramentDetails: React.FC = () => {
  const [formData, setFormData] = useState({
    lowInventoryThreshold: 5,
  });

  const sacrament = {
    low_inventory_threshold: 5,
    num_storage: 10,
    num_active: 5,
  };

  const navigate = useNavigate();

  return (
    <div>
      <NumberInput
        label="Low Inventory Threshold"
        description="Alert when total inventory falls below this number"
        value={formData.lowInventoryThreshold}
        onChange={(value) => setFormData({ ...formData, lowInventoryThreshold: value || 5 })}
        min={0}
        step={1}
      />

      <Text>
        <strong>Low Inventory Threshold:</strong> {sacrament.low_inventory_threshold}
        {(sacrament.num_storage + sacrament.num_active) < sacrament.low_inventory_threshold && (
          <Badge color="red" ml="xs">Currently Low</Badge>
        )}
      </Text>

      <Button
        onClick={() => navigate(`/sacraments/${id}/edit`)}
        variant="outline"
      >
        Edit
      </Button>
    </div>
  );
};

export default SacramentDetails;