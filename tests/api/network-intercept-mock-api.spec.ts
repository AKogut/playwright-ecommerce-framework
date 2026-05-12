import { test, expect } from '@fx/ui';

test('network intercept can mock API response @regression', async ({ page, network }) => {
  await page.goto('/');

  await network.mockJson('**/api/test-products', {
    items: [{ id: 'mock-1', name: 'Mock Backpack' }],
  });

  const mockedResponse = await page.evaluate(async () => {
    const response = await fetch('/api/test-products');
    return response.json();
  });

  expect(mockedResponse).toEqual({
    items: [{ id: 'mock-1', name: 'Mock Backpack' }],
  });

  await network.clearRoutes();
});
