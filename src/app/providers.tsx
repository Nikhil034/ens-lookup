'use client';

import { ReactNode } from 'react';
import { http, createConfig, WagmiProvider } from 'wagmi';
import { mainnet } from 'wagmi/chains';

const config = createConfig({
  chains: [mainnet],
  transports: {
    [mainnet.id]: http(),
  },
})

export function Providers({ children }: { children: ReactNode }) {
  return <WagmiProvider config={config}>{children}</WagmiProvider>
}