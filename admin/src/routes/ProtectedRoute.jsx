import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated, selectCurrentUser } from '../features/auth/authSlice';
import { Result } from 'antd';

// Guards routes: unauthenticated → /login; authenticated but lacking an allowed
// role → an inline 403. `allowedRoles` omitted means any signed-in staff.
export default function ProtectedRoute({ children, allowedRoles }) {
  const isAuthed = useSelector(selectIsAuthenticated);
  const user = useSelector(selectCurrentUser);
  const location = useLocation();

  if (!isAuthed) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return (
      <Result
        status="403"
        title="403"
        subTitle="You don't have permission to view this page."
      />
    );
  }

  return children;
}
