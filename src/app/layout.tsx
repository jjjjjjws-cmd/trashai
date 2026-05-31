import type { Metadata } from 'next';
import { ClerkProvider } from '@clerk/nextjs';
import { koKR } from '@clerk/localizations';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] });
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] });

export const metadata: Metadata = {
  title: '폐급 AI — 설명 검증형 학습 플랫폼',
  description: 'AI를 가르치면서 내 이해를 검증한다',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider localization={koKR}>
      <html lang="ko">
        <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
