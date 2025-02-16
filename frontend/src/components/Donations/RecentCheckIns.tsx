import { Button, Table, Text } from '@mantine/core';
import { useQuery } from '@tanstack/react-query';
import { members } from '../../services/api';

interface CheckIn {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  last_check_in: string;
}

interface RecentCheckInsProps {
  onSelectMember: (id: number | null) => void;
  selectedMemberId: number | null;
}

export default function RecentCheckIns({ onSelectMember, selectedMemberId }: RecentCheckInsProps) {
  const { data: recentCheckIns, isError } = useQuery({
    queryKey: ['recent-checkins'],
    queryFn: members.getRecentCheckIns,
    staleTime: 30000 // Refresh every 30 seconds
  });

  if (isError) {
    return <div>Error loading check-ins</div>;
  }

  // If a member is selected, only show that member
  if (selectedMemberId) {
    const selectedMember = recentCheckIns?.find((checkIn: CheckIn) => checkIn.id === selectedMemberId);
    if (!selectedMember) return null;

    return (
      <div>
        <Text mb="xs">Selected Member:</Text>
        <Table>
          <tbody>
            <tr>
              <td>{new Date(selectedMember.last_check_in).toLocaleString()}</td>
              <td>{selectedMember.first_name} {selectedMember.last_name}</td>
              <td>
                <Button
                  size="xs"
                  variant="light"
                  onClick={() => onSelectMember(null)}
                >
                  Unselect
                </Button>
              </td>
            </tr>
          </tbody>
        </Table>
      </div>
    );
  }

  // Otherwise show the full list
  return (
    <Table>
      <thead>
        <tr>
          <th>Date</th>
          <th>Name</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody>
        {recentCheckIns?.map((checkIn: CheckIn) => (
          <tr key={checkIn.id}>
            <td>{new Date(checkIn.last_check_in).toLocaleString()}</td>
            <td>{checkIn.first_name} {checkIn.last_name}</td>
            <td>
              <Button
                size="xs"
                variant="light"
                onClick={() => onSelectMember(checkIn.id)}
              >
                Select
              </Button>
            </td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
}