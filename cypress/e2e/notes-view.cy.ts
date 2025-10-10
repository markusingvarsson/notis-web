// Create all notes once for all read-only viewing tests
describe('Notes View - All Viewing Tests', () => {
  before(() => {
    // Clear data once and create ALL notes needed for viewing tests
    cy.clearAllData();

    // Visit any page to initialize the app before seeding
    cy.visit('/notes');

    // Seed notes directly into IndexedDB (much faster, no MediaRecorder issues)
    cy.seedNote({ title: 'Meeting Notes', tags: ['meeting', 'work'], duration: 0.1 });
    cy.seedNote({ title: 'Personal Reminder', tags: ['personal', 'reminder'], duration: 0.1 });
    cy.seedNote({ title: 'Project Planning', tags: ['project', 'planning', 'work'], duration: 0.1 });
    cy.seedNote({ title: 'Quick Idea', tags: ['idea', 'creative'], duration: 0.1 });
  });

  beforeEach(() => {
    // Just navigate to notes page before each test (don't recreate notes)
    cy.visit('/notes');
  });

  describe('Multiple Notes Display', () => {
    it('should display all notes', () => {
      cy.get('app-note-card').should('have.length', 4);
      cy.contains('Meeting Notes').should('be.visible');
      cy.contains('Personal Reminder').should('be.visible');
      cy.contains('Project Planning').should('be.visible');
      cy.contains('Quick Idea').should('be.visible');
    });

    it('should display notes in chronological order (newest first)', () => {
      cy.get('app-note-card').first().should('contain', 'Quick Idea');
      cy.get('app-note-card').last().should('contain', 'Meeting Notes');
    });

    it('should show note card with basic information', () => {
      cy.get('app-note-card').first().should('contain', 'Audio');
      cy.get('app-note-card').first().should('contain', '0:00');
      cy.get('app-note-card')
        .first()
        .contains('less than a minute ago')
        .should('be.visible');
    });
  });

  describe('Responsive Design', () => {
    it('should be responsive on mobile', () => {
      cy.visitAsIPhone('/notes');
      cy.get('app-note-card').should('be.visible');
      cy.get('[data-testid="mobile-menu"]').should('be.visible');
      cy.get('[data-testid="desktop-sidebar"]').should('not.be.visible');
    });

    it('should be responsive on desktop', () => {
      cy.visitAsDesktop('/notes');
      cy.get('app-note-card').should('be.visible');
      cy.get('[data-testid="desktop-sidebar"]').should('be.visible');
      cy.get('[data-testid="mobile-menu"]').should('not.be.visible');
    });
  });
});

// Empty State - needs to be separate since it requires no notes
describe('Notes View - Empty State', () => {
  beforeEach(() => {
    cy.clearAllData();
    cy.visit('/notes');
  });

  it('should display empty state when no notes exist', () => {
    cy.get('app-note-card').should('not.exist');
    cy.contains('No notes found').should('be.visible');
  });

  it('should have create note button in empty state', () => {
    cy.get('[data-testid="create-note-button"]').should('be.visible');
    cy.get('[data-testid="create-note-button"]').click();
    cy.url().should('include', '/notes/create');
  });
});

// Note Actions - needs to be separate since it deletes notes
describe('Notes View - Note Actions', () => {
  before(() => {
    cy.clearAllData();
    cy.visit('/notes/create');
    cy.createAudioNote({
      noteName: 'Note with Actions',
      tags: ['action', 'test'],
      recordingDuration: 100,
    });
  });

  beforeEach(() => {
    cy.visit('/notes');
  });

  it('should allow deleting note', () => {
    cy.get('[data-testid="delete-note"]').click();
    cy.get('[data-testid="confirm-modal-btn"]').click();
    cy.get('app-note-card').should('not.exist');
    cy.contains('No notes found').should('be.visible');
  });
});

