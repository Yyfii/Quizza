import { useEffect } from "react";
import { FaSearch } from "react-icons/fa";
import "./style/SearchBar.css";

import { SearchResultsList } from "./SearchResultsList";

const API_BASE_URL = "http://localhost:4000/api";

export const SearchBar = ({
  input,
  setInput,
  results,
  setResults,
  selectedIndex,
  setSelectedIndex,
}) => {
  const fetchData = async (value) => {
    if (value.length < 2) {
      setResults([]);
      return;
    }
    try {
      const res = await fetch(
        `${API_BASE_URL}/quizzes?search=${encodeURIComponent(value)}`,
        {
          credentials: "include",
        }
      );
      if (!res.ok) throw new Error("Busca falhou");
      const data = await res.json();
      setResults(data);
    } catch {
      setResults([]);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => fetchData(input), 300);
    return () => clearTimeout(timer);
  }, [input]);

  const handleChange = (value) => {
    setInput(value);
    setSelectedIndex(-1);
  };

  const handleSelect = (quiz) => {
    setInput(quiz.title);
    setResults([]);
    setSelectedIndex(-1);
  };

  const handleKeyDown = (e) => {
    if (e.key === "ArrowDown") {
      setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : results.length - 1));
    } else if (e.key === "Enter" && selectedIndex >= 0) {
      handleSelect(results[selectedIndex]);
    }
  };

  return (
    <div className="input-wrapper">
      <FaSearch id="search-icon" />
      <input
        placeholder="Buscar simulados..."
        value={input}
        onChange={(e) => handleChange(e.target.value)}
        onKeyDown={handleKeyDown}
      />

      {results.length > 0 && (
        <SearchResultsList
          results={results}
          setInput={setInput}
          setResults={setResults}
          selectedIndex={selectedIndex}
        />
      )}
    </div>
  );
};
