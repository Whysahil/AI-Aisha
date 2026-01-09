/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_KEY: string;
  readonly API_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      API_KEY: string;
      [key: string]: any;
    }
  }
}
