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

  /*
   * Restore authentication session
   * when the application starts.
   */
  useEffect(() => {
    const restoreSession = async () => {
      const token = localStorage.getItem("pos_token");

      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await api.get("/auth/me");

        setUser(response.data.user);
      } catch (error) {
        console.error(
          "Failed to restore authentication session:",
          error
        );

        localStorage.removeItem("pos_token");
        localStorage.removeItem("pos_user");

        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    restoreSession();
  }, []);

  /*
   * Login
   */
  const login = async (email, password) => {
    const response = await api.post("/auth/login", {
      email,
      password,
    });

    const { token, user } = response.data;

    localStorage.setItem("pos_token", token);
    localStorage.setItem(
      "pos_user",
      JSON.stringify(user)
    );

    setUser(user);

    return response.data;
  };

  /*
   * Register
   */
  const register = async (
    name,
    email,
    password
  ) => {
    const response = await api.post("/auth/register", {
      name,
      email,
      password,
    });

    return response.data;
  };

  /*
   * Logout
   */
  const logout = () => {
    localStorage.removeItem("pos_token");
    localStorage.removeItem("pos_user");

    setUser(null);
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated: Boolean(user),
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider"
    );
  }

  return context;
};