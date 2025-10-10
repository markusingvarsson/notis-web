// ***********************************************
// TypeScript declarations for custom commands
// ***********************************************

// eslint-disable-next-line @typescript-eslint/no-namespace
declare namespace Cypress {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  interface Chainable<Subject = any> {
    createAudioNote(options?: {
      noteName?: string;
      tags?: string[];
      recordingDuration?: number;
    }): Chainable<Subject>;

    verifyNoteCreated(options: {
      noteName?: string;
      tags?: string[];
      recordingDuration?: number;
    }): Chainable<Subject>;

    clearAllData(): Chainable<Subject>;

    seedNote(options?: {
      title?: string;
      tags?: string[];
      duration?: number;
    }): Chainable<Subject>;

    visitAsIPhone(url: string, options?: Partial<Cypress.VisitOptions>): Chainable<Subject>;
    visitAsAndroidPhone(url: string, options?: Partial<Cypress.VisitOptions>): Chainable<Subject>;
    visitAsIPad(url: string, options?: Partial<Cypress.VisitOptions>): Chainable<Subject>;
    visitAsAndroidTablet(url: string, options?: Partial<Cypress.VisitOptions>): Chainable<Subject>;
    visitAsDesktop(url: string, options?: Partial<Cypress.VisitOptions>): Chainable<Subject>;
  }
}

// ***********************************************
// Custom Commands
// ***********************************************

/**
 * Creates an audio note by recording audio, filling out the form, and saving
 * @param options Configuration for the note creation
 */
function createAudioNote(options: {
  noteName?: string;
  tags?: string[];
  recordingDuration?: number;
} = {}): void {
  const {
    noteName,
    tags,
    recordingDuration = 2000
  } = options;

  // Wait for initial idle state
  cy.get('[data-testid="record-button-idle"]').should('be.visible');

  // Click to start recording (may prompt for microphone permission)
  cy.get('[data-testid="record-button-idle"]').click();

  // Should show recording state
  cy.get('[data-testid="record-button-recording"]', {
    timeout: 10000,
  }).should('be.visible');

  // If recording started successfully, continue the flow
  cy.get('body').then(($body) => {
    if ($body.find('[data-testid="record-button-recording"]').length > 0) {
      // Wait for recording duration
      cy.wait(recordingDuration);

      // Click to stop recording
      cy.get('[data-testid="record-button-recording"]').click();

      // Should show audio preview
      cy.get('audio').should('be.visible');

      // Fill out note name if provided
      if (noteName) {
        cy.get(
          'input[placeholder*="e.g., Meeting Summary"], input[placeholder*="title"]',
        ).type(noteName);
      }

      // Add tags if available and tags are provided
      if (tags && tags.length > 0) {
        cy.get('body').then(($tagBody) => {
          if ($tagBody.find('button:contains("Add Tags")').length > 0) {
            // Click "Add Tags" button first
            cy.contains('button', 'Add Tags').click();

            // Add each tag
            tags.forEach((tag) => {
              cy.get('input[placeholder*="meeting, important"]').type(`${tag}{enter}`);
            });
          }
        });
      }

      // Save the note
      cy.contains('button', /Save/).click();

      // Should navigate to notes list or show success
      cy.url().should('satisfy', (url) => {
        return url.includes('/notes') && !url.includes('/notes/create');
      });
    } else {
      // If microphone is blocked, fail the test
      cy.get('[data-testid="record-button-blocked"]').should('be.visible');
      throw new Error(
        'Microphone access blocked - test requires microphone permissions to pass',
      );
    }
  });
}

/**
 * Verifies that a note was created with the expected properties
 * @param options The expected properties of the created note
 */
function verifyNoteCreated(options: {
  noteName?: string;
  tags?: string[];
  recordingDuration?: number;
}): void {
  const {
    noteName,
    tags,
    recordingDuration = 2000
  } = options;

  // Verify the note was created and appears in the list as a note card
  cy.get('app-note-card').should('be.visible');

  // If note name was provided, verify it appears
  if (noteName) {
    cy.get('app-note-card').contains(noteName).should('be.visible');
  }

  // Verify each tag was added to the note card if tags were provided
  if (tags && tags.length > 0) {
    tags.forEach((tag) => {
      cy.get('app-note-card').contains(tag).should('be.visible');
    });
  }

  // Verify the audio duration shows on the card
  const seconds = Math.floor(recordingDuration / 1000);
  const expectedDuration = seconds < 10 ? `0${seconds}` : seconds.toString();
  cy.get('app-note-card')
    .should('contain', 'Audio')
    .and('contain', `0:${expectedDuration}`);

  // Verify the date shows as "less than a minute ago"
  cy.get('app-note-card')
    .contains('less than a minute ago')
    .should('be.visible');
}

/**
 * Clears all data by navigating to settings and clicking the "Clear All Data" button
 */
function clearAllData(): void {
  // Navigate to settings page
  cy.visit('/settings');

  // Find and click the "Clear All Data" button
  cy.contains('button', 'Clear All Data').click();

  // Confirm the action if there's a confirmation dialog
  cy.get('body').then(($body) => {
    // Look for confirmation dialog or button
    if ($body.find('button:contains("Confirm")').length > 0) {
      cy.contains('button', 'Confirm').click();
    } else if ($body.find('button:contains("Yes")').length > 0) {
      cy.contains('button', 'Yes').click();
    } else if ($body.find('button:contains("Delete")').length > 0) {
      cy.contains('button', 'Delete').click();
    }
  });

  // Wait a moment for the data to be cleared
  cy.wait(500);
}

/**
 * Seeds a note directly into IndexedDB without using the UI
 * This is much faster and avoids MediaRecorder resource issues
 * @param options Configuration for the note
 */
