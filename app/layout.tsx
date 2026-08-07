import type { Metadata } from 'next';
import { Space_Grotesk, DM_Serif_Display, JetBrains_Mono } from 'next/font/google';
import '@/app/globals.css';
import { MotionProvider } from '@/components/providers/MotionProvider';
import { SurfaceProvider } from '@/lib/surface/SurfaceContext';

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
  display: 'swap',
  weight: ['300', '400', '500', '600', '700'],
});

const dmSerifDisplay = DM_Serif_Display({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-dm-serif',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
  weight: ['300', '400', '500'],
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
      className={`${spaceGrotesk.variable} ${dmSerifDisplay.variable} ${jetbrainsMono.variable}`}
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
