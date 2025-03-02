import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { donationFormSchema, DonationFormData } from '../../schemas/donationSchemas';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { donations, members, sacraments } from '../../services/api';
import {
  Button,
  Select,
  NumberInput,
  TextInput,
  Group,
  Paper,
  Stack,
  Text,
  ActionIcon
} from '@mantine/core';
import { IconTrash, IconPlus } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';

export default function DonationForm() {
  const queryClient = useQueryClient();

  const { data: membersList } = useQuery({
    queryKey: ['members'],
    queryFn: members.getAll
  });

  const { data: sacramentsList } = useQuery({
    queryKey: ['sacraments'],
    queryFn: sacraments.getAll
  });

  const { control, handleSubmit, reset, formState: { errors } } = useForm<DonationFormData>({
    resolver: zodResolver(donationFormSchema),
    defaultValues: {
      memberId: 0,
      type: 'cash',
      items: [{ sacramentId: 0, quantity: 1, amount: 0 }],
      notes: ''
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items'
  });

  const donationMutation = useMutation({
    mutationFn: donations.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['donations'] });
      reset();
      notifications.show({
        title: 'Success',
        message: 'Donation recorded successfully',
        color: 'green'
      });
    },
    onError: (error) => {
      notifications.show({
        title: 'Error',
        message: `Failed to record donation: ${error.message}`,
        color: 'red'
      });
    }
  });

  const onSubmit = (data: DonationFormData) => {
    donationMutation.mutate(data);
  };

  return (
    <Paper shadow="xs" p="md">
      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack spacing="md">
          <Text size="xl">Record Donation</Text>

          <Controller
            name="memberId"
            control={control}
            render={({ field }) => (
              <Select
                label="Member"
                placeholder="Select member"
                data={membersList?.map(m => ({ value: m.id.toString(), label: `${m.first_name} ${m.last_name}` })) || []}
                error={errors.memberId?.message}
                onChange={(value) => field.onChange(parseInt(value || '0'))}
                required
              />
            )}
          />

          <Controller
            name="type"
            control={control}
            render={({ field }) => (
              <Select
                label="Payment Type"
                placeholder="Select payment type"
                data={[
                  { value: 'cash', label: 'Cash' },
                  { value: 'card', label: 'Card' },
                  { value: 'other', label: 'Other' }
                ]}
                error={errors.type?.message}
                {...field}
                required
              />
            )}
          />

          <Text weight={500}>Items</Text>
          {fields.map((field, index) => (
            <Group key={field.id} align="flex-end">
              <Controller
                name={`items.${index}.sacramentId`}
                control={control}
                render={({ field }) => (
                  <Select
                    label="Sacrament"
                    placeholder="Select sacrament"
                    data={sacramentsList?.map(s => ({ value: s.id.toString(), label: s.name })) || []}
                    error={errors.items?.[index]?.sacramentId?.message}
                    onChange={(value) => field.onChange(parseInt(value || '0'))}
                    style={{ flex: 2 }}
                    required
                  />
                )}
              />

              <Controller
                name={`items.${index}.quantity`}
                control={control}
                render={({ field }) => (
                  <NumberInput
                    label="Quantity"
                    min={1}
                    error={errors.items?.[index]?.quantity?.message}
                    onChange={(value) => field.onChange(value)}
                    value={field.value}
                    style={{ flex: 1 }}
                    required
                  />
                )}
              />

              <Controller
                name={`items.${index}.amount`}
                control={control}
                render={({ field }) => (
                  <NumberInput
                    label="Amount"
                    min={0}
                    precision={2}
                    error={errors.items?.[index]?.amount?.message}
                    onChange={(value) => field.onChange(value)}
                    value={field.value}
                    style={{ flex: 1 }}
                    required
                  />
                )}
              />

              <ActionIcon color="red" onClick={() => fields.length > 1 && remove(index)}>
                <IconTrash size={16} />
              </ActionIcon>
            </Group>
          ))}

          <Button
            leftIcon={<IconPlus size={16} />}
            variant="outline"
            onClick={() => append({ sacramentId: 0, quantity: 1, amount: 0 })}
          >
            Add Item
          </Button>

          <Controller
            name="notes"
            control={control}
            render={({ field }) => (
              <TextInput
                label="Notes"
                placeholder="Optional notes"
                error={errors.notes?.message}
                {...field}
              />
            )}
          />

          <Group position="right">
            <Button type="submit" loading={donationMutation.isPending}>
              Record Donation
            </Button>
          </Group>
        </Stack>
      </form>
    </Paper>
  );
}