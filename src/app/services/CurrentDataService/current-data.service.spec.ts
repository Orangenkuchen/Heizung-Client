import { TestBed } from '@angular/core/testing';

import { CurrentDataService } from './current-data.service';

describe('DataService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: CurrentDataService = TestBed.get(CurrentDataService);
    expect(service).toBeTruthy();
  });
});
