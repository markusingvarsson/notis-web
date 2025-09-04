describe('Landing Page', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  describe('Page Structure', () => {
    it('should load the home page with correct title', () => {
      cy.title().should('contain', 'Notis.nu - Record Your Thoughts, Locally');
      cy.get('app-hero').should('be.visible');
    });

    it('should display all main sections', () => {
      cy.get('app-hero').should('be.visible');
      cy.get('app-usp').should('be.visible');
      cy.get('app-contact').should('be.visible');
      cy.get('app-cta').should('be.visible');
    });
  });

  describe('Hero Section', () => {
    it('should display the main heading', () => {
      cy.get('[data-testid="hero-heading"]').should('be.visible');
      cy.get('[data-testid="hero-heading"]').should(
        'contain',
        'Record Your Thoughts',
      );
      cy.get('[data-testid="hero-heading"]').should('contain', 'Locally');
    });

    it('should display the subtitle', () => {
      cy.get('[data-testid="hero-subtitle"]').should('be.visible');
      cy.get('[data-testid="hero-subtitle"]').should(
        'contain',
        'A minimalist voice-first note-taking experience',
      );
    });

    it('should have Record button that navigates to notes creation', () => {
      cy.get('[data-testid="hero-record-button"]').should('be.visible');
      cy.get('[data-testid="hero-record-button"]').click();
      cy.url().should('include', '/notes/create');
      cy.get('app-create-audio-note').should('be.visible');
      cy.get('[data-testid="record-button-recording"]').should('be.visible');
    });

    it('should have View Notes button that navigates to notes list', () => {
      cy.get('[data-testid="hero-view-notes-button"]').should('be.visible');
      cy.get('[data-testid="hero-view-notes-button"]').click();
      cy.url().should('include', '/notes');
    });
  });

  describe('USP Section', () => {
    it('should display the main USP heading', () => {
      cy.get('[data-testid="usp-heading"]').should('be.visible');
      cy.get('[data-testid="usp-heading"]').should(
        'contain',
        'Built on Trust & Transparency',
      );
      cy.get('[data-testid="usp-subtitle"]').should('be.visible');
      cy.get('[data-testid="usp-subtitle"]').should(
        'contain',
        'Your notes, your device, your control',
      );
    });

    it('should display all three features', () => {
      cy.contains('100% Free').should('be.visible');
      cy.contains('No subscriptions, no hidden costs').should('be.visible');

      cy.contains('Completely Secure').should('be.visible');
      cy.contains('All your notes are stored locally').should('be.visible');

      cy.contains('Open Source').should('be.visible');
      cy.contains('The entire source code is freely available').should(
        'be.visible',
      );
    });

    it('should have working GitHub link', () => {
      cy.get('[data-testid="github-link"]').should('be.visible');
      cy.get('[data-testid="github-link"]').should(
        'contain',
        'View Source Code',
      );
      cy.get('[data-testid="github-link"]').should(
        'have.attr',
        'href',
        'https://github.com/markusingvarsson/notis-web',
      );
      cy.get('[data-testid="github-link"]').should(
        'have.attr',
        'target',
        '_blank',
      );
    });
  });

  describe('Contact Section', () => {
    it('should display feedback section', () => {
      cy.get('[data-testid="contact-heading"]').should('be.visible');
      cy.get('[data-testid="contact-heading"]').should(
        'contain',
        'Hey, Got Feedback?',
      );
      cy.contains('Your data stays on your device').should('be.visible');
      cy.contains('– Markus').should('be.visible');
    });

    it('should have working email link', () => {
      cy.get('[data-testid="feedback-email-link"]').should('be.visible');
      cy.get('[data-testid="feedback-email-link"]').should(
        'contain',
        'Send Feedback',
      );
      cy.get('[data-testid="feedback-email-link"]').should(
        'have.attr',
        'href',
        'mailto:info@markusingvarsson.com',
      );
    });
  });

  describe('CTA Section', () => {
    it('should display the CTA section', () => {
      cy.get('[data-testid="cta-heading"]').should('be.visible');
      cy.get('[data-testid="cta-heading"]').should(
        'contain',
        'Turn Your Voice Into Action',
      );
      cy.get('[data-testid="cta-subtitle"]').should('be.visible');
      cy.get('[data-testid="cta-subtitle"]').should(
        'contain',
        'Experience a smarter way to capture',
      );
    });

    it('should have Get Started button that navigates to notes creation', () => {
      cy.get('[data-testid="cta-get-started-button"]').should('be.visible');
      cy.get('[data-testid="cta-get-started-button"]').click();
      cy.url().should('include', '/notes/create');
      cy.get('app-create-audio-note').should('be.visible');
      cy.get('[data-testid="record-button-recording"]').should('be.visible');
    });
  });

  describe('Navigation', () => {
    it('should have working navbar', () => {
      cy.get('app-navbar').should('be.visible');
    });

    it('should have footer', () => {
      cy.get('app-footer').should('be.visible');
    });
  });

  describe('Responsiveness', () => {
    it('should be responsive on mobile', () => {
      cy.viewport('iphone-6');
      cy.get('app-hero').should('be.visible');
      cy.contains('Record Your Thoughts,').should('be.visible');
      cy.contains('Record').should('be.visible');
    });

    it('should be responsive on tablet', () => {
      cy.viewport('ipad-2');
      cy.get('app-hero').should('be.visible');
      cy.contains('Record Your Thoughts,').should('be.visible');
      cy.contains('Record').should('be.visible');
    });
  });
});
