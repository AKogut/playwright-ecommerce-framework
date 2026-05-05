export const cartSelectors = {
  root: '#cart_contents_container',
  title: '.title',
  itemNames: '.inventory_item_name',
  checkoutButton: '[data-test="checkout"]',
  removeButton: (productSlug: string): string => '[data-test="remove-' + productSlug + '"]',
} as const;
