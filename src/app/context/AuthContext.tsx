import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { registerUser } from '../services/mockData';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'lecturer';
  studentId?: string;
  course?: string;
  level?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string, role: 'student' | 'lecturer') => Promise<{ success: boolean; error?: string }>;
  signup: (
    name: string,
    email: string,
    password: string,
    role: 'student' | 'lecturer',
    studentId?: string,
    course?: string,
    level?: string
  ) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Check for existing session
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = async (email: string, password: string, role: 'student' | 'lecturer'): Promise<{ success: boolean; error?: string }> => {
    try {
      // Get users from localStorage
      const usersData = localStorage.getItem('users');
      const users = usersData ? JSON.parse(usersData) : [];

      // Find user by email, password, and role
      const foundUser = users.find((u: any) => u.email === email && u.password === password && u.role === role);

      if (foundUser) {
        const { password: _, ...userWithoutPassword } = foundUser;
        setUser(userWithoutPassword);
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
    course?: string,
    level?: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const result = registerUser(name, email, password, role, studentId, course, level);
      if (result.success && result.user) {
        setUser(result.user);
        localStorage.setItem('currentUser', JSON.stringify(result.user));
        return { success: true };
      }
      return { success: false, error: result.error };
    } catch (error) {
      return { success: false, error: 'Registration failed' };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('currentUser');
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, isAuthenticated: !!user }}>
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
