import { useNavigate } from "react-router-dom";
const Greeting_page = () => {
  const navigate = useNavigate();

  return (
    <div className="mb-3">
      <div className="header">
        <h1>Greeting_page</h1>
      </div>

      <div className="body">
        <button>Skip Animation</button>
      </div>

      <div className="footer">
        <button className="btn" onClick={() => navigate("/log_in")}>
          Log in
        </button>
        <button className="btn" onClick={() => navigate("/sign_up")}>
          Sign up
        </button>
      </div>
    </div>
  );
};

export default Greeting_page;
