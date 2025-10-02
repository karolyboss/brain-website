import type { Metadata } from "next";
import "./globals.css";
import "./navbar.css";
import { WalletAdapterProvider } from "@/components/WalletAdapterProvider";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "BrainRot | $ROT Memecoin",
  description: "Join the BrainRot revolution! Buy $ROT tokens in presale with bonuses.",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0" />
      </head>
      <body>
        <WalletAdapterProvider>
          <Navbar />
          <main style={{
            padding: '1rem',
            maxWidth: '100%',
            overflowX: 'hidden',
            margin: '0 auto'
          }}>
            {children}
          </main>
        </WalletAdapterProvider>
      </body>
    </html>
  );
}