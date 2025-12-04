import {
  CognitoUserPool,
  CognitoUser,
  AuthenticationDetails,
  CognitoUserAttribute,
  CognitoUserSession,
} from "amazon-cognito-identity-js";
import { Amplify } from "aws-amplify";
import { signInWithRedirect, fetchAuthSession, signOut as amplifySignOut, type AuthSession } from "@aws-amplify/auth";

// Patient User Pool Configuration
const patientPoolData = {
  UserPoolId: import.meta.env.VITE_COGNITO_PATIENT_USER_POOL_ID || "",
  ClientId: import.meta.env.VITE_COGNITO_PATIENT_CLIENT_ID || "",
};

// Therapist User Pool Configuration
const therapistPoolData = {
  UserPoolId: import.meta.env.VITE_COGNITO_THERAPIST_USER_POOL_ID || "",
  ClientId: import.meta.env.VITE_COGNITO_THERAPIST_CLIENT_ID || "",
};

let patientUserPool: CognitoUserPool | null = null;
let therapistUserPool: CognitoUserPool | null = null;
let currentUserType: "patient" | "therapist" = "patient";

try {
  if (patientPoolData.UserPoolId && patientPoolData.ClientId) {
    patientUserPool = new CognitoUserPool(patientPoolData);
  }
  if (therapistPoolData.UserPoolId && therapistPoolData.ClientId) {
    therapistUserPool = new CognitoUserPool(therapistPoolData);
  }
} catch (error) {
  console.warn("Failed to initialize Cognito User Pools:", error);
}

// Configure Amplify for Google Sign-In (will be updated per user type)
const configureAmplify = (userType: "patient" | "therapist") => {
  currentUserType = userType;
  const config = userType === "patient" ? patientPoolData : therapistPoolData;
  
  if (!config.UserPoolId || !config.ClientId) {
    console.warn(`Cognito not configured for ${userType}`);
    return;
  }

  Amplify.configure({
    Auth: {
      Cognito: {
        userPoolId: config.UserPoolId,
        userPoolClientId: config.ClientId,
        loginWith: {
          oauth: {
            domain: userType === "patient" 
              ? import.meta.env.VITE_COGNITO_PATIENT_DOMAIN?.replace(/^https?:\/\//, '').replace(/\/$/, '')
              : import.meta.env.VITE_COGNITO_THERAPIST_DOMAIN?.replace(/^https?:\/\//, '').replace(/\/$/, ''),
            scopes: ['email', 'openid', 'profile'],
            redirectSignIn: [`${window.location.origin}/auth/callback`],
            redirectSignOut: [`${window.location.origin}/echanneling/login`],
            responseType: 'code'
          }
        }
      }
    }
  }, {
    ssr: false
  });
};

export interface SignUpParams {
  email: string;
  password: string;
  name: string;
  phone?: string;
  dateOfBirth?: string;
}

export interface SignInParams {
  email: string;
  password: string;
}

export interface AuthUser {
  email: string;
  sub: string;
  name?: string;
  email_verified?: boolean;
}

// Get the appropriate user pool based on user type
const getUserPool = (userType: "patient" | "therapist"): CognitoUserPool => {
  const pool = userType === "patient" ? patientUserPool : therapistUserPool;
  if (!pool) {
    throw new Error(
      `Cognito User Pool not initialized for ${userType}. Please check your environment variables.`
    );
  }
  return pool;
};

/**
 * Sign up a new user
 */
export const signUp = (
  userType: "patient" | "therapist",
  params: SignUpParams
): Promise<{ userSub: string; userConfirmed: boolean }> => {
  return new Promise((resolve, reject) => {
    const userPool = getUserPool(userType);

    const attributeList = [
      new CognitoUserAttribute({
        Name: "email",
        Value: params.email,
      }),
      new CognitoUserAttribute({
        Name: "name",
        Value: params.name,
      }),
    ];

    if (params.phone) {
      attributeList.push(
        new CognitoUserAttribute({
          Name: "phone_number",
          Value: params.phone,
        })
      );
    }

    if (params.dateOfBirth) {
      attributeList.push(
        new CognitoUserAttribute({
          Name: "birthdate",
          Value: params.dateOfBirth,
        })
      );
    }

    userPool.signUp(
      params.email,
      params.password,
      attributeList,
      [],
      (err, result) => {
        if (err) {
          reject(err);
          return;
        }
        resolve({
          userSub: result!.userSub,
          userConfirmed: result!.userConfirmed,
        });
      }
    );
  });
};

/**
 * Confirm sign up with verification code
 */
export const confirmSignUp = (
  userType: "patient" | "therapist",
  email: string,
  code: string
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const userPool = getUserPool(userType);
    const cognitoUser = new CognitoUser({
      Username: email,
      Pool: userPool,
    });

    cognitoUser.confirmRegistration(code, true, (err, result) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(result);
    });
  });
};

/**
 * Sign in with email and password
 */
export const signIn = (
  userType: "patient" | "therapist",
  params: SignInParams
): Promise<CognitoUserSession> => {
  return new Promise((resolve, reject) => {
    const userPool = getUserPool(userType);

    const authenticationDetails = new AuthenticationDetails({
      Username: params.email,
      Password: params.password,
    });

    const cognitoUser = new CognitoUser({
      Username: params.email,
      Pool: userPool,
    });

    cognitoUser.authenticateUser(authenticationDetails, {
      onSuccess: (session) => {
        resolve(session);
      },
      onFailure: (err) => {
        reject(err);
      },
      newPasswordRequired: (userAttributes) => {
        // Handle new password required flow if needed
        reject(new Error("New password required. Please contact support."));
      },
    });
  });
};

