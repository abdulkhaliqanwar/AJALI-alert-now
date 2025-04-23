
import React, { createContext, useState, useEffect, useContext, ReactNode } from "react";
import { toast } from "sonner";

export interface User {
  id: string;
  name: string;
  email: string;
  role: "user" | "admin";
}

interface AuthContextProps {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for stored user on component mount
  useEffect(() => {
    const storedUser = localStorage.getItem("ajali_user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  // Mock login function (would connect to backend in production)
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock authentication logic
      if (email === "admin@ajali.com" && password === "admin123") {
        const adminUser = {
          id: "admin-1",
          name: "Admin User",
          email: "admin@ajali.com",
          role: "admin" as const
        };
        setUser(adminUser);
        localStorage.setItem("ajali_user", JSON.stringify(adminUser));
        toast.success("Admin logged in successfully");
      } else if (email === "user@ajali.com" && password === "user123") {
        const regularUser = {
          id: "user-1",
          name: "Regular User",
          email: "user@ajali.com",
          role: "user" as const
        };
        setUser(regularUser);
        localStorage.setItem("ajali_user", JSON.stringify(regularUser));
        toast.success("Logged in successfully");
      } else {
        toast.error("Invalid credentials");
      }
    } catch (error) {
      toast.error("Login failed");
      console.error("Login error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Mock register function
  const register = async (name: string, email: string, password: string) => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newUser = {
        id: `user-${Date.now()}`,
        name,
        email,
        role: "user" as const
      };
      
      setUser(newUser);
      localStorage.setItem("ajali_user", JSON.stringify(newUser));
      toast.success("Registration successful");
    } catch (error) {
      toast.error("Registration failed");
      console.error("Registration error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("ajali_user");
    toast.info("Logged out successfully");
  };

  const value = {
    user,
    isLoading,
    login,
    register,
    logout,
    isAuthenticated: !!user,
    isAdmin: user?.role === "admin"
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
