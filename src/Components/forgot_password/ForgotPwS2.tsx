import { useState, useEffect } from "react";
import api from "../../api";
import { useForgotPwContext } from "./ForgotPwContext";
import { maskEmail } from "../../utils/mask";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

const FPWS2Schema = z.object({
  code: z.string().min(1, { message: "Password reset code is required." }),
});
type FPWS2Data = z.infer<typeof FPWS2Schema>;

const RESEND_TIMEOUT = 30; // secunde

const ForgotPwStep2 = () => {
  const { formData, setFormData, nextStep, prevStep } = useForgotPwContext();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<FPWS2Data>({
    resolver: zodResolver(FPWS2Schema),
    defaultValues: {
      code: formData.code || "",
    },
  });

  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(0);

  useEffect(() => {
    if (timer <= 0) return;
    const id = setInterval(() => setTimer((t) => t - 1), 1000);
    return () => clearInterval(id);
  }, [timer]);

  const triggerResend = async () => {
    setError("code", { type: "server", message: "" });
    try {
      await api.post("accounts/forgot-password/", {
        identifier: formData.identifier,
      });
      setTimer(RESEND_TIMEOUT);
    } catch (e: any) {
      setError("code", {
        type: "server",
        message: "Could not resend code. Please try again later.",
      });
    }
  };

  const contactPoint = formData.identifier?.includes("@")
    ? maskEmail(formData.identifier)
    : formData.identifier;

  const handleVerify = async (data: FPWS2Data) => {
    setLoading(true);
    setError("code", { type: "server", message: "" });
    try {
      const code = data.code.trim();
      await api.post("accounts/verify-reset-code/", {
        identifier: formData.identifier,
        code,
      });
      setFormData({ code });
      nextStep();
    } catch (error: any) {
      const res = error.response?.data;
      if (res) {
        if (Array.isArray(res.code) && res.code.length > 0) {
          setError("code", { type: "server", message: res.code[0] });
        } else if (Array.isArray(res.identifier) && res.identifier.length > 0) {
          setError("code", { type: "server", message: res.identifier[0] });
        } else if (res.detail) {
          const msg = Array.isArray(res.detail) ? res.detail[0] : res.detail;
          setError("code", { type: "server", message: msg });
        } else {
          setError("code", {
            type: "server",
            message: "Something went wrong. Please try again.",
          });
        }
      } else {
        setError("code", {
          type: "server",
          message: "Unable to reach server. Please check your connection.",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(handleVerify)} className="form">
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
          placeholder="Enter code"
          disabled={loading}
          {...register("code")}
        />
        {errors.code && <p className="text-danger">{errors.code.message}</p>}
      </div>
      <div className="footer">
        <div className="resend">
          <button
            type="button"
            onClick={triggerResend}
            disabled={timer > 0 || loading}
            className={`text-sm underline ${
              timer > 0
                ? "opacity-50 cursor-not-allowed"
                : "hover:text-gray-300"
            }`}
          >
            {timer > 0 ? `Resend code in ${timer}s` : "Resend code"}
          </button>
        </div>
        <button type="button" onClick={prevStep} disabled={loading}>
          Prev
        </button>
        <button
          type="submit"
          disabled={loading}
          aria-busy={loading}
          className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center"
        >
          {loading ? "Verifying…" : "Verify"}
        </button>
      </div>
    </form>
  );
};

export default ForgotPwStep2;
