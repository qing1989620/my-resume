/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // ⚠️ 警告：允许生产环境构建成功，即使存在 ESLint 错误。
    ignoreDuringBuilds: true,
  },
  typescript: {
    // ⚠️ 警告：允许生产环境构建成功，即使存在 TypeScript 错误。
    ignoreBuildErrors: true,
  },
};

module.exports = nextConfig;
// 如果你的文件叫 next.config.mjs，最后一行请改成：export default nextConfig;