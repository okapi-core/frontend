import {
  BarChart,
  CustomChart,
  LineChart as ELineChart,
} from 'echarts/charts';
import {
  BrushComponent,
  DataZoomComponent,
  GridComponent,
  TooltipComponent,
  LegendComponent,
  ToolboxComponent,
  TitleComponent,
} from 'echarts/components';
import * as echarts from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';

// Register the minimal set of components we need.
echarts.use([
  GridComponent,
  TooltipComponent,
  LegendComponent,
  ToolboxComponent,
  TitleComponent,
  DataZoomComponent,
  BrushComponent,
  ELineChart,
  BarChart,
  CustomChart,
  CanvasRenderer,
]);

export default echarts;
