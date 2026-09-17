'use client';
/**
 * GridBoard
 *
 * Simple wrapper around react-grid-layout that renders a set of items
 * according to a provided layout configuration. It supports both
 * single-layout (non-responsive) and responsive modes.
 *
 * Notes
 * - This component is layout-only. It does not add outer spacing; let the
 *   parent container control padding/margins per repo conventions.
 * - For Next.js/SSR, react-grid-layout is dynamically imported and its CSS
 *   should be included globally (already imported in app/layout.tsx).
 * - Provide a `draggableHandle` (e.g. '.gb-drag') to avoid conflicts with
 *   interactive children like charts; optionally set `draggableCancel` for
 *   inputs/canvas.
 *
 * Props
 * - config: GridConfig | ResponsiveGridConfig
 *   - GridConfig: { layout: GridItem[] }
 *   - ResponsiveGridConfig: { layouts, breakpoints, cols }
 * - items: Record<string, ReactNode> mapping GridItem.id -> content
 * - cols?: number (non-responsive only)
 * - draggable, resizable, compactType ('vertical' | 'horizontal' | null)
 * - preventCollision, rowHeight, margin, containerPadding
 * - draggableHandle, draggableCancel
 * - onLayoutChange(layout, allLayouts?)
 * - onBreakpointChange(bp, cols)
 * - renderItem?(id, node, state): optional wrapper to add chrome per-tile
 *
 * Usage (single-layout)
 *   const config = { layout: [
 *     { id: 'a', x: 0, y: 0, w: 6, h: 6 },
 *     { id: 'b', x: 6, y: 0, w: 6, h: 6 },
 *   ] };
 *   const items = { a: <Chart />, b: <Table /> };
 *   <GridBoard
 *     config={config}
 *     items={items}
 *     cols={12}
 *     rowHeight={28}
 *     margin={[8,8]}
 *     draggableHandle=".gb-drag"
 *     renderItem={(id, node) => (
 *       <div className="h-full flex flex-col">
 *         <div className="gb-drag h-8 px-2 text-xs flex items-center">{id}</div>
 *         <div className="flex-1 min-h-0">{node}</div>
 *       </div>
 *     )}
 *   />
 *
 * Usage (responsive)
 *   const config = {
 *     layouts: {
 *       lg: [ { id: 'a', x:0, y:0, w:6, h:6 }, { id: 'b', x:6, y:0, w:6, h:6 } ],
 *       md: [ { id: 'a', x:0, y:0, w:10, h:6 }, { id: 'b', x:0, y:6, w:10, h:6 } ],
 *     },
 *     breakpoints: { lg: 1200, md: 996, sm: 768, xs: 480 },
 *     cols: { lg: 12, md: 10, sm: 8, xs: 4 },
 *   };
 *   <GridBoard config={config} items={items} />
 */
import { cn } from '@/lib/utils';
import React from 'react';
import ReactGridLayout, { Responsive, WidthProvider } from 'react-grid-layout';

// Types for external layout config
export type GridItem = {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  minW?: number;
  maxW?: number;
  minH?: number;
  maxH?: number;
  static?: boolean;
  isDraggable?: boolean;
  isResizable?: boolean;
};

export type GridConfig = {
  layout: GridItem[];
};

export type BreakpointKey =
  | 'xxl'
  | 'xl'
  | 'lg'
  | 'md'
  | 'sm'
  | 'xs'
  | (string & {});

export type ResponsiveGridConfig = {
  layouts: Partial<Record<BreakpointKey, GridItem[]>>;
  breakpoints: Record<BreakpointKey, number>;
  cols: Record<BreakpointKey, number>;
};

type CompactType = 'vertical' | 'horizontal' | null;

