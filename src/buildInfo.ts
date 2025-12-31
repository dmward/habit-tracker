// This file is auto-generated during build
// Build information for debugging and version tracking

export interface BuildInfo {
  version: string;
  buildId: string;
  buildDate: string;
  gitBranch: string;
  gitCommit: string;
  environment: string;
}

export const buildInfo: BuildInfo = {
  version: import.meta.env.VITE_APP_VERSION || '0.0.0',
  buildId: import.meta.env.VITE_BUILD_ID || 'dev',
  buildDate: import.meta.env.VITE_BUILD_DATE || new Date().toISOString(),
  gitBranch: import.meta.env.VITE_GIT_BRANCH || 'unknown',
  gitCommit: import.meta.env.VITE_GIT_COMMIT || 'unknown',
  environment: import.meta.env.MODE,
};
