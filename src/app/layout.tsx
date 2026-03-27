import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getMessages } from 'next-intl/server';
import { ThemeProvider } from "@/core/providers/ThemeProvider";
import { ChatWidget } from '@/modules/chat/components/ChatWidget';
import "./globals.css";
import "@/core/design-system/tokens.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ProjectJ - Dashboard",
  description: "Sistema de gestión empresarial",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <NextIntlClientProvider messages={messages} locale={locale}>
            {children}
            <ChatWidget />
          </NextIntlClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
