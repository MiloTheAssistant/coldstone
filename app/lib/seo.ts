export const SITE_URL = 'https://www.coldstonesoap.com';
export const SITE_NAME = 'Coldstone Soap Co.';
export const SITE_DESCRIPTION =
  'Handcrafted cold process soap. Veteran owned. Small batch. Minimal ingredients. Made in the USA.';
export const CONTACT_EMAIL = 'hello@coldstonesoapco.com';

export function absoluteUrl(path = '/') {
  return new URL(path, SITE_URL).toString();
}

export function canonicalPath(path = '/') {
  return path;
}
