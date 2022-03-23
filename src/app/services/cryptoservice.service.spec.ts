import { TestBed } from '@angular/core/testing';

import { CryptoserviceService } from './cryptoservice.service';

describe('CryptoserviceService', () => {
  let service: CryptoserviceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CryptoserviceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
