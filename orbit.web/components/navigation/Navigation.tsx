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
  Menu,
  ScrollArea,
} from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import {
  IconHome,
  IconCalendar,
  IconSettings,
  IconCalendarPlus,
  IconLogout,
  IconCash,
  IconCheckbox,
  IconFiles,
  IconShoppingCart,
  IconMoodSmile,
  IconCalendarEvent,
  IconNote,
  IconChevronDown,
  IconApps,
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

  // Main navigation items (always visible)
  const mainNavItems = [
    { label: 'Dashboard', icon: IconHome, href: '/' },
    { label: 'Finance', icon: IconCash, href: '/finance' },
  ]

  // Finance sub-items
  const financeSubItems = [
    { label: 'This Month', icon: IconCalendar, href: '/finance/this-month' },
    { label: 'Historic Data', icon: IconCalendarEvent, href: '/finance/historic-data' },
    { label: 'Management', icon: IconSettings, href: '/finance/management' },
  ]

  // App items (shown in dropdown on desktop to save space)
  const appItems = [
    { label: 'Tasks', icon: IconCheckbox, href: '/tasks' },
    { label: 'Documents', icon: IconFiles, href: '/documents' },
    { label: 'Shopping', icon: IconShoppingCart, href: '/shopping' },
    { label: 'Journal', icon: IconMoodSmile, href: '/journal' },
    { label: 'Calendar', icon: IconCalendarEvent, href: '/calendar' },
    { label: 'Notes', icon: IconNote, href: '/notes' },
    { label: 'Settings', icon: IconSettings, href: '/settings' },
  ]

  const allNavItems = [
    ...mainNavItems,
    ...financeSubItems.map(item => ({ ...item, isSubItem: true })),
    ...appItems,
  ]

  const isAppActive = appItems.some(item => pathname === item.href)
  const activeApp = appItems.find(item => pathname === item.href)

  const NavItems = () => (
    <>
      {allNavItems.map((item) => (
        <NavLink
          component={Link}
          key={item.href}
          href={item.href}
          label={item.label}
          leftSection={<item.icon size="1rem" />}
          active={pathname === item.href || (item.href === '/finance' && pathname.startsWith('/finance'))}
          onClick={() => close()}
          style={'isSubItem' in item && item.isSubItem ? { paddingLeft: '2rem' } : {}}
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
        <Group h="100%" px="md" justify="space-between" wrap="nowrap">
          <Group wrap="nowrap">
            <Burger
              opened={opened}
              onClick={open}
              hiddenFrom="md"
              size="sm"
            />
            <Text size="lg" fw={600} style={{ whiteSpace: 'nowrap' }}>
              Orbit
            </Text>
          </Group>

          {/* Desktop Navigation - Full (large screens) */}
          <ScrollArea type="never" style={{ flex: 1 }} mx="md" visibleFrom="lg">
            <Group gap="xs" wrap="nowrap" justify="center">
              {/* Main nav items */}
              {mainNavItems.map((item) => (
                <Button
                  key={item.href}
                  variant={pathname === item.href || (item.href === '/finance' && pathname.startsWith('/finance')) ? 'filled' : 'subtle'}
                  leftSection={<item.icon size="1rem" />}
                  onClick={() => router.push(item.href)}
                  size="compact-sm"
                >
                  {item.label}
                </Button>
              ))}

              {/* Finance sub-items - only show when in finance section */}
              {pathname.startsWith('/finance') && financeSubItems.map((item) => (
                <Button
                  key={item.href}
                  variant={pathname === item.href ? 'light' : 'subtle'}
                  leftSection={<item.icon size="0.9rem" />}
                  onClick={() => router.push(item.href)}
                  size="compact-xs"
                  color="gray"
                >
                  {item.label}
                </Button>
              ))}

              {/* All app items shown individually */}
              {appItems.map((item) => (
                <Button
                  key={item.href}
                  variant={pathname === item.href ? 'filled' : 'subtle'}
                  leftSection={<item.icon size="1rem" />}
                  onClick={() => router.push(item.href)}
                  size="compact-sm"
                >
                  {item.label}
                </Button>
              ))}
            </Group>
          </ScrollArea>

          {/* Desktop Navigation - Compact with dropdown (medium screens) */}
          <ScrollArea type="never" style={{ flex: 1 }} mx="md" visibleFrom="md" hiddenFrom="lg">
            <Group gap="xs" wrap="nowrap" justify="center">
              {/* Main nav items */}
              {mainNavItems.map((item) => (
                <Button
                  key={item.href}
                  variant={pathname === item.href || (item.href === '/finance' && pathname.startsWith('/finance')) ? 'filled' : 'subtle'}
                  leftSection={<item.icon size="1rem" />}
                  onClick={() => router.push(item.href)}
                  size="compact-sm"
                >
                  {item.label}
                </Button>
              ))}

              {/* Finance sub-items - only show when in finance section */}
              {pathname.startsWith('/finance') && financeSubItems.map((item) => (
                <Button
                  key={item.href}
                  variant={pathname === item.href ? 'light' : 'subtle'}
                  leftSection={<item.icon size="0.9rem" />}
                  onClick={() => router.push(item.href)}
                  size="compact-xs"
                  color="gray"
                >
                  {item.label}
                </Button>
              ))}

              {/* Apps dropdown menu */}
              <Menu shadow="md" width={200} position="bottom-end">
                <Menu.Target>
                  <Button
                    variant={isAppActive ? 'filled' : 'subtle'}
                    leftSection={activeApp ? <activeApp.icon size="1rem" /> : <IconApps size="1rem" />}
                    rightSection={<IconChevronDown size="0.9rem" />}
                    size="compact-sm"
                  >
                    {activeApp ? activeApp.label : 'Apps'}
                  </Button>
                </Menu.Target>
                <Menu.Dropdown>
                  {appItems.map((item) => (
                    <Menu.Item
                      key={item.href}
                      leftSection={<item.icon size="1rem" />}
                      onClick={() => router.push(item.href)}
                      style={{
                        backgroundColor: pathname === item.href ? 'var(--mantine-color-blue-light)' : undefined,
                      }}
                    >
                      {item.label}
                    </Menu.Item>
                  ))}
                </Menu.Dropdown>
              </Menu>
            </Group>
          </ScrollArea>

          <Group wrap="nowrap" gap="xs">
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
              visibleFrom="md"
              size="compact-sm"
              onClick={async () => { await auth.logout() }}
            >
              Logout
            </Button>

            <ActionIcon
              variant="light"
              color="red"
              hiddenFrom="md"
              title="Logout"
              onClick={async () => { await auth.logout() }}
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
        hiddenFrom="md"
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
