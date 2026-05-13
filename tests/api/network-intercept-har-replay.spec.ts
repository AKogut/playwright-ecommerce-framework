import { test, expect } from '@fx/ui';

test('network intercept can replay responses from HAR @regression', async ({ page, network }) => {
  await page.goto('/');

  await network.replayHar('tests/api/fixtures/mock-products.har', {
    notFound: 'fallback',
    url: /\/api\/test-har-products$/,
  });

  const mockedResponse = await page.evaluate(async () => {
    const response = await fetch('/api/test-har-products', {
      headers: {
        accept: 'application/json',
      },
    });
    return response.json();
  });

  expect(mockedResponse).toEqual({
    items: [{ id: 'har-1', name: 'HAR Backpack' }],
    source: 'har',
  });
});
