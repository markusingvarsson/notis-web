describe('Notes Creation', () => {
  beforeEach(() => {
    cy.visit('/notes/create');
  });

  describe('Page Structure', () => {
    it('should load the notes creation page', () => {
      cy.url().should('include', '/notes/create');
      cy.get('app-create-audio-note').should('be.visible');
    });

    it('should display the record button in idle state', () => {
      cy.get('[data-testid="record-button-idle"]').should('be.visible');
    });
  });

  describe('Recording Interface', () => {
    it('should show recording controls', () => {
      cy.get('app-record-button').should('be.visible');
      cy.get('app-transcription-settings-picker').should('be.visible');
    });

    it('should have microphone selector when not recording', () => {
      // Should show mic selector when not recording and has permission
      cy.get('app-mic-selector').should('be.visible');
    });

    it('should display record label text', () => {
      cy.contains('Click to start recording').should('be.visible');
    });
  });

  describe('Mobile Device Simulation', () => {
    beforeEach(() => {
      cy.viewport('iphone-6');

      // Mock mobile user agent and disable speech recognition
      cy.visit('/notes/create', {
        onBeforeLoad: (win) => {
          Object.defineProperty(win.navigator, 'userAgent', {
            value:
              'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1',
          });
        },
      });
    });

    it('should hide transcription settings on mobile without speech recognition', () => {
      cy.get('app-transcription-settings-picker').should('not.exist');
    });

    it('should not show navbar on mobile on note creation page', () => {
      cy.get('app-navbar').should('not.exist');
    });

    it('should show record button in mobile layout', () => {
      cy.get('[data-testid="record-button-idle"]').should('be.visible');
    });
  });

  describe('Navigation', () => {
    it('should not have navbar on mobile', () => {
      cy.viewport('iphone-6');

      cy.visit('/notes/create', {
        onBeforeLoad: (win) => {
          Object.defineProperty(win.navigator, 'userAgent', {
            value:
              'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1',
          });
        },
      });

      cy.get('app-navbar').should('not.exist');
    });

    it('should have working sidebar on desktop', () => {
      cy.viewport(1280, 720);
      cy.get('app-desktop-sidebar').should('be.visible');
    });

    it('should navigate back to notes list', () => {
      cy.viewport(1280, 720);
      cy.get('app-desktop-sidebar').within(() => {
        cy.contains('Notes').click();
      });
      cy.url().should('include', '/notes');
    });
  });

  describe('Recording Flow Integration', () => {
    it('should complete full note creation flow', () => {
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
          // Wait a moment (simulate recording)
          cy.wait(2000);

          // Click to stop recording
          cy.get('[data-testid="record-button-recording"]').click();

          // Should show audio preview
          cy.get('audio').should('be.visible');

          // Fill out note name
          cy.get(
            'input[placeholder*="e.g., Meeting Summary"], input[placeholder*="title"]',
          ).type('My Test Note');

          // Add tags if available
          cy.get('body').then(($tagBody) => {
            if ($tagBody.find('button:contains("Add Tags")').length > 0) {
              // Click "Add Tags" button first
              cy.contains('button', 'Add Tags').click();

              // Then type in the tag input that appears
              cy.get('input[placeholder*="meeting, important"]').type(
                'test{enter}',
              );
            }
          });

          // Save the note
          cy.contains('button', /Save/).click();

          // Should navigate to notes list or show success
          cy.url().should('satisfy', (url) => {
            return url.includes('/notes') && !url.includes('/notes/create');
          });

          // Verify the note was created and appears in the list as a note card
          cy.get('app-note-card').contains('My Test Note').should('be.visible');

          // Verify the tag was also added to the note card
          cy.get('app-note-card').contains('test').should('be.visible');

          // Verify the audio duration shows on the card
          cy.get('app-note-card')
            .should('contain', 'Audio')
            .and('contain', '0:02');

          // Verify the date shows as "less than a minute ago"
          cy.get('app-note-card')
            .contains('less than a minute ago')
            .should('be.visible');
        } else {
          // If microphone is blocked, fail the test
          cy.get('[data-testid="record-button-blocked"]').should('be.visible');
          throw new Error(
            'Microphone access blocked - test requires microphone permissions to pass',
          );
        }
      });
    });

    it('should handle recording cancellation', () => {
      // Start recording
      cy.get('[data-testid="record-button-idle"]').click();

      // Should show recording state
      cy.get('[data-testid="record-button-recording"]', {
        timeout: 10000,
      }).should('be.visible');

      // Only continue if recording actually started
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="record-button-recording"]').length > 0) {
          // Look for cancel button if it exists
          cy.get('body').then(($cancelBody) => {
            if ($cancelBody.find('button:contains("Cancel")').length > 0) {
              cy.contains('button', 'Cancel').click();
              cy.get('[data-testid="record-button-idle"]').should('be.visible');
            }
          });
        } else {
          // If microphone is blocked, fail the test
          cy.get('[data-testid="record-button-blocked"]').should('be.visible');
          throw new Error(
            'Microphone access blocked - test requires microphone permissions to pass',
          );
        }
      });
    });

    it('should show recording duration during recording', () => {
      // Start recording
      cy.get('[data-testid="record-button-idle"]').click();

      // Should show recording state
      cy.get('[data-testid="record-button-recording"]', {
        timeout: 10000,
      }).should('be.visible');

      // Only continue if recording actually started
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="record-button-recording"]').length > 0) {
          // Should show some kind of recording indicator (timer, animation, etc.)
          cy.get('body').should('satisfy', ($indicatorBody) => {
            return (
              $indicatorBody
                .find('[data-testid="record-button-recording"]')
                .hasClass('animate-pulse') ||
              $indicatorBody.text().includes('00:') ||
              $indicatorBody.find('.recording-indicator').length > 0
            );
          });

          // Stop recording
          cy.get('[data-testid="record-button-recording"]').click();
        } else {
          // If microphone is blocked, fail the test
          cy.get('[data-testid="record-button-blocked"]').should('be.visible');
          throw new Error(
            'Microphone access blocked - test requires microphone permissions to pass',
          );
        }
      });
    });

    it('should show blocked state when microphone access is denied', () => {
      // Visit page with blocked microphone access
      cy.visit('/notes/create', {
        onBeforeLoad(win) {
          cy.stub(win.navigator.mediaDevices, 'getUserMedia').rejects(
            new DOMException('Permission denied', 'NotAllowedError'),
          );
        },
      });

      // Wait for initial idle state
      cy.get('[data-testid="record-button-idle"]').should('be.visible');

      // Click to start recording
      cy.get('[data-testid="record-button-idle"]').click();

      // Should show blocked state
      cy.get('[data-testid="record-button-blocked"]', {
        timeout: 10000,
      }).should('be.visible');

      // Verify the blocked button is in DOM and visible
      cy.get('[data-testid="record-button-blocked"]')
        .should('exist')
        .and('be.visible');
    });
  });

  describe('Form Validation', () => {
    beforeEach(() => {
      // Simulate quick recording without mocking - let browser handle naturally
      cy.get('[data-testid="record-button-idle"]').click();

      // Handle recording state
      cy.get('[data-testid="record-button-recording"]', {
        timeout: 10000,
      }).should('be.visible');

      // Only continue if recording actually started
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="record-button-recording"]').length > 0) {
          cy.wait(1000); // Brief recording
          cy.get('[data-testid="record-button-recording"]').click();
        } else {
          // If microphone is blocked, fail the test
          cy.get('[data-testid="record-button-blocked"]').should('be.visible');
          throw new Error(
            'Microphone access blocked - test requires microphone permissions to pass',
          );
        }
      });
    });

    it('should allow saving with minimum required data', () => {
      cy.contains('button', /Save/).click();

      // Should successfully save and navigate
      cy.url().should('not.include', '/notes/create');
    });
  });

  describe('Responsiveness', () => {
    it('should be responsive on mobile', () => {
      cy.viewport('iphone-6');
      cy.get('app-create-audio-note').should('be.visible');
      cy.get('[data-testid="record-button-idle"]').should('be.visible');
    });

    it('should be responsive on tablet', () => {
      cy.viewport('ipad-2');
      cy.get('app-create-audio-note').should('be.visible');
      cy.get('[data-testid="record-button-idle"]').should('be.visible');
    });

    it('should be responsive on desktop', () => {
      cy.viewport(1280, 720);
      cy.get('app-create-audio-note').should('be.visible');
      cy.get('[data-testid="record-button-idle"]').should('be.visible');
    });
  });
});
