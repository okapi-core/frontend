import SafeDeleteButton from '@/components/custom-component-tray/safe-delete-button';
import { DASH_VAR_TYPE } from '@/lib/request-types';
import {
  Button,
  Group,
  Loader,
  Modal,
  Select,
  Stack,
  Table,
  Text,
  TextInput,
  Title,
} from '@mantine/core';
import { useForm } from '@mantine/form';

export function ManageVarsModal({
  dashboardId,
  opened,
  onClose,
  vars,
  loadingVars,
  onCreate,
  onDelete,
  createPending,
  deletePending,
}: {
  dashboardId: string;
  opened: boolean;
  onClose: () => void;
  vars: Array<{ name?: string; type?: string; tag?: string }>;
  loadingVars: boolean;
  onCreate: (values: { name: string; type: DASH_VAR_TYPE; tag: string }) => void;
  onDelete: (name: string) => void;
  createPending: boolean;
  deletePending: boolean;
}) {
  const form = useForm<{
    name: string;
    type: DASH_VAR_TYPE;
    tag: string;
  }>({
    initialValues: {
      name: 'var_name',
      type: 'METRIC',
      tag: '',
    },
  });

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Manage variables"
      size="lg"
      centered
      keepMounted={false}
    >
      <Stack gap="lg">
        <form
          onSubmit={form.onSubmit((values) => {
            onCreate(values);
          })}
        >
          <Stack gap="md">
            <Group align="flex-end" grow>
              <TextInput
                label="Variable name"
                placeholder="service_name"
                required
                {...form.getInputProps('name')}
              />
              <Select
                label="Type"
                required
                data={[
                  { value: 'SVC', label: 'service' },
                  { value: 'METRIC', label: 'metric' },
                  { value: 'TAG_VALUE', label: 'facet value' },
                ]}
                {...form.getInputProps('type')}
              />
            </Group>
            {form.values.type === 'TAG_VALUE' ? (
              <TextInput
                label="Tag name"
                placeholder="environment"
                required
                {...form.getInputProps('tag')}
              />
            ) : null}
            <Group justify="flex-end">
              <Button
                type="submit"
                disabled={!dashboardId}
                loading={createPending}
              >
                Add variable
              </Button>
            </Group>
          </Stack>
        </form>
        <Stack gap="sm">
          <Title order={5}>Existing variables</Title>
          {loadingVars ? (
            <Group justify="center" py="md">
              <Loader size="sm" />
            </Group>
          ) : vars.length === 0 ? (
            <Text size="sm" c="dimmed">
              No variables found.
            </Text>
          ) : (
            <Table striped highlightOnHover withTableBorder>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Name</Table.Th>
                  <Table.Th>Type</Table.Th>
                  <Table.Th>Tag</Table.Th>
                  <Table.Th></Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {vars.map((v) => (
                  <Table.Tr key={`${v.name}-${v.type}`}>
                    <Table.Td>{v.name || '-'}</Table.Td>
                    <Table.Td>{v.type || '-'}</Table.Td>
                    <Table.Td>{v.tag || '-'}</Table.Td>
                    <Table.Td>
                      <Group justify="flex-end">
                        <SafeDeleteButton
                          label="Delete"
                          confirmLabel="Confirm delete"
                          loading={deletePending}
                          disabled={!v.name}
                          onConfirm={() => {
                            if (!v.name) return;
                            onDelete(v.name);
                          }}
                        />
                      </Group>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          )}
        </Stack>
      </Stack>
    </Modal>
  );
}
