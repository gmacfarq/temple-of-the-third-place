import { useQuery } from '@tanstack/react-query';
import { Table, Text, Paper, Title, Button, Group, LoadingOverlay } from '@mantine/core';
import { members } from '../../services/api';

interface RecentCheckInsProps {
  onSelectMember: (memberId: number) => void;
}

interface CheckIn {
  id: number;
  first_name: string;
  last_name: string;
  timestamp: string; // This might be called timestamp instead of check_in_time
  member_id?: number; // This might be called user_id in the API response
}

export default function RecentCheckIns({ onSelectMember }: RecentCheckInsProps) {
  const { data: recentCheckIns, isLoading, error } = useQuery({
    queryKey: ['members', 'recent-checkins'],
    queryFn: members.getRecentCheckIns,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  if (isLoading) {
    return <LoadingOverlay visible={true} />;
  }

  if (error) {
    return <Text color="red">Error loading recent check-ins: {(error as Error).message}</Text>;
  }

  if (!recentCheckIns || recentCheckIns.length === 0) {
    return <Text>No recent check-ins found.</Text>;
  }

  // Format date safely
  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'Unknown';

    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid date';

      return date.toLocaleString();
    } catch (e) {
      console.error('Error formatting date:', e);
      return 'Invalid date';
    }
  };

  return (
    <Paper shadow="xs" p="md" withBorder>
      <Title order={4} mb="md">Recent Check-ins</Title>
      <Table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Check-in Time</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {recentCheckIns.map((checkin: CheckIn) => (
            <tr key={checkin.id}>
              <td>{checkin.first_name} {checkin.last_name}</td>
              <td>{formatDate(checkin.timestamp || checkin.last_check_in)}</td>
              <td>
                <Button
                  size="xs"
                  variant="subtle"
                  onClick={() => onSelectMember(checkin.member_id || checkin.id)}
                >
                  Select
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Paper>
  );
}