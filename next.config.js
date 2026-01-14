/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // keep default settings; client app is located in ./client
  // No special config required for now
  webpack: (config, { dev }) => {
    // Avoid using eval-based devtool (which triggers CSP 'unsafe-eval' errors in browsers).
    // Use a non-eval source map in development to keep browser CSP strict.
    if (dev) {
      config.devtool = 'source-map';
    }
    return config;
  },
};

export default nextConfig;
