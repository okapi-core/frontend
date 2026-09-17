'use client';

import { useDashboardsApi } from '@/lib/domain/dashboards';
import { ActionIcon, Tooltip } from '@mantine/core';
import { Star } from 'lucide-react';

export function FavoriteToggle({
  dashboardId,
  favorite,
}: {
  dashboardId: string;
  favorite: boolean;
}) {
  const dashboardsApi = useDashboardsApi();

  const toggled = !favorite;

  return (
    <Tooltip label={favorite ? 'Unfavorite' : 'Favorite'} openDelay={300}>
      <ActionIcon
        variant={favorite ? 'filled' : 'subtle'}
        color={favorite ? 'yellow' : 'gray'}
        radius="md"
        aria-label={favorite ? 'Unfavorite dashboard' : 'Favorite dashboard'}
        onClick={() =>
          dashboardsApi.favoriteDashboard({
            dashboardId,
            favorite: toggled,
          })
        }
        loading={dashboardsApi.favoriteDashboardPending}
      >
        <Star
          size={16}
          fill={favorite ? 'currentColor' : 'none'}
          strokeWidth={2}
        />
      </ActionIcon>
    </Tooltip>
  );
}

export default FavoriteToggle;
