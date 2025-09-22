import React, { createContext, useContext, useReducer, useEffect } from 'react';

// Initial state
const initialState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  isInitializing: true,
  error: null
};

// Action types
const AUTH_ACTIONS = {
  LOGIN_START: 'LOGIN_START',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_FAILURE: 'LOGIN_FAILURE',
  GOOGLE_LOGIN_START: 'GOOGLE_LOGIN_START',
  GOOGLE_LOGIN_SUCCESS: 'GOOGLE_LOGIN_SUCCESS',
  GOOGLE_LOGIN_FAILURE: 'GOOGLE_LOGIN_FAILURE',
  LOGOUT: 'LOGOUT',
  REGISTER_START: 'REGISTER_START',
  REGISTER_SUCCESS: 'REGISTER_SUCCESS',
  REGISTER_FAILURE: 'REGISTER_FAILURE',
  CLEAR_ERROR: 'CLEAR_ERROR',
  INITIALIZATION_COMPLETE: 'INITIALIZATION_COMPLETE'
};

// Reducer
function authReducer(state, action) {
  switch (action.type) {
    case AUTH_ACTIONS.LOGIN_START:
      return {
        ...state,
        isLoading: true,
        error: null
      };
    
    case AUTH_ACTIONS.LOGIN_SUCCESS:
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
        isInitializing: false, // Complete initialization when login is successful
        error: null
      };
    
    case AUTH_ACTIONS.LOGIN_FAILURE:
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload
      };
    
    case AUTH_ACTIONS.GOOGLE_LOGIN_START:
      return {
        ...state,
        isLoading: true,
        error: null
      };
    
    case AUTH_ACTIONS.GOOGLE_LOGIN_SUCCESS:
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
        isInitializing: false, // Complete initialization when login is successful
        error: null
      };
    
    case AUTH_ACTIONS.GOOGLE_LOGIN_FAILURE:
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload
      };
    
    case AUTH_ACTIONS.LOGOUT:
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: null
      };
    
    case AUTH_ACTIONS.REGISTER_START:
      return {
        ...state,
        isLoading: true,
        error: null
      };
    
    case AUTH_ACTIONS.REGISTER_SUCCESS:
      return {
        ...state,
        isLoading: false,
        error: null
      };
    
    case AUTH_ACTIONS.REGISTER_FAILURE:
      return {
        ...state,
        isLoading: false,
        error: action.payload
      };
    
    case AUTH_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null
      };
    
    case AUTH_ACTIONS.INITIALIZATION_COMPLETE:
      return {
        ...state,
        isInitializing: false
      };
    
    default:
      return state;
  }
}

// Create context
const AuthContext = createContext();

