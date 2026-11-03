/**
 * Decides which listing page a filter change should navigate to.
 *
 * - On /search, or whenever a text query is active, stay on the search page so
 *   the query is kept and the category simply narrows the results.
 * - Otherwise a chosen category opens its dedicated /category/[slug] page.
 * - Clearing the category ("All Categories") from a category page goes back to
 *   /products instead of staying on the old category page.
 */
export function resolveCategoryNavigationPath(
  pathname: string,
  nextCategory: string | null | undefined,
  hasTextQuery: boolean
): string {
  if (pathname.startsWith("/search")) return "/search";
  if (hasTextQuery) return pathname.startsWith("/products") ? "/products" : "/search";
  if (nextCategory && nextCategory !== "all") return `/category/${nextCategory}`;
  return "/products";
}
