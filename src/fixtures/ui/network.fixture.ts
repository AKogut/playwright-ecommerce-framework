import { test as base } from '@playwright/test';
import type { Page, Route } from '@playwright/test';

type RouteMatcher = Parameters<Page['route']>[0];
type RouteHandler = (route: Route) => Promise<void> | void;

type MockJsonOptions = {
  status?: number;
  headers?: Record<string, string>;
  once?: boolean;
};

type HarReplayOptions = {
  notFound?: 'abort' | 'fallback';
  url?: string | RegExp;
  update?: boolean;
};

type NetworkFacade = {
  mockJson(routeMatcher: RouteMatcher, body: unknown, options?: MockJsonOptions): Promise<void>;
  mock(routeMatcher: RouteMatcher, handler: RouteHandler): Promise<void>;
  replayHar(harPath: string, options?: HarReplayOptions): Promise<void>;
  clearRoutes(): Promise<void>;
};

type NetworkFixture = {
  network: NetworkFacade;
};

export const test = base.extend<NetworkFixture>({
  network: async ({ page }, use) => {
    const mock = async (routeMatcher: RouteMatcher, handler: RouteHandler): Promise<void> => {
      await page.route(routeMatcher, handler);
    };

    const mockJson = async (
      routeMatcher: RouteMatcher,
      body: unknown,
      options: MockJsonOptions = {},
    ): Promise<void> => {
      const { status = 200, headers = {}, once = false } = options;

      await page.route(
        routeMatcher,
        async (route) => {
          await route.fulfill({
            status,
            contentType: 'application/json',
            headers: {
              ...headers,
            },
            body: JSON.stringify(body),
          });
        },
        { times: once ? 1 : undefined },
      );
    };

    const replayHar = async (harPath: string, options: HarReplayOptions = {}): Promise<void> => {
      await page.routeFromHAR(harPath, {
        notFound: options.notFound ?? 'fallback',
        url: options.url,
        update: options.update ?? false,
      });
    };

    const clearRoutes = async (): Promise<void> => {
      await page.unrouteAll({ behavior: 'ignoreErrors' });
    };

    await use({
      mockJson,
      mock,
      replayHar,
      clearRoutes,
    });
  },
});
