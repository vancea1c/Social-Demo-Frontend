import { useEffect } from "react";

export const TitleChange = (title: string) => {
  useEffect(() => {
    document.title = title;
  }, [title]);
};
