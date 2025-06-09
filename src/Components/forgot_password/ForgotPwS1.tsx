import { useState } from "react";
import api from "../../api";
import { useForgotPwContext } from "./ForgotPwContext";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

const FPWS1Schema = z.object({
  identifier: z.string().min(1, { message: "Username/Email is required." }),
});
type FPWS1Data = z.infer<typeof FPWS1Schema>;

const ForgotPwStep1 = () => {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<FPWS1Data>({
    resolver: zodResolver(FPWS1Schema),
  });

  const { setFormData, nextStep } = useForgotPwContext();
  const [loading, setLoading] = useState(false);

  const onSubmit = async (data: FPWS1Data) => {
    setLoading(true);

    try {
      const identifier = data.identifier.trim();
      await api.post("accounts/forgot-password/", {
        identifier,
      });

      setFormData({ identifier });
      nextStep();
    } catch (error: any) {
      const res = error.response?.data;

      console.log("❌ Step 1 error:", res);
      if (res) {
        if (Array.isArray(res.identifier) && res.identifier.length > 0) {
          setError("identifier", {
            type: "server",
            message: res.identifier[0],
          });
        } else if (res.detail) {
          const msg = Array.isArray(res.detail) ? res.detail[0] : res.detail;
          setError("identifier", { type: "server", message: msg });
        }
      } else {
        setError("identifier", {
          type: "server",
          message: "Unable to reach server. Please check your connection.",
        });
      }
    } finally {
      setLoading(false);
    }
  };
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="form">
      <div className="header">
        <h2>Account recovery</h2>
        <p>Enter your email or username to receive a reset code.</p>
      </div>
      <div className="body">
        <label htmlFor="identifier">Email or Username</label>
        <input
          id="identifier"
          type="text"
          {...register("identifier")}
          disabled={loading}
        />
        {errors.identifier && (
          <p className="text-red-600 font-semibold">
            {errors.identifier.message}
          </p>
        )}
      </div>
      <div className="footer">
        <button
          type="submit"
          className="hover:bg-gray-500 hover:scale-110 active:scale-95 "
          disabled={loading}
        >
          {loading ? "Sending…" : "Send Code"}
        </button>
      </div>
    </form>
  );
};

export default ForgotPwStep1;
