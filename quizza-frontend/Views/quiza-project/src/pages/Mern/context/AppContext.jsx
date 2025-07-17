import axios from "axios";
import { createContext, useEffect, useState } from "react";
import { toast } from "react-toastify";

export const AppContext = createContext();

export const AppContextProvider = (props) => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const [isLoggedin, setIsLoggedin] = useState(false);
  const [userData, setUserData] = useState(null);
  const [authChecked, setAuthChecked] = useState(false); // Novo estado para verificação inicial

  // Configuração global do axios
  axios.defaults.withCredentials = true;

  // Interceptor para tratamento global de erros
  axios.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        // Se recebermos 401, limpamos a autenticação
        logout(false); // false para não mostrar toast
      }
      return Promise.reject(error);
    }
  );

  const logout = (showToast = true) => {
    localStorage.removeItem("token");
    setIsLoggedin(false);
    setUserData(null);
    if (showToast) {
      toast.info("Sessão encerrada");
    }
  };

  const getAuthState = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setAuthChecked(true);
        return;
      }

      const { data } = await axios.get(`${backendUrl}/api/auth/is-auth`);
      if (data.success) {
        setIsLoggedin(true);
        await getUserData();
      } else {
        logout(false);
      }
    } catch (error) {
      logout(false);
      console.error("Auth check error:", error);
    } finally {
      setAuthChecked(true);
    }
  };

  const getUserData = async () => {
    try {
      axios.defaults.withCredentials = true;
      const token = localStorage.getItem("token");

      if (!token) {
        setUserData(null);
        setIsLoggedin(false);
        
        return;
      }

      const { data } = await axios.get(`${backendUrl}/api/auth/user`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (data.success) {
        setUserData(data.userData);
        if(data.userData?._id){
          localStorage.setItem("userId", data.userData._id)
        }

      } else {
        setUserData(null);
        setIsLoggedin(false);
        localStorage.removeItem("token");
        localStorage.removeItem("userId");
        throw new Error(data.message || "Failed to get user data.")
      }
    } catch (error) {
      setUserData(null);
      setIsLoggedin(false);
      localStorage.removeItem("token");
      localStorage.removeItem("userId");
      console.error("Erro ao buscar usuário:", error);
    }
  };

  // Efeito para verificar autenticação ao montar
  useEffect(() => {
    getAuthState();
  }, []);

  const value = {
    backendUrl,
    isLoggedin,
    setIsLoggedin,
    userData,
    setUserData,
    getUserData,
    authChecked, // Exporta o estado de verificação
    logout, // Exporta a função de logout
  };

  return (
    <AppContext.Provider value={value}>
      {/* Renderiza children apenas após verificar autenticação */}
      {authChecked ? props.children : <div className="loading-spinner" />}
    </AppContext.Provider>
  );
};
