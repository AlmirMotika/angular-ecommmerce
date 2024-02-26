import { TestBed } from '@angular/core/testing';

import { AMShopFormService } from './amshop-form.service';

describe('AMShopFormService', () => {
  let service: AMShopFormService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AMShopFormService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
