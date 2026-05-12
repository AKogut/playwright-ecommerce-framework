import { test, expect } from '@fx/ui';

test('network intercept can use custom route handler @regression', async ({
  auth,
  page,
  network,
}) => {
  await auth.loginAsStandardUser();

  await network.mock('**/api/test-echo', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        method: route.request().method(),
        url: route.request().url(),
      }),
    });
  });

  const mockedResponse = await page.evaluate(async () => {
    const response = await fetch('/api/test-echo', {
      method: 'POST',
    });
    return (await response.json()) as { method: string; url: string };
  });

  expect(mockedResponse.method).toBe('POST');
  expect(mockedResponse.url).toContain('/api/test-echo');
});
