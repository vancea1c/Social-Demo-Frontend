import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useSignUpContext } from "./SignUpContext";
import {
  passwordValidationSchema,
  PasswordValidationData,
} from "../schemas/passwordValidationSchema";
import {
  validatePassword,
  isPasswordValid,
} from "../schemas/passwordValidationSchema";

function SignUpStep2() {
  const { prevStep, formData } = useSignUpContext();
  const navigate = useNavigate();

  // Focus & error states (purely UI-related)
  const [isFocused, setIsFocused] = useState(false);
  const [showError, setShowError] = useState(false);
  // Control pentru a afișa/ascunde parola
  const [showPassword, setShowPassword] = useState(false);

  // Set up React Hook Form with Zod
  const {
    register,
    handleSubmit,
    watch,
    trigger,
    formState: { errors, isValid },
  } = useForm<PasswordValidationData>({
    mode: "onChange", // or "onBlur", depending on your preference
    resolver: zodResolver(passwordValidationSchema),
    criteriaMode: "all",
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  // Watch the password field so we can do real-time checks
  const passwordValue = watch("password");
  const checks = validatePassword(passwordValue);
  const overallValid = isPasswordValid(passwordValue);
  const touched = passwordValue.length > 0;

  // Revalidează confirmPassword ori de câte ori se schimbă password
  useEffect(() => {
    trigger("confirmPassword");
  }, [passwordValue, trigger]);

  // Focus/Blur handlers for showing/hiding validation
  const handleFocus = () => setIsFocused(true);
  const handleBlur = () => {
    setIsFocused(false);
    if (!overallValid && touched) {
      setShowError(true);
    }
  };

  // Submit handler
  const onSubmit = async (data: PasswordValidationData) => {
    // Merge with previous step data
    const completeData = { ...formData, ...data };
    console.log("Sending to server:", completeData);

    try {
      const response = await axios.post(
        "http://localhost:8000/api/sign_up/",
        completeData
      );
      if (response.status === 201) {
        navigate("/home");
      } else {
        console.error("Creating account error:", response.data);
      }
    } catch (error: any) {
      console.error("Data sending error:", error);
      if (error.response) {
        console.log("Server message:", error.response.data);
      }
    }
  };

  return (
    <div className="form">
      <div className="form-container">
        <h2>Choose a password</h2>

        <form id="signup-form" onSubmit={handleSubmit(onSubmit)}>
          {/* Password Field */}
          <div className="form-group">
            {showError ? (
              <label htmlFor="password" style={{ color: "red" }}>
                Invalid Password
              </label>
            ) : (
              <label htmlFor="password">Password</label>
            )}
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              {...register("password")}
              onFocus={handleFocus}
              onBlur={handleBlur}
              style={{
                borderColor:
                  !isFocused && touched && !overallValid ? "red" : undefined,
                marginRight: "8px",
              }}
            />

            {/* Password Criteria List */}
            {(isFocused || touched) && (
              <AnimatePresence mode="wait">
                {(isFocused || touched) && (
                  <motion.div
                    key="conditionsList"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    style={{ overflow: "hidden" }}
                  >
                    <p>Your password must contain at least:</p>
                    <ul style={{ listStyleType: "none", paddingLeft: 0 }}>
                      <ConditionItem
                        text="8 characters"
                        isOk={checks.length}
                        isFocused={isFocused}
                        showError={showError}
                      />
                      <ConditionItem
                        text="1 number"
                        isOk={checks.number}
                        isFocused={isFocused}
                        showError={showError}
                      />
                      <ConditionItem
                        text="1 uppercase letter"
                        isOk={checks.uppercase}
                        isFocused={isFocused}
                        showError={showError}
                      />
                      <ConditionItem
                        text="1 lowercase letter"
                        isOk={checks.lowercase}
                        isFocused={isFocused}
                        showError={showError}
                      />
                      <ConditionItem
                        text="1 symbol"
                        isOk={checks.symbol}
                        isFocused={isFocused}
                        showError={showError}
                      />
                    </ul>
                  </motion.div>
                )}
              </AnimatePresence>
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
          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              id="confirmPassword"
              type="password"
              {...register("confirmPassword")}
            />
            {errors.confirmPassword && (
              <p className="text-danger">{errors.confirmPassword.message}</p>
            )}
          </div>
        </form>

        {/* Footer */}
        <div className="footer">
          <button onClick={prevStep}>Prev</button>
          <button
            type="submit"
            form="signup-form"
            disabled={!isValid || !overallValid}
          >
            Create account
          </button>
        </div>
      </div>
    </div>
  );
}

// A small sub-component for each password condition item
function ConditionItem({
  text,
  isOk,
  isFocused,
  showError,
}: {
  text: string;
  isOk: boolean;
  isFocused: boolean;
  showError: boolean;
}) {
  // If user has blurred and password is invalid, show red X
  if (isFocused && !isOk && showError) {
    return <li style={{ color: "red", marginBottom: 4 }}>✕ {text}</li>;
  }
  // If the condition is met, show green check
  if (isFocused && isOk) {
    return <li style={{ color: "green", marginBottom: 4 }}>✓ {text}</li>;
  }
  // If it's focused but not met yet (and no final error), show gray
  if (isFocused && !isOk) {
    return <li style={{ color: "gray", marginBottom: 4 }}>o {text}</li>;
  }
  // Default (unfocused) - show green if OK, red if not
  return (
    <li style={{ color: isOk ? "green" : "red", marginBottom: 4 }}>
      {isOk ? "✓" : "✕"} {text}
    </li>
  );
}

export default SignUpStep2;
