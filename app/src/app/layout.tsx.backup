import type { Metadata } from "next";
import "./navbar.css";
import "./mobile-fixes.css";
import { WalletAdapterProvider } from "@/components/WalletAdapterProvider";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "BrainRot | $ROT Memecoin",
  description: "Join the BrainRot revolution! Buy $ROT tokens in presale with bonuses."
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
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