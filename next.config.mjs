/** @type {import('next').NextConfig} */
const isGithubPages = process.env.GITHUB_ACTIONS === "true" || process.env.NEXT_EXPORT === "true";

const nextConfig = {
  output: "export",
  basePath: isGithubPages ? "/Cineapp" : "",
  images: {

    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
};

export default nextConfig;

