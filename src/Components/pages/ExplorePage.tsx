// src/pages/ExplorePage.tsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import SearchBar from "../components/Widgets/SearchBar";
import ProfileCard, { Profile } from "../components/Widgets/ProfileCard";

const ExplorePage: React.FC = () => {
  const [results, setResults] = useState<Profile[]>([]);
  const [trending, setTrending] = useState<Profile[]>([]);
  const [query, setQuery] = useState<string>("");

  // Când query e gol, încarcă „suggested follows”
  useEffect(() => {
    if (!query) {
      axios
        .get<Profile[]>("/api/profile/?suggested=true") // poți extinde back-end-ul să accepte suggested
        .then((res) => setTrending(res.data))
        .catch(() => setTrending([]));
      setResults([]);
    }
  }, [query]);

  // Când utilizatorul caută efectiv
  useEffect(() => {
    if (query.trim()) {
      axios
        .get<Profile[]>(`/api/profile/?search=${encodeURIComponent(query)}`)
        .then((res) => setResults(res.data))
        .catch(() => setResults([]));
    }
  }, [query]);

  return (
    <div style={{ padding: "1rem", overflowY: "auto", height: "100%" }}>
      <h2>Explore</h2>

      {/* Folosim acelaşi SearchBar, dar îi pasăm query şi setter */}
      <SearchBar
        query={query}
        onQueryChange={setQuery}
        placeholder="Search people..."
      />

      {query ? (
        <div>
          {results.length ? (
            results.map((p) => <ProfileCard key={p.username} profile={p} />)
          ) : (
            <p>No profiles found for “{query}”.</p>
          )}
        </div>
      ) : (
        <div>
          <h3>Suggested Follows</h3>
          {trending.length ? (
            trending.map((p) => <ProfileCard key={p.username} profile={p} />)
          ) : (
            <p>Loading suggestions…</p>
          )}
        </div>
      )}
    </div>
  );
};

export default ExplorePage;
