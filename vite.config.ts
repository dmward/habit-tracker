import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { execSync } from 'child_process'
import { readFileSync } from 'fs'

// Get build metadata
const getGitCommit = () => {
  try {
    return execSync('git rev-parse --short HEAD').toString().trim()
  } catch {
    return 'unknown'
  }
}

const getGitBranch = () => {
  try {
    return execSync('git rev-parse --abbrev-ref HEAD').toString().trim()
  } catch {
    return 'unknown'
  }
}

const getAppVersion = () => {
  try {
    const packageJson = JSON.parse(readFileSync('./package.json', 'utf-8'))
    return packageJson.version
  } catch {
    return '0.0.0'
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    'import.meta.env.VITE_BUILD_ID': JSON.stringify(getGitCommit()),
    'import.meta.env.VITE_BUILD_DATE': JSON.stringify(new Date().toISOString()),
    'import.meta.env.VITE_GIT_COMMIT': JSON.stringify(getGitCommit()),
    'import.meta.env.VITE_GIT_BRANCH': JSON.stringify(getGitBranch()),
    'import.meta.env.VITE_APP_VERSION': JSON.stringify(getAppVersion()),
  },
})
