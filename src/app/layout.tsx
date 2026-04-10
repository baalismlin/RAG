import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "Local RAG System",
  description: "A local RAG system for document and code Q&A",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
