"use client";
import React, { useEffect } from "react";
import { Authenticator } from "@aws-amplify/ui-react";
import { Amplify } from "aws-amplify";
import { fetchAuthSession, getCurrentUser } from "aws-amplify/auth";
import { UserService } from "@/services/userService";
import { environment, validateEnvironment } from "@/config/environment";
import LoadingSpinner from "@/components/LoadingSpinner";
import "@aws-amplify/ui-react/styles.css";

// Validate environment variables before configuring Amplify
try {
  validateEnvironment();
} catch (error) {
  console.error('Environment validation failed:', error);
}

// Configure Amplify only when required env values exist
const hasAmplifyEnv = Boolean(
  environment.cognito.userPoolId && environment.cognito.userPoolClientId
);

if (hasAmplifyEnv) {
  Amplify.configure({
    Auth: {
      Cognito: {
        userPoolId: environment.cognito.userPoolId,
        userPoolClientId: environment.cognito.userPoolClientId,
      },
    },
  });
} else {
  console.error('Amplify not configured: missing Cognito env vars');
}

const formFields = {
  signUp: {
    username: {
      order: 1,
      placeholder: "Choose a username",
      label: "Username",
      inputProps: { required: true },
    },
    email: {
      order: 1,
      placeholder: "Enter your email address",
      label: "Email",
      inputProps: { type: "email", required: true },
    },
    password: {
      order: 3,
      placeholder: "Enter your password",
      label: "Password",
      inputProps: { type: "password", required: true },
    },
    confirm_password: {
      order: 4,
      placeholder: "Confirm your password",
      label: "Confirm Password",
      inputProps: { type: "password", required: true },
    },
  },
};

const AuthProvider = ({ children }: any) => {
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const session = await fetchAuthSession();
        if (session.tokens) {
          setIsAuthenticated(true);
          
          // Ensure user exists in database
          try {
            await UserService.syncUserData();
          } catch (syncError) {
            console.error('Error syncing user data:', syncError);
          }
        }
      } catch (error) {
        console.log('No active session');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  if (!hasAmplifyEnv) {
    return (
      <div className="flex min-h-screen w-full flex-col items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 font-medium">Missing required environment variables.</p>
          <p className="text-sm text-gray-600 mt-2">Please set NEXT_PUBLIC_COGNITO_USER_POOL_ID and NEXT_PUBLIC_COGNITO_USER_POOL_CLIENT_ID.</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen w-full flex-col justify-center items-center">
        <LoadingSpinner size="lg" text="Initializing..." />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full flex-col justify-center">
      <Authenticator formFields={formFields}>{() => <></>}</Authenticator>
      {isAuthenticated ? (
        <div>{children}</div>
      ) : (
        <div className="flex items-center justify-center py-10">
          <h1>Please sign in below:</h1>
        </div>
      )}
    </div>
  );
};

export default AuthProvider;
