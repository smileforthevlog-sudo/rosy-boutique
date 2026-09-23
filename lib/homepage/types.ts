export type HomepageImage = {
  path: string | null;
  signedUrl: string | null;
};

export type HomepageItem = {
  id: string;
  key: string;
  eyebrow: string | null;
  title: string;
  subtitle: string | null;
  ctaLabel: string | null;
  ctaHref: string | null;
  image: HomepageImage;
  active: boolean;
  sortOrder: number;
};

export type HomepageSection = {
  id: string;
  key: string;
  sectionType: string;
  eyebrow: string | null;
  heading: string | null;
  body: string | null;
  ctaLabel: string | null;
  ctaHref: string | null;
  image: HomepageImage;
  active: boolean;
  sortOrder: number;
  items: HomepageItem[];
};

export function isSafeContentHref(href: string | null) {
  if (!href) return true;
  if (href.startsWith("/") && !href.startsWith("//")) return true;
  if (/^#[A-Za-z][A-Za-z0-9_-]*$/.test(href)) return true;

  try {
    return new URL(href).protocol === "https:";
  } catch {
    return false;
  }
}

export function safeContentHref(href: string | null, fallback = "/") {
  return href && isSafeContentHref(href) ? href : fallback;
}