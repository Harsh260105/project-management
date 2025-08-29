import { fetchAuthSession } from 'aws-amplify/auth';

export interface AuthenticatedRequest {
  headers: Headers;
  url: string;
  method: string;
  body?: any;
}

export class AuthMiddleware {
  static async ensureAuthenticated(): Promise<boolean> {
    try {
      const session = await fetchAuthSession();
      return !!session.tokens;
    } catch (error) {
      console.error('Authentication check failed:', error);
      return false;
    }
  }

  static async getAuthHeaders(): Promise<Headers> {
    const headers = new Headers();
    headers.set('Content-Type', 'application/json');
    
    try {
      const session = await fetchAuthSession();
      const { accessToken } = session.tokens ?? {};
      
      if (accessToken) {
        headers.set('Authorization', `Bearer ${accessToken}`);
      } else {
        throw new Error('No access token available');
      }
    } catch (error) {
      console.error('Failed to get auth headers:', error);
      throw error;
    }
    
    return headers;
  }

  static async makeAuthenticatedRequest(
    url: string, 
    options: RequestInit = {}
  ): Promise<Response> {
    const headers = await this.getAuthHeaders();
    
    // Merge headers
    if (options.headers) {
      if (options.headers instanceof Headers) {
        options.headers.forEach((value, key) => headers.set(key, value));
      } else {
        Object.entries(options.headers).forEach(([key, value]) => {
          headers.set(key, value as string);
        });
      }
    }
    
    const response = await fetch(url, {
      ...options,
      headers,
    });

    // Handle authentication errors
    if (response.status === 401) {
      // Token expired or invalid
      console.error('Authentication failed, redirecting to login');
      // You can redirect to login here if needed
      throw new Error('Authentication failed');
    }

    return response;
  }
} 