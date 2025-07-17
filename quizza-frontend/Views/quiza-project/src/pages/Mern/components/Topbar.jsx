// src/components/Topbar.jsx
import { useState } from "react";
import { FaBell, FaSearch } from "react-icons/fa";
import { SearchBar } from "../../../components/SearchBar";

import UserMenu from "./userMenu";

const Topbar = () => {
  const [showMobileSearch, setShowMobileSearch] = useState(false);

  // 2) crie os estados que o SearchBar precisa
  const [input, setInput] = useState("");
  const [results, setResults] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  return (
    <div className="w-full bg-gradient-to-br from-blue-200 to-purple-400 shadow-md">
      <div className="flex items-center justify-between px-6 h-[64px]">
        {/* Desktop Search */}
        <div className="hidden md:flex w-96">
          <SearchBar
            input={input}
            setInput={setInput}
            results={results}
            setResults={setResults}
            selectedIndex={selectedIndex}
            setSelectedIndex={setSelectedIndex}
          />
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-x-4 md:gap-x-8">
          {/* Mobile Search Icon */}
          <button
            className="block md:hidden text-zinc-700 text-xl"
            onClick={() => setShowMobileSearch(!showMobileSearch)}
          >
            <FaSearch />
          </button>

          {/* Notification */}
          <button className="relative cursor-pointer">
            <span className="absolute -top-2 -right-2 bg-red-600 text-white w-4 h-4 rounded-full text-xs flex items-center justify-center">
              3
            </span>
            <FaBell className="text-xl text-zinc-700" />
          </button>

          {/* Profile */}
          <UserMenu />
        </div>
      </div>

      {/* Mobile Search */}
      {showMobileSearch && (
        <div className="md:hidden px-4 py-2 bg-white shadow-sm">
          <SearchBar
            input={input}
            setInput={setInput}
            results={results}
            setResults={setResults}
            selectedIndex={selectedIndex}
            setSelectedIndex={setSelectedIndex}
          />
        </div>
      )}
    </div>
  );
};

export default Topbar;
