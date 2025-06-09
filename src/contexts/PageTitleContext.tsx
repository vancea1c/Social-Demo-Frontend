// src/contexts/PageTitleContext.tsx
import React, { createContext, useContext, useState, ReactNode } from "react";

interface PageTitleContextValue {
  title: string | null;
  setTitle: (newTitle: string | null) => void;
}

const PageTitleContext = createContext<PageTitleContextValue | undefined>(
  undefined
);

export const PageTitleProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [title, setTitle] = useState<string | null>(null);
  return (
    <PageTitleContext.Provider value={{ title, setTitle }}>
      {children}
    </PageTitleContext.Provider>
  );
};

// Custom hook for pages to set the title
export const usePageTitle = (newTitle: string | null) => {
  const context = useContext(PageTitleContext);
  if (!context) {
    throw new Error("usePageTitle must be used inside a PageTitleProvider");
  }

  // When a page mounts, we register the title. When it unmounts, clear the title.
  React.useEffect(() => {
    context.setTitle(newTitle);
    return () => {
      context.setTitle(null);
    };
  }, [newTitle]);

  return null;
};

// Hook to read the current title inside Layout
export const useCurrentTitle = (): string | null => {
  const context = useContext(PageTitleContext);
  if (!context) {
    throw new Error("useCurrentTitle must be used inside a PageTitleProvider");
  }
  return context.title;
};
