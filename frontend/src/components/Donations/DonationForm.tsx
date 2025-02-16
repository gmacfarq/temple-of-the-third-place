import { useState } from 'react';
import { NumberInput, Button, Group, Stack, Select, Paper, Text, ActionIcon } from '@mantine/core';
import { IconChevronUp, IconChevronDown } from '@tabler/icons-react';
import styles from '../Members/Members.module.css';
import RecentCheckIns from './RecentCheckIns';
import SacramentSearch from '../Sacraments/SacramentSearch';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { donations } from '../../services/api';

type DonationType = 'cash' | 'card' | 'other';

interface DonationItem {
  sacramentId: number;
  quantity: number;
  suggestedDonation: number;
}

interface Sacrament {
  id: number;
  name: string;
  suggested_donation: string;
}

export default function DonationForm() {
  const queryClient = useQueryClient();
  const [donationType, setDonationType] = useState<DonationType>('cash');
  const [selectedMemberId, setSelectedMemberId] = useState<number | null>(null);
  const [donationItems, setDonationItems] = useState<DonationItem[]>([]);

  const types: DonationType[] = ['cash', 'card', 'other'];

  const cycleDonationType = (direction: 'up' | 'down') => {
    const currentIndex = types.indexOf(donationType);
    let newIndex;
    if (direction === 'up') {
      newIndex = currentIndex === types.length - 1 ? 0 : currentIndex + 1;
    } else {
      newIndex = currentIndex === 0 ? types.length - 1 : currentIndex - 1;
    }
    setDonationType(types[newIndex]);
  };

  const addDonationMutation = useMutation({
    mutationFn: donations.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['donations'] });
      setSelectedMemberId(null);
      setDonationItems([]);
    },
  });

  const addDonationItem = (sacrament: Sacrament) => {
    setDonationItems([
      ...donationItems,
      {
        sacramentId: sacrament.id,
        quantity: 1,
        suggestedDonation: parseFloat(sacrament.suggested_donation)
      }
    ]);
  };

  const updateQuantity = (index: number, quantity: number) => {
    const newItems = [...donationItems];
    newItems[index].quantity = quantity;
    setDonationItems(newItems);
  };

  const removeDonationItem = (index: number) => {
    setDonationItems(donationItems.filter((_, i) => i !== index));
  };

  const calculateTotal = () => {
    return donationItems.reduce((total, item) =>
      total + (item.quantity * item.suggestedDonation), 0
    );
  };

  return (
    <Paper shadow="xs" p="md">
      <Stack gap="md">
        <Text size="xl">New Donation</Text>

        <Select
          className={styles.selectWrapper}
          label="Donation Type"
          value={donationType}
          data={types.map(type => ({ value: type, label: type.charAt(0).toUpperCase() + type.slice(1) }))}
          readOnly
          rightSection={
            <Group gap={0}>
              <ActionIcon onClick={(e) => { e.stopPropagation(); cycleDonationType('up'); }}>
                <IconChevronUp size={24} />
              </ActionIcon>
              <ActionIcon onClick={(e) => { e.stopPropagation(); cycleDonationType('down'); }}>
                <IconChevronDown size={24} />
              </ActionIcon>
            </Group>
          }
        />

        <Text fw={500}>Recently Checked-In Members</Text>
        <RecentCheckIns
          onSelectMember={setSelectedMemberId}
          selectedMemberId={selectedMemberId}
        />

        {selectedMemberId && (
          <>
            <Text fw={500}>Sacraments</Text>
            <SacramentSearch onSelect={addDonationItem} />

            {donationItems.length > 0 && (
              <Stack gap="sm">
                <Text fw={500}>Selected Items</Text>
                {donationItems.map((item, index) => (
                  <Group key={index} justify="apart">
                    <Text>Sacrament {item.sacramentId}</Text>
                    <Group gap="xs">
                      <NumberInput
                        value={item.quantity}
                        onChange={(value) => updateQuantity(index, Number(value))}
                        min={1}
                        max={99}
                        style={{ width: 80 }}
                      />
                      <Button
                        variant="subtle"
                        color="red"
                        onClick={() => removeDonationItem(index)}
                      >
                        Remove
                      </Button>
                    </Group>
                  </Group>
                ))}

                <Group justify="apart" mt="md">
                  <Text size="lg" fw={500}>Total Suggested Donation:</Text>
                  <Text size="lg" fw={500}>${calculateTotal().toFixed(2)}</Text>
                </Group>
              </Stack>
            )}

            <Button
              fullWidth
              onClick={() => addDonationMutation.mutate({
                memberId: selectedMemberId!,
                type: donationType,
                items: donationItems.map(item => ({
                  sacramentId: item.sacramentId,
                  quantity: item.quantity,
                  amount: item.quantity * item.suggestedDonation
                })),
                notes: `${donationType} payment`
              })}
              loading={addDonationMutation.isPending}
              disabled={donationItems.length === 0}
            >
              Complete Donation
            </Button>
          </>
        )}
      </Stack>
    </Paper>
  );
}