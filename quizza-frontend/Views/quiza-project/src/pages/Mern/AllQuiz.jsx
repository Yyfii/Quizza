import ExploreQuiz from "./components/ExploreQuiz"
import Sidebar from "./components/Sidebar"

const AllQuiz = () => {
  return (
    <Sidebar >
    <div className="text-center bg-indigo-100 rounded-lg w-auto">
            <h1 className="text-2xl font-bold text-zinc-800 mb-4">Simulados</h1>
        <p className="text-zinc-700">Aqui você verá todos os simulados disponíveis.</p>
        </div>
        <div>
        <ExploreQuiz />
    </div>
    </Sidebar>
  )
}

export default AllQuiz
