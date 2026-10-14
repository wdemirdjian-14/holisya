'use client';
import { SessionProvider } from 'next-auth/react';
import { ThemeProvider } from '@/components/theme-provider';
import { BookingModeProvider } from '@/components/booking-mode';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false} disableTransitionOnChange>
        <BookingModeProvider>{children}</BookingModeProvider>
      </ThemeProvider>
    </SessionProvider>
  );
}
