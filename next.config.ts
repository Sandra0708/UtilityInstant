import type { NextConfig } from 'next';

// Metadata is local and inexpensive. Send it in the initial document head so
// crawlers can read canonical URLs and language alternatives without rendering JS.
const nextConfig: NextConfig = {htmlLimitedBots: /.*/};

export default nextConfig;
