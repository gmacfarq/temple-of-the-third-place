import { Link, useNavigate } from 'react-router-dom';
import {
  Group,
  Button,
  Drawer,
  Burger,
  Text,
  Stack,
  UnstyledButton,
  Box,
  Avatar,
  Menu,
  rem,
  Badge
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconChevronDown, IconLogout, IconUser } from '@tabler/icons-react';
import { useAuth } from '../../hooks/useAuth';
import classes from './Navbar.module.css';

export default function Navbar() {
  const [opened, { toggle, close }] = useDisclosure(false);
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const isAdmin = user?.role === 'admin';
  const isAdvisor = user?.role === 'advisor';

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <Box className={classes.header}>
      <Group justify="space-between" h="100%">
        <Group>
          <Text component={Link} to="/" size="xl" fw={700}>
            Temple of the Third Place
          </Text>
          {isAdmin && (
            <Badge color="red" size="lg" variant="filled">
              ADMIN
            </Badge>
          )}
          {isAdvisor && !isAdmin && (
            <Badge color="blue" size="lg" variant="filled">
              ADVISOR
            </Badge>
          )}
        </Group>

        <Group gap={5} visibleFrom="sm">
          {isAuthenticated ? (
            <>
              <Button variant="subtle" component={Link} to="/dashboard">
                Dashboard
              </Button>

              <Menu position="bottom-end" withArrow>
                <Menu.Target>
                  <UnstyledButton className={classes.user}>
                    <Group gap={7}>
                      <Avatar radius="xl" size={30} />
                      <Text size="sm" fw={500}>
                        {user?.firstName} {user?.lastName}
                      </Text>
                      <IconChevronDown style={{ width: rem(12), height: rem(12) }} />
                    </Group>
                  </UnstyledButton>
                </Menu.Target>
                <Menu.Dropdown>
                  <Menu.Item
                    leftSection={<IconUser style={{ width: rem(14), height: rem(14) }} />}
                    onClick={() => navigate('/profile')}
                  >
                    My Profile
                  </Menu.Item>
                  <Menu.Divider />
                  <Menu.Item
                    leftSection={<IconLogout style={{ width: rem(14), height: rem(14) }} />}
                    onClick={handleLogout}
                    color="red"
                  >
                    Logout
                  </Menu.Item>
                </Menu.Dropdown>
              </Menu>
            </>
          ) : (
            <>
              <Button variant="subtle" component={Link} to="/about">
                About Us
              </Button>
              <Button variant="subtle" component={Link} to="/contact">
                Contact
              </Button>
              <Button variant="outline" component={Link} to="/login">
                Login
              </Button>
              <Button component={Link} to="/signup">
                Sign Up
              </Button>
            </>
          )}
        </Group>

        <Burger opened={opened} onClick={toggle} hiddenFrom="sm" />
      </Group>

      <Drawer
        opened={opened}
        onClose={close}
        size="100%"
        padding="md"
        title="Menu"
        hiddenFrom="sm"
        zIndex={1000}
      >
        <Stack>
          {isAuthenticated ? (
            <>
              <Group>
                {isAdmin && (
                  <Badge color="red" size="lg" variant="filled">
                    ADMIN
                  </Badge>
                )}
                {isAdvisor && !isAdmin && (
                  <Badge color="blue" size="lg" variant="filled">
                    ADVISOR
                  </Badge>
                )}
              </Group>
              <UnstyledButton component={Link} to="/dashboard" onClick={close}>
                Dashboard
              </UnstyledButton>
              <UnstyledButton component={Link} to="/profile" onClick={close}>
                My Profile
              </UnstyledButton>
              <UnstyledButton onClick={() => { handleLogout(); close(); }} c="red">
                Logout
              </UnstyledButton>
            </>
          ) : (
            <>
              <UnstyledButton component={Link} to="/about" onClick={close}>
                About Us
              </UnstyledButton>
              <UnstyledButton component={Link} to="/contact" onClick={close}>
                Contact
              </UnstyledButton>
              <UnstyledButton component={Link} to="/login" onClick={close}>
                Login
              </UnstyledButton>
              <Button component={Link} to="/signup" onClick={close} fullWidth>
                Sign Up
              </Button>
            </>
          )}
        </Stack>
      </Drawer>
    </Box>
  );
}