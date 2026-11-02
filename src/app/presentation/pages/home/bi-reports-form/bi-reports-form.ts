import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { KpiCard } from './kpi-card/kpi-card';
import { LineChart, LineChartDto } from './line-chart/line-chart';
import { BarChart, BarChartDto } from './bar-chart/bar-chart';
import { DonutChart, DonutChartDto } from './donut-chart/donut-chart';
import { ScatterChart, ScatterChartDto } from './scatter-chart/scatter-chart';
import { HeatmapChart, HeatmapChartDto } from './heatmap-chart/heatmap-chart';
import { ModernTrustLoading } from '../../../components/modern-trust-loading/modern-trust-loading';
import { Api } from '../../../../data/api';
import { reportsBiReport1Get } from '../../../../data/functions';
import { BiReport1Response } from '../../../../data/models/bi-report-1-response';
import { DialogService } from '../../../../core/services/dialog';

@Component({
  selector: 'app-bi-reports-form',
  standalone: true,
  imports: [CommonModule, KpiCard, LineChart, BarChart, DonutChart, ScatterChart, HeatmapChart, ModernTrustLoading],
  templateUrl: './bi-reports-form.html',
  styleUrl: './bi-reports-form.css',
})
export class BiReportsForm {
  private readonly apiService = inject(Api);
  private readonly dialogService = inject(DialogService);

  readonly isLoaded = signal(false);

  readonly currentYear = new Date().getFullYear();

  // ── Chart data (populated from API)
  kpiCards: { title: string; value: string; change: string; icon: string; up: boolean }[] = [];
  lineChartConfig: LineChartDto = { title: '', xAxisValues: [], lines: [] };
  barChartConfig: BarChartDto = { title: '', xAxisValues: [], bars: [] };
  donutChartConfig: DonutChartDto = { title: '', data: [] };
  scatterChartConfig: ScatterChartDto = { title: '', points: [] };
  heatmapChartConfig: HeatmapChartDto = { title: '', xLabels: [], yLabels: [], data: [] };

  // ── Loading integration
  readonly loadingFn: () => Promise<void> = () =>
    new Promise<void>(async (resolve) => {
      try {
        const data = await this.apiService.invoke(reportsBiReport1Get);
        this.applyApiData(data);
        resolve();
      } catch {
        this.dialogService.openDialog('Failed to load dashboard data. Please refresh the page.', 'error');
        // Promise intentionally left pending — loading animation stays active
      }
    });

  readonly loadedFn: () => void = () => {
    this.isLoaded.set(true);
  };

  private applyApiData(data: BiReport1Response): void {
    if (data.kpiCards) {
      this.kpiCards = data.kpiCards.map(k => ({
        title: k.title ?? '',
        value: k.value ?? '',
        change: k.change ?? '',
        icon: k.icon ?? '',
        up: k.up ?? true,
      }));
    }

    if (data.lineChartConfig) {
      this.lineChartConfig = {
        title: data.lineChartConfig.title ?? '',
        xAxisValues: data.lineChartConfig.xAxisValues ?? [],
        lines: (data.lineChartConfig.lines ?? []).map(l => ({
          name: l.name ?? '',
          values: l.values ?? [],
        })),
        area: data.lineChartConfig.area,
      };
    }

    if (data.barChartConfig) {
      this.barChartConfig = {
        title: data.barChartConfig.title ?? '',
        xAxisValues: data.barChartConfig.xAxisValues ?? [],
        bars: (data.barChartConfig.bars ?? []).map(b => ({
          name: b.name ?? '',
          values: b.values ?? [],
        })),
      };
    }

    if (data.donutChartConfig) {
      this.donutChartConfig = {
        title: data.donutChartConfig.title ?? '',
        data: (data.donutChartConfig.data ?? []).map(s => ({
          name: s.name ?? '',
          value: s.value ?? 0,
        })),
      };
    }

    if (data.scatterChartConfig) {
      this.scatterChartConfig = {
        title: data.scatterChartConfig.title ?? '',
        xName: data.scatterChartConfig.xName ?? '',
        yName: data.scatterChartConfig.yName ?? '',
        points: (data.scatterChartConfig.points ?? []) as [number, number][],
      };
    }

    if (data.heatmapChartConfig) {
      this.heatmapChartConfig = {
        title: data.heatmapChartConfig.title ?? '',
        seriesName: data.heatmapChartConfig.seriesName ?? 'Value',
        xLabels: data.heatmapChartConfig.xLabels ?? [],
        yLabels: data.heatmapChartConfig.yLabels ?? [],
        data: (data.heatmapChartConfig.data ?? []) as [number, number, number][],
        maxValue: data.heatmapChartConfig.maxValue,
      };
    }
  }
}
