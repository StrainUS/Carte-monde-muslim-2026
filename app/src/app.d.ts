declare global {
  namespace App {}
}

declare module '*.json' {
  const value: unknown;
  export default value;
}

export {};
