'use client';
import DeletionPrompt from '@/components/custom-component-tray/deletion-prompt';
import { QueryPlotter } from '@/features/dashboards/components/panel/PanelContentSwitch';
import ExemplarsModal from '@/features/dashboards/components/panel/ExemplarsModal';
import PanelFrame from '@/features/dashboards/components/panel/PanelFrame';
import { useAppServices } from '@/lib/app-services';
import { useDashboardEditorApi } from '@/lib/domain/dashboard-editor';
import { GetDashboardPanelResponse } from '@/lib/response-types';
import { ActionIcon, Menu, Modal, Text } from '@mantine/core';
import { EllipsisVertical } from 'lucide-react';
import React, { useState } from 'react';

// todo: config targets should be outside, view / delete
export function DashboardPanelRenderer({
  props,
  startMs,
  endMs,
  dashboardId,
  rowId,
  varsCtx,
  runKey,
  dashVersion,
  chartGroup,
  onSelectRange,
  onDelete,
}: {
  props: GetDashboardPanelResponse;
  startMs: number;
  endMs: number;
  dashboardId: string;
  rowId: string;
  varsCtx: { [key: string]: string };
  runKey?: number;
  dashVersion?: string;
  chartGroup?: string;
  onSelectRange?: (xstart: number, xend: number) => void;
  onDelete?: () => void;
}) {
  const { navigation, notify } = useAppServices();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [exemplarsOpen, setExemplarsOpen] = useState(false);
  const editorApi = useDashboardEditorApi({
    dashboardId,
    versionId: dashVersion || '',
  });
  let body: React.ReactNode = null;
  if (!props.queries || !props.queries?.length) {
    body = <Text c="dimmed">Panel is not configured</Text>;
  } else {
    body = (
      <QueryPlotter
        varsCtx={varsCtx}
        queryConfig={props.queries}
        timeConstraint={{ startMs, endMs }}
        runKey={runKey}
        onSelectRange={onSelectRange}
        chartGroup={chartGroup}
      />
    );
  }
  return (
    <>
      <GenericPanelRenderer
        title={props.title}
        onConfigure={() => {
          const target = dashVersion
            ? `/main/dashboards/${dashboardId}/${dashVersion}/rows/${rowId}/panels/${props.panelId}/edit`
            : `/main/dashboards/${dashboardId}/rows/${rowId}/panels/${props.panelId}/edit`;
          navigation.navigate(target);
        }}
        onView={() => {
          const params = new URLSearchParams({
            dashboardId,
            versionId: dashVersion || '',
            rowId,
            panelId: props.panelId,
          });
          navigation.navigate(`/main/metrics-explorer?${params.toString()}`);
        }}
        onViewExemplars={() => setExemplarsOpen(true)}
        onDelete={() => setDeleteOpen(true)}
      >
        {body}
      </GenericPanelRenderer>
      <Modal
        opened={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        title="Delete panel ?"
        centered
      >
        <DeletionPrompt
          onDeleteConfirmed={async () => {
            try {
              await editorApi.deletePanel(rowId, props.panelId);
              notify.success('Panel deleted');
              setDeleteOpen(false);
              onDelete?.();
            } catch {
              notify.error('Failed to delete panel');
            }
          }}
          onCancel={() => setDeleteOpen(false)}
        />
      </Modal>
      <ExemplarsModal
        opened={exemplarsOpen}
        onClose={() => setExemplarsOpen(false)}
        metricPaths={props.queries?.map((query) => query.query) || []}
        timeConstraint={{ startMs, endMs }}
      />
    </>
  );
}

// todo: call this something else (its not a Generic)
export function GenericPanelRenderer({
  title,
  children,
  onConfigure,
  onView,
  onViewExemplars,
  onDelete,
}: {
  children: React.ReactNode | React.ReactNode[];
  title?: string;
  onConfigure?: () => void;
  onView?: () => void;
  onViewExemplars?: () => void;
  onDelete?: () => void;
}) {
  const hasActions = Boolean(
    onView || onViewExemplars || onConfigure || onDelete,
  );

  return (
    <PanelFrame
      title={title}
      rightActions={
        hasActions ? (
          <Menu withinPortal position="bottom-end">
            <Menu.Target>
              <ActionIcon
                variant="subtle"
                color="gray"
                aria-label="Panel actions"
              >
                <EllipsisVertical size={16} />
              </ActionIcon>
            </Menu.Target>
            <Menu.Dropdown>
              {onView ? <Menu.Item onClick={onView}>View</Menu.Item> : null}
              {onViewExemplars ? (
                <Menu.Item onClick={onViewExemplars}>
                  View exemplars
                </Menu.Item>
              ) : null}
              {onConfigure ? (
                <Menu.Item onClick={onConfigure}>Configure</Menu.Item>
              ) : null}
              {onDelete ? (
                <Menu.Item color="red" onClick={onDelete}>
                  Delete
                </Menu.Item>
              ) : null}
            </Menu.Dropdown>
          </Menu>
        ) : (
          <></>
        )
      }
    >
      {children}
    </PanelFrame>
  );
}
