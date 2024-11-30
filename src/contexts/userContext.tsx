import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  user_id: string;
  fname: string;
  lname: string;
  hub: string;
  location_user: string;
  email: string;
  role: string;
  machineId: string;
  permissions: string[];
}

interface UserContextType {
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  login: (email: string, userID: string, name: string, machineId: string) => Promise<void>;
  logout: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  // Load user from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('userM');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  // Update localStorage whenever the user state changes
  useEffect(() => {
    if (user) {
      localStorage.setItem('userM', JSON.stringify(user));
    }
     else {
      localStorage.removeItem('userM');
    }
  }, [user]);

  const login = async (email: string, userID: string, name: string, machineId: string) => {

    // Simulate API login response
    const mockUser: User = {
      user_id: userID,
      fname: name,
      lname: name,
      hub: 'Main Hub',
      location_user: 'Location A',
      email,
      machineId,
      role: 'admin',
      permissions: ['read', 'write'],
    };

    setUser(mockUser);
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <UserContext.Provider value={{ user, setUser, logout, login }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
