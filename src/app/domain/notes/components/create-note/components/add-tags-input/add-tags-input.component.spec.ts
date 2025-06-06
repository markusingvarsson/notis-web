import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddTagsInputComponent } from './add-tags-input.component';

describe('AddTagsInputComponent', () => {
  let component: AddTagsInputComponent;
  let fixture: ComponentFixture<AddTagsInputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddTagsInputComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddTagsInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
