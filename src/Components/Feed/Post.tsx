import React from 'react';

interface PostProps {
  id: number;
  author: string;
  content: string;
  avatarUrl?: string;
}

const Post: React.FC<PostProps> = ({ author, content, avatarUrl }) => (
  <div style={{ padding: '1rem', borderBottom: '1px solid #222' }}>
    <strong>{author}</strong>
    <p>{content}</p>
  </div>
);

export default Post;
