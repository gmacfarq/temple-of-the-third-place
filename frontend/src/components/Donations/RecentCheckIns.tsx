import { useQuery } from '@tanstack/react-query';
import { Paper, Text, Group, Stack, Button, Badge } from '@mantine/core';
import { members } from '../../services/api';
import { memo } from 'react';

interface Member {
  id: number;
  first_name: string;
  last_name: string;
  last_check_in: string;
}

interface RecentCheckInsProps {
  onSelectMember: (memberId: number | null) => void;  // Updated to allow null
  selectedMemberId: number | null;
}

export default memo(function RecentCheckIns({ onSelectMember, selectedMemberId }: RecentCheckInsProps) {
  const { data: recentCheckIns, isLoading } = useQuery({
    queryKey: ['recent-checkins'],
    queryFn: members.getRecentCheckIns,
    refetchInterval: 30000
  });

  // Format date to show time if today, or date and time if older
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);

    // Check if date is valid
    if (isNaN(date.getTime())) {
      return 'Invalid date';
    }

    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    const isYesterday = new Date(now.setDate(now.getDate() - 1)).toDateString() === date.toDateString();

    if (isToday) {
      return `Today at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else if (isYesterday) {
      return `Yesterday at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else {
      return `${date.toLocaleDateString()} at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }
  };

  if (isLoading) {
    return <Text>Loading recent check-ins...</Text>;
  }

  if (!recentCheckIns?.length) {
    return <Text color="dimmed">No recent check-ins today</Text>;
  }

  return (
    <Paper withBorder p="xs">
      <Stack gap="xs">
        {recentCheckIns.map((member: Member) => (
          <Group key={member.id} justify="apart">
            <Group gap="xs">
              <Text size="sm">
                {member.first_name} {member.last_name}
              </Text>
              <Badge size="sm">
                {formatDate(member.last_check_in)}
              </Badge>
            </Group>
            <Button
              size="xs"
              variant={selectedMemberId === member.id ? "filled" : "light"}
              onClick={() => {
                onSelectMember(selectedMemberId === member.id ? null : member.id);
              }}
            >
              {selectedMemberId === member.id ? "Unselect" : "Select"}
            </Button>
          </Group>
        ))}
      </Stack>
    </Paper>
  );
});