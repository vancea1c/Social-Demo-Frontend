import { useEffect, useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";

export interface PasswordChecks {
  length: boolean;
  number: boolean;
  uppercase: boolean;
  lowercase: boolean;
  symbol: boolean;
}

export function validatePassword(pw: string): PasswordChecks {
  return {
    length: pw.length >= 8,
    number: /\d/.test(pw),
    uppercase: /[A-Z]/.test(pw),
    lowercase: /[a-z]/.test(pw),
    symbol: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pw),
  };
}

// Ca să știm dacă parola e validă per total:
export function isPasswordValid(pw: string): boolean {
  const checks = validatePassword(pw);
  return (
    checks.length &&
    checks.number &&
    checks.uppercase &&
    checks.lowercase &&
    checks.symbol
  );
}

export const passwordValidationSchema = z
  .object({
    password: z.string(),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do no match.",
    path: ["confirmPassword"],
  });

export type PasswordValidationData = z.infer<typeof passwordValidationSchema>;

const Password = () => {
  // Focus & error states (purely UI-related)
  const [isFocused, setIsFocused] = useState(false);
  const [showError, setShowError] = useState(false);
  // Control pentru a afișa/ascunde parola
  const [showPassword, setShowPassword] = useState(false);
  const {
    register,
    watch,
    trigger,
    formState: { errors, isValid },
  } = useForm<PasswordValidationData>({
    mode: "onChange",
    resolver: zodResolver(passwordValidationSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });
  // Watch the password field so we can do real-time checks
  const passwordValue = watch("password");
  const confirmPasswordValue = watch("confirmPassword");
  const checks = validatePassword(passwordValue);
  const overallValid = isPasswordValid(passwordValue);
  const touched = passwordValue.length > 0;

  // Revalidează confirmPassword ori de câte ori se schimbă password
  useEffect(() => {
    if (confirmPasswordValue.length > 0) trigger("confirmPassword");
  }, [passwordValue, trigger]);

  // Focus/Blur handlers for showing/hiding validation
  const handleFocus = () => setIsFocused(true);
  const handleBlur = () => {
    setIsFocused(false);
    // Dacă a ieșit din câmp și parola nu e validă, setează showError true
    if (!overallValid && touched) {
      setShowError(true);
    }
  };
  return (
      <div className="form-container">
        <form id="signup-form">
          {/* Password Field */}
          <div className="form-group">
            {showError && !overallValid ? (
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
      </div>
  );
};
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
  if (!isOk && showError) {
    return <li style={{ color: "red", marginBottom: 4 }}>✕ {text}</li>;
  }
  // If it's focused but not met yet (and no final error), show gray
  else if (isFocused && !isOk && !showError) {
    return <li style={{ color: "gray", marginBottom: 4 }}>o {text}</li>;
  }
  // Default (unfocused) - show green if OK, red if not
  else
    return (
      <li style={{ color: isOk ? "green" : "red", marginBottom: 4 }}>
        {isOk ? "✓" : "✕"} {text}
      </li>
    );
}

export default Password;
