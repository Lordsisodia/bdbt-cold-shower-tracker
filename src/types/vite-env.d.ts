/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_ANON_KEY: string
  // API keys are handled server-side for security
  // API keys are handled server-side for security
  // more env variables...
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}