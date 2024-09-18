import { TestBed } from '@angular/core/testing';

import { LowpassfilterService } from './lowpassfilter.service';

describe('LowpassfilterService', () => {
  let service: LowpassfilterService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LowpassfilterService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
