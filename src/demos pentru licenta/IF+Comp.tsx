export interface PostProps {
  id: number;
  username: string;
  content: string;
  created_at: string;
  type?: string;
}

const Post: React.FC<PostProps> = ({ username, content, created_at }) => {
  return (
    <div className="post">
      <h2>{username}</h2>
      <p>{content}</p>
      <span>{new Date(created_at).toLocaleString()}</span>
    </div>
  );
};

export default Post;


