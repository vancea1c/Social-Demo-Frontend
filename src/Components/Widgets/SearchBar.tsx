import React, { useState, useEffect, useRef, ChangeEvent } from "react";
import api from "../../api";
import { useDebounce } from "../../hooks/useDebounce";
import ProfileSearchCard from "./ProfileSearchCard";
import { UserProfile } from "../../contexts/types";
import { useUserProfiles } from "../../contexts/UserProfilesContext";
import { useNavigate } from "react-router-dom";

const SearchBar: React.FC = () => {
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 400);
  const [results, setResults] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const { profiles, updateProfile } = useUserProfiles();
  const navigate = useNavigate();

  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setResults([]);
      setLoading(false);
      setError(null);
      return;
    }

    const controller = new AbortController();
    setLoading(true);
    setError(null);

    api
      .get<{ results: UserProfile[] }>("profile/", {
        params: { search: debouncedQuery.trim() },
        signal: controller.signal,
      })
      .then((res) => {
        const users = Array.isArray(res.data)
          ? (res.data as UserProfile[])
          : res.data.results;
        users
          .filter((u) => !profiles[u.username])
          .forEach((u) => updateProfile(u));
        setResults(users);
      })
      .catch((err) => {
        if (err.name === "CanceledError") return;
        console.error("Search error:", err);
        setError("Couldn’t load results.");
        setResults([]);
      })
      .finally(() => {
        setLoading(false);
      });

    return () => {
      controller.abort();
    };
  }, [debouncedQuery, updateProfile]);

  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setResults([]);
      }
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => {
      document.removeEventListener("mousedown", onClickOutside);
    };
  }, []);

  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <input
        type="search"
        value={query}
        onChange={onChange}
        placeholder="Search people"
        className="
          w-full px-4 py-2 rounded-full border border-gray-700
          bg-gray-900 text-white text-base focus:outline-none
          placeholder-gray-500
        "
      />

      {(loading || error || results.length > 0) && (
        <div
          className="
            absolute top-full mt-1 left-0 right-0
            bg-gray-900 border border-gray-700 rounded-lg
            max-h-72 overflow-y-auto z-50 shadow-lg
          "
        >
          {loading && (
            <div className="px-4 py-2 text-gray-400 italic">Searching…</div>
          )}

          {!loading && error && (
            <div className="px-4 py-2 text-red-500 italic">{error}</div>
          )}

          {!loading && !error && results.length === 0 && (
            <div className="px-4 py-2 text-gray-400 italic">
              No results found.
            </div>
          )}

          {!loading &&
            !error &&
            results.map((u) => (
              <div
                key={u.username}
                onClick={() => {
                  navigate(`/${u.username}`);
                  setQuery("");
                  setResults([]);
                }}
              >
                <ProfileSearchCard profile={u} />
              </div>
            ))}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
