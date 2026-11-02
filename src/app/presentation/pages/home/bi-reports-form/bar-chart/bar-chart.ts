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

export interface ChartBar {
  name: string;
  values: number[];
}

export interface BarChartDto {
  title: string;
  xAxisValues: string[];
  bars: ChartBar[];
}

@Component({
  selector: 'app-bar-chart',
  standalone: true,
  imports: [NgxEchartsDirective],
  templateUrl: './bar-chart.html',
  host: { '[attr.title]': 'null' },
})
export class BarChart implements OnChanges {
  @Input({ required: true }) config!: BarChartDto;

  chartOption!: EChartsOption;

  ngOnChanges(): void {
    this.chartOption = this.buildOption();
  }

  private buildOption(): EChartsOption {
    const { title, xAxisValues, bars } = this.config;
    const multi = bars.length > 1;

    return {
      title: {
        text: title,
        left: '1%', top: 8,
        textStyle: { color: CRIMSON, fontSize: 14, fontWeight: 'bold' },
      },
      tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
      ...(multi && {
        legend: {
          data: bars.map(b => b.name),
          top: 8, right: 10,
          textStyle: { color: TEXT_CLR },
        },
      }),
      grid: {
        left: '3%', right: '2%', bottom: '8%',
        top: multi ? '24%' : '20%',
        containLabel: true,
      },
      xAxis: {
        type: 'category', data: xAxisValues,
        axisLine: { lineStyle: { color: BORD_CLR } },
        axisLabel: { color: TEXT_CLR, interval: 0 },
      },
      yAxis: {
        type: 'value',
        axisLabel: { color: TEXT_CLR },
        splitLine: { lineStyle: { color: GRID_CLR } },
      },
      series: bars.map((bar, i) => ({
        name: bar.name,
        type: 'bar' as const,
        data: bar.values,
        itemStyle: multi
          ? { color: PALETTE[i % PALETTE.length], borderRadius: [4, 4, 0, 0] as [number, number, number, number] }
          : {
              color: (params: any) => PALETTE[params.dataIndex % PALETTE.length],
              borderRadius: [6, 6, 0, 0] as [number, number, number, number],
            },
        label: {
          show: !multi,
          position: 'top' as const,
          color: CRIMSON,
          fontWeight: 'bold',
          fontSize: 11,
        },
        barMaxWidth: 64,
      })),
    };
  }
}
