import { TestBed } from '@angular/core/testing';

import { MyDocumentResolver } from './my-document.resolver';

describe('MyDocumentResolver', () => {
  let resolver: MyDocumentResolver;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    resolver = TestBed.inject(MyDocumentResolver);
  });

  it('should be created', () => {
    expect(resolver).toBeTruthy();
  });
});
