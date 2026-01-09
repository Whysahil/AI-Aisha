interface ImportMetaEnv {
  readonly VITE_API_KEY: string;
  readonly API_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// Augment the NodeJS namespace to ensure API_KEY is recognized on process.env.
// This avoids redeclaring 'process' which causes a conflict with existing definitions (e.g. from @types/node).
declare namespace NodeJS {
  interface ProcessEnv {
    API_KEY: string;
    [key: string]: any;
  }
}
