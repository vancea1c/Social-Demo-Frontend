import React, { createContext, useContext, useState } from "react";

const FeedRefreshContext = createContext({
  refreshKey: 0,
  triggerRefresh: () => {},
});

export const useFeedRefresh = () => useContext(FeedRefreshContext);

export const FeedRefreshProvider = ({ children }: { children: React.ReactNode }) => {
  const [refreshKey, setRefreshKey] = useState(0);
  const triggerRefresh = () => setRefreshKey((k) => k + 1);

  return (
    <FeedRefreshContext.Provider value={{ refreshKey, triggerRefresh }}>
      {children}
    </FeedRefreshContext.Provider>
  );
};
