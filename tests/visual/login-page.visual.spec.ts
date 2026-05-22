import { test, expect } from '@fx/ui';

test('critical login page visual baseline @visual', async ({ loginPage }) => {
  // eslint-disable-next-line playwright/no-conditional-in-test
  if (process.env.RUN_VISUAL_TESTS !== 'true') {
    test.info().annotations.push({
      type: 'visual',
      description: 'Opt-in check. Run npm run test:visual or npm run test:visual:update.',
    });
    return;
  }

  await loginPage.open();

  await expect(loginPage.page).toHaveScreenshot('login-page.png', {
    fullPage: true,
    maxDiffPixelRatio: 0.01,
  });
});
