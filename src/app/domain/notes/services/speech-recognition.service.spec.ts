// import { TestBed } from '@angular/core/testing';
// import { PLATFORM_ID } from '@angular/core';
// import { SpeechRecognitionService } from './speech-recognition.service';
// import { DeviceDetectorService } from 'ngx-device-detector';
//
// describe('SpeechRecognitionService', () => {
//   let service: SpeechRecognitionService;
//   let deviceDetectorService: jasmine.SpyObj<DeviceDetectorService>;
//
//   beforeEach(() => {
//     const deviceDetectorSpy = jasmine.createSpyObj('DeviceDetectorService', [
//       'isDesktop',
//     ]);
//
//     TestBed.configureTestingModule({
//       providers: [
//         SpeechRecognitionService,
//         { provide: DeviceDetectorService, useValue: deviceDetectorSpy },
//         { provide: PLATFORM_ID, useValue: 'browser' },
//       ],
//     });
//
//     deviceDetectorService = TestBed.inject(
//       DeviceDetectorService,
//     ) as jasmine.SpyObj<DeviceDetectorService>;
//     service = TestBed.inject(SpeechRecognitionService);
//   });
//
//   it('should be created', () => {
//     expect(service).toBeTruthy();
//   });
//
//   describe('hasSpeechRecognition', () => {
//     it('should return true when browser supports webkitSpeechRecognition and is desktop', () => {
//       // Setup
//       (window as any).webkitSpeechRecognition = class MockSpeechRecognition {};
//       deviceDetectorService.isDesktop.and.returnValue(true);
//
//       // Create a new instance to trigger computed property
//       service = TestBed.inject(SpeechRecognitionService);
//
//       // Assert
//       expect(service.hasSpeechRecognition()).toBe(true);
//
//       // Cleanup
//       delete (window as any).webkitSpeechRecognition;
//     });
//
//     it('should return false when browser does not support webkitSpeechRecognition', () => {
//       // Setup
//       delete (window as any).webkitSpeechRecognition;
//       deviceDetectorService.isDesktop.and.returnValue(true);
//
//       // Create a new instance to trigger computed property
//       service = TestBed.inject(SpeechRecognitionService);
//
//       // Assert
//       expect(service.hasSpeechRecognition()).toBe(false);
//     });
//
//     it('should return false when device is not desktop', () => {
//       // Setup
//       (window as any).webkitSpeechRecognition = class MockSpeechRecognition {};
//       deviceDetectorService.isDesktop.and.returnValue(false);
//
//       // Create a new instance to trigger computed property
//       service = TestBed.inject(SpeechRecognitionService);
//
//       // Assert
//       expect(service.hasSpeechRecognition()).toBe(false);
//
//       // Cleanup
//       delete (window as any).webkitSpeechRecognition;
//     });
//
//     it('should return false when platform is not browser', () => {
//       // Setup
//       (window as any).webkitSpeechRecognition = class MockSpeechRecognition {};
//       deviceDetectorService.isDesktop.and.returnValue(true);
//
//       // Reconfigure TestBed with non-browser platform
//       TestBed.resetTestingModule();
//       TestBed.configureTestingModule({
//         providers: [
//           SpeechRecognitionService,
//           { provide: DeviceDetectorService, useValue: deviceDetectorService },
//           { provide: PLATFORM_ID, useValue: 'server' },
//         ],
//       });
//
//       service = TestBed.inject(SpeechRecognitionService);
//
//       // Assert
//       expect(service.hasSpeechRecognition()).toBe(false);
//
//       // Cleanup
//       delete (window as any).webkitSpeechRecognition;
//     });
//   });
// });
