import { mergeTests } from '@playwright/test';
import type { LoginCredentials } from '@po/login.page';
import { test as pagesTest } from '@fx/ui/pages.fixture';
import { test as dataTest } from '@fx/ui/data.fixture';
import { test as networkTest } from '@fx/ui/network.fixture';

type AuthFacade = {
  loginAs(credentials: LoginCredentials): Promise<void>;
  loginAsStandardUser(): Promise<void>;
};

type AuthFixture = {
  auth: AuthFacade;
};

const mergedBase = mergeTests(pagesTest, dataTest, networkTest);

export const test = mergedBase.extend<AuthFixture>({
  auth: async ({ loginPage, productsPage, users }, use) => {
    const loginAs = async (credentials: LoginCredentials): Promise<void> => {
      await loginPage.open();
      await loginPage.loginAs(credentials);
      await productsPage.waitUntilLoaded();
    };

    await use({
      loginAs,
      loginAsStandardUser: async () => loginAs(users.standard),
    });
  },
});