/**
 * Sign in with Google using Cognito Managed Login
 */
export const signInWithGoogle = async (userType: "patient" | "therapist"): Promise<void> => {
  try {
    // Store user type for callback
    localStorage.setItem('pending_user_type', userType);
    
    // Configure Amplify for this user type
    configureAmplify(userType);
    
    // Initiate Google sign-in with redirect
    await signInWithRedirect({
      provider: 'Google'
    });
  } catch (error) {
    console.error('Google sign-in error:', error);
    throw error;
  }
};

/**
 * Handle OAuth callback and get session
 */
export const handleAuthCallback = async (): Promise<{
  session: AuthSession;
  userType: "patient" | "therapist";
}> => {
  try {
    const userType = (localStorage.getItem('pending_user_type') || 'patient') as "patient" | "therapist";
    configureAmplify(userType);
    
    const session = await fetchAuthSession();
    
    if (!session.tokens) {
      throw new Error('No tokens in session');
    }
    
    // Clear pending user type
    localStorage.removeItem('pending_user_type');
    
    return { session, userType };
  } catch (error) {
    console.error('Auth callback error:', error);
    throw error;
  }
};

/**
 * Sign out current user
 */
export const signOut = (userType: "patient" | "therapist"): void => {
  const userPool = getUserPool(userType);
  const cognitoUser = userPool.getCurrentUser();
  if (cognitoUser) {
    cognitoUser.signOut();
  }
  // Clear localStorage
  localStorage.removeItem("auth_token");
  localStorage.removeItem("user_type");
  localStorage.removeItem("user_name");
  localStorage.removeItem("user_email");
  localStorage.removeItem("patient_id");
  localStorage.removeItem("therapist_id");
};

/**
 * Get current authenticated user session
 */
export const getCurrentSession = (
  userType: "patient" | "therapist"
): Promise<CognitoUserSession> => {
  return new Promise((resolve, reject) => {
    const userPool = getUserPool(userType);
    const cognitoUser = userPool.getCurrentUser();

    if (!cognitoUser) {
      reject(new Error("No current user"));
      return;
    }

    cognitoUser.getSession(
      (err: Error | null, session: CognitoUserSession | null) => {
        if (err || !session) {
          reject(err || new Error("No session"));
          return;
        }
        resolve(session);
      }
    );
  });
};

/**
 * Get current user attributes
 */
export const getUserAttributes = (
  userType: "patient" | "therapist"
): Promise<AuthUser> => {
  return new Promise((resolve, reject) => {
    const userPool = getUserPool(userType);
    const cognitoUser = userPool.getCurrentUser();

    if (!cognitoUser) {
      reject(new Error("No current user"));
      return;
    }

    cognitoUser.getSession(
      (err: Error | null, session: CognitoUserSession | null) => {
        if (err || !session) {
          reject(err || new Error("No session"));
          return;
        }

        cognitoUser.getUserAttributes((err, attributes) => {
          if (err) {
            reject(err);
            return;
          }

          const user: AuthUser = {
            email: "",
            sub: "",
          };

          attributes?.forEach((attr) => {
            if (attr.Name === "email") user.email = attr.Value;
            if (attr.Name === "sub") user.sub = attr.Value;
            if (attr.Name === "name") user.name = attr.Value;
            if (attr.Name === "email_verified")
              user.email_verified = attr.Value === "true";
          });

          resolve(user);
        });
      }
    );
  });
};

/**
 * Resend verification code
 */
export const resendConfirmationCode = (
  userType: "patient" | "therapist",
  email: string
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const userPool = getUserPool(userType);
    const cognitoUser = new CognitoUser({
      Username: email,
      Pool: userPool,
    });

    cognitoUser.resendConfirmationCode((err, result) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(result);
    });
  });
};

/**
 * Forgot password - initiate password reset
 */
export const forgotPassword = (
  userType: "patient" | "therapist",
  email: string
): Promise<void> => {
  return new Promise((resolve, reject) => {
    const userPool = getUserPool(userType);
    const cognitoUser = new CognitoUser({
      Username: email,
      Pool: userPool,
    });

    cognitoUser.forgotPassword({
      onSuccess: () => {
        resolve();
      },
      onFailure: (err) => {
        reject(err);
      },
    });
  });
};

/**
 * Confirm password reset with code
 */
export const confirmPassword = (
  userType: "patient" | "therapist",
  email: string,
  code: string,
  newPassword: string
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const userPool = getUserPool(userType);
    const cognitoUser = new CognitoUser({
      Username: email,
      Pool: userPool,
    });

    cognitoUser.confirmPassword(code, newPassword, {
      onSuccess: (result) => {
        resolve(result);
      },
      onFailure: (err) => {
        reject(err);
      },
    });
  });
};

/**
 * Change password for authenticated user
 */
export const changePassword = (
  userType: "patient" | "therapist",
  oldPassword: string,
  newPassword: string
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const userPool = getUserPool(userType);
    const cognitoUser = userPool.getCurrentUser();

    if (!cognitoUser) {
      reject(new Error("No current user"));
      return;
    }

    cognitoUser.getSession(
      (err: Error | null, session: CognitoUserSession | null) => {
        if (err || !session) {
          reject(err || new Error("No session"));
          return;
        }

        cognitoUser.changePassword(oldPassword, newPassword, (err, result) => {
          if (err) {
            reject(err);
            return;
          }
          resolve(result);
        });
      }
    );
  });
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = async (
  userType: "patient" | "therapist"
): Promise<boolean> => {
  try {
    const session = await getCurrentSession(userType);
    return session.isValid();
  } catch {
    return false;
  }
};
