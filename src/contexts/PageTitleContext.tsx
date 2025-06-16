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

export const usePageTitle = (newTitle: string | null) => {
  const context = useContext(PageTitleContext);
  if (!context) {
    throw new Error("usePageTitle must be used inside a PageTitleProvider");
  }

  React.useEffect(() => {
    context.setTitle(newTitle);
    return () => {
      context.setTitle(null);
    };
  }, [newTitle]);

  return null;
};

export const useCurrentTitle = (): string | null => {
  const context = useContext(PageTitleContext);
  if (!context) {
    throw new Error("useCurrentTitle must be used inside a PageTitleProvider");
  }
  return context.title;
};
