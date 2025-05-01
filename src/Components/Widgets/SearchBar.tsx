// src/components/Widgets/SearchBar.tsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import ProfileCard, { Profile } from "./ProfileCard";

const SearchBar: React.FC = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Profile[]>([]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.trim()) {
        axios
          .get<Profile[]>(`/api/profile/?search=${encodeURIComponent(query)}`)
          .then((res) => setResults(res.data))
          .catch(() => setResults([]));
      } else {
        setResults([]);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [query]);

  return (
    <div>
      <input
        type="search"
        placeholder="Search profiles"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        style={{
          width: "100%",
          padding: "0.5rem",
          marginBottom: "1rem",
          borderRadius: "9999px",
          border: "1px solid #333",
          background: "#222",
          color: "white",
        }}
      />

      {results.map((p) => (
        <ProfileCard key={p.user.username} profile={p} />
      ))}
    </div>
  );
};

export default SearchBar;