// Search Functionality - separate suite to avoid recreating notes for each test
describe('Notes View - Search Functionality', () => {
  before(() => {
    // Clear data once and create notes for all tests in this suite
    cy.clearAllData();
    cy.visitAsDesktop('/notes');

    // Seed notes directly into IndexedDB
    cy.seedNote({ title: 'JavaScript Tutorial', tags: ['programming', 'javascript', 'tutorial'], duration: 0.1 });
    cy.seedNote({ title: 'Python Basics', tags: ['programming', 'python', 'basics'], duration: 0.1 });
    cy.seedNote({ title: 'Meeting with Client', tags: ['meeting', 'business', 'client'], duration: 0.1 });
  });

  beforeEach(() => {
    // Just navigate to notes page before each test (don't recreate notes)
    cy.visitAsDesktop('/notes');
  });

  it('should have a search input field', () => {
    cy.get('app-note-card').should('have.length', 3);

    // Now interact with search input
    cy.get('[data-testid="note-list-search"] input')
      .should('be.visible')
      .and('not.be.disabled');
  });

  it('should filter notes by title search', () => {
    // Wait for notes to load and UI to be ready
    cy.get('app-note-card').should('have.length', 3);

    // Give Angular a moment to finish initialization
    cy.wait(100);

    // Set search value using invoke to avoid typing issues
    cy.get('[data-testid="note-list-search"] input')
      .should('be.visible')
      .invoke('val', 'JavaScript')
      .trigger('input', { force: true });

    // Wait for filtering to complete
    cy.get('app-note-card').should('have.length', 1);
    cy.get('app-note-card').should('contain', 'JavaScript Tutorial');
  });

  it('should filter notes by partial title search', () => {
    cy.get('app-note-card').should('have.length', 3);
    cy.wait(100);

    cy.get('[data-testid="note-list-search"] input')
      .should('be.visible')
      .invoke('val', 'Tutorial')
      .trigger('input', { force: true });

    cy.get('app-note-card').should('have.length', 1);
    cy.get('app-note-card').should('contain', 'JavaScript Tutorial');
  });

  it('should filter notes by tag search', () => {
    cy.get('app-note-card').should('have.length', 3);
    cy.wait(100);

    cy.get('[data-testid="note-list-search"] input')
      .should('be.visible')
      .invoke('val', 'programming')
      .trigger('input', { force: true });

    cy.get('app-note-card').should('have.length', 2);
    cy.get('app-note-card').should('contain', 'JavaScript Tutorial');
    cy.get('app-note-card').should('contain', 'Python Basics');
  });

  it('should show no results for non-matching search', () => {
    cy.get('app-note-card').should('have.length', 3);
    cy.wait(100);

    cy.get('[data-testid="note-list-search"] input')
      .should('be.visible')
      .invoke('val', 'NonExistentTerm')
      .trigger('input', { force: true });

    cy.get('app-note-card').should('not.exist');
    cy.contains('No notes found').should('be.visible');
  });

  it('should clear search and show all notes', () => {
    cy.get('app-note-card').should('have.length', 3);
    cy.wait(100);

    cy.get('[data-testid="note-list-search"] input')
      .should('be.visible')
      .invoke('val', 'JavaScript')
      .trigger('input', { force: true });

    cy.get('app-note-card').should('have.length', 1);

    cy.get('[data-testid="note-list-search"] input')
      .invoke('val', '')
      .trigger('input', { force: true });

    cy.get('app-note-card').should('have.length', 3);
  });

  it('should search case-insensitively', () => {
    cy.get('app-note-card').should('have.length', 3);
    cy.wait(100);

    cy.get('[data-testid="note-list-search"] input')
      .should('be.visible')
      .invoke('val', 'javascript')
      .trigger('input', { force: true });

    cy.get('app-note-card').should('have.length', 1);
    cy.get('app-note-card').should('contain', 'JavaScript Tutorial');
  });
});

