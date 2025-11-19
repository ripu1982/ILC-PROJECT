import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthProvider';


export const PrivateRoute: React.FC<{ children: React.ReactElement }> = ({ children }) => {
const { user, loading } = useAuth();
if (loading) return <div />; // or a spinner
if (!user) return <Navigate to="/login" replace />;
return children;
};