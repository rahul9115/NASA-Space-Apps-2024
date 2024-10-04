import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const SourceContext = createContext();

export const useSource = () => useContext(SourceContext);

export const SourceProvider = ({ children }) => {

  const [source, setSource] = useState({ recs: true, type: "web", messages: [], all_sessions: [], session: { messages: [] }, files: [], user: { type: 1 } });

  return (
    <SourceContext.Provider value={{ source, setSource }}>
      {children}
    </SourceContext.Provider>
  );
};