export type GridBoardProps = {
  config: GridConfig | ResponsiveGridConfig;
  items: Record<string, React.ReactNode>;
  className?: string;
  style?: React.CSSProperties;
  cols?: number; // for non-responsive
  draggable?: boolean;
  resizable?: boolean;
  compactType?: CompactType;
  preventCollision?: boolean;
  rowHeight?: number;
  margin?: [number, number];
  containerPadding?: [number, number];
  draggableHandle?: string;
  draggableCancel?: string;
  onLayoutChange?: (layout: any, allLayouts?: any) => void;
  onBreakpointChange?: (bp: string, cols: number) => void;
  renderItem?: (
    id: string,
    node: React.ReactNode,
    state: { isDragging: boolean; isResizing: boolean; w: number; h: number },
  ) => React.ReactNode;
};

const RGLDynamic = WidthProvider(ReactGridLayout as any) as any;
const ResponsiveRGLDynamic = WidthProvider(Responsive as any) as any;

function toRglLayout(items: GridItem[]) {
  return items.map((it) => ({
    i: it.id,
    x: it.x,
    y: it.y,
    w: it.w,
    h: it.h,
    minW: it.minW,
    maxW: it.maxW,
    minH: it.minH,
    maxH: it.maxH,
    static: it.static,
    isDraggable: it.isDraggable,
    isResizable: it.isResizable,
  }));
}

export function GridBoard({
  config,
  items,
  className,
  style,
  draggable = true,
  resizable = true,
  compactType = 'vertical',
  preventCollision = false,
  rowHeight = 30,
  margin = [10, 10],
  containerPadding = [10, 10],
  cols,
  draggableHandle,
  draggableCancel,
  onLayoutChange,
  onBreakpointChange,
  renderItem,
}: GridBoardProps) {
  const isResponsive = (
    cfg: GridBoardProps['config'],
  ): cfg is ResponsiveGridConfig =>
    (cfg as ResponsiveGridConfig).layouts !== undefined;

  const allIds = React.useMemo(() => new Set(Object.keys(items)), [items]);

  const commonProps = {
    isDraggable: draggable,
    isResizable: resizable,
    compactType: compactType as any,
    preventCollision,
    rowHeight,
    margin,
    containerPadding,
    cols,
    draggableHandle,
    draggableCancel,
  } as const;

  if (isResponsive(config)) {
    const rglLayouts = Object.fromEntries(
      Object.entries(config.layouts).map(([bp, arr]) => [
        bp,
        toRglLayout(arr || []),
      ]),
    );

    const children = Object.values(config.layouts)[0] || [];
    const toRenderIds = Array.from(new Set(children.map((it) => it.id)));

    return (
      <div className={cn(className)} style={style}>
        <ResponsiveRGLDynamic
          layouts={rglLayouts}
          breakpoints={config.breakpoints}
          onLayoutChange={onLayoutChange as any}
          onBreakpointChange={onBreakpointChange as any}
          {...commonProps}
        >
          {toRenderIds.map((id) => {
            const node = items[id];
            if (!node) {
              console.warn(`GridBoard: missing item for id "${id}"`);
              return <></>;
            }
            return (
              <div key={id} data-grid={undefined}>
                {renderItem
                  ? renderItem(id, node, {
                      isDragging: false,
                      isResizing: false,
                      w: 0,
                      h: 0,
                    })
                  : node}
              </div>
            );
          })}
        </ResponsiveRGLDynamic>
      </div>
    );
  }

  const layout = toRglLayout(config.layout);
  const toRenderIds = config.layout.map((it) => it.id);

  return (
    <div className={cn(className)} style={style}>
      <RGLDynamic
        layout={layout}
        onLayoutChange={onLayoutChange as any}
        {...commonProps}
      >
        {toRenderIds.map((id) => {
          const node = items[id];
          if (!node) {
            if (process.env.NODE_ENV !== 'production') {
              console.warn(`GridBoard: missing item for id "${id}"`);
            }
            return null;
          }
          return (
            <div key={id} data-grid={undefined}>
              {renderItem
                ? renderItem(id, node, {
                    isDragging: false,
                    isResizing: false,
                    w: 0,
                    h: 0,
                  })
                : node}
            </div>
          );
        })}
      </RGLDynamic>
    </div>
  );
}

export default GridBoard;
