// src/components/UserMenu.jsx
import axios from "axios";
import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { AppContext } from "../context/AppContext";

const UserMenu = () => {
  const { userData, backendUrl, setUserData, setIsLoggedin, logout} = useContext(AppContext);
  const navigate = useNavigate();

  const sendVerificationOtp = async () => {
    try {
      const { data } = await axios.post(backendUrl + "/api/auth/send-verify-otp", {}, { withCredentials: true });
      if (data.success) {
        toast.success(data.message);
        navigate("/email-verify");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error("Erro ao enviar e-mail de verificação.");
    }
  };

    const handleLogout = async () => {
    try {
      await axios.post(backendUrl + "/api/auth/logout", {}, { withCredentials: true });
    } catch (error) {
      toast.error("Erro ao fazer logout no servidor.");
    } finally {
      logout(); // Função do contexto, garante limpeza completa
      navigate("/");
    }
  };

  if (!userData) return null;

  return (
    <div className="w-8 h-8 flex justify-center rounded-full items-center bg-black text-white relative group cursor-pointer">
      {userData.name?.charAt(0).toUpperCase()}
      <div className="absolute hidden group-hover:block top-0 right-0 z-10 text-black rounded pt-10">
        <ul className="list-none m-0 p-2 bg-gray-100 text-sm min-w-[160px] text-left rounded shadow">
          {!userData.isAccountVerified && (
            <li
              onClick={sendVerificationOtp}
              className="py-2 px-4 hover:bg-gray-200 cursor-pointer"
            >
              Verificar e-mail
            </li>
          )}
          <li
            onClick={handleLogout}
            className="py-2 px-4 hover:bg-gray-200 cursor-pointer"
          >
            Logout
          </li>
        </ul>
      </div>
    </div>
  );
};

export default UserMenu;
