import Sidebar from "./components/Sidebar";
import Simulados from "./components/Simulados";

const QuizList = () => {
  return (
    <Sidebar>
      <div className="text-center bg-indigo-100 rounded-lg w-auto">
        <h1 className="text-2xl font-bold text-zinc-800 mb-4">Meus Simulados</h1>
      <p className="text-zinc-700">Aqui estão todos os simulados que você criou.</p>
      </div>
      <div>
        <Simulados />
      </div>
    </Sidebar>
  );
};

export default QuizList;