// Provider component
export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Check for existing session on mount
  useEffect(() => {
    console.log('🔄 AuthContext: Starting initialization...');
    
    // Set a timeout to ensure initialization completes
    const initTimeout = setTimeout(() => {
      console.log('⏰ AuthContext: Initialization timeout, forcing completion');
      dispatch({ type: AUTH_ACTIONS.INITIALIZATION_COMPLETE });
    }, 5000); // 5 second timeout
    
    // Check for stored user session in localStorage
    const storedUser = localStorage.getItem('user');
    const storedUserId = localStorage.getItem('userId');
    
    console.log('🔍 AuthContext: Stored user:', storedUser ? 'exists' : 'none');
    console.log('🔍 AuthContext: Stored userId:', storedUserId);
    
    if (storedUser && storedUserId) {
      try {
        const user = JSON.parse(storedUser);
        console.log('✅ AuthContext: Parsed user data:', user);
        
        // Verify the session is still valid
        console.log('🔍 AuthContext: Verifying session...');
        fetch(`/api/auth/verify?userId=${storedUserId}`, {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        })
        .then(response => {
          console.log('📡 AuthContext: Verify response status:', response.status);
          clearTimeout(initTimeout); // Clear timeout on successful response
          if (response.ok) {
            return response.json();
          } else {
            throw new Error(`HTTP ${response.status}: No valid session`);
          }
        })
        .then(data => {
          console.log('📡 AuthContext: Verify response data:', data);
          if (data.success && data.user) {
            console.log('✅ AuthContext: Session restored successfully');
            dispatch({ 
              type: AUTH_ACTIONS.LOGIN_SUCCESS, 
              payload: { 
                token: data.token || 'session-based',
                user: data.user,
                message: 'Session restored'
              } 
            });
          } else {
            console.log('❌ AuthContext: Session verification failed, completing initialization');
            dispatch({ type: AUTH_ACTIONS.INITIALIZATION_COMPLETE });
          }
        })
        .catch(error => {
          console.log('❌ AuthContext: Session verification error:', error.message);
          clearTimeout(initTimeout); // Clear timeout on error
          // Clear invalid session data
          localStorage.removeItem('user');
          localStorage.removeItem('userId');
          dispatch({ type: AUTH_ACTIONS.INITIALIZATION_COMPLETE });
        });
      } catch (error) {
        console.log('❌ AuthContext: Error parsing stored user:', error.message);
        clearTimeout(initTimeout); // Clear timeout on error
        localStorage.removeItem('user');
        localStorage.removeItem('userId');
        dispatch({ type: AUTH_ACTIONS.INITIALIZATION_COMPLETE });
      }
    } else {
      // No stored session, complete initialization
      console.log('ℹ️ AuthContext: No stored session, completing initialization');
      clearTimeout(initTimeout); // Clear timeout
      dispatch({ type: AUTH_ACTIONS.INITIALIZATION_COMPLETE });
    }
    
    // Cleanup function
    return () => {
      clearTimeout(initTimeout);
    };
  }, []);

  // Login function
  const login = async (email, password) => {
    dispatch({ type: AUTH_ACTIONS.LOGIN_START });
    
    try {
      const response = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (data.success) {
        // Store session in localStorage for persistence
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('userId', data.user.id.toString());
        
        // Session is managed server-side via cookies
        dispatch({
          type: AUTH_ACTIONS.LOGIN_SUCCESS,
          payload: { token: data.token || 'session-based', user: data.user }
        });
        
        return { success: true };
      } else {
        dispatch({
          type: AUTH_ACTIONS.LOGIN_FAILURE,
          payload: data.message
        });
        
        return { success: false, error: data.message };
      }
    } catch (error) {
      dispatch({
        type: AUTH_ACTIONS.LOGIN_FAILURE,
        payload: 'Network error. Please try again.'
      });
      
      return { success: false, error: 'Network error. Please try again.' };
    }
  };

  // Register function
  const register = async (firstName, lastName, username, email, password, recaptchaToken = null) => {
    dispatch({ type: AUTH_ACTIONS.REGISTER_START });
    
    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          firstName, 
          lastName, 
          username,
          email, 
          password,
          recaptchaToken 
        })
      });

      const data = await response.json();

      if (data.success) {
        dispatch({
          type: AUTH_ACTIONS.REGISTER_SUCCESS,
          payload: data.user
        });
        
        return { success: true };
      } else {
        dispatch({
          type: AUTH_ACTIONS.REGISTER_FAILURE,
          payload: data.message
        });
        
        return { success: false, error: data.message };
      }
    } catch (error) {
      dispatch({
        type: AUTH_ACTIONS.REGISTER_FAILURE,
        payload: 'Network error. Please try again.'
      });
      
      return { success: false, error: 'Network error. Please try again.' };
    }
  };

  // Logout function
  const logout = async () => {
    try {
      // Call server-side logout to clear session
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear session from localStorage
      localStorage.removeItem('user');
      localStorage.removeItem('userId');
      dispatch({ type: AUTH_ACTIONS.LOGOUT });
    }
  };

  // Google login function
  const googleLogin = async (code, state) => {
    dispatch({ type: AUTH_ACTIONS.GOOGLE_LOGIN_START });
    
    try {
      const response = await fetch('/api/google-oauth/callback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code, state })
      });

      const data = await response.json();

      if (data.success) {
        // Session is managed server-side via cookies
        dispatch({
          type: AUTH_ACTIONS.GOOGLE_LOGIN_SUCCESS,
          payload: { token: data.token || 'session-based', user: data.user }
        });
        
        return { success: true };
      } else {
        dispatch({
          type: AUTH_ACTIONS.GOOGLE_LOGIN_FAILURE,
          payload: data.message
        });
        
        return { success: false, error: data.message };
      }
    } catch (error) {
      dispatch({
        type: AUTH_ACTIONS.GOOGLE_LOGIN_FAILURE,
        payload: 'Network error. Please try again.'
      });
      
      return { success: false, error: 'Network error. Please try again.' };
    }
  };

  // Clear error function
  const clearError = () => {
    dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });
  };

  const value = {
    ...state,
    login,
    register,
    googleLogin,
    logout,
    clearError
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

