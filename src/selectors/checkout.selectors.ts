export const checkoutSelectors = {
  title: '.title',
  firstNameInput: '[data-test="firstName"]',
  lastNameInput: '[data-test="lastName"]',
  postalCodeInput: '[data-test="postalCode"]',
  continueButton: '[data-test="continue"]',
  finishButton: '[data-test="finish"]',
  errorMessage: '[data-test="error"]',
  totalLabel: '[data-test="total-label"]',
  completeHeader: '[data-test="complete-header"]',
} as const;
