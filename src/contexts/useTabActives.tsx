import React, { createContext, useContext, useState, ReactNode } from 'react';

interface ButtonContextProps {
  activeButtonName: string | null;
  activateButton: (name: string) => void;
  deactivateButton: () => void;
}

const ButtonContext = createContext<ButtonContextProps | undefined>(undefined);

export const ButtonProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [activeButtonName, setActiveButtonId] = useState<string | null>(null);

  const activateButton = (name: string) => {
    setActiveButtonId(name); 
  };

  const deactivateButton = () => {
    setActiveButtonId(null); 
  };

  return (
    <ButtonContext.Provider value={{ activeButtonName, activateButton, deactivateButton }}>
      {children}
    </ButtonContext.Provider>
  );
};

export const useButtonContext = (): ButtonContextProps => {
  const context = useContext(ButtonContext);
  if (!context) {
    throw new Error('useButtonContext must be used within a ButtonProvider');
  }
  return context;
};
