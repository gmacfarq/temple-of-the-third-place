import { useQuery } from '@tanstack/react-query';
import { Paper, Text, Table, Badge, LoadingOverlay } from '@mantine/core';
import { members } from '../../services/api';

export default function RecentCheckins() {
  const { data: recentCheckins, isLoading } = useQuery({
    queryKey: ['members', 'recent-checkins'],
    queryFn: members.getRecentCheckins
  });

  return (
    <Paper shadow="xs" p="md" style={{ position: 'relative' }}>
      <LoadingOverlay visible={isLoading} />
      <Text size="xl" mb="md">Recent Check-ins</Text>

      {recentCheckins?.length === 0 ? (
        <Text>No recent check-ins</Text>
      ) : (
        <Table>
          <thead>
            <tr>
              <th>Member</th>
              <th>Time</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {recentCheckins?.map((checkin) => (
              <tr key={`${checkin.id}-${checkin.last_check_in}`}>
                <td>{checkin.first_name} {checkin.last_name}</td>
                <td>{new Date(checkin.last_check_in).toLocaleString()}</td>
                <td>
                  <Badge
                    color={checkin.subscription_status === 'active' ? 'green' : 'yellow'}
                  >
                    {checkin.subscription_status}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </Paper>
  );
}