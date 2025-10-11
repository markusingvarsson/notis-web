import { TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { SwUpdate } from '@angular/service-worker';
import { of } from 'rxjs';

describe('AppComponent', () => {
  let swUpdateSpy: jasmine.SpyObj<SwUpdate>;

  beforeEach(async () => {
    // Create a spy for SwUpdate
    swUpdateSpy = jasmine.createSpyObj('SwUpdate', ['checkForUpdate'], {
      versionUpdates: of(),
      unrecoverable: of(),
      isEnabled: false
    });

    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [
        { provide: SwUpdate, useValue: swUpdateSpy }
      ]
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });
});
