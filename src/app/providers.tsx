'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import { SessionProvider } from 'next-auth/react';
import { Toaster } from 'sonner';

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
      <SessionProvider>
        <QueryClientProvider client={queryClient}>
          {children}
          <Toaster position="top-right" richColors />
        </QueryClientProvider>
      </SessionProvider>
  );
}
