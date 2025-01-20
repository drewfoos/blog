import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "./components/theme-provider";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import { cn } from "@/lib/utils";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Andrew's Blog",
  description: "Exploring technology, development, and digital insights",
  keywords: [
    "blog",
    "technology",
    "development",
    "web development",
    "programming",
  ],
  authors: [{ name: "Andrew" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          inter.className
        )}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div className="relative flex min-h-screen flex-col">
            <Navbar />
            <main className="flex-1 pt-24">
              <div className="container mx-auto px-4 lg:px-8 max-w-7xl">
                {children}
              </div>
            </main>
            <Footer />
          </div>
          <Toaster
            toastOptions={{
              className: "bg-primary text-white", // Tailwind classes for primary color
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