function seedNote(options: {
  title?: string;
  tags?: string[];
  duration?: number;
} = {}): void {
  const {
    title = `Test Note ${Date.now()}`,
    tags = [],
    duration = 0.1 // 0.1 seconds (100ms)
  } = options;

  cy.window().then((win) => {
    // Create a minimal audio blob (silence)
    const sampleRate = 44100;
    const numSamples = Math.floor(sampleRate * duration);
    const buffer = new ArrayBuffer(44 + numSamples * 2);
    const view = new DataView(buffer);

    // WAV header
    const writeString = (offset: number, string: string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    };

    writeString(0, 'RIFF');
    view.setUint32(4, 36 + numSamples * 2, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, 1, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);
    writeString(36, 'data');
    view.setUint32(40, numSamples * 2, true);

    const audioBlob = new Blob([buffer], { type: 'audio/wav' });

    // Open IndexedDB and insert note directly
    const dbRequest = win.indexedDB.open('notisDB', 2);

    dbRequest.onsuccess = () => {
      const db = dbRequest.result;
      const tx = db.transaction(['notes', 'tags'], 'readwrite');
      const notesStore = tx.objectStore('notes');
      const tagsStore = tx.objectStore('tags');

      const noteId = crypto.randomUUID();
      const tagIds = tags;
      const now = new Date().toISOString();

      // Insert tags first
      tags.forEach((tagName) => {
        tagsStore.put({
          id: tagName,
          name: tagName,
          updatedAt: now
        });
      });

      // Insert note
      notesStore.put({
        id: noteId,
        title,
        type: 'audio',
        audioBlob,
        audioMimeType: 'audio/wav',
        duration,
        transcript: '',
        updatedAt: now,
        tagIds
      });

      tx.oncomplete = () => {
        db.close();
      };
    };
  });

  // Give IndexedDB time to complete the transaction
  cy.wait(50);
}

/**
 * Device User Agents
 */
const USER_AGENTS = {
  iPhone: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1',
  androidPhone: 'Mozilla/5.0 (Linux; Android 11; Pixel 5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.120 Mobile Safari/537.36',
  iPad: 'Mozilla/5.0 (iPad; CPU OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15A5341f Safari/604.1',
  androidTablet: 'Mozilla/5.0 (Linux; Android 11; Galaxy Tab S7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.120 Safari/537.36',
  desktop: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
};

/**
 * Visits a URL with iPhone user agent
 */
function visitAsIPhone(url: string, options: Partial<Cypress.VisitOptions> = {}): void {
  cy.viewport(375, 667); // iPhone 6/7/8 dimensions
  cy.visit(url, {
    ...options,
    onBeforeLoad: (win) => {
      Object.defineProperty(win.navigator, 'userAgent', {
        value: USER_AGENTS.iPhone,
      });
      if (options.onBeforeLoad) {
        options.onBeforeLoad(win);
      }
    },
  });
}

/**
 * Visits a URL with Android phone user agent
 */
function visitAsAndroidPhone(url: string, options: Partial<Cypress.VisitOptions> = {}): void {
  cy.viewport(360, 740); // Typical Android phone dimensions
  cy.visit(url, {
    ...options,
    onBeforeLoad: (win) => {
      Object.defineProperty(win.navigator, 'userAgent', {
        value: USER_AGENTS.androidPhone,
      });
      if (options.onBeforeLoad) {
        options.onBeforeLoad(win);
      }
    },
  });
}

/**
 * Visits a URL with iPad user agent
 */
function visitAsIPad(url: string, options: Partial<Cypress.VisitOptions> = {}): void {
  cy.viewport(768, 1024); // iPad dimensions (portrait)
  cy.visit(url, {
    ...options,
    onBeforeLoad: (win) => {
      Object.defineProperty(win.navigator, 'userAgent', {
        value: USER_AGENTS.iPad,
      });
      if (options.onBeforeLoad) {
        options.onBeforeLoad(win);
      }
    },
  });
}

/**
 * Visits a URL with Android tablet user agent
 */
function visitAsAndroidTablet(url: string, options: Partial<Cypress.VisitOptions> = {}): void {
  cy.viewport(800, 1280); // Typical Android tablet dimensions
  cy.visit(url, {
    ...options,
    onBeforeLoad: (win) => {
      Object.defineProperty(win.navigator, 'userAgent', {
        value: USER_AGENTS.androidTablet,
      });
      if (options.onBeforeLoad) {
        options.onBeforeLoad(win);
      }
    },
  });
}

/**
 * Visits a URL with desktop user agent
 */
function visitAsDesktop(url: string, options: Partial<Cypress.VisitOptions> = {}): void {
  cy.viewport(1920, 1080); // Full HD desktop dimensions
  cy.visit(url, {
    ...options,
    onBeforeLoad: (win) => {
      Object.defineProperty(win.navigator, 'userAgent', {
        value: USER_AGENTS.desktop,
      });
      if (options.onBeforeLoad) {
        options.onBeforeLoad(win);
      }
    },
  });
}

// Register the custom commands
Cypress.Commands.add('createAudioNote', createAudioNote);
Cypress.Commands.add('verifyNoteCreated', verifyNoteCreated);
Cypress.Commands.add('clearAllData', clearAllData);
Cypress.Commands.add('seedNote', seedNote);
Cypress.Commands.add('visitAsIPhone', visitAsIPhone);
Cypress.Commands.add('visitAsAndroidPhone', visitAsAndroidPhone);
Cypress.Commands.add('visitAsIPad', visitAsIPad);
Cypress.Commands.add('visitAsAndroidTablet', visitAsAndroidTablet);
Cypress.Commands.add('visitAsDesktop', visitAsDesktop);
