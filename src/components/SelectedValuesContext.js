import React, { createContext, useState } from 'react';

export const SelectedValuesContext = createContext();

export const SelectedValuesProvider = ({ children }) => {
  const [selectedValues, setSelectedValues] = useState([]);

  return (
    <SelectedValuesContext.Provider value={{ selectedValues, setSelectedValues }}>
      {children}
    </SelectedValuesContext.Provider>
  );
};
