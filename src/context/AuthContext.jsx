import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import api from "../services/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token =
      localStorage.getItem("pos_token");

    const storedUser =
      localStorage.getItem("pos_user");

    if (token && storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error(
          "Failed to restore user:",
          error
        );

        localStorage.removeItem("pos_token");
        localStorage.removeItem("pos_user");
      }
    }

    setLoading(false);
  }, []);

  const login = async (
    email,
    password
  ) => {
    const response = await api.post(
      "/auth/login",
      {
        email,
        password,
      }
    );

    const {
      token,
      user,
    } = response.data;

    localStorage.setItem(
      "pos_token",
      token
    );

    localStorage.setItem(
      "pos_user",
      JSON.stringify(user)
    );

    setUser(user);

    return response.data;
  };

  const register = async (
    name,
    email,
    password
  ) => {
    const response = await api.post(
      "/auth/register",
      {
        name,
        email,
        password,
      }
    );

    const {
      token,
      user,
    } = response.data;

    localStorage.setItem(
      "pos_token",
      token
    );

    localStorage.setItem(
      "pos_user",
      JSON.stringify(user)
    );

    setUser(user);

    return response.data;
  };

  const logout = () => {
    localStorage.removeItem(
      "pos_token"
    );

    localStorage.removeItem(
      "pos_user"
    );

    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};