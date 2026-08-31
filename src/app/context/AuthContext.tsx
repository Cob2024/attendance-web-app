import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { registerUser, updateUserProfile, validateDevice, registerDevice } from '../services/mockData';
import { generateDeviceFingerprint } from '../services/deviceFingerprint';
import { loginUserApi, registerUserApi } from '../services/apiData';
import { checkServerHealth } from '../services/apiClient';

export type UserRole = 'student' | 'lecturer' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  studentId?: string;
  programme?: string;
  level?: string;
  profilePicture?: string;
}

interface AuthContextType {
  user: User | null;
  deviceFingerprint: string | null;
  isInitializing: boolean;
  login: (email: string, password: string, role: UserRole) => Promise<{ success: boolean; error?: string }>;
  signup: (
    name: string,
    email: string,
    password: string,
    role: 'student' | 'lecturer',
    studentId?: string,
    programme?: string,
    level?: string
  ) => Promise<{ success: boolean; error?: string }>;
  updateProfile: (updates: { name?: string; email?: string; studentId?: string; programme?: string; level?: string; profilePicture?: string }) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const stored = localStorage.getItem('currentUser');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [deviceFingerprint, setDeviceFingerprint] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    try {
      const fp = generateDeviceFingerprint();
      setDeviceFingerprint(fp);
    } catch (e) {
      console.warn('Fingerprint error:', e);
    } finally {
      setIsInitializing(false);
    }
  }, []);

  const login = async (email: string, password: string, role: UserRole): Promise<{ success: boolean; error?: string }> => {
    try {
      const fp = generateDeviceFingerprint();

      // Attempt live backend API login first
      const isOnline = await checkServerHealth();
      if (isOnline) {
        const apiResult = await loginUserApi(email, password, role, fp);
        if (apiResult.success && apiResult.user) {
          setUser(apiResult.user);
          setDeviceFingerprint(fp);
          localStorage.setItem('currentUser', JSON.stringify(apiResult.user));
          return { success: true };
        } else if (apiResult.error) {
          return { success: false, error: apiResult.error };
        }
      }

      // Local mock login fallback
      const usersData = localStorage.getItem('users');
      const users = usersData ? JSON.parse(usersData) : [];
      const foundUser = users.find((u: any) => u.email === email && u.password === password && u.role === role);

      if (foundUser) {
        if (role === 'student') {
          const deviceCheck = validateDevice(foundUser.id, fp);
          if (!deviceCheck.valid) {
            return { success: false, error: deviceCheck.error || 'Device verification failed' };
          }
        }

        const { password: _, ...userWithoutPassword } = foundUser;
        setUser(userWithoutPassword);
        setDeviceFingerprint(fp);
        localStorage.setItem('currentUser', JSON.stringify(userWithoutPassword));
        return { success: true };
      } else {
        return { success: false, error: 'Invalid email or password' };
      }
    } catch (error) {
      return { success: false, error: 'Login failed' };
    }
  };

  const signup = async (
    name: string,
    email: string,
    password: string,
    role: 'student' | 'lecturer',
    studentId?: string,
    programme?: string,
    level?: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const isOnline = await checkServerHealth();
      if (isOnline) {
        const apiResult = await registerUserApi(name, email, password, role, studentId, programme, level);
        if (apiResult.success && apiResult.user) {
          const fp = generateDeviceFingerprint();
          setUser(apiResult.user);
          setDeviceFingerprint(fp);
          localStorage.setItem('currentUser', JSON.stringify(apiResult.user));
          return { success: true };
        } else if (apiResult.error) {
          return { success: false, error: apiResult.error };
        }
      }

      const result = registerUser(name, email, password, role, studentId, programme, level);
      if (result.success && result.user) {
        const fp = generateDeviceFingerprint();
        registerDevice(result.user.id, fp);

        setUser(result.user);
        setDeviceFingerprint(fp);
        localStorage.setItem('currentUser', JSON.stringify(result.user));
        return { success: true };
      }
      return { success: false, error: result.error };
    } catch (error) {
      return { success: false, error: 'Registration failed' };
    }
  };

  const updateProfile = async (updates: { name?: string; email?: string; studentId?: string; programme?: string; level?: string; profilePicture?: string }): Promise<{ success: boolean; error?: string }> => {
    if (!user) return { success: false, error: 'Not authenticated' };
    try {
      const result = updateUserProfile(user.id, updates);
      if (result.success && result.user) {
        setUser(result.user);
        localStorage.setItem('currentUser', JSON.stringify(result.user));
        return { success: true };
      }
      return { success: false, error: result.error };
    } catch (error) {
      return { success: false, error: 'Failed to update profile' };
    }
  };

  const logout = () => {
    setUser(null);
    setDeviceFingerprint(null);
    localStorage.removeItem('currentUser');
  };

  return (
    <AuthContext.Provider value={{ user, deviceFingerprint, login, signup, updateProfile, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
