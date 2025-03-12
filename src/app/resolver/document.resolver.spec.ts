import { TestBed } from '@angular/core/testing';

import { DocumentResolver } from './document.resolver';

describe('DocumentResolver', () => {
  let resolver: DocumentResolver;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    resolver = TestBed.inject(DocumentResolver);
  });

  it('should be created', () => {
    expect(resolver).toBeTruthy();
  });
});
