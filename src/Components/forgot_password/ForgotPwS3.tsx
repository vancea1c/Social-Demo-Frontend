import axios from "axios";
import PasswordInput from "../Password2";
import { useForgotPwContext } from "./ForgotPwContext";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

const ForgotPwS3 = () => {
  const { formData, resetFlow } = useForgotPwContext();
  const navigate = useNavigate();

  // ① stocăm aici parola validă
  const [validPassword, setValidPassword] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ② la click buton: trimitem cererea
  const handleReset = async () => {
    if (!validPassword) return;
    setError(null);
    setLoading(true);
    try {
      await axios.post("/api/accounts/reset-password/", {
        identifier: formData.identifier,
        code: formData.code,
        newPassword: validPassword,
      });
      navigate("/log_in", {
        state: { message: "Password reset successfully. Please Log in." },
      });
    } catch (err: any) {
      const msg =
        err.response?.data?.code?.[0] ||
        err.response?.data?.message ||
        "Reset failed";
      if (msg === "Reset code expired.") {
        setError("Session Expired. U gotta start again…");
        setTimeout(() => resetFlow(), 5000);
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form">
      <div className="header">
        <h2>Set a new password</h2>
        <p>Choose a strong password for your account.</p>
      </div>
      <div className="body">
        <PasswordInput
          onValidPassword={(pw) => setValidPassword(pw)}
          showError={false}
        />
      </div>
      <div className="footer">
        <button
          type="button"
          disabled={!validPassword || loading}
          onClick={handleReset}
          className={`px-4 py-2 rounded ${
            validPassword
              ? "bg-blue-600 text-white hover:bg-blue-700"
              : "bg-gray-600 text-gray-300 cursor-not-allowed"
          }`}
        >
          {loading ? "Resetting…" : "Reset Password"}
        </button>
        {error && <p className="text-danger">{error}</p>}
      </div>
    </div>
  );
};

export default ForgotPwS3;
