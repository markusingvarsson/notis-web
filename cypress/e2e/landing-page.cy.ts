it('should load the home page', () => {
  cy.visit('/');
  cy.contains('Notis.nu');
  cy.get('app-hero').should('be.visible');
});

it('should have CTA button that navigates to notes', () => {
  cy.visit('/');
  cy.contains('Get Started').should('be.visible');
  cy.contains('Get Started').click();
  cy.url().should('include', '/notes/create');
});
