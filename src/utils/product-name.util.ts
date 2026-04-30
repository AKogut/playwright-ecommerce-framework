export const toProductSlug = (productName: string): string =>
  productName.trim().toLowerCase().replace(/\s+/g, '-');
