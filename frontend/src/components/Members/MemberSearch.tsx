import { TextInput, Group, Select, Stack, Paper } from '@mantine/core';
import { IconSearch } from '@tabler/icons-react';
import { useState, useEffect } from 'react';
import styles from '../Members/Members.module.css';

interface Member {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
  phone?: string;
}

interface MemberSearchProps {
  members: Member[];
  onFilteredMembersChange?: (members: Member[]) => void;
  showRoleFilter?: boolean;
  placeholder?: string;
}

export default function MemberSearch({
  members,
  onFilteredMembersChange,
  showRoleFilter = true,
  placeholder = "Search by name, email, or phone number"
}: MemberSearchProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string | null>(null);

  useEffect(() => {
    const filteredMembers = members?.filter((member: Member) => {
      const matchesRole = !roleFilter || member.role === roleFilter;

      if (!searchQuery) return matchesRole;

      const searchLower = searchQuery.toLowerCase();

      if (/^\d+$/.test(searchQuery)) {
        return matchesRole && member.phone?.replace(/\D/g, '').includes(searchQuery);
      }

      return matchesRole && (
        `${member.first_name} ${member.last_name}`.toLowerCase().includes(searchLower) ||
        member.email.toLowerCase().includes(searchLower)
      );
    });

    onFilteredMembersChange?.(filteredMembers || []);
  }, [searchQuery, roleFilter, members, onFilteredMembersChange]);

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
          {showRoleFilter && (
            <Select
              className={styles.selectWrapper}
              placeholder="Filter by role"
              value={roleFilter}
              onChange={setRoleFilter}
              data={[
                { value: '', label: 'All' },
                { value: 'member', label: 'Members' },
                { value: 'advisor', label: 'Advisors' },
                { value: 'admin', label: 'Admins' }
              ]}
              clearable
            />
          )}
        </Group>
      </Stack>
    </Paper>
  );
}