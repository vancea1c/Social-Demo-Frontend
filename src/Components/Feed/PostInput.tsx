import React, { useState } from "react";

const PostInput: React.FC = () => {
  const [text, setText] = useState("");
  const onSubmit = () => {
    // TODO: POST to /api/posts/
    console.log("posting:", text);
    setText("");
  };

  return (
    <div style={{ borderBottom: "1px solid #333", padding: "1rem" }}>
      <textarea
        rows={3}
        placeholder="What's happening?"
        value={text}
        onChange={(e) => setText(e.target.value)}
        style={{
          width: "100%",
          background: "transparent",
          color: "white",
          border: "none",
        }}
      />
      <button onClick={onSubmit}>Post</button>
    </div>
  );
};

export default PostInput;
