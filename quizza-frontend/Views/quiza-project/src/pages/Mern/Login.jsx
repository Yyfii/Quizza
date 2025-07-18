import axios from "axios";
import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { assets } from "../../assets/navbar/assets";
import { AppContext } from "./context/AppContext";

const Login = () => {

  const navigate = useNavigate();
  const { backendUrl, setIsLoggedin, getUserData, setUserData } = useContext(AppContext);

  const [state, setState] = useState("Sign Up");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Configuração global do axios para credenciais
      axios.defaults.withCredentials = true;

      if (state === "Sign Up") {
        const { data } = await axios.post(
          `${backendUrl}/api/auth/register`,
          {
            name,
            email,
            password,
          },
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (data.success) {
          localStorage.setItem("token", data.token);

          const userId = data.user?._id;
          if (userId) {
            localStorage.setItem("userId", userId);
          }

          setIsLoggedin(true);
          await getUserData();
          toast.success("Login realizado com sucesso!");
          navigate("/quizza");
        }
      } else {
        const { data } = await axios.post(
          `${backendUrl}/api/auth/login`,
          {
            email,
            password,
          },
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (data.success) {
          localStorage.setItem("token", data.token);
          localStorage.setItem("userId", data.user._id);

          setIsLoggedin(true);

          await getUserData();
          setUserData(data.user);
          
          toast.success("Login realizado com sucesso!");
          navigate("/quizza");
        } else {
          toast.error("Credenciais inválidas. ");
        }
      }
    } catch (error) {
      console.error("Erro no login:", {
        message: error.message,
        response: error.response?.data,
      });

      toast.error(
        error.response?.data?.message ||
          "Erro ao processar sua requisição. Tente novamente."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen px-6 sm:px-0 bg-gradient-to-br from-blue-200 to-purple-400">
      <img
        onClick={() => navigate("/quizza")}
        src={assets.logo}
        alt=""
        className="absolute left-5 sm:left-20 top-5 w-28 sm:w-32 cursor-pointer"
      />
      <div className="bg-slate-900 p-10 rounded-lg shadow-lg w-full sm:w-96 text-indigo-300 text-sm">
        <h2 className="text-3xl font-semibold text-white text-center mb-3">
          {state === "Sign Up" ? "Create Account" : "Login"}
        </h2>

        <form onSubmit={onSubmitHandler}>
          {state === "Sign Up" && (
            <div className="mb-4 flex items-center gap-3 w-full px-5 py-2.5 rounded-full bg-[#333A5C]">
              <img src={assets.person_icon} alt="" />
              <input
                className="bg-transparent outline-none text-white"
                type="text"
                placeholder="Full Name"
                required
                onChange={(e) => setName(e.target.value)}
                value={name}
              />
            </div>
          )}

          <div className="mb-4 flex items-center gap-3 w-full px-5 py-2.5 rounded-full bg-[#333A5C]">
            <img src={assets.mail_icon} alt="" />
            <input
              className="bg-transparent outline-none text-white"
              type="email"
              placeholder="E-mail"
              required
              onChange={(e) => setEmail(e.target.value)}
              value={email}
            />
          </div>

          <div className="mb-4 flex items-center gap-3 w-full px-5 py-2.5 rounded-full bg-[#333A5C]">
            <img src={assets.lock_icon} alt="" />
            <input
              className="bg-transparent outline-none text-white"
              type="password"
              placeholder="Password"
              required
              minLength={6}
              onChange={(e) => setPassword(e.target.value)}
              value={password}
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 rounded-full bg-gradient-to-r from-indigo-500 to-indigo-900 text-white font-medium flex justify-center items-center"
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="inline-block h-5 w-5 border-2 border-white/50 border-t-indigo-400 rounded-full animate-spin"></span>
            ) : (
              state
            )}
          </button>
        </form>

        <div className="mt-4 text-center">
          <p className="text-gray-400 text-xs">
            {state === "Sign Up" ? (
              <>
                Already have an account?{" "}
                <span
                  onClick={() => setState("Login")}
                  className="text-blue-400 cursor-pointer underline"
                >
                  Login here
                </span>
              </>
            ) : (
              <>
                Don't have an account?{" "}
                <span
                  onClick={() => setState("Sign Up")}
                  className="text-blue-400 cursor-pointer underline"
                >
                  Sign up
                </span>
              </>
            )}
          </p>
          <p
            onClick={() => navigate("/reset-password")}
            className="mt-2 text-indigo-500 cursor-pointer text-xs"
          >
            Forgot password?
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
