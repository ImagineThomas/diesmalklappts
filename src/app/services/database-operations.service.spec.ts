import { TestBed } from '@angular/core/testing';

import { DatabaseOperationsService } from './database-operations.service';

describe('DatabaseOperationsService', () => {
  let service: DatabaseOperationsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DatabaseOperationsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
