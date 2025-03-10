import { Modal, Text, Button, Group, Stack } from '@mantine/core';
import React, { ReactNode } from 'react';

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  isLoading?: boolean;
  isConfirmDisabled?: boolean;
  confirmationInput?: ReactNode;
}

const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  isLoading = false,
  isConfirmDisabled = false,
  confirmationInput
}) => {
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
        <Stack>
          <Text>{message}</Text>

          {confirmationInput && (
            <div>{confirmationInput}</div>
          )}

          <Group justify="flex-end" mt="md">
            <Button variant="outline" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button
              color="red"
              onClick={onConfirm}
              loading={isLoading}
              disabled={isConfirmDisabled}
            >
              Delete
            </Button>
          </Group>
        </Stack>
      </Modal>
    )
  );
};

export default DeleteConfirmationModal;