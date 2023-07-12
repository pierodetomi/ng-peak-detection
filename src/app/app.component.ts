import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { Chart, registerables } from 'chart.js';
import { debounceTime, Subject } from 'rxjs';

import { INPUT_DATA } from './config/input-data';
import { IThresholdParams } from './models/threshold-params.interface';
import { ThresholdingService } from './services/thresholding.service';

Chart.register(...registerables);

@Component({
  selector: 'pd-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.less']
})
export class AppComponent implements AfterViewInit {
  private _signalChart: Chart;

  private _detectionChart: Chart;

  private _renderSubject = new Subject<void>();

  @ViewChild('signalChart') public signalChartContainer: ElementRef;

  @ViewChild('detectionChart') public detectionChartContainer: ElementRef;

  public data: number[] = INPUT_DATA;

  public viewportBoundaries = [0, this.data.length];

  public lag = 20;

  public threshold = 5;

  public influence = 3.6;

  public minlevel = 0;

  constructor(private _thresholdingService: ThresholdingService) {
    this._renderSubject
      .pipe(debounceTime(200))
      .subscribe(() => {
        this._render();
      });
  }

  public ngAfterViewInit(): void {
    this._render();
  }

  public requestRender() {
    this._renderSubject.next();
  }

  private _render() {
    const output = this._calculateOutputData();

    this._signalChart?.destroy();
    this._detectionChart?.destroy();

    this._signalChart = this._renderChart('Signal', output.input, output.outfrom, output.outto, this.signalChartContainer.nativeElement);
    this._detectionChart = this._renderChart('Detection', output.signal, output.outfrom, output.outto, this.detectionChartContainer.nativeElement);
  }

  private _renderChart(name: string, values: number[], from: number, to: number, ctx: HTMLCanvasElement) {
    if (from == -1 && to == -1) {
      from = 0;
      to = values.length - 1;
    }

    const labels = [];

    for (let k = from; k <= to; ++k) {
      labels.push(k.toString());
    }

    return new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: name,
          data: values,
          fill: false,
          borderColor: 'rgb(75, 192, 192)',
          tension: 0.1
        }]
      },
      options: {
        maintainAspectRatio: false
      }
    });
  }

  private _calculateOutputData() {
    const params: IThresholdParams = {
      lag: this.lag,
      influence: this.influence,
      minlevel: this.minlevel,
      threshold: this.threshold
    };

    const data = this.data.slice(this.viewportBoundaries[0], this.viewportBoundaries[1]);
    return this._thresholdingService.calculateThreshold(params, data);
  }
}
