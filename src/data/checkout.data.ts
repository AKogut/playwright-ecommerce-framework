import type { CheckoutData } from '@po/checkout.page';

export const VALID_CHECKOUT_DATA: CheckoutData = {
  firstName: 'Test',
  lastName: 'User',
  postalCode: '12345',
};

export const INVALID_CHECKOUT_DATA = {
  missingFirstName: {
    firstName: '',
    lastName: 'User',
    postalCode: '12345',
  },
  missingLastName: {
    firstName: 'Test',
    lastName: '',
    postalCode: '12345',
  },
  missingPostalCode: {
    firstName: 'Test',
    lastName: 'User',
    postalCode: '',
  },
} as const satisfies Record<string, CheckoutData>;

type FakerLike = {
  person: {
    firstName: () => string;
    lastName: () => string;
  };
  location: {
    zipCode: (format?: string) => string;
  };
};

type DynamicFakerModule = {
  faker: FakerLike;
};

let fakerModulePromise: Promise<DynamicFakerModule> | null = null;

const getFaker = async (): Promise<FakerLike> => {
  if (!fakerModulePromise) {
    fakerModulePromise = import('@faker-js/faker') as Promise<DynamicFakerModule>;
  }

  const fakerModule = await fakerModulePromise;
  return fakerModule.faker;
};

export const createRandomCheckoutData = async (
  overrides?: Partial<CheckoutData>,
): Promise<CheckoutData> => {
  const faker = await getFaker();

  return {
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
    postalCode: faker.location.zipCode('#####'),
    ...overrides,
  };
};
