/**
 * Amazon Associates store ID (tracking tag) for amazon.in. Every outbound Amazon link must carry
 * it, or clicks and sales are not credited to this account. Set AMAZON_ASSOCIATES_TAG in
 * wrangler.jsonc / .env.local to override; this default is the account's main store ID.
 */
export const DEFAULT_AMAZON_ASSOCIATES_TAG = "dealfinder025-21";

export function getAmazonAssociatesTag(): string {
  return (
    process.env.AMAZON_ASSOCIATES_TAG ||
    process.env.NEXT_PUBLIC_AMAZON_TAG ||
    DEFAULT_AMAZON_ASSOCIATES_TAG
  );
}
