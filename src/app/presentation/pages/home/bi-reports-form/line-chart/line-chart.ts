import { Component, Input, OnChanges } from '@angular/core';
import { NgxEchartsDirective } from 'ngx-echarts';
import type { EChartsOption } from 'echarts';

const PALETTE = [
  '#C0390A',
  '#F5C800',
  '#27AE60',
  '#7B1A1A',
  '#8E44AD',
  '#E87A20',
  '#16A085',
];
const CRIMSON = '#7B1A1A';
const TEXT_CLR = '#5A2A0A';
const GRID_CLR = '#F5E8D8';
const BORD_CLR = '#E8C8A0';

export interface ChartLine {
  name: string;
  values: number[];
}

export interface LineChartDto {
  title: string;
  xAxisValues: string[];
  lines: ChartLine[];
  area?: boolean;
}

function toRgba(hex: string, alpha: number): string {
  const h = hex.replace('#', '');
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

@Component({
  selector: 'app-line-chart',
  standalone: true,
  imports: [NgxEchartsDirective],
  templateUrl: './line-chart.html',
  host: { '[attr.title]': 'null' },
})
export class LineChart implements OnChanges {
  @Input({ required: true }) config!: LineChartDto;

  chartOption!: EChartsOption;

  ngOnChanges(): void {
    this.chartOption = this.buildOption();
  }

  private buildOption(): EChartsOption {
    const { title, xAxisValues, lines, area = false } = this.config;
    return {
      title: {
        text: title,
        left: '1%', top: 8,
        textStyle: { color: CRIMSON, fontSize: 14, fontWeight: 'bold' },
      },
      tooltip: { trigger: 'axis', axisPointer: { type: 'cross' } },
      legend: {
        data: lines.map(l => l.name),
        top: 8, right: 10,
        textStyle: { color: TEXT_CLR },
      },
      grid: { left: '3%', right: '2%', bottom: '8%', top: '20%', containLabel: true },
      xAxis: {
        type: 'category', data: xAxisValues,
        axisLine: { lineStyle: { color: BORD_CLR } },
        axisLabel: { color: TEXT_CLR },
      },
      yAxis: {
        type: 'value',
        axisLabel: { color: TEXT_CLR },
        splitLine: { lineStyle: { color: GRID_CLR } },
      },
      series: lines.map((line, i) => {
        const color = PALETTE[i % PALETTE.length];
        return {
          name: line.name,
          type: 'line' as const,
          data: line.values,
          smooth: true,
          symbol: 'circle',
          symbolSize: 6,
          lineStyle: { color, width: 3 },
          itemStyle: { color },
          ...(area && {
            areaStyle: {
              color: {
                type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
                colorStops: [
                  { offset: 0, color: toRgba(color, 0.38) },
                  { offset: 1, color: toRgba(color, 0.02) },
                ],
              } as any,
            },
          }),
        };
      }),
    };
  }
}
