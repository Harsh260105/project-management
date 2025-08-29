import { useEffect, useState } from 'react';
import { useAuth } from './useAuth';
import { UserService } from '@/services/userService';
import { User } from '@/state/api';

export const useUserSync = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [syncedUser, setSyncedUser] = useState<User | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    const syncUserData = async () => {
      if (!isAuthenticated || isLoading) return;

      setIsSyncing(true);
      try {
        const userDetails = await UserService.syncUserData();
        if (userDetails) {
          setSyncedUser(userDetails);
        }
      } catch (error) {
        console.error('Error syncing user data:', error);
      } finally {
        setIsSyncing(false);
      }
    };

    syncUserData();
  }, [isAuthenticated, isLoading]);

  const refreshUserData = async () => {
    setIsSyncing(true);
    try {
      const userDetails = await UserService.syncUserData();
      if (userDetails) {
        setSyncedUser(userDetails);
      }
    } catch (error) {
      console.error('Error refreshing user data:', error);
    } finally {
      setIsSyncing(false);
    }
  };

  return {
    user: syncedUser || user,
    isSyncing: isSyncing || isLoading,
    refreshUserData,
  };
}; 