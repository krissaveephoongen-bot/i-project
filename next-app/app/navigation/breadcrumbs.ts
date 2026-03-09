import { getAppNavigation } from "./config";

type Crumb = { label: string; href?: string };

export function buildBreadcrumbs(pathname: string, t: (k: string, d?: string) => string): Crumb[] {
  const nav = getAppNavigation(t);
  const items: Array<{ href: string; name: string; parent?: { href: string; name: string } }> = [];
  nav.forEach(section => {
    section.items.forEach(item => {
      if (item.href) {
        items.push({ href: item.href, name: item.name || "" });
      }
      if (item.children && item.children.length > 0) {
        item.children.forEach(child => {
          items.push({
            href: child.href,
            name: child.name || "",
            parent: item.href ? { href: item.href, name: item.name || "" } : undefined,
          });
        });
      }
    });
  });

  const best = items
    .filter(x => x.href && x.href !== "/" && pathname.startsWith(x.href))
    .sort((a, b) => b.href.length - a.href.length)[0];

  if (!best) return [];

  const crumbs: Crumb[] = [];
  if (best.parent) {
    crumbs.push({ label: best.parent.name, href: best.parent.href });
  }
  crumbs.push({ label: best.name });
  return crumbs;
}
