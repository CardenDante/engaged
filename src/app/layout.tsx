import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Engaged",
  description: "Church youth enrollment and matching system",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Engaged",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#f2f2f7",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <main className="mx-auto max-w-[430px] min-h-screen relative">
          {children}
        </main>
      </body>
    </html>
  );
}
