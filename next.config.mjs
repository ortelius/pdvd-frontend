import { fileURLToPath } from 'url'
import { dirname } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {},
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? { exclude: ['error', 'warn'] } : false,
  },
  webpack: (config) => {
    config.resolve.alias['@'] = __dirname
    return config
  },
  // Next.js 16 automatically respects browserslist config
  // With your modern browser targets, no polyfills will be added for ES2022+ features
}

export default nextConfig
