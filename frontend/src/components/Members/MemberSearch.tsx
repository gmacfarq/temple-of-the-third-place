import { TextInput, Group, Select, Stack, Paper } from '@mantine/core';
import { IconSearch } from '@tabler/icons-react';
import { useState, useEffect } from 'react';
import styles from '../Members/Members.module.css';
import { Member } from '../../types/member';

interface MemberSearchProps {
  members: Member[];
  onFilteredMembersChange: (members: Member[]) => void;
  showMembershipFilter?: boolean;
  placeholder?: string;
}

export default function MemberSearch({
  members,
  onFilteredMembersChange,
  showMembershipFilter = true,
  placeholder = "Search by name, email, or phone number"
}: MemberSearchProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [membershipFilter, setMembershipFilter] = useState<string | null>(null);

  useEffect(() => {
    if (!members) {
      onFilteredMembersChange([]);
      return;
    }

    const filteredMembers = members.filter((member: Member) => {
      const matchesMembership = !membershipFilter || member.membership_type === membershipFilter;

      if (!searchQuery) return matchesMembership;

      const searchLower = searchQuery.toLowerCase();

      if (/^\d+$/.test(searchQuery)) {
        return matchesMembership && member.phone_number?.replace(/\D/g, '').includes(searchQuery);
      }

      return matchesMembership && (
        `${member.first_name} ${member.last_name}`.toLowerCase().includes(searchLower) ||
        member.email.toLowerCase().includes(searchLower)
      );
    });

    onFilteredMembersChange(filteredMembers);
  }, [searchQuery, membershipFilter, members, onFilteredMembersChange]);

  return (
    <Paper shadow="xs" p="md" mb="md">
      <Stack gap="sm">
        <Group grow>
          <TextInput
            placeholder={placeholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            leftSection={<IconSearch size={16} />}
          />
          {showMembershipFilter && (
            <Select
              className={styles.selectWrapper}
              placeholder="Filter by membership"
              value={membershipFilter}
              onChange={setMembershipFilter}
              data={[
                { value: '', label: 'All' },
                { value: 'Exploratory', label: 'Exploratory' },
                { value: 'Starter', label: 'Starter' },
                { value: 'Lovely', label: 'Lovely' }
              ]}
              clearable
            />
          )}
        </Group>
      </Stack>
    </Paper>
  );
}