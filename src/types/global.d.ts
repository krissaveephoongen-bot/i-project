// Global TypeScript declarations
interface ProcessEnv {
  [key: string]: string | undefined;
}

declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV: 'development' | 'production' | 'test';
    // Add other environment variables as needed
  }
  interface Process {
    env: ProcessEnv;
    version: string;
    platform: string;
  }
  let process: Process;
}

declare const process: NodeJS.Process;
