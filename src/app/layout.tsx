import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import "./globals.css";
import AuthProvider from "@/context/authProvider";
import  ThemeProvider  from "@/context/ThemeProvider";
import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/toast";

const inter = Inter({subsets:['latin'],variable:'--font-sans'});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Unfiltered.txt",
  description: "get your anonymous review",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={cn("h-full", "antialiased", geistSans.variable, geistMono.variable, "font-sans", inter.variable)}
      suppressHydrationWarning
    >
      <body className="h-full">
        <AuthProvider>
          <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <div className="flex h-screen flex-col overflow-hidden">
          <main className="flex-1 overflow-y-auto scroll-smooth">
            {children}
          </main>
          <Toaster/>
          </div>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
