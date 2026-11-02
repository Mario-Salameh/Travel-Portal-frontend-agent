import { Component, Input, OnChanges } from '@angular/core';
import { NgxEchartsDirective } from 'ngx-echarts';
import type { EChartsOption } from 'echarts';

const CRIMSON = '#7B1A1A';
const BURNT = '#C0390A';
const W_ORANGE = '#E87A20';
const GOLD = '#F5C800';
const TEXT_CLR = '#5A2A0A';

export interface HeatmapChartDto {
  title: string;
  xLabels: string[];
  yLabels: string[];
  /** Triples of [xIndex, yIndex, value] */
  data: [number, number, number][];
  seriesName?: string;
  /** Upper bound for the colour scale; defaults to the maximum value in data. */
  maxValue?: number;
}

@Component({
  selector: 'app-heatmap-chart',
  standalone: true,
  imports: [NgxEchartsDirective],
  templateUrl: './heatmap-chart.html',
  host: { '[attr.title]': 'null' },
})
export class HeatmapChart implements OnChanges {
  @Input({ required: true }) config!: HeatmapChartDto;

  chartOption!: EChartsOption;

  ngOnChanges(): void {
    this.chartOption = this.buildOption();
  }

  private buildOption(): EChartsOption {
    const { title, xLabels, yLabels, data, seriesName = 'Value', maxValue } = this.config;
    const max = maxValue ?? Math.max(...data.map(d => d[2]), 1);

    return {
      title: {
        text: title,
        left: '1%', top: 8,
        textStyle: { color: CRIMSON, fontSize: 14, fontWeight: 'bold' },
      },
      tooltip: {
        position: 'top',
        formatter: (params: any) =>
          `${yLabels[params.value[1]]} – ${xLabels[params.value[0]]}<br/>` +
          `${seriesName}: <b>${params.value[2]}</b>`,
      },
      grid: { left: '15%', right: '15%', bottom: '8%', top: '18%' },
      xAxis: {
        type: 'category', data: xLabels,
        splitArea: { show: true },
        axisLabel: { color: TEXT_CLR, fontSize: 11 },
      },
      yAxis: {
        type: 'category', data: yLabels,
        splitArea: { show: true },
        axisLabel: { color: TEXT_CLR, fontSize: 11 },
      },
      visualMap: {
        min: 0, max,
        calculable: true,
        orient: 'vertical',
        right: 0, top: 'middle',
        inRange: { color: ['#FFF8F0', GOLD, W_ORANGE, BURNT, CRIMSON] },
        textStyle: { color: TEXT_CLR, fontSize: 10 },
      },
      series: [{
        name: seriesName,
        type: 'heatmap',
        data,
        label: { show: false },
        emphasis: { itemStyle: { shadowBlur: 10, shadowColor: 'rgba(0,0,0,0.4)' } },
      }],
    };
  }
}
