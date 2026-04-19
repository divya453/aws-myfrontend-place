import { createContext, useState, useEffect, useContext } from "react";

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    if (userId) {
      setCurrentUser(userId);
    } else {
      localStorage.removeItem("userId");
      setCurrentUser(null);
    }
    setLoading(false);
  }, []);

  const logout = () => {
    localStorage.removeItem("userId");
    localStorage.removeItem("token");
    setCurrentUser(null);
    setIsIssueModalOpen(false);
  };

  const value = {
    currentUser,
    setCurrentUser,
    isIssueModalOpen,
    setIsIssueModalOpen,
    loading,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children} 
    </AuthContext.Provider>
  );
};