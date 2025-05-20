import React from "react";
import PostForm from "../PostForm2";
import { useFeedRefresh } from "../../contexts/FeedRefreshContext";

const PostInput: React.FC = () => {
  // const { triggerRefresh } = useFeedRefresh();
  return (
    <div className="border-b p-4">
      <PostForm />
    </div>
  );
};

export default PostInput;
