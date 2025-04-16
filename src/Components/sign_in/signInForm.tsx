import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signInSchema, SignInData } from "../schemas/signInSchema";
import { useAuth } from "../AuthContext";
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
  // Control pentru a afișa/ascunde parola
  const [showPassword, setShowPassword] = useState(false);
  const onSubmit = async (data: SignInData) => {
    try {
      await signIn(data);
      navigate("/home");
    } catch (error: any) {
      if (error.response && error.response.data) {
        const serverErrors = error.response.data;
        for (const field in serverErrors) {
          setError(field as keyof SignInData, {
            type: "server",
            message: serverErrors[field][0],
          });
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
                <p className="text-danger">{errors.password.message}</p>
              )}
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: "absolute",
                  right: "0.5rem",
                  top: "2.2rem", // ajustează după stilul tău
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
          <button type="submit" form="signin-form">
            Log In
          </button>
          <button onClick={() => navigate("/forgot_password")}>
            Forgot Password
          </button>
        </div>
      </div>
    </div>
  );
};

export default SignInForm;
