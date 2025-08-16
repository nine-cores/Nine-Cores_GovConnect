import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import "./globals.css"
import { LanguageProvider } from "../contexts/LanguageContext"
import { Toaster } from "@/components/ui/toaster";

export const metadata: Metadata = {
  title: "GovConnect",
  description: "A platform to connect citizens with government services",
  generator: "GovConnect",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <style>{`
html {
  font-family: ${GeistSans.style.fontFamily};
  --font-sans: ${GeistSans.variable};
  --font-mono: ${GeistMono.variable};
}
        `}</style>
      </head>
      <body suppressHydrationWarning={true}>
        <LanguageProvider>{children}</LanguageProvider>
        <Toaster />
      </body>
    </html>
  )
}
