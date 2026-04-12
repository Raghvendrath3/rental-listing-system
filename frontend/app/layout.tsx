import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import { Suspense } from "react";
import { AuthProvider } from "@/contexts/AuthContext";
import { ToastProvider } from "@/contexts/ToastContext";
import ToastContainer from "@/components/Toast/ToastContainer";
import Navbar from "@/components/Navbar";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Rental Listing System",
  description: "Find and list rental properties",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Phantom-UI Skeleton Loader Library */}
        <Script
          src="https://unpkg.com/phantom-ui/dist/phantom.min.js"
          strategy="afterInteractive"
          type="module"
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ToastProvider>
          <AuthProvider>
            <Navbar />
            <ToastContainer />
            <Suspense fallback={<div className="p-8">Loading...</div>}>
              {children}
            </Suspense>
          </AuthProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
