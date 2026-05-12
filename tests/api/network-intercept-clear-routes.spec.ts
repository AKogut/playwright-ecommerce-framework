import { test, expect } from '@fx/ui';

test('network intercept can clear routes and apply a new mock @regression', async ({
  page,
  network,
}) => {
  await page.goto('/');

  await network.mockJson('**/api/test-clear-routes', {
    version: 'before-clear',
  });

  await network.clearRoutes();

  await network.mockJson('**/api/test-clear-routes', {
    version: 'after-clear',
  });

  const mockedResponse = await page.evaluate(async () => {
    const response = await fetch('/api/test-clear-routes');
    return response.json();
  });

  expect(mockedResponse).toEqual({
    version: 'after-clear',
  });
});
