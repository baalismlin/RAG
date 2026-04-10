/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: [
      "chromadb",
      "pdf-parse",
      "tree-sitter",
      "tree-sitter-typescript",
      "tree-sitter-javascript",
      "tree-sitter-python",
    ],
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals = [
        ...(config.externals || []),
        "chromadb",
        "chromadb-default-embed",
        "@xenova/transformers",
        "tree-sitter",
        "tree-sitter-typescript",
        "tree-sitter-javascript",
        "tree-sitter-python",
      ]
    }
    return config
  },
}

module.exports = nextConfig
