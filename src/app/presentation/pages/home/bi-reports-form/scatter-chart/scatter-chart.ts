import { Component, Input, OnChanges } from '@angular/core';
import { NgxEchartsDirective } from 'ngx-echarts';
import type { EChartsOption } from 'echarts';

const PALETTE_GRAD = ['#F5C800', '#E87A20', '#C0390A', '#7B1A1A'];
const CRIMSON = '#7B1A1A';
const TEXT_CLR = '#5A2A0A';
const GRID_CLR = '#F5E8D8';

export interface ScatterChartDto {
  title: string;
  points: [number, number][];
  xName?: string;
  yName?: string;
}

@Component({
  selector: 'app-scatter-chart',
  standalone: true,
  imports: [NgxEchartsDirective],
  templateUrl: './scatter-chart.html',
  host: { '[attr.title]': 'null' },
})
export class ScatterChart implements OnChanges {
  @Input({ required: true }) config!: ScatterChartDto;

  chartOption!: EChartsOption;

  ngOnChanges(): void {
    this.chartOption = this.buildOption();
  }

  private buildOption(): EChartsOption {
    const { title, points, xName = '', yName = '' } = this.config;
    const xVals = points.map(p => p[0]);
    const xMin = Math.min(...xVals);
    const xMax = Math.max(...xVals);

    return {
      title: {
        text: title,
        left: '1%', top: 8,
        textStyle: { color: CRIMSON, fontSize: 14, fontWeight: 'bold' },
      },
      tooltip: {
        trigger: 'item',
        formatter: (params: any) =>
          `${xName || 'X'}: ${params.value[0].toLocaleString()}<br/>` +
          `${yName || 'Y'}: ${params.value[1].toLocaleString()}`,
      },
      grid: { left: '4%', right: '15%', bottom: '1%', top: '25%', containLabel: true },
      xAxis: {
        type: 'value',
        name: xName, nameLocation: 'end',
        axisLabel: { color: TEXT_CLR },
        splitLine: { lineStyle: { color: GRID_CLR } },
      },
      yAxis: {
        type: 'value',
        name: yName, nameLocation: 'end',
        axisLabel: { color: TEXT_CLR },
        splitLine: { lineStyle: { color: GRID_CLR } },
      },
      visualMap: {
        show: false,
        min: xMin, max: xMax,
        dimension: 0,
        inRange: { color: PALETTE_GRAD },
      },
      series: [{
        type: 'scatter',
        data: points,
        symbolSize: 9,
        emphasis: { itemStyle: { shadowBlur: 8, shadowColor: 'rgba(0,0,0,0.3)' } },
      }],
    };
  }
}
