import React, { createContext, useContext } from "react";

const SettingsContext = createContext();

export const useSettingsContext = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error(
      "useSettingsContext must be used within a SettingsContextProvider"
    );
  }
  return context;
};

export const SettingsContextProvider = ({ children, settings }) => {
  return (
    <SettingsContext.Provider value={settings}>
      {children}
    </SettingsContext.Provider>
  );
};
