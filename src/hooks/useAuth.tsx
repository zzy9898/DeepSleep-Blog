import { useState, useEffect, createContext, useContext, ReactNode, useCallback } from 'react';
import { UserProfile, AuthResponse } from '../types';
import { dataService } from '../services/dataService';
import { LoginRequest, RegisterInput } from '../api/types';
import {
  clearTokens,
  getAccessToken,
  getRefreshToken,
  setTokens,
} from '../api/tokenStore';

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  isAdmin: boolean;
  login: (data: LoginRequest) => Promise<void>;
  register: (data: RegisterInput) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  isAdmin: false,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
  refreshProfile: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async () => {
    try {
      const profile = await dataService.getCurrentUser();
      setUser(profile);
    } catch (error) {
      console.error('Failed to fetch profile:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const token = getAccessToken();
    if (token) {
      fetchProfile();
    } else {
      setLoading(false);
    }
  }, [fetchProfile]);

  const login = async (data: LoginRequest) => {
    const auth: AuthResponse = await dataService.login(data);
    setTokens(auth.accessToken, auth.refreshToken);
    await fetchProfile();
  };

  const register = async ({ displayName, ...credentials }: RegisterInput) => {
    const auth: AuthResponse = await dataService.register(credentials);
    setTokens(auth.accessToken, auth.refreshToken);
    if (displayName?.trim()) {
      await dataService.updateProfile({ nickname: displayName.trim() });
    }
    await fetchProfile();
  };

  const logout = async () => {
    const refreshToken = getRefreshToken();
    if (refreshToken) {
      try {
        await dataService.logout({ refreshToken });
      } catch (e) {
        console.error('Logout error:', e);
      }
    }
    clearTokens();
    setUser(null);
  };

  const refreshProfile = async () => {
    await fetchProfile();
  };

  const value = {
    user,
    loading,
    isAdmin: user?.role === 'admin',
    login,
    register,
    logout,
    refreshProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
