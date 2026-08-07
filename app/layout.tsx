import type { Metadata } from 'next';
import { Inter_Tight, Instrument_Serif, JetBrains_Mono } from 'next/font/google';
import '@/app/globals.css';
import { MotionProvider } from '@/components/providers/MotionProvider';
import { SurfaceProvider } from '@/lib/surface/SurfaceContext';

const interTight = Inter_Tight({
  subsets: ['latin'],
  variable: '--font-inter-tight',
  display: 'swap',
});

const instrumentSerif = Instrument_Serif({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-instrument-serif',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Vocari — Clear Pathways from £0 to Qualified',
  description: 'UK careers pathway platform providing transparent costs, qualifications, and funding routes.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${interTight.variable} ${instrumentSerif.variable} ${jetbrainsMono.variable}`}
    >
      <body className="bg-ivory text-charcoal antialiased min-h-screen">
        <MotionProvider>
          <SurfaceProvider surface="consumer">
            {children}
          </SurfaceProvider>
        </MotionProvider>
      </body>
    </html>
  );
}
