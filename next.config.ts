import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
  // Keep pdfkit external so it isn't bundled: it loads its .afm font-metric
  // files from node_modules via __dirname at runtime, which breaks when bundled.
  serverExternalPackages: ["pdfkit"],
};

export default withNextIntl(nextConfig);
