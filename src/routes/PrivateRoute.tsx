import type { JSX } from 'react';
import { Navigate } from 'react-router-dom';

interface Props {
  children: JSX.Element;
  roles?: string[];
}

export default function PrivateRoute({ children, roles }: Props) {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  if (!token) return <Navigate to="/login" />;
  if (roles && !roles.includes(role || '')) return <Navigate to="/" />;

  return children;
}