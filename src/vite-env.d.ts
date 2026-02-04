/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_EMBEDAPI_KEY: string
  readonly VITE_EMBED_API_KEY?: string // Legacy support
  readonly VITE_FIREBASE_API_KEY: string
  readonly VITE_FIREBASE_AUTH_DOMAIN: string
  readonly VITE_FIREBASE_PROJECT_ID: string
  readonly VITE_FIREBASE_STORAGE_BUCKET: string
  readonly VITE_FIREBASE_MESSAGING_SENDER_ID: string
  readonly VITE_FIREBASE_APP_ID: string
  readonly VITE_CASPER_NETWORK: string
  readonly VITE_SUI_CLOUD_KEY: string
  readonly VITE_WISE_LENDING_CONTRACT_HASH: string
  readonly VITE_FERRUM_API_KEY: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

