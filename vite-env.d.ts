
interface ImportMetaEnv {
  readonly VITE_API_KEY: string;
  readonly API_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// Removed conflicting `declare var process` to fix "Cannot redeclare block-scoped variable" error.
// The process variable is already declared by @types/node.
// Removed `/// <reference types="vite/client" />` as the type definition file was not found.
