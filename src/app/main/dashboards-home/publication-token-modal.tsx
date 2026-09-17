import { useAppServices } from '@/lib/app-services';
import { useDashboardsApi } from '@/lib/domain/dashboards';
import { Dropzone, MIME_TYPES } from '@mantine/dropzone';
import { Button, Group, Modal, Stack, Text } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { ArrowDown, FileArchive, FileCheck, FileUp, X } from 'lucide-react';

export function DashboardImportModal() {
  const dashboardsApi = useDashboardsApi();
  const { notify } = useAppServices();
  const [opened, { open, close }] = useDisclosure(false);
  return (
    <>
      <Button
        variant="light"
        leftSection={<ArrowDown size={16} />}
        onClick={open}
      >
        Import dashboard
      </Button>
      <Modal opened={opened} onClose={close} title="Import dashboards" centered>
        <Stack gap="md">
          <Text size="sm" c="dimmed">
            Drop a dashboard YAML file or bundle to create dashboards without
            any clicks.
          </Text>
          <Stack gap={6}>
            <Dropzone
              onDrop={async ([file]) => {
                if (!file) return;
                try {
                  const response =
                    await dashboardsApi.bulkApplyDashboards(file);
                  if (response.kind === 'yaml') {
                    notify.success('Dashboard imported');
                  } else {
                    const importedCount = response.response.data?.imported?.length;
                    const warningCount = response.response.data?.warnings?.length;
                    const suffix =
                      importedCount === undefined
                        ? ''
                        : ` (${importedCount} imported)`;
                    notify.success(`Dashboards imported${suffix}`);
                    if (warningCount) {
                      notify.message(
                        `${warningCount} import warning${warningCount === 1 ? '' : 's'}`,
                      );
                    }
                  }
                  close();
                } catch (err) {
                  notify.error(
                    err instanceof Error
                      ? err.message
                      : 'Failed to import dashboards',
                  );
                }
              }}
              onReject={() =>
                notify.error(
                  'Only YAML files and dashboard bundles are supported',
                )
              }
              accept={{
                'text/yaml': ['.yaml', '.yml'],
                [MIME_TYPES.zip]: ['.zip'],
              }}
              loading={dashboardsApi.bulkApplyDashboardsPending}
              disabled={dashboardsApi.bulkApplyDashboardsPending}
              maxSize={10 * 1024 ** 2}
            >
              <Group
                justify="center"
                gap="xl"
                mih={220}
                px="xl"
                style={{ pointerEvents: 'none' }}
              >
                <Dropzone.Accept>
                  <FileCheck
                    size={56}
                    color="var(--mantine-color-blue-6)"
                  />
                </Dropzone.Accept>
                <Dropzone.Reject>
                  <X size={56} color="var(--mantine-color-red-6)" />
                </Dropzone.Reject>
                <Dropzone.Idle>
                  <FileUp size={56} color="var(--mantine-color-dimmed)" />
                </Dropzone.Idle>

                <div>
                  <Text size="xl" inline>
                    Drop a dashboard file here
                  </Text>
                  <Text size="sm" c="dimmed" inline mt={7}>
                    Or click to select a YAML file or ZIP bundle (up to 10 MB)
                  </Text>
                </div>
              </Group>
            </Dropzone>
            <Text size="xs" c="dimmed">
              <FileArchive
                size={13}
                style={{ verticalAlign: 'middle', marginRight: 4 }}
              />
              YAML files and ZIP bundles are supported.
            </Text>
          </Stack>
        </Stack>
      </Modal>
    </>
  );
}
