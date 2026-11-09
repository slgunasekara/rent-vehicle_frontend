import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAppSelector } from '../store';
import { Role } from '../types';
import { Spinner } from '../components/common/ui';

export const homeFor = (role?: Role): string => (role === 'admin' ? '/admin' : '/');

/** signed-in only (optionally for certain roles): visitors are sent to the sign-in page and come back here afterwards */
export function RequireRole({ roles, children }: { roles?: Role[]; children: ReactNode }) {
  const { user, initialised } = useAppSelector((s) => s.auth);
  const loc = useLocation();
  if (!initialised) return <Spinner />;
  if (!user) return <Navigate to="/login" replace state={{ from: loc.pathname + loc.search }} />;
  if (roles && !roles.includes(user.role)) return <Navigate to={homeFor(user.role)} replace />;
  return <>{children}</>;
}
