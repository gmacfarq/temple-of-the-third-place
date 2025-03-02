import { useQuery } from '@tanstack/react-query';
import { Paper, Text, Group, Stack, Button, Badge } from '@mantine/core';
import { members } from '../../services/api';

interface Member {
  id: number;
  first_name: string;
  last_name: string;
  timestamp: string;
}

interface RecentCheckInsProps {
  onSelectMember: (memberId: number | null) => void;  // Updated to allow null
  selectedMemberId: number | null;
}

export default function RecentCheckIns({ onSelectMember, selectedMemberId }: RecentCheckInsProps) {
  const { data: recentCheckIns, isLoading } = useQuery({
    queryKey: ['recent-checkins'],
    queryFn: members.getRecentCheckIns,
    refetchInterval: 30000
  });

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
                {new Date(member.timestamp).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
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
}