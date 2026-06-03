export const SITE_URL = 'https://www.coldstonesoap.com';
export const SITE_NAME = 'Coldstone Soap Co.';
export const SITE_DESCRIPTION =
  'Handcrafted cold process soap. Veteran owned. Small batch. Minimal ingredients. Made in the USA.';
export const CONTACT_EMAIL = 'hello@coldstonesoapco.com';

export interface BreadcrumbItem {
  name: string;
  path: string;
}

export interface ItemListEntry {
  name: string;
  url: string;
}

export function absoluteUrl(path = '/') {
  return new URL(path, SITE_URL).toString();
}

export function canonicalPath(path = '/') {
  return path;
}

export function breadcrumbSchema(items: BreadcrumbItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function itemListSchema(name: string, items: ItemListEntry[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name,
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      url: item.url,
    })),
  };
}
