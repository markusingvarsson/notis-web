import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UspComponent } from './usp.component';

describe('UspComponent', () => {
  let component: UspComponent;
  let fixture: ComponentFixture<UspComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UspComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UspComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
