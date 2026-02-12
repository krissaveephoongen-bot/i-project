'use client';

import { AuthProvider as AuthProviderComponent } from '../model/useAuth';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return <AuthProviderComponent>{children}</AuthProviderComponent>;
}
