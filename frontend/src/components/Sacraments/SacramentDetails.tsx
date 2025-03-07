import React, { useState } from 'react';
import { NumberInput, Text, Badge } from '@mantine/core';

const SacramentDetails: React.FC = () => {
  const [formData, setFormData] = useState({
    lowInventoryThreshold: 5,
  });

  const sacrament = {
    low_inventory_threshold: 5,
    num_storage: 10,
    num_active: 5,
  };

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
    </div>
  );
};

export default SacramentDetails;