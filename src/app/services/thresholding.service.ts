import { Injectable } from '@angular/core';

import { IThresholdParams } from '../models/threshold-params.interface';

@Injectable({
  providedIn: 'root'
})
export class ThresholdingService {
  constructor() { }

  public calculateThreshold(params: IThresholdParams, input: number[]) {
    if (input.length <= params.lag + 2) {
      return null;
    }

    const signls = []; // TODO: Fill with 0 ?
    const avgFilter = []; // TODO: Fill with 0 ?
    const stdFilter = []; // TODO: Fill with 0 ?
    const filteredY = input;

    avgFilter[params.lag] = this._mean(filteredY, 0, params.lag);
    stdFilter[params.lag] = this._stdDev(filteredY, avgFilter[params.lag], 0, params.lag);

    for (let i = params.lag + 1; i < input.length; i++) {
      if (Math.abs(input[i]) >= params.minlevel && Math.abs(input[i] - avgFilter[i - 1]) > params.threshold * stdFilter[i - 1]) {

        signls[i] = (input[i] > avgFilter[i - 1]) ? 1 : -1;
        filteredY[i] = params.influence * input[i] + (1 - params.influence) * filteredY[i - 1];

      } else {

        signls[i] = 0; //# No signal
        filteredY[i] = input[i];
      }

      avgFilter[i] = this._mean(filteredY, i - params.lag, i);
      stdFilter[i] = this._stdDev(filteredY, avgFilter[i], i - params.lag, i);
    }

    return {
      input,
      params,
      mean: avgFilter,
      stddev: stdFilter,
      signal: signls,
      outfrom: params.lag,
      outto: input.length - 1
    };
  }

  private _mean(vector: number[], from: number, to: number) {
    from = Math.max(0, from);

    let sum = 0;

    for (let k = from; k <= to; ++k) {
      sum += vector[k];
    }

    return sum / (to - from + 1);
  }

  private _stdDev(vector: number[], mean: number, from: number, to: number) {
    from = Math.max(0, from);

    let sum = 0;

    for (let k = from; k <= to; ++k) {
      sum += Math.pow(vector[k] - mean, 2);
    }

    return Math.sqrt(sum / (to - from + 1));
  }
}
