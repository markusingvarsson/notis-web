import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateAudioNoteComponent } from './create-audio-note.component';

describe('CreateAudioNoteComponent', () => {
  let component: CreateAudioNoteComponent;
  let fixture: ComponentFixture<CreateAudioNoteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateAudioNoteComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateAudioNoteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
