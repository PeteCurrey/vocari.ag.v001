'use client';

import React, { createContext, useContext } from 'react';
import { SurfaceType, surfaceRegisters } from '@/lib/design/tokens';

interface SurfaceContextValue {
  surface: SurfaceType;
  isConsumer: boolean;
  isPartner: boolean;
  register: typeof surfaceRegisters[SurfaceType];
}

const SurfaceContext = createContext<SurfaceContextValue>({
  surface: 'consumer',
  isConsumer: true,
  isPartner: false,
  register: surfaceRegisters.consumer,
});

export interface SurfaceProviderProps {
  surface?: SurfaceType;
  children: React.ReactNode;
}

export function SurfaceProvider({ surface = 'consumer', children }: SurfaceProviderProps) {
  const isConsumer = surface === 'consumer';
  const isPartner = surface === 'partner';
  const register = surfaceRegisters[surface];

  return (
    <SurfaceContext.Provider value={{ surface, isConsumer, isPartner, register }}>
      <div
        data-surface={surface}
        className={isConsumer ? 'bg-ivory text-charcoal text-[17px] leading-[1.65]' : 'bg-charcoal text-ivory text-[15px] leading-[1.5]'}
      >
        {children}
      </div>
    </SurfaceContext.Provider>
  );
}

export function useSurface() {
  return useContext(SurfaceContext);
}
