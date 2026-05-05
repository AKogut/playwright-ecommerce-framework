export const productsSelectors = {
  root: '#inventory_container',
  title: '.title',
  inventoryList: '.inventory_list',
  inventoryItems: '.inventory_item',
  cartLink: '.shopping_cart_link',
  menuButton: '#react-burger-menu-btn',
  logoutLink: '#logout_sidebar_link',
  addToCartButton: (productSlug: string): string => '[data-test="add-to-cart-' + productSlug + '"]',
  removeFromCartButton: (productSlug: string): string => '[data-test="remove-' + productSlug + '"]',
} as const;
