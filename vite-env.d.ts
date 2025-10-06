/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_TITLE: string
  // FIX: Removed redundant declaration of BASE_URL as it is already provided by "vite/client" and was causing a type error.
  // more env variables...
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
