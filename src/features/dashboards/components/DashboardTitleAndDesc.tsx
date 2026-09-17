'use client';
import DashboardTag from '@/components/custom-component-tray/dashboard-tag';
import EditableText from '@/components/custom-component-tray/editable-text';
import { Stack, Text, Title } from '@mantine/core';

export function DashboardTitleAndDesc({
  title,
  description,
  tags,
  onSaveTitle,
  onSaveDescription,
  onUpdateTags,
}: {
  title?: string;
  description?: string;
  onSaveTitle?: (next: string) => void;
  onSaveDescription?: (next: string) => void;
  onUpdateTags: (tags: string[]) => void;
  note?: string;
  tags?: string[];
}) {
  return (
    <Stack gap={6}>
      <Title order={4}>
        <EditableText
          value={title || 'Untitled dashboard'}
          onSave={(v) => {
            onSaveTitle?.(v);
          }}
          title="Edit dashboard title"
          placeholder="Enter dashboard title"
          triggerClassName="text-left"
        >
          {title || 'Untitled dashboard'}
        </EditableText>
      </Title>
      <Text component="div" size="sm" c="dimmed">
        <EditableText
          value={description}
          onSave={(v) => onSaveDescription?.(v)}
          title="Edit dashboard description"
          placeholder="Fancy load balancer dashboard"
          multiline
          rows={3}
          triggerClassName="text-left"
        >
          {description || 'Fancy load balancer dashboard'}
        </EditableText>
      </Text>
      {tags?.length ? (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            flexWrap: 'wrap',
          }}
        >
          {tags.map((t) => (
            <DashboardTag key={t} tag={t} />
          ))}
        </div>
      ) : null}
    </Stack>
  );
}

export default DashboardTitleAndDesc;
