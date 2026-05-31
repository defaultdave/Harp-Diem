/// <reference types="vite/client" />

interface ImportMetaEnv {
  /**
   * Sentry DSN. When set at build time, runtime errors are forwarded to Sentry.
   * Leave unset to fully tree-shake Sentry out of the bundle.
   */
  readonly VITE_SENTRY_DSN?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
