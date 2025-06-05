import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateTextNoteComponent } from './create-text-note.component';

describe('CreateTextNoteComponent', () => {
  let component: CreateTextNoteComponent;
  let fixture: ComponentFixture<CreateTextNoteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateTextNoteComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateTextNoteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
