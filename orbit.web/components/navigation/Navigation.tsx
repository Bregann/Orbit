'use client'

import {
  AppShell,
  Burger,
  Button,
  Drawer,
  Group,
  NavLink,
  Text,
  ActionIcon,
  Stack,
} from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import {
  IconHome,
  IconCalendar,
  IconSettings,
  IconCalendarPlus,
  IconLogout,
  IconCash,
} from '@tabler/icons-react'
import { useRouter, usePathname } from 'next/navigation'
import classes from '@/css/navigation.module.css'
import Link from 'next/link'
import { useAuth } from '@/context/authContext'
import AddNewMonthModal from '../AddNewMonthModal'

export default function Navigation({ children }: { children: React.ReactNode }) {
  const [opened, { open, close }] = useDisclosure(false)
  const [addMonthModalOpened, { open: openAddMonthModal, close: closeAddMonthModal }] = useDisclosure(false)
  const router = useRouter()
  const pathname = usePathname()

  const auth = useAuth()

  const navigationItems = [
    { label: 'Dashboard', icon: IconHome, href: '/' },
    { label: 'Finance', icon: IconCash, href: '/finance' },
    { label: 'This Month', icon: IconCalendar, href: '/finance/this-month', isSubItem: true },
    { label: 'Management', icon: IconSettings, href: '/finance/management', isSubItem: true },
  ]

  const NavItems = () => (
    <>
      {navigationItems.map((item) => (
        <NavLink
          component={Link}
          key={item.href}
          href={item.href}
          label={item.label}
          leftSection={<item.icon size="1rem" />}
          active={pathname === item.href || (item.href === '/finance' && pathname.startsWith('/finance'))}
          onClick={() => close()}
          style={item.isSubItem ? { paddingLeft: '2rem' } : {}}
        />
      ))}
    </>
  )

  return (
    <AppShell
      header={{ height: 60 }}
      padding="md"
    >
      <AppShell.Header>
        <Group h="100%" px="md" justify="space-between">
          <Group>
            <Burger
              opened={opened}
              onClick={open}
              hiddenFrom="sm"
              size="sm"
            />
            <Text size="lg" fw={600}>
              Orbit
            </Text>
          </Group>

          <Group gap="lg" visibleFrom="sm">
            {navigationItems
              .filter(item => !item.isSubItem || pathname.startsWith('/finance'))
              .map((item) => (
                <Button
                  key={item.href}
                  variant={pathname === item.href ? 'filled' : 'subtle'}
                  leftSection={<item.icon size="1rem" />}
                  onClick={() => router.push(item.href)}
                  size={item.isSubItem ? 'compact-sm' : 'sm'}
                >
                  {item.label}
                </Button>
              ))}
          </Group>

          <Group>
            {pathname.startsWith('/finance') && (
              <ActionIcon
                variant="light"
                color="blue"
                size="lg"
                className={classes.addMonthIco}
                title="Add Month"
                onClick={openAddMonthModal}
              >
                <IconCalendarPlus size="1.2rem" />
              </ActionIcon>
            )}

            <Button
              variant="light"
              color="red"
              leftSection={<IconLogout size="1rem" />}
              visibleFrom="sm"
              onClick={async () => { await auth.logout() }}
            >
              Logout
            </Button>

            <ActionIcon
              variant="light"
              color="red"
              hiddenFrom="sm"
              title="Logout"
            >
              <IconLogout size="1rem" />
            </ActionIcon>
          </Group>
        </Group>
      </AppShell.Header>

      <Drawer
        opened={opened}
        onClose={close}
        title="Orbit"
        hiddenFrom="sm"
        zIndex={1000000}
      >
        <Stack gap="xs">
          <NavItems />
        </Stack>
      </Drawer>

      <AppShell.Main>
        {children}
      </AppShell.Main>

      <AddNewMonthModal
        displayModal={addMonthModalOpened}
        hideModal={closeAddMonthModal}
      />
    </AppShell>
  )
}
