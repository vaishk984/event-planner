/**
 * Next.js Instrumentation Hook
 * Runs once when the server starts (both Node.js and Edge runtimes)
 *
 * Used here to set NODE_TLS_REJECT_UNAUTHORIZED for local development
 * when behind a corporate firewall/proxy that intercepts HTTPS.
 */
export async function register() {
  if (process.env.NODE_ENV === 'development') {
    // Only disable TLS verification in development
    // This fixes UNABLE_TO_GET_ISSUER_CERT_LOCALLY errors
    // caused by corporate firewalls intercepting HTTPS traffic
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'
  }
}
