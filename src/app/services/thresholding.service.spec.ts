import { TestBed } from '@angular/core/testing';

import { ThresholdingService } from './thresholding.service';

describe('ThresholdingService', () => {
  let service: ThresholdingService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ThresholdingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
