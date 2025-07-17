import { useNavigate } from "react-router-dom";
import "./style/SearchBar.css";


export const SearchResult = ({ result, setInput, setResults, isSelected }) => {
  
  const navigate = useNavigate();

  const handleClick = () => {
    setInput(result.title);
    setResults([]);

    setTimeout(() => {
      navigate(`/quizzes/${result._id}`)
    }, 3000)
  };
  return (
    <div
      className={`search-result ${isSelected ? `selected` : ""}`}
      onMouseDown={handleClick}
    >
      {result.title}
    </div>
  );
};
