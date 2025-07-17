import ListItems from "./components/ListItems";
import Sidebar from "./components/Sidebar";

const List = () => {
  return (
    <Sidebar>
      <div className="text-center bg-indigo-100 rounded-lg w-auto">
        <h1 className="text-2xl font-bold text-zinc-800 mb-4">Simulados Favoritos</h1>
      <p className="text-zinc-700">Aqui estão todos os simulados que você adicionou a sua lista.</p>
      </div>
      <div>
        <ListItems />
      </div>
    </Sidebar>
  );
};

export default List;
