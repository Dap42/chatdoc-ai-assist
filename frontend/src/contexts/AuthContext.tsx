import React, { createContext, useContext, useState, useEffect } from "react";

interface User {
  id: string;
  email: string;
  userType: "doctor" | "admin";
  name: string;
  isApproved?: boolean;
}

interface AuthContextType {
  user: User | null;
  login: (
    email: string,
    password: string,
    userType: "doctor" | "admin"
  ) => Promise<void>;
  logout: () => void;
  updateUser: (updatedFields: Partial<User>) => void; // Add updateUser function
  isLoading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check for existing session
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (
    email: string,
    password: string,
    userType: "doctor" | "admin"
  ) => {
    setIsLoading(true);
    setError(null);

    try {
      // Mock authentication - replace with real API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Demo credentials validation
      const validCredentials = {
        doctor: { email: "dr.amitmalik@gmail.com", password: "Amit@2025" },
        admin: { email: "admin@demo.com", password: "admin123" },
      };

      if (
        email !== validCredentials[userType].email ||
        password !== validCredentials[userType].password
      ) {
        throw new Error("Invalid credentials");
      }

      // Mock user data
      const mockUser: User = {
        id: `${userType}-${Date.now()}`,
        email,
        userType,
        name: userType === "admin" ? "System Admin" : "Dr. Amit Malik",
        isApproved: true,
      };

      setUser(mockUser);
      localStorage.setItem("user", JSON.stringify(mockUser));
    } catch (err) {
      setError("Invalid credentials. Please check your email and password.");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
  };

  const updateUser = (updatedFields: Partial<User>) => {
    setUser((prevUser) => {
      if (!prevUser) return null;
      const newUser = { ...prevUser, ...updatedFields };
      localStorage.setItem("user", JSON.stringify(newUser));
      return newUser;
    });
  };

  return (
    <AuthContext.Provider
      value={{ user, login, logout, updateUser, isLoading, error }}
    >
      {children}
    </AuthContext.Provider>
  );
};
