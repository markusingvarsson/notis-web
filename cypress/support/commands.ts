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

// Register the custom commands
Cypress.Commands.add('createAudioNote', createAudioNote);
Cypress.Commands.add('verifyNoteCreated', verifyNoteCreated);
