'use client';

import DashboardTag from '@/components/custom-component-tray/dashboard-tag';
import DeletionPrompt from '@/components/custom-component-tray/deletion-prompt';
import HumanTime from '@/components/custom-component-tray/human-time';
import { FallbackContainer } from '@/components/fallback-container';
import { PageCanvas } from '@/components/page-canvas';
import { FavoriteToggle } from '@/features/dashboards/components/FavoriteToggle';
import { useAppServices } from '@/lib/app-services';
import { useUserData } from '@/lib/context';
import { useDashboardsApi } from '@/lib/domain/dashboards';
import { GetDashboardResponse } from '@/lib/response-types';
import {
  ActionIcon,
  Button,
  Group,
  Loader,
  Menu,
  Modal,
  Paper,
  Stack,
  Text,
  Title,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { EllipsisVertical, PlusIcon } from 'lucide-react';
import DataTable, { TableColumn } from 'react-data-table-component';
import { Link } from 'react-router-dom';
import { DashboardImportModal } from './publication-token-modal';

export default function DashboardsHomePage() {
  const { currentOrg } = useUserData();

  return (
    <PageCanvas
      path={[{ label: 'Dashboards', href: '/main/dashboards' }]}
      inner={<Inner />}
      sidebarProps={{
        org: currentOrg,
        activeItem: 'playground',
      }}
    />
  );
}

export function Inner() {
  return (
    <Stack p="md" gap="md">
      <Group justify="space-between">
        <Title order={4}>Dashboards</Title>
        <Group gap="sm">
          <DashboardImportModal />
          <CreateNewButton />
        </Group>
      </Group>
      <ViewDashboardsTable />
    </Stack>
  );
}

export function CreateNewButton() {
  const dashboardsApi = useDashboardsApi();
  const { navigation, notify } = useAppServices();
  return (
    <Button
      leftSection={<PlusIcon size={16} />}
      onClick={async () => {
        try {
          const { dashboardId, versionId } =
            await dashboardsApi.createDashboard({
              description: 'Sample dashboard',
              title: 'Untitled',
            });
          navigation.navigate(
            `/main/dashboards/${dashboardId}/${versionId}/edit`,
          );
        } catch (err) {
          notify.error(
            err instanceof Error ? err.message : 'Failed to create dashboard',
          );
        }
      }}
      loading={dashboardsApi.createDashboardPending}
    >
      Create New
    </Button>
  );
}

export function ViewDashboardsTable() {
  const { listQuery } = useDashboardsApi();

  return (
    <FallbackContainer loading={listQuery.isLoading} fallback={<Loader />}>
      {listQuery.data?.data && listQuery.data.data.length > 0 ? (
        <Paper withBorder radius="md" shadow="xs" p="md">
          <DataTable
            columns={dashboardColumns}
            data={listQuery.data.data}
            highlightOnHover
            pagination={false}
            dense
            customStyles={{
              table: { style: { minWidth: '100%' } },
              headRow: { style: { minHeight: '56px' } },
              rows: { style: { minHeight: '64px' } },
              cells: { style: { paddingTop: '12px', paddingBottom: '12px' } },
            }}
          />
        </Paper>
      ) : (
        <Text size="sm" c="dimmed">
          No dashboards found.
        </Text>
      )}
    </FallbackContainer>
  );
}

type DashboardRow = GetDashboardResponse;

const dashboardColumns: TableColumn<DashboardRow>[] = [
  {
    name: 'Dashboard',
    sortable: true,
    selector: (d) => d.title || '',
    grow: 2,
    cell: (d) => {
      const versionId = d.activeVersion;
      if (!versionId) {
        return (
          <Text fw={600} c="dark.7">
            {d.title}
          </Text>
        );
      }
      return (
        <Stack gap={4} align="flex-start">
          <Link
            to={`/main/dashboards/${d.dashboardId}/${versionId}`}
            style={{ textDecoration: 'none' }}
          >
            <Text fw={600} c="dark.7">
              {d.title}
            </Text>
          </Link>
          {d.tags && d.tags.length > 0 && (
            <Group gap={6} wrap="wrap">
              {d.tags.map((t) => (
                <DashboardTag key={t} tag={t} />
              ))}
            </Group>
          )}
        </Stack>
      );
    },
  },
  {
    name: 'Favorite',
    center: true,
    cell: (d) => (
      <FavoriteToggle
        dashboardId={d.dashboardId}
        favorite={d.isFavorite || false}
      />
    ),
  },
  {
    name: 'Last edited by',
    cell: (d) =>
      d.lastEditedBy ? (
        <DashboardAuthor
          userId={d.lastEditedBy.userId}
          firstName={d.lastEditedBy.firstName}
          lastName={d.lastEditedBy.lastName}
        />
      ) : (
        '-'
      ),
  },
  {
    name: 'Last viewed',
    cell: (d) => (d.viewed ? <HumanTime date={d.viewed} /> : '-'),
  },
  {
    name: '',
    right: true,
    cell: (d) => (
      <DashboardActions
        dashboardId={d.dashboardId}
        versionId={d.activeVersion}
      />
    ),
  },
];

export function DashboardActions({
  dashboardId,
  versionId,
}: {
  dashboardId: string;
  versionId?: string;
}) {
  const [opened, { open, close }] = useDisclosure(false);
  const dashboardsApi = useDashboardsApi();
  const { notify } = useAppServices();

  const handleDeleteConfirmed = async () => {
    try {
      await dashboardsApi.deleteDashboard(dashboardId);
      notify.success('Dashboard deleted');
      close();
    } catch {
      notify.error('Failed to delete dashboard');
    }
  };

  return (
    <>
      <Menu withinPortal position="bottom-end">
        <Menu.Target>
          <ActionIcon
            variant="subtle"
            color="gray"
            aria-label="Dashboard actions"
          >
            <EllipsisVertical size={16} />
          </ActionIcon>
        </Menu.Target>
        <Menu.Dropdown>
          <Menu.Item
            component={Link}
            to={
              versionId
                ? `/main/dashboards/${dashboardId}/${versionId}/edit`
                : `/main/dashboards/${dashboardId}/edit`
            }
          >
            Edit
          </Menu.Item>
          <Menu.Item
            component={Link}
            to={
              versionId
                ? `/main/dashboards/${dashboardId}/${versionId}`
                : `/main/dashboards/${dashboardId}`
            }
          >
            View
          </Menu.Item>
          <Menu.Divider />
          <Menu.Item color="red" onClick={open}>
            Delete
          </Menu.Item>
        </Menu.Dropdown>
      </Menu>

      <Modal opened={opened} onClose={close} title="Delete dashboard?" centered>
        <DeletionPrompt
          onDeleteConfirmed={handleDeleteConfirmed}
          onCancel={close}
        />
      </Modal>
    </>
  );
}

export function DashboardAuthor({
  userId,
  firstName,
  lastName,
}: {
  userId: string;
  firstName?: string;
  lastName?: string;
}) {
  const label =
    firstName || lastName
      ? `${firstName || ''} ${lastName || ''}`.trim()
      : userId;
  return <Text size="sm">{label}</Text>;
}
