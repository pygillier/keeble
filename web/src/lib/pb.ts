import PocketBase from 'pocketbase';

// Server-side uses POCKETBASE_URL; client-side uses NEXT_PUBLIC_POCKETBASE_URL
const POCKETBASE_URL =
  (typeof window === 'undefined'
    ? process.env.POCKETBASE_URL
    : process.env.NEXT_PUBLIC_POCKETBASE_URL) ?? 'http://localhost:8090';

// Client-side singleton — reused across renders to preserve auth state and realtime subs
let _clientPb: PocketBase | undefined;

/**
 * Returns a PocketBase client.
 * - Server: fresh instance per call (avoids shared auth state between requests)
 * - Browser: singleton instance (preserves auth + realtime subscriptions)
 */
export function getPb(): PocketBase {
  if (typeof window === 'undefined') {
    return new PocketBase(POCKETBASE_URL);
  }
  if (!_clientPb) {
    _clientPb = new PocketBase(POCKETBASE_URL);
  }
  return _clientPb;
}
