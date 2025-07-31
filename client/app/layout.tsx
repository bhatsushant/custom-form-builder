// app/layout.tsx
import "./globals.css";
import type { Metadata } from "next";
import { FormProvider } from "./context/FormContext";
import { ThemeProvider } from "./context/ThemeContext";

export const metadata: Metadata = {
  title: "Custom Form Builder",
  description: "Create and analyze custom forms with live analytics"
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-gray-100 text-gray-900 dark:bg-gray-900 dark:text-gray-100 transition-colors duration-300">
        <ThemeProvider>
          <FormProvider>
            <div className="min-h-screen">{children}</div>
          </FormProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
