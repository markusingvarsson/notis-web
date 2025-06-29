import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NotesLayoutComponent } from './notes-layout.component';

describe('NotesLayoutComponent', () => {
  let component: NotesLayoutComponent;
  let fixture: ComponentFixture<NotesLayoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NotesLayoutComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(NotesLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
