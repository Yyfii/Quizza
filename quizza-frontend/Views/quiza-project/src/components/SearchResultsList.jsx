import { SearchResult } from "./SearchResult";
import "./style/SearchBar.css";

export const SearchResultsList = ({
  results,
  setInput,
  setResults,
  selectedIndex,
}) => {
  return (
    <div className="results-list">
      {results.map((result, id) => {
        return (
          <SearchResult
            key={id}
            result={result}
            setInput={setInput}
            setResults={setResults}
            isSelected={id === selectedIndex}
          />
        );
      })}
    </div>
  );
};
