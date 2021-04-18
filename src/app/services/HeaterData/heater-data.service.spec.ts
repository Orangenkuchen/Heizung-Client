import { TestBed } from '@angular/core/testing';

import { HeaterDataService } from './heater-data.service';

describe('HeaterDataService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: HeaterDataService = TestBed.get(HeaterDataService);
    expect(service).toBeTruthy();
  });
});
