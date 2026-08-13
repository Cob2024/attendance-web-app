import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { registerUser, updateUserProfile, validateDevice, registerDevice } from '../services/mockData';
import { generateDeviceFingerprint } from '../services/deviceFingerprint';

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
  const [user, setUser] = useState<User | null>(null);
  const [deviceFingerprint, setDeviceFingerprint] = useState<string | null>(null);

  useEffect(() => {
    // Check for existing session
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      const parsed = JSON.parse(storedUser);
      setUser(parsed);
      // Generate fingerprint for existing session
      const fp = generateDeviceFingerprint();
      setDeviceFingerprint(fp);
    }
  }, []);

  const login = async (email: string, password: string, role: UserRole): Promise<{ success: boolean; error?: string }> => {
    try {
      // Get users from localStorage
      const usersData = localStorage.getItem('users');
      const users = usersData ? JSON.parse(usersData) : [];

      // Find user by email, password, and role
      const foundUser = users.find((u: any) => u.email === email && u.password === password && u.role === role);

      if (foundUser) {
        // Generate device fingerprint
        const fp = generateDeviceFingerprint();

        // For students and lecturers, validate/register device
        if (role === 'student' || role === 'lecturer') {
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
      const result = registerUser(name, email, password, role, studentId, programme, level);
      if (result.success && result.user) {
        // Generate and register device fingerprint for new user
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
