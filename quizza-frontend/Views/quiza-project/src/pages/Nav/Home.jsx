import { FaArrowRight, FaFilePdf, FaRobot } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import "./style/Home.css";

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="home-container">
      <div className="home-content">
        <h1 className="home-title">Gere simulados com IA ou PDF</h1>
        <p className="home-subtitle">Transforme conteúdos em simulados interativos com poucos cliques.</p>

        <div className="home-buttons">
          <button className="home-btn" onClick={() => navigate("/simulados")}>
            <FaFilePdf /> PDF para Simulado
          </button>
          <button className="home-btn" onClick={() => navigate("/ia")}>
            <FaRobot /> Usar Inteligência Artificial
          </button>
        </div>

        <button className="home-secondary-btn" onClick={() => navigate("/about")}>
          Conheça nossa história <FaArrowRight />
        </button>
      </div>
    </div>
  );
};

export default Home;
