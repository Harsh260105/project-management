import { fetchAuthSession, getCurrentUser } from 'aws-amplify/auth';
import { User } from '@/state/api';
import { AuthMiddleware } from '@/middleware/authMiddleware';

export interface CognitoUser {
  username: string;
  attributes: {
    email: string;
    sub: string;
  };
}

export class UserService {
  static async getCurrentCognitoUser(): Promise<CognitoUser | null> {
    try {
      const user = await getCurrentUser();
      const session = await fetchAuthSession();
      
      if (!session.tokens) {
        return null;
      }

      return {
        username: user.username,
        attributes: {
          email: user.signInDetails?.loginId || '',
          sub: session.userSub || '',
        },
      };
    } catch (error) {
      console.error('Error getting Cognito user:', error);
      return null;
    }
  }

  static async ensureUserInDatabase(cognitoUser: CognitoUser): Promise<User> {
    try {
      // First, try to get the user from the database
      const response = await AuthMiddleware.makeAuthenticatedRequest(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/users/${cognitoUser.attributes.sub}`,
        { method: 'GET' }
      );

      if (response.ok) {
        // User exists, return the data
        return await response.json();
      }

      if (response.status === 404) {
        // User doesn't exist, create them
        const createResponse = await AuthMiddleware.makeAuthenticatedRequest(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/users`,
          {
            method: 'POST',
            body: JSON.stringify({
              username: cognitoUser.username,
              cognitoId: cognitoUser.attributes.sub,
              email: cognitoUser.attributes.email,
              profilePictureUrl: 'i1.jpg', // Default profile picture
              teamId: 1, // Default team
            }),
          }
        );

        if (createResponse.ok) {
          const newUser = await createResponse.json();
          return newUser.newUser; // Based on your API response structure
        } else {
          throw new Error('Failed to create user in database');
        }
      }

      throw new Error('Failed to fetch user from database');
    } catch (error) {
      console.error('Error ensuring user in database:', error);
      throw error;
    }
  }

  static async syncUserData(): Promise<User | null> {
    try {
      const cognitoUser = await this.getCurrentCognitoUser();
      if (!cognitoUser) {
        return null;
      }

      return await this.ensureUserInDatabase(cognitoUser);
    } catch (error) {
      console.error('Error syncing user data:', error);
      return null;
    }
  }
} 