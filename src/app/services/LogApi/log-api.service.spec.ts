import { TestBed } from '@angular/core/testing';

import { LogApiService } from './log-api.service';

describe('LogService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: LogApiService = TestBed.get(LogApiService);
    expect(service).toBeTruthy();
  });
});
