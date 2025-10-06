// FIX: The /// <reference types="vite/client" /> directive was failing because the type definition file could not be found.
// As a workaround, the essential types for Vite's client environment are explicitly defined here. This resolves the TypeScript error.

/**
 * Vite's client-side environment variables.
 * @see https://vitejs.dev/guide/env-and-mode.html#env-variables
 */
interface ImportMetaEnv {
  /** The base URL the app is served from. It is determined by the `base` config option. */
  readonly BASE_URL: string;
  /** The mode the app is running in. */
  readonly MODE: string;
  /** Whether the app is running in development. */
  readonly DEV: boolean;
  /** Whether the app is running in production. */
  readonly PROD: boolean;
  /** Whether the app is running in server-side rendering. */
  readonly SSR: boolean;

  // Custom environment variables
  readonly VITE_APP_TITLE: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
