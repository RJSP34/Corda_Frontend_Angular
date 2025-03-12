import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegistrationMessageComponent } from './registration-message.component';

describe('RegistrationMessageComponent', () => {
  let component: RegistrationMessageComponent;
  let fixture: ComponentFixture<RegistrationMessageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RegistrationMessageComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RegistrationMessageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
