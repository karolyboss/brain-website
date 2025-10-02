'use client';

import DegenDodge from '@/components/DegenDodge';
import Head from 'next/head';

export default function MiniGamePage() {
  return (
    <>
      <Head>
        <title>Degen Dodge - $ROT Token Game</title>
        <meta name="description" content="Dodge brain-rotting items and collect $ROT tokens in this fun mini-game!" />
      </Head>
      <main className="min-h-screen bg-gradient-to-b from-purple-900 to-indigo-900">
        <DegenDodge />
      </main>
    </>
  );
}
