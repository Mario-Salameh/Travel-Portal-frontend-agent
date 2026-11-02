import { Component, Input, OnChanges } from '@angular/core';
import { NgxEchartsDirective } from 'ngx-echarts';
import type { EChartsOption } from 'echarts';

const PALETTE = [
  '#C0390A',
  '#D95A0A',
  '#E87A20',
  '#F0A800',
  '#F5C800',
  '#7B1A1A',
  '#9B2A10',
  '#FFAA00',
];
const CRIMSON = '#7B1A1A';
const TEXT_CLR = '#5A2A0A';

export interface ChartSlice {
  name: string;
  value: number;
}

export interface DonutChartDto {
  title: string;
  data: ChartSlice[];
}

@Component({
  selector: 'app-donut-chart',
  standalone: true,
  imports: [NgxEchartsDirective],
  templateUrl: './donut-chart.html',
  host: { '[attr.title]': 'null' },
})
export class DonutChart implements OnChanges {
  @Input({ required: true }) config!: DonutChartDto;

  chartOption!: EChartsOption;

  ngOnChanges(): void {
    this.chartOption = this.buildOption();
  }

  private buildOption(): EChartsOption {
    const { title, data } = this.config;
    return {
      title: {
        text: title,
        left: 'center', top: 8,
        textStyle: { color: CRIMSON, fontSize: 14, fontWeight: 'bold' },
      },
      tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
      legend: {
        orient: 'vertical', left: 8, top: 'middle',
        textStyle: { color: TEXT_CLR, fontSize: 11 },
      },
      color: PALETTE,
      series: [{
        name: title,
        type: 'pie',
        radius: ['40%', '70%'],
        center: ['62%', '55%'],
        avoidLabelOverlap: true,
        itemStyle: { borderRadius: 8, borderColor: '#fff', borderWidth: 2 },
        label: { show: false },
        emphasis: { label: { show: true, fontSize: 15, fontWeight: 'bold', color: CRIMSON } },
        data,
      }],
    };
  }
}
