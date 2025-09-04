describe('Settings Page', () => {
  beforeEach(() => {
    cy.visit('/settings');
  });

  describe('Page Structure', () => {
    it('should load the settings page', () => {
      cy.url().should('include', '/settings');
      cy.get('app-settings-page').should('be.visible');
    });

    it('should display the page title and description', () => {
      cy.get('[data-testid="settings-title"]').should('be.visible');
      cy.get('[data-testid="settings-title"]').should('contain', 'Settings');
      cy.contains('Customize your app experience').should('be.visible');
    });

    it('should display all settings sections on desktop', () => {
      cy.viewport(1280, 720); // Desktop viewport
      cy.get('[data-testid="transcription-title"]').should('be.visible');
      cy.get('[data-testid="microphone-title"]').should('be.visible');
      cy.get('[data-testid="danger-zone-title"]').should('be.visible');
    });
  });

  describe('Desktop Layout', () => {
    beforeEach(() => {
      cy.viewport(1280, 720); // Desktop viewport
    });

    it('should show transcription settings', () => {
      cy.get('[data-testid="transcription-title"]').should('be.visible');
      cy.contains('Choose the language for audio transcription').should(
        'be.visible',
      );
      cy.get('app-transcription-settings-picker').should('be.visible');
    });

    it('should show microphone settings', () => {
      cy.get('[data-testid="microphone-title"]').should('be.visible');
      cy.contains(
        'Select your preferred microphone for audio recording',
      ).should('be.visible');
      cy.get('app-mic-selector').should('be.visible');
    });

    it('should show danger zone settings', () => {
      cy.get('[data-testid="danger-zone-title"]').should('be.visible');
      cy.contains('Manage your local data').should('be.visible');
      cy.contains('Clear Local Data').should('be.visible');
      cy.contains('Permanently delete all your data from this browser').should(
        'be.visible',
      );
      cy.get('[data-testid="clear-data-button"]').should('be.visible');
      cy.get('[data-testid="clear-data-button"]').should(
        'contain',
        'Clear All Data',
      );
    });
  });

  describe('Mobile Layout', () => {
    beforeEach(() => {
      cy.viewport('iphone-6'); // Mobile viewport

      // Mock mobile user agent and unavailable speech recognition
      cy.visit('/settings', {
        onBeforeLoad: (win) => {
          // Mock mobile device
          Object.defineProperty(win.navigator, 'userAgent', {
            value:
              'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1',
          });
        },
      });
    });

    it('should show accordion-style sections when speech recognition is available', () => {
      // Check that sections are collapsed by default
      cy.contains('button', 'Transcription').should('not.exist');
      cy.contains('button', 'Microphone').should('be.visible');
      cy.contains('button', 'Danger Zone').should('be.visible');
    });

    it('should expand and collapse microphone section', () => {
      cy.contains('button', 'Microphone').click();
      cy.get('app-mic-selector').should('be.visible');

      cy.contains('button', 'Microphone').click();
      cy.get('app-mic-selector').should('not.be.visible');
    });

    it('should expand and collapse danger zone section', () => {
      // First, verify the mobile button doesn't exist initially
      cy.get('[data-testid="clear-data-button-mobile"]').should('not.exist');

      // Expand the section
      cy.contains('button', 'Danger Zone').click();

      // Wait for the mobile-specific content to appear
      cy.get('[data-testid="clear-data-button-mobile"]', {
        timeout: 10000,
      }).should('be.visible');

      // Check for the mobile-specific text (which is different from desktop)
      cy.contains('This action cannot be undone').should('be.visible');

      // Collapse the section
      cy.contains('button', 'Danger Zone').click();

      // Wait for the content to be removed from DOM
      cy.get('[data-testid="clear-data-button-mobile"]', {
        timeout: 10000,
      }).should('not.exist');
    });
  });

  describe('Clear Data Functionality', () => {
    it('should show clear data button on desktop', () => {
      cy.viewport(1280, 720);
      cy.get('[data-testid="clear-data-button"]').should('be.visible');
      cy.get('[data-testid="clear-data-button"]').should(
        'contain',
        'Clear All Data',
      );
      // Check that it has the destructive variant styling
      cy.get('[data-testid="clear-data-button"]').should(
        'have.attr',
        'variant',
        'destructive',
      );
    });

    it('should show clear data button on mobile when expanded', () => {
      cy.viewport('iphone-6');

      // Mock mobile user agent
      cy.visit('/settings', {
        onBeforeLoad: (win) => {
          Object.defineProperty(win.navigator, 'userAgent', {
            value:
              'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1',
          });
        },
      });

      cy.contains('button', 'Danger Zone').click();
      cy.get('[data-testid="clear-data-button-mobile"]').should('be.visible');
    });
  });

  describe('Navigation', () => {
    it('should have working sidebar on desktop', () => {
      cy.viewport(1280, 720);
      cy.get('app-desktop-sidebar').should('be.visible');
    });

    it('should have working navbar on mobile', () => {
      cy.viewport('iphone-6');

      // Mock mobile user agent
      cy.visit('/settings', {
        onBeforeLoad: (win) => {
          Object.defineProperty(win.navigator, 'userAgent', {
            value:
              'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1',
          });
        },
      });

      cy.get('app-navbar').should('be.visible');
    });

    it('should navigate back to home when clicking on notis logo', () => {
      cy.viewport('iphone-6');

      // Mock mobile user agent
      cy.visit('/settings', {
        onBeforeLoad: (win) => {
          Object.defineProperty(win.navigator, 'userAgent', {
            value:
              'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1',
          });
        },
      });

      cy.get('app-navbar').should('be.visible');
      cy.get('app-navbar').within(() => {
        cy.contains('Notis').click();
      });
      cy.url().should('eq', Cypress.config().baseUrl + '/');
    });

    it('should navigate to notes creation from sidebar', () => {
      cy.viewport(1280, 720);
      cy.get('app-desktop-sidebar').within(() => {
        cy.contains('New Note').click();
      });
      cy.url().should('include', '/notes/create');
    });
  });
});
