import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/app/redux';
import { setCurrentUser, setUserLoading, setUserError, clearUser } from '@/state';
import { useGetAuthUserQuery } from '@/state/api';
import { signOut } from 'aws-amplify/auth';
import { useAuthContext } from '@/app/AuthContext';
import { UserService } from '@/services/userService';

export const useAuth = () => {
  const dispatch = useAppDispatch();
  const { currentUser, isAuthenticated, isLoading, error } = useAppSelector((state) => state.user);
  const { isAuthenticated: contextAuth, isLoading: contextLoading } = useAuthContext();
  
  const { data: authData, isLoading: isAuthLoading, error: authError, refetch } = useGetAuthUserQuery({}, {
    // Skip the query if we already have user data or if not authenticated
    skip: !!currentUser || !contextAuth,
  });

  useEffect(() => {
    if (authData?.userDetails) {
      dispatch(setCurrentUser(authData.userDetails));
    }
  }, [authData, dispatch]);

  useEffect(() => {
    if (authError) {
      const errorMessage = 'error' in authError ? authError.error : 'Authentication failed';
      dispatch(setUserError(typeof errorMessage === 'string' ? errorMessage : 'Authentication failed'));
    }
  }, [authError, dispatch]);

  useEffect(() => {
    dispatch(setUserLoading(isAuthLoading));
  }, [isAuthLoading, dispatch]);

  const logout = async () => {
    try {
      await signOut();
      dispatch(clearUser());
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const refreshUser = async () => {
    try {
      const userDetails = await UserService.syncUserData();
      if (userDetails) {
        dispatch(setCurrentUser(userDetails));
      }
    } catch (error) {
      console.error('Error refreshing user:', error);
    }
  };

  return {
    user: currentUser,
    isAuthenticated: isAuthenticated || contextAuth,
    isLoading: isLoading || isAuthLoading || contextLoading,
    error,
    logout,
    refreshUser,
  };
}; 