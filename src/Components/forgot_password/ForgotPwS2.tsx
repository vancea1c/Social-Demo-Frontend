import { useState, useEffect } from "react";
import axios from "axios";
import { useForgotPwContext } from "./ForgotPwContext";
import { maskEmail } from "../../utils/mask";

const RESEND_TIMEOUT = 30; // secunde

const ForgotPwStep2 = () => {
  const { formData, setFormData, nextStep, prevStep } = useForgotPwContext();
  const [code, setCode] = useState(formData.code || "");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [timer, setTimer] = useState(0);

  // countdown
  useEffect(() => {
    if (timer <= 0) return;
    const id = setInterval(() => setTimer((t) => t - 1), 1000);
    return () => clearInterval(id);
  }, [timer]);

  const triggerResend = async () => {
    try {
      setError(null);
      // retrimite codul
      await axios.post("/api/accounts/forgot-password/", {
        identifier: formData.identifier,
      });
      setFormData({ identifier: formData.identifier! });
      setTimer(RESEND_TIMEOUT);
    } catch (e: any) {
      setError("Could not resend code. Try again later.");
    }
  };

  const contactPoint = formData.identifier?.includes("@")
    ? maskEmail(formData.identifier)
    : formData.identifier;

  const handleVerify = async () => {
    setError(null);
    setLoading(true);
    try {
      await axios.post("/api/accounts/verify-reset-code/", {
        identifier: formData.identifier,
        code,
      });
      setFormData({ code });
      nextStep();
    } catch (err: any) {
      setError(
        err.response?.data?.code?.[0] ||
          err.response?.data?.detail ||
          "Invalid code"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form">
      <div className="header">
        <h2>Account recovery</h2>
        <p>
          A verification code was just sent to <strong>{contactPoint}</strong>.
          Please enter it below.
        </p>
      </div>
      <div className="body">
        <label htmlFor="code">Verification Code</label>
        <input
          id="code"
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          disabled={loading}
        />
        {error && <p className="text-danger">{error}</p>}
      </div>
      <div className="footer">
        <div className="resend">
          <button
            type="button"
            onClick={triggerResend}
            disabled={timer > 0}
            className="link-button"
          >
            {timer > 0 ? `Resend code in ${timer}s` : "Resend code"}
          </button>
        </div>
        <button type="button" onClick={prevStep} disabled={loading}>
          Prev
        </button>
        <button
          type="button"
          onClick={handleVerify}
          disabled={!code.trim() || loading}
        >
          {loading ? "Verifying…" : "Verify"}
        </button>
      </div>
    </div>
  );
};

export default ForgotPwStep2;
