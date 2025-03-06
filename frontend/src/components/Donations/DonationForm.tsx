import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  TextInput,
  Button,
  Group,
  Select,
  NumberInput,
  Stack,
  Text,
  SegmentedControl,
  Textarea,
  Grid,
  ActionIcon,
  Divider,
  Box,
  Alert
} from '@mantine/core';
import { IconPlus, IconTrash, IconAlertCircle } from '@tabler/icons-react';
import { useNotifications } from '../../hooks/useNotifications';
import { members, sacraments, donations } from '../../services/api';
import { donationFormSchema, DonationFormData } from '../../schemas/donationSchemas';
import RecentCheckIns from './RecentCheckIns';
import SacramentSearch from '../common/SacramentSearch';

interface DonationItem {
  sacramentId: number;
  quantity: number;
  amount: number;
}

interface Sacrament {
  id: number;
  name: string;
  type: string;
  num_active: number;
  num_storage: number;
  suggested_donation: string;
}

export default function DonationForm() {
  const queryClient = useQueryClient();
  const { showSuccess, showError, showWarning } = useNotifications();
  const [selectedMemberId, setSelectedMemberId] = useState<number | null>(null);
  const [items, setItems] = useState<DonationItem[]>([{ sacramentId: 0, quantity: 1, amount: 0 }]);
  const [discountType, setDiscountType] = useState<'percent' | 'amount'>('percent');
  const [discountValue, setDiscountValue] = useState<number>(0);
  const [notes, setNotes] = useState('');
  const [paymentType, setPaymentType] = useState<'cash' | 'card' | 'other'>('cash');
  const [formKey, setFormKey] = useState(0);
  const [inventoryError, setInventoryError] = useState<string | null>(null);

  const { data: membersList } = useQuery({
    queryKey: ['members'],
    queryFn: members.getAll
  });

  const { data: sacramentsList } = useQuery<Sacrament[]>({
    queryKey: ['sacraments'],
    queryFn: sacraments.getAll
  });

  // Check inventory whenever items change
  useEffect(() => {
    checkInventory();
  }, [items, sacramentsList]);

  const checkInventory = () => {
    if (!sacramentsList) return;

    setInventoryError(null);

    for (const item of items) {
      if (!item.sacramentId) continue;

      const sacrament = sacramentsList.find(s => s.id === item.sacramentId);
      if (!sacrament) continue;

      const availableQuantity = sacrament.num_active;

      if (item.quantity > availableQuantity) {
        setInventoryError(`Not enough inventory for ${sacrament.name}. Only ${availableQuantity} available.`);
        return;
      }
    }
  };

  const donationMutation = useMutation({
    mutationFn: donations.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['donations'] });
      queryClient.invalidateQueries({ queryKey: ['sacraments'] });
      showSuccess('Donation recorded successfully');
      resetForm();
    },
    onError: (error) => {
      showError(`Failed to record donation: ${(error as Error).message}`);
    }
  });

  const resetForm = () => {
    setSelectedMemberId(null);
    setItems([{ sacramentId: 0, quantity: 1, amount: 0 }]);
    setDiscountValue(0);
    setNotes('');
    setPaymentType('cash');
    setInventoryError(null);
    setFormKey(prev => prev + 1);
  };

  const handleMemberSelect = (id: number | null) => {
    setSelectedMemberId(id);
  };

  const addItem = () => {
    setItems([...items, { sacramentId: 0, quantity: 1, amount: 0 }]);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      const newItems = [...items];
      newItems.splice(index, 1);
      setItems(newItems);
    }
  };

  const updateItem = (index: number, field: keyof DonationItem, value: number) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };

    if (field === 'sacramentId' && sacramentsList) {
      const sacrament = sacramentsList.find(s => s.id === value);
      if (sacrament && sacrament.suggested_donation) {
        newItems[index].amount = parseFloat(sacrament.suggested_donation) * newItems[index].quantity;
      }
    }

    if (field === 'quantity' && sacramentsList) {
      const sacrament = sacramentsList.find(s => s.id === newItems[index].sacramentId);
      if (sacrament && sacrament.suggested_donation) {
        newItems[index].amount = parseFloat(sacrament.suggested_donation) * value;
      }
    }

    setItems(newItems);
  };

  const calculateSubtotal = () => {
    return items.reduce((sum, item) => sum + item.amount, 0);
  };

  const calculateDiscount = () => {
    const subtotal = calculateSubtotal();
    if (discountType === 'percent') {
      return subtotal * (discountValue / 100);
    } else {
      return discountValue;
    }
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const discount = calculateDiscount();
    return Math.max(subtotal - discount, 0);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (inventoryError) {
      showError(inventoryError, 'Inventory Error');
      return;
    }

    if (!selectedMemberId) {
      showWarning('Please select a member');
      return;
    }

    const validItems = items.filter(item => item.sacramentId > 0);
    if (validItems.length === 0) {
      showWarning('Please add at least one item');
      return;
    }

    let donationNotes = notes;
    if (discountValue > 0) {
      donationNotes += donationNotes ? ' ' : '';
      donationNotes += discountType === 'percent'
        ? `(${discountValue}% discount applied)`
        : `($${discountValue.toFixed(2)} discount applied)`;
    }

    const total = calculateTotal();
    const subtotal = calculateSubtotal();

    if (discountValue > 0 && subtotal > 0) {
      const discountRatio = total / subtotal;
      validItems.forEach(item => {
        item.amount = Math.round((item.amount * discountRatio) * 100) / 100;
      });
    }

    const donationData: DonationFormData = {
      memberId: selectedMemberId,
      type: paymentType,
      items: validItems,
      notes: donationNotes
    };

    donationMutation.mutate(donationData);
  };

  const getSacramentAvailability = (sacramentId: number) => {
    if (!sacramentsList) return null;
    const sacrament = sacramentsList.find(s => s.id === sacramentId);
    if (!sacrament) return null;
    return sacrament.num_active;
  };

  return (
    <Box key={formKey}>
      <Grid>
        <Grid.Col span={8}>
          <form onSubmit={handleSubmit}>
            <Stack spacing="md">
              {inventoryError && (
                <Alert icon={<IconAlertCircle size={16} />} title="Inventory Error" color="red">
                  {inventoryError}
                </Alert>
              )}

              <Group grow>
                <div>
                  <Text weight={500} size="sm" mb={5}>Member</Text>
        <Select
                    placeholder="Select member"
                    data={membersList?.map(member => ({
                      value: member.id.toString(),
                      label: `${member.first_name} ${member.last_name}`
                    })) || []}
                    value={selectedMemberId?.toString() || ''}
                    onChange={(value) => handleMemberSelect(value ? parseInt(value) : null)}
                    searchable
                    required
                    clearable
                  />
                </div>

                <div>
                  <Text weight={500} size="sm" mb={5}>Payment Type</Text>
                  <Select
                    placeholder="Select payment type"
                    data={[
                      { value: 'cash', label: 'Cash' },
                      { value: 'card', label: 'Card' },
                      { value: 'other', label: 'Other' }
                    ]}
                    value={paymentType}
                    onChange={(value) => setPaymentType(value as 'cash' | 'card' | 'other')}
                    required
                  />
                </div>
              </Group>

              <Divider label="Donation Items" />

              {items.map((item, index) => {
                const sacrament = sacramentsList?.find(s => s.id === item.sacramentId);
                const available = sacrament?.num_active || 0;
                const isOverLimit = item.sacramentId > 0 && item.quantity > available;

                return (
                  <Group key={index} grow align="flex-end">
                    <div>
                      <SacramentSearch
                        value={item.sacramentId || null}
                        onChange={(value) => updateItem(index, 'sacramentId', value || 0)}
                        error={isOverLimit ? `Not enough inventory` : undefined}
                        required
                      />
                    </div>

                    <div>
                      <Text weight={500} size="sm" mb={5}>Quantity</Text>
                      <NumberInput
                        value={item.quantity}
                        onChange={(value) => updateItem(index, 'quantity', Number(value))}
                        min={1}
                        max={sacrament?.num_active || undefined}
                        required
                        error={isOverLimit ? `Max ${available}` : undefined}
                      />
                    </div>

                    <div>
                      <Text weight={500} size="sm" mb={5}>Amount</Text>
                      <NumberInput
                        value={item.amount}
                        onChange={(value) => updateItem(index, 'amount', Number(value))}
                        min={0}
                        precision={2}
                        required
                        prefix="$"
                      />
                    </div>

                    <ActionIcon
                        color="red"
                      onClick={() => removeItem(index)}
                      disabled={items.length <= 1}
                      style={{ marginBottom: '8px' }}
                      >
                      <IconTrash size={16} />
                    </ActionIcon>
                  </Group>
                );
              })}

              <Button
                leftSection={<IconPlus size={16} />}
                variant="outline"
                onClick={addItem}
              >
                Add Item
              </Button>

              <Divider label="Discount" />

              <Group grow>
                <SegmentedControl
                  value={discountType}
                  onChange={(value) => setDiscountType(value as 'percent' | 'amount')}
                  data={[
                    { label: 'Percentage (%)', value: 'percent' },
                    { label: 'Fixed Amount ($)', value: 'amount' }
                  ]}
                />

                <NumberInput
                  label={discountType === 'percent' ? 'Discount Percentage' : 'Discount Amount'}
                  value={discountValue}
                  onChange={(value) => setDiscountValue(Number(value))}
                  min={0}
                  max={discountType === 'percent' ? 100 : undefined}
                  prefix={discountType === 'amount' ? '$' : ''}
                  suffix={discountType === 'percent' ? '%' : ''}
                />
                </Group>

              <Textarea
                label="Notes"
                placeholder="Add any notes about this donation"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />

              <Group position="apart">
                <Stack spacing={5}>
                  <Text>Subtotal: ${calculateSubtotal().toFixed(2)}</Text>
                  {discountValue > 0 && (
                    <Text>Discount: -${calculateDiscount().toFixed(2)}</Text>
                  )}
                  <Text weight={700} size="lg">Total: ${calculateTotal().toFixed(2)}</Text>
              </Stack>

                <Group>
                  <Button
                    variant="outline"
                    onClick={resetForm}
                  >
                    Reset Form
                  </Button>

            <Button
                    type="submit"
                    loading={donationMutation.isPending}
                    disabled={!selectedMemberId || items.some(item => !item.sacramentId) || !!inventoryError}
            >
                    Record Donation
            </Button>
                </Group>
              </Group>
      </Stack>
          </form>
        </Grid.Col>

        <Grid.Col span={4}>
          <RecentCheckIns
            onSelectMember={handleMemberSelect}
            selectedMemberId={selectedMemberId}
          />
        </Grid.Col>
      </Grid>
    </Box>
  );
}