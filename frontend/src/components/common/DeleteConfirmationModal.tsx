import { Modal, Text, Group, Button } from '@mantine/core';

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
  itemType?: string;
  isLoading?: boolean;
}

export default function DeleteConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirm Deletion",
  message,
  itemType = "item",
  isLoading = false
}: DeleteConfirmationModalProps) {
  const defaultMessage = `Are you sure you want to delete this ${itemType}?`;

  return (
    isOpen && (
      <Modal
        opened={true}
        onClose={onClose}
        title={title}
        centered
        size="sm"
        styles={{
          root: { position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1500 },
          content: { position: 'relative', width: '90%', maxWidth: '400px' }
        }}
        overlayProps={{
          opacity: 0.55,
          blur: 3
        }}
      >
        <Text>{message || defaultMessage}</Text>
        <Group justify="center" mt="md">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button color="red" onClick={onConfirm} loading={isLoading}>
            Delete
          </Button>
        </Group>
      </Modal>
    )
  );
}