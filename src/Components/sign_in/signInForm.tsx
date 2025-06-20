import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signInSchema, SignInData } from "../schemas/signInSchema";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useState } from "react";

const SignInForm = () => {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<SignInData>({
    resolver: zodResolver(signInSchema),
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showForgot, setShowForgot] = useState(false);

  const onSubmit = async (data: SignInData) => {
    setShowForgot(false);
    setLoading(true);
    try {
      await signIn(data);

      navigate("/home");
    } catch (error: any) {
      const resp = error.response?.data;
      if (resp) {
        setLoading(false);
        for (const field of ["identifier", "password"] as const) {
          if (resp[field]) {
            const msg = Array.isArray(resp[field])
              ? resp[field][0]
              : resp[field];
            setError(field, { type: "server", message: msg });
          }
        }
        const pwErr = Array.isArray(resp.password)
          ? resp.password[0]
          : resp.password;
        if (pwErr === "Incorrect password.") {
          setShowForgot(true);
        }
      }
    }
  };

  return (
    <div className="form">
      <div className="form-container">
        <div className="header">
          <h2>Log In</h2>
        </div>
        <div className="body">
          <form id="signin-form" onSubmit={handleSubmit(onSubmit)}>
            <div className="form-group">
              <label htmlFor="usn/e" className="form-label">
                Username or Email
              </label>
              <input id="usn/e" {...register("identifier")} />
              {errors.identifier && (
                <p className="text-danger">{errors.identifier.message}</p>
              )}
            </div>
            <div className="form-group">
              <label htmlFor="password" className="form-label">
                Password
              </label>
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                {...register("password")}
              />
              {errors.password && (
                <p className="text-red-600">{errors.password.message}</p>
              )}
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: "absolute",
                  right: "0.5rem",
                  top: "2.2rem",
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
              </button>
            </div>
          </form>
        </div>
        <div className="footer">
          <button type="submit" form="signin-form" className="btn-base">
            {loading ? "Login in.." : "Log in"}
          </button>
          {showForgot && (
            <button
              type="button"
              onClick={() => navigate("/forgot_password")}
              className="link-button"
              style={{ marginLeft: "1rem" }}
            >
              Forgot Password?
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default SignInForm;
