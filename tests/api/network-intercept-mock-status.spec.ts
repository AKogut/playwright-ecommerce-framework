import { test, expect } from '@fx/ui';

test('network intercept can mock status and headers @regression', async ({ auth, page, network }) => {
  await auth.loginAsStandardUser();

  await network.mockJson(
    '**/api/test-unavailable',
    { message: 'Service temporarily unavailable' },
    {
      status: 503,
      headers: {
        'x-mock-source': 'playwright',
      },
    },
  );

  const mockedResponse = await page.evaluate(async () => {
    const response = await fetch('/api/test-unavailable');
    const body = (await response.json()) as { message: string };

    return {
      status: response.status,
      mockHeader: response.headers.get('x-mock-source'),
      message: body.message,
    };
  });

  expect(mockedResponse).toEqual({
    status: 503,
    mockHeader: 'playwright',
    message: 'Service temporarily unavailable',
  });
});
