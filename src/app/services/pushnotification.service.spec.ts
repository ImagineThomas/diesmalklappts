import { TestBed } from '@angular/core/testing';

import { PushnotificationService } from './pushnotification.service';

describe('PushnotificationService', () => {
  let service: PushnotificationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PushnotificationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
