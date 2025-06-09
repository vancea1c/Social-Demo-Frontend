import React, { useState, useEffect, useRef, ChangeEvent } from "react";
import api from "../../api"; // your axios wrapper
import ProfileCard, { Profile } from "./ProfileCard";

const SearchBar: React.FC = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (query.trim() === "") {
      setResults([]);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);
    const controller = new AbortController();

    const fetchProfiles = async () => {
      try {
        const response = await api.get<{ results: Profile[] }>("profile/", {
          params: { search: query.trim() },
          signal: controller.signal,
        });
        const data: Profile[] = Array.isArray(response.data)
          ? response.data
          : response.data.results;
        setResults(data);
        setLoading(false);
      } catch (err: any) {
        if (err.code === "ERR_CANCELED" || err.name === "CanceledError") {
          return;
        }
        console.error("Search error:", err);
        setError("Failed to fetch results.");
        setResults([]);
        setLoading(false);
      }
    };

    const timer = setTimeout(() => {
      fetchProfiles();
    }, 400);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setResults([]);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  };

  return (
    <div className="relative w-full">
      <input
        type="search"
        placeholder="Search people"
        value={query}
        onChange={onChange}
        className="
          w-full 
          px-4 py-2 
          mb-2 
          rounded-full 
          border 
          border-gray-700 
          bg-gray-900 
          text-white 
          text-base 
          focus:outline-none 
          placeholder-gray-500
        "
      />

      {(loading || error || results.length > 0) && (
        <div
          ref={dropdownRef}
          className="
            absolute 
            top-full 
            mt-1 
            left-0 
            right-0 
            bg-gray-900 
            border 
            border-gray-700 
            rounded-lg 
            max-h-72 
            overflow-y-auto 
            z-50 
            shadow-lg
          "
        >
          {loading && (
            <div className="px-4 py-3 text-gray-400 italic">Searching…</div>
          )}

          {error && !loading && (
            <div className="px-4 py-3 text-red-500 italic">{error}</div>
          )}

          {!loading &&
            !error &&
            results.length === 0 &&
            query.trim() !== "" && (
              <div className="px-4 py-3 text-gray-400 italic">
                No results found.
              </div>
            )}

          {!loading &&
            !error &&
            results.map((profile) => (
              <div
                key={profile.user.username}
                className="
                  flex 
                  items-center 
                  border-b 
                  border-gray-700 
                  px-4 py-2 
                  cursor-pointer 
                  hover:bg-gray-800
                "
                onClick={() => {
                  // Example: navigate or handle click
                  console.log("Clicked:", profile.user.username);
                  setQuery("");
                  setResults([]);
                }}
              >
                <ProfileCard profile={profile} />
              </div>
            ))}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
