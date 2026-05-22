import AxeBuilder from '@axe-core/playwright';
import { test, expect } from '@fx/ui';

test('login page has no serious accessibility violations @smoke @accessibility', async ({
  loginPage,
}, testInfo) => {
  await loginPage.open();

  const accessibilityScanResults = await new AxeBuilder({ page: loginPage.page })
    .include('[data-test="login-container"]')
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze();

  const blockingViolations = accessibilityScanResults.violations.filter(
    ({ impact }) => impact === 'critical' || impact === 'serious',
  );

  await testInfo.attach('axe-blocking-violations', {
    body: JSON.stringify(blockingViolations, null, 2),
    contentType: 'application/json',
  });

  expect(blockingViolations, JSON.stringify(blockingViolations, null, 2)).toEqual([]);
});