describe('Notes View - Tag Filtering', () => {
  before(() => {
    // Clear data once and create notes for all tests in this suite
    cy.clearAllData();
    cy.visit('/notes');

    // Seed notes directly into IndexedDB
    cy.seedNote({ title: 'Work Project A', tags: ['work', 'project', 'urgent'], duration: 0.1 });
    cy.seedNote({ title: 'Work Project B', tags: ['work', 'project'], duration: 0.1 });
    cy.seedNote({ title: 'Personal Task', tags: ['personal', 'todo'], duration: 0.1 });
    cy.seedNote({ title: 'Urgent Meeting', tags: ['meeting', 'urgent'], duration: 0.1 });
  });

  beforeEach(() => {
    // Just navigate to notes page before each test (don't recreate notes)
    cy.visit('/notes');
  });

  it('should display all unique tags', () => {
    cy.get('[data-testid="tag-filter"]').should('contain', 'work');
    cy.get('[data-testid="tag-filter"]').should('contain', 'project');
    cy.get('[data-testid="tag-filter"]').should('contain', 'urgent');
    cy.get('[data-testid="tag-filter"]').should('contain', 'personal');
    cy.get('[data-testid="tag-filter"]').should('contain', 'todo');
    cy.get('[data-testid="tag-filter"]').should('contain', 'meeting');
  });

  it('should filter notes by clicking on a tag', () => {
    cy.get('[data-testid="tag-filter"]').contains('work').click();
    cy.get('app-note-card').should('have.length', 2);
    cy.get('app-note-card').should('contain', 'Work Project A');
    cy.get('app-note-card').should('contain', 'Work Project B');
  });

  it('should filter notes by urgent tag', () => {
    cy.get('[data-testid="tag-filter"]').contains('urgent').click();
    cy.get('app-note-card').should('have.length', 2);
    cy.get('app-note-card').should('contain', 'Work Project A');
    cy.get('app-note-card').should('contain', 'Urgent Meeting');
  });

  it('should show all notes when clearing tag filter', () => {
    cy.get('[data-testid="tag-filter"]').contains('work').click();
    cy.get('app-note-card').should('have.length', 2);

    cy.get('[data-testid="clear-filters"]').click();
    cy.get('app-note-card').should('have.length', 4);
  });
});

describe('Notes View - View Modes', () => {
  before(() => {
    // Clear data once and create notes for all tests in this suite
    cy.clearAllData();
    cy.visit('/notes');

    // Seed notes directly into IndexedDB
    cy.seedNote({ title: 'Note 1', tags: ['test'], duration: 0.1 });
    cy.seedNote({ title: 'Note 2', tags: ['test'], duration: 0.1 });
    cy.seedNote({ title: 'Note 3', tags: ['test'], duration: 0.1 });
  });

  beforeEach(() => {
    // Just navigate to notes page before each test (don't recreate notes)
    cy.visit('/notes');
  });

  it('should display notes in grid view by default', () => {
    cy.get('[data-testid="notes-grid"]').should('be.visible');
  });

  it('should switch to list view', () => {
    cy.get('[data-testid="view-toggle-list"]').click();
    cy.get('[data-testid="notes-list"]').should('be.visible');
  });

  it('should switch back to grid view', () => {
    cy.get('[data-testid="view-toggle-list"]').click();
    cy.get('[data-testid="view-toggle-grid"]').click();
    cy.get('[data-testid="notes-grid"]').should('be.visible');
  });
});

describe('Notes View - Duration Display', () => {
  before(() => {
    // Clear data once and create notes with DIFFERENT durations
    cy.clearAllData();
    cy.visit('/notes');

    // Seed notes with various durations to test formatting
    cy.seedNote({ title: 'Very Short Note', tags: ['duration-test'], duration: 0.5 });   // 0:00 (rounds down)
    cy.seedNote({ title: 'One Second Note', tags: ['duration-test'], duration: 1 });     // 0:01
    cy.seedNote({ title: 'Fifteen Second Note', tags: ['duration-test'], duration: 15 }); // 0:15
    cy.seedNote({ title: 'One Minute Note', tags: ['duration-test'], duration: 60 });    // 1:00
    cy.seedNote({ title: 'Ninety Second Note', tags: ['duration-test'], duration: 90 }); // 1:30
    cy.seedNote({ title: 'Five Minute Note', tags: ['duration-test'], duration: 300 });  // 5:00
  });

  beforeEach(() => {
    // Just navigate to notes page before each test (don't recreate notes)
    cy.visit('/notes');
  });

  it('should display correct duration for very short note (< 1 second)', () => {
    cy.contains('app-note-card', 'Very Short Note').should('contain', '0:00');
  });

  it('should display correct duration for 1 second note', () => {
    cy.contains('app-note-card', 'One Second Note').should('contain', '0:01');
  });

  it('should display correct duration for 15 second note', () => {
    cy.contains('app-note-card', 'Fifteen Second Note').should('contain', '0:15');
  });

  it('should display correct duration for 1 minute note', () => {
    cy.contains('app-note-card', 'One Minute Note').should('contain', '1:00');
  });

  it('should display correct duration for 90 second note', () => {
    cy.contains('app-note-card', 'Ninety Second Note').should('contain', '1:30');
  });

  it('should display correct duration for 5 minute note', () => {
    cy.contains('app-note-card', 'Five Minute Note').should('contain', '5:00');
  });
});
