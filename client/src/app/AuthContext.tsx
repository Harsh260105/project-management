"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { fetchAuthSession, getCurrentUser, AuthUser } from 'aws-amplify/auth';
import { useAppDispatch } from './redux';
import { setCurrentUser, setUserLoading, setUserError, clearUser } from '@/state';
import { UserService } from '@/services/userService';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: AuthUser | null;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  isLoading: true,
  user: null,
});

export const useAuthContext = () => useContext(AuthContext);

export const AuthContextProvider = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<AuthUser | null>(null);
  const dispatch = useAppDispatch();

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        setIsLoading(true);
        const session = await fetchAuthSession();
        
        if (session.tokens) {
          const currentUser = await getCurrentUser();
          setIsAuthenticated(true);
          setUser(currentUser);
          
          // Sync user data with database
          try {
            const userDetails = await UserService.syncUserData();
            if (userDetails) {
              dispatch(setCurrentUser(userDetails));
            }
          } catch (syncError) {
            console.error('Error syncing user data:', syncError);
            dispatch(setUserError('Failed to sync user data'));
          }
        } else {
          setIsAuthenticated(false);
          setUser(null);
          dispatch(clearUser());
        }
      } catch (error) {
        console.log('No active session');
        setIsAuthenticated(false);
        setUser(null);
        dispatch(clearUser());
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, [dispatch]);

  const value = {
    isAuthenticated,
    isLoading,
    user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 