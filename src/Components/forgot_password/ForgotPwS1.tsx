import { useState } from "react";
import axios from "axios";
import { useForgotPwContext } from "./ForgotPwContext";

const ForgotPwStep1 = () => {
  const { setFormData, nextStep } = useForgotPwContext();
  const [identifier, setIdentifier] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSendCode = async (identifier: string) => {
    setError(null);
    setLoading(true);
    try {
      // ① apelează endpoint-ul de trimitere cod
      console.log("buna ziua!!");
      const res = await axios.post("/api/accounts/forgot-password/", {
        identifier,
      });
      console.log(res);
      // ② salvează identifier în context
      setFormData({ identifier });
      // ③ treci la pasul următor (step 2: verify)
      nextStep();
    } catch (err: any) {
      setError(
        err.response?.data?.identifier?.[0] ||
          err.response?.data?.detail ||
          "Failed to send code"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form">
      <div className="header">
        <h2>Account recovery</h2>
        <p>Enter your email or username to receive a reset code.</p>
      </div>
      <div className="body">
        <label htmlFor="identifier">Email or Username</label>
        <input
          id="identifier"
          type="text"
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          disabled={loading}
        />
        {error && <p className="text-danger">{error}</p>}
      </div>
      <div className="footer">
        <button
          type="button"
          onClick={() => handleSendCode(identifier)}
          disabled={!identifier.trim() || loading}
        >
          {loading ? "Sending…" : "Send Code"}
        </button>
      </div>
    </div>
  );
};

export default ForgotPwStep1;
